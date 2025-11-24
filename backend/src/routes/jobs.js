// Job Routes
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireBusinessOwner, requireEmailVerification } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// POST /api/jobs - Create new job (business owners only, email verified)
router.post('/', requireBusinessOwner, requireEmailVerification, async (req, res) => {
    try {
        const { title, description, category, budget_min, budget_max, deadline } = req.body;

        if (!title || !description || !category || !budget_min || !budget_max || !deadline) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const job = await prisma.job.create({
            data: {
                owner_id: req.user.id,
                title,
                description,
                category,
                budget_min,
                budget_max,
                deadline: new Date(deadline),
                status: 'OPEN'
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        res.status(201).json(job);
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/jobs - List jobs with filters
router.get('/', async (req, res) => {
    try {
        const { owner, status, category } = req.query;

        const where = {};

        if (owner) {
            where.owner_id = parseInt(owner);
        }

        if (status) {
            where.status = status;
        }

        if (category) {
            where.category = category;
        }

        const jobs = await prisma.job.findMany({
            where,
            include: {
                owner: {
                    select: { id: true, name: true }
                },
                _count: {
                    select: { proposals: true }
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

// GET /api/jobs/:id - Get job details
router.get('/:id', async (req, res) => {
    try {
        const jobId = parseInt(req.params.id);

        const job = await prisma.job.findUnique({
            where: { id: jobId },
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
            }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json(job);
    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/jobs/:id - Update job
router.put('/:id', async (req, res) => {
    try {
        const jobId = parseInt(req.params.id);
        const { title, description, category, budget_min, budget_max, deadline, status } = req.body;

        // Verify ownership
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        if (job.owner_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updatedJob = await prisma.job.update({
            where: { id: jobId },
            data: {
                title,
                description,
                category,
                budget_min,
                budget_max,
                deadline: deadline ? new Date(deadline) : undefined,
                status
            }
        });

        res.json(updatedJob);
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/jobs/:id/select-freelancer - Select freelancer for job
router.put('/:id/select-freelancer', requireBusinessOwner, async (req, res) => {
    try {
        const jobId = parseInt(req.params.id);
        const { freelancerId } = req.body;

        // Verify ownership
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        if (job.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Update job and proposal status
        const [updatedJob] = await prisma.$transaction([
            prisma.job.update({
                where: { id: jobId },
                data: {
                    chosen_freelancer_id: freelancerId,
                    status: 'IN_PROGRESS'
                }
            }),
            prisma.proposal.updateMany({
                where: { job_id: jobId, freelancer_id: freelancerId },
                data: { status: 'ACCEPTED' }
            }),
            prisma.proposal.updateMany({
                where: {
                    job_id: jobId,
                    freelancer_id: { not: freelancerId }
                },
                data: { status: 'REJECTED' }
            })
        ]);

        res.json(updatedJob);
    } catch (error) {
        console.error('Select freelancer error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/jobs/:id/complete - Mark job as completed
router.put('/:id/complete', async (req, res) => {
    try {
        const jobId = parseInt(req.params.id);
        const { rating, comment } = req.body;

        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Only owner or chosen freelancer can complete
        if (job.owner_id !== req.user.id && job.chosen_freelancer_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updatedJob = await prisma.job.update({
            where: { id: jobId },
            data: { status: 'COMPLETED' }
        });

        // If rating provided, create review
        if (rating) {
            const to_user_id = req.user.id === job.owner_id
                ? job.chosen_freelancer_id
                : job.owner_id;

            await prisma.review.create({
                data: {
                    job_id: jobId,
                    from_user_id: req.user.id,
                    to_user_id,
                    rating,
                    comment
                }
            });
        }

        res.json(updatedJob);
    } catch (error) {
        console.error('Complete job error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
