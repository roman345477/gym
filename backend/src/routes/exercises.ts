import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /exercises
router.post('/', async (req: Request, res: Response) => {
  try {
    const { workoutId, name } = req.body;
    if (!workoutId || !name) {
      return res.status(400).json({ error: 'workoutId and name are required' });
    }

    const exercise = await prisma.exercise.create({
      data: { workoutId: Number(workoutId), name },
      include: { sets: true },
    });

    return res.json({ exercise });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /exercises/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.exercise.delete({ where: { id: Number(req.params.id) } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
