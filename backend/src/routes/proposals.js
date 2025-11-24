// Proposal Routes
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireFreelancer } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// POST /api/proposals - Submit proposal (freelancers only)
router.post('/', requireFreelancer, async (req, res) => {
    try {
        const { job_id, message, proposed_price } = req.body;

        if (!job_id || !message || !proposed_price) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if job exists and is open
        const job = await prisma.job.findUnique({
            where: { id: job_id }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        if (job.status !== 'OPEN') {
            return res.status(400).json({ error: 'Job is not accepting proposals' });
        }

        // Check if already proposed
        const existing = await prisma.proposal.findUnique({
            where: {
                job_id_freelancer_id: {
                    job_id,
                    freelancer_id: req.user.id
                }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'You have already submitted a proposal for this job' });
        }

        const proposal = await prisma.proposal.create({
            data: {
                job_id,
                freelancer_id: req.user.id,
                message,
                proposed_price,
                status: 'PENDING'
            },
            include: {
                freelancer: {
                    select: { id: true, name: true, email: true }
                },
                job: {
                    select: { id: true, title: true }
                }
            }
        });

        res.status(201).json(proposal);
    } catch (error) {
        console.error('Create proposal error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/proposals/job/:jobId - Get all proposals for a job
router.get('/job/:jobId', async (req, res) => {
    try {
        const jobId = parseInt(req.params.jobId);

        // Verify user is job owner
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        if (job.owner_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const proposals = await prisma.proposal.findMany({
            where: { job_id: jobId },
            include: {
                freelancer: {
                    select: {
                        id: true,
                        name: true,
                        profile: {
                            select: { niche: true, skills: true, bio: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(proposals);
    } catch (error) {
        console.error('Get proposals error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/proposals/my-proposals - Get freelancer's own proposals
router.get('/my-proposals', requireFreelancer, async (req, res) => {
    try {
        const proposals = await prisma.proposal.findMany({
            where: { freelancer_id: req.user.id },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        budget_min: true,
                        budget_max: true,
                        status: true,
                        owner: {
                            select: { id: true, name: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(proposals);
    } catch (error) {
        console.error('Get my proposals error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/proposals/:id - Update proposal status (mostly for admin)
router.put('/:id', async (req, res) => {
    try {
        const proposalId = parseInt(req.params.id);
        const { status } = req.body;

        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId },
            include: { job: true }
        });

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        // Only job owner or admin can update
        if (proposal.job.owner_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updatedProposal = await prisma.proposal.update({
            where: { id: proposalId },
            data: { status }
        });

        res.json(updatedProposal);
    } catch (error) {
        console.error('Update proposal error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
