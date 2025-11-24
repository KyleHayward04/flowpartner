// User & Profile Routes
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users/profile - Get user's own profile
router.get('/profile', async (req, res) => {
    try {
        const profile = await prisma.profile.findUnique({
            where: { user_id: req.user.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/users/profile - Update user's profile
router.put('/profile', async (req, res) => {
    try {
        const { business_name, website, location, niche, skills, bio } = req.body;

        const profile = await prisma.profile.update({
            where: { user_id: req.user.id },
            data: {
                business_name,
                website,
                location,
                niche,
                skills,
                bio
            }
        });

        res.json(profile);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/users/:id - Get public user profile (for viewing freelancers)
router.get('/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                role: true,
                created_at: true,
                profile: true,
                reviews_received: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        created_at: true,
                        from_user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
