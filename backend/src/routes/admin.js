// Admin Routes
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                created_at: true,
                _count: {
                    select: {
                        jobs_owned: true,
                        proposals: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/jobs - Get all jobs
router.get('/jobs', async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                },
                chosen_freelancer: {
                    select: { id: true, name: true }
                },
                _count: {
                    select: { proposals: true, messages: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(jobs);
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/admin/users/:id/deactivate - Deactivate user
router.put('/users/:id/deactivate', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        const user = await prisma.user.update({
            where: { id: userId },
            data: { active: false },
            select: {
                id: true,
                name: true,
                email: true,
                active: true
            }
        });

        res.json(user);
    } catch (error) {
        console.error('Deactivate user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
