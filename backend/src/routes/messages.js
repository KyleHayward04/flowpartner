// Message Routes
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// POST /api/messages - Send message
router.post('/', async (req, res) => {
    try {
        const { job_id, text } = req.body;

        if (!job_id || !text) {
            return res.status(400).json({ error: 'Job ID and message text required' });
        }

        // Verify user is involved in the job
        const job = await prisma.job.findUnique({
            where: { id: job_id }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const isOwner = job.owner_id === req.user.id;
        const isChosenFreelancer = job.chosen_freelancer_id === req.user.id;

        if (!isOwner && !isChosenFreelancer && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized to message on this job' });
        }

        const message = await prisma.message.create({
            data: {
                job_id,
                sender_id: req.user.id,
                text
            },
            include: {
                sender: {
                    select: { id: true, name: true }
                }
            }
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/messages/job/:jobId - Get all messages for a job
router.get('/job/:jobId', async (req, res) => {
    try {
        const jobId = parseInt(req.params.jobId);

        // Verify user is involved in the job
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const isOwner = job.owner_id === req.user.id;
        const isChosenFreelancer = job.chosen_freelancer_id === req.user.id;

        if (!isOwner && !isChosenFreelancer && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized to view messages for this job' });
        }

        const messages = await prisma.message.findMany({
            where: { job_id: jobId },
            include: {
                sender: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { created_at: 'asc' }
        });

        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
