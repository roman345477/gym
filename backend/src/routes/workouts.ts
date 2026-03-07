import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /workouts?telegramId=xxx
router.get('/', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.query;
    if (!telegramId) return res.status(400).json({ error: 'telegramId required' });

    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const workouts = await prisma.workout.findMany({
      where: { userId: user.id },
      include: {
        exercises: {
          include: { sets: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return res.json({ workouts });
  } catch (error) {
    console.error('Get workouts error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /workouts
// Body: { telegramId, date, exercises: [{ name, sets: [{ weight, reps }] }] }
router.post('/', async (req: Request, res: Response) => {
  try {
    const { telegramId, date, exercises } = req.body;
    if (!telegramId) return res.status(400).json({ error: 'telegramId required' });

    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const workout = await prisma.workout.create({
      data: {
        userId: user.id,
        date: new Date(date),
        exercises: {
          create: (exercises || []).map((ex: { name: string; sets: { weight: number; reps: number }[] }) => ({
            name: ex.name,
            sets: {
              create: (ex.sets || []).map((s) => ({
                weight: Number(s.weight),
                reps: Number(s.reps),
              })),
            },
          })),
        },
      },
      include: {
        exercises: { include: { sets: true } },
      },
    });

    return res.json({ workout });
  } catch (error) {
    console.error('Create workout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /workouts/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const workout = await prisma.workout.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        exercises: { include: { sets: true } },
      },
    });
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    return res.json({ workout });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /workouts/:id - update workout
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { date, exercises } = req.body;
    const workoutId = Number(req.params.id);

    // Delete old exercises (cascade deletes sets)
    await prisma.exercise.deleteMany({ where: { workoutId } });

    const workout = await prisma.workout.update({
      where: { id: workoutId },
      data: {
        date: new Date(date),
        exercises: {
          create: (exercises || []).map((ex: { name: string; sets: { weight: number; reps: number }[] }) => ({
            name: ex.name,
            sets: {
              create: (ex.sets || []).map((s) => ({
                weight: Number(s.weight),
                reps: Number(s.reps),
              })),
            },
          })),
        },
      },
      include: {
        exercises: { include: { sets: true } },
      },
    });

    return res.json({ workout });
  } catch (error) {
    console.error('Update workout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /workouts/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.workout.delete({ where: { id: Number(req.params.id) } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
