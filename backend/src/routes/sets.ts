import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /sets
router.post('/', async (req: Request, res: Response) => {
  try {
    const { exerciseId, weight, reps } = req.body;
    if (!exerciseId) return res.status(400).json({ error: 'exerciseId is required' });

    const set = await prisma.set.create({
      data: {
        exerciseId: Number(exerciseId),
        weight: Number(weight) || 0,
        reps: Number(reps) || 0,
      },
    });

    return res.json({ set });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /sets/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.set.delete({ where: { id: Number(req.params.id) } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
