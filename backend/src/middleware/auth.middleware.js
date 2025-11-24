// Authentication Middleware
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
}

// Middleware to require email verification for sensitive actions
export async function requireEmailVerification(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { email_verified: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.email_verified) {
            return res.status(403).json({
                error: 'Please verify your email address to perform this action',
                emailVerificationRequired: true
            });
        }

        next();
    } catch (error) {
        console.error('Email verification check error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}

// Convenience middleware for specific roles
export const requireBusinessOwner = requireRole('BUSINESS_OWNER');
export const requireFreelancer = requireRole('FREELANCER');
export const requireAdmin = requireRole('ADMIN');
