import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /progress/:exerciseName?telegramId=xxx
router.get('/:exerciseName', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.query;
    const { exerciseName } = req.params;

    if (!telegramId) return res.status(400).json({ error: 'telegramId required' });

    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const exercises = await prisma.exercise.findMany({
      where: {
        name: { contains: exerciseName, mode: 'insensitive' },
        workout: { userId: user.id },
      },
      include: {
        sets: true,
        workout: { select: { date: true } },
      },
      orderBy: { workout: { date: 'asc' } },
    });

    const progressData = exercises.map((ex) => {
      const maxWeight = ex.sets.reduce((max, s) => Math.max(max, s.weight), 0);
      const totalVolume = ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      return {
        date: ex.workout.date,
        maxWeight,
        totalVolume,
        sets: ex.sets,
      };
    });

    const overallMax = progressData.reduce((max, p) => Math.max(max, p.maxWeight), 0);
    const overallVolume = progressData.reduce((sum, p) => sum + p.totalVolume, 0);

    return res.json({
      exerciseName,
      progressData,
      stats: {
        maxWeight: overallMax,
        totalVolume: overallVolume,
        totalSessions: progressData.length,
      },
    });
  } catch (error) {
    console.error('Progress error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /progress?telegramId=xxx  -> list all exercise names
router.get('/', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.query;
    if (!telegramId) return res.status(400).json({ error: 'telegramId required' });

    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const exercises = await prisma.exercise.findMany({
      where: { workout: { userId: user.id } },
      select: { name: true },
      distinct: ['name'],
      orderBy: { name: 'asc' },
    });

    return res.json({ exercises: exercises.map((e) => e.name) });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
