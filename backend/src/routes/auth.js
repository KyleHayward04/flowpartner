// Authentication Routes
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { generateVerificationToken, sendVerificationEmail, sendWelcomeEmail } from '../services/email.service.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/signup - Register new user
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!['BUSINESS_OWNER', 'FREELANCER'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Generate verification token
        const verificationToken = generateVerificationToken();
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hour expiry

        // Create user and profile
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password_hash,
                role,
                email_verification_token: verificationToken,
                email_verification_expires: tokenExpiry,
                profile: {
                    create: {}
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                email_verified: true,
                created_at: true
            }
        });

        // Send verification email
        try {
            await sendVerificationEmail(email, name, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Delete the user if email fails
            await prisma.user.delete({ where: { id: user.id } });
            return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
        }

        res.status(201).json({
            message: 'Account created! Please check your email to verify your account.',
            user: {
                name: user.name,
                email: user.email,
                email_verified: user.email_verified
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

// POST /api/auth/login - Authenticate user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password_hash: true,
                role: true,
                active: true
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.active) {
            return res.status(403).json({ error: 'Account has been deactivated' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Remove password from response
        const { password_hash, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                email_verified: true,
                created_at: true,
                profile: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/auth/verify-email/:token - Verify email with token
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with this token
        const user = await prisma.user.findUnique({
            where: { email_verification_token: token }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        // Check if already verified
        if (user.email_verified) {
            return res.json({ message: 'Email already verified', alreadyVerified: true });
        }

        // Check if token is expired
        if (user.email_verification_expires && new Date() > user.email_verification_expires) {
            return res.status(400).json({ error: 'Verification token has expired. Please request a new one.' });
        }

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                email_verified: true,
                email_verification_token: null,
                email_verification_expires: null
            }
        });

        // Send welcome email
        try {
            await sendWelcomeEmail(user.email, user.name, user.role);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the verification if welcome email fails
        }

        res.json({ message: 'Email verified successfully!', verified: true });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Server error during verification' });
    }
});

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // Don't reveal if email exists
            return res.json({ message: 'If an account exists with this email, a verification link has been sent.' });
        }

        if (user.email_verified) {
            return res.json({ message: 'Email is already verified' });
        }

        // Generate new token
        const verificationToken = generateVerificationToken();
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 24);

        // Update user with new token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                email_verification_token: verificationToken,
                email_verification_expires: tokenExpiry
            }
        });

        // Send verification email
        await sendVerificationEmail(user.email, user.name, verificationToken);

        res.json({ message: 'Verification email sent! Please check your inbox.' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Failed to resend verification email' });
    }
});

export default router;
