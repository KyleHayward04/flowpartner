// Review Routes
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// POST /api/reviews - Create review
router.post('/', async (req, res) => {
    try {
        const { job_id, to_user_id, rating, comment } = req.body;

        if (!job_id || !to_user_id || !rating) {
            return res.status(400).json({ error: 'Job ID, recipient, and rating required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Verify user was involved in the job
        const job = await prisma.job.findUnique({
            where: { id: job_id }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const isOwner = job.owner_id === req.user.id;
        const isChosenFreelancer = job.chosen_freelancer_id === req.user.id;

        if (!isOwner && !isChosenFreelancer) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Check if already reviewed
        const existing = await prisma.review.findFirst({
            where: {
                job_id,
                from_user_id: req.user.id,
                to_user_id
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'You have already reviewed this user for this job' });
        }

        const review = await prisma.review.create({
            data: {
                job_id,
                from_user_id: req.user.id,
                to_user_id,
                rating,
                comment
            },
            include: {
                from_user: {
                    select: { id: true, name: true }
                },
                to_user: {
                    select: { id: true, name: true }
                }
            }
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/reviews/user/:userId - Get reviews for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        const reviews = await prisma.review.findMany({
            where: { to_user_id: userId },
            include: {
                from_user: {
                    select: { id: true, name: true }
                },
                job: {
                    select: { id: true, title: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
