// Database Seed Script
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.review.deleteMany();
    await prisma.message.deleteMany();
    await prisma.proposal.deleteMany();
    await prisma.job.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@flowpartner.com',
            password_hash: hashedPassword,
            role: 'ADMIN',
            profile: { create: {} }
        }
    });

    const businessOwner = await prisma.user.create({
        data: {
            name: 'John Business',
            email: 'john@business.com',
            password_hash: hashedPassword,
            role: 'BUSINESS_OWNER',
            profile: {
                create: {
                    business_name: 'John\'s Plumbing Services',
                    website: 'https://johnsplumbing.com',
                    location: 'Austin, TX'
                }
            }
        }
    });

    const freelancer1 = await prisma.user.create({
        data: {
            name: 'Sarah Designer',
            email: 'sarah@freelance.com',
            password_hash: hashedPassword,
            role: 'FREELANCER',
            profile: {
                create: {
                    niche: 'Web Design & Development',
                    skills: 'HTML, CSS, JavaScript, React, Figma',
                    bio: 'Experienced web designer with 5+ years building beautiful, responsive websites for small businesses.'
                }
            }
        }
    });

    const freelancer2 = await prisma.user.create({
        data: {
            name: 'Mike AdsPro',
            email: 'mike@freelance.com',
            password_hash: hashedPassword,
            role: 'FREELANCER',
            profile: {
                create: {
                    niche: 'Digital Marketing & Advertising',
                    skills: 'Facebook Ads, Google Ads, SEO, Analytics',
                    bio: 'Digital marketing specialist helping local businesses get more customers through targeted online advertising.'
                }
            }
        }
    });

    // Create jobs
    console.log('Creating jobs...');
    const job1 = await prisma.job.create({
        data: {
            owner_id: businessOwner.id,
            title: 'Setup Facebook Ads Campaign for Plumbing Business',
            description: 'I need help setting up and managing a Facebook Ads campaign to generate leads for my plumbing business. Looking for someone to create ad copy, select images, set up targeting for homeowners in Austin, TX area, and monitor performance. Need weekly reports on ad spend and leads generated.',
            category: 'ads',
            budget_min: 800,
            budget_max: 1500,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            status: 'OPEN'
        }
    });

    const job2 = await prisma.job.create({
        data: {
            owner_id: businessOwner.id,
            title: 'Build Professional Website for Local Service Business',
            description: 'Looking for a web developer to build a professional website for my plumbing business. Need 5-7 pages including Home, About, Services, Testimonials, Contact. Must be mobile-responsive and easy to update. Prefer WordPress or similar CMS.',
            category: 'website',
            budget_min: 1200,
            budget_max: 2500,
            deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
            status: 'OPEN'
        }
    });

    // Create proposals
    console.log('Creating proposals...');
    const proposal1 = await prisma.proposal.create({
        data: {
            job_id: job1.id,
            freelancer_id: freelancer2.id,
            message: 'Hi John! I\'d love to help with your Facebook Ads campaign. I have 3+ years of experience running successful ad campaigns for local service businesses. I can create compelling ad copy, design engaging visuals, and target the right audience in Austin. I provide detailed weekly reports and am always available for questions.',
            proposed_price: 1200,
            status: 'PENDING'
        }
    });

    const proposal2 = await prisma.proposal.create({
        data: {
            job_id: job2.id,
            freelancer_id: freelancer1.id,
            message: 'Hello! I specialize in building websites for local service businesses. I can create a beautiful, professional WordPress site that\'s easy for you to update. I\'ll include SEO best practices, mobile optimization, and a contact form that sends leads directly to your email. I can have this completed within 3 weeks.',
            proposed_price: 1800,
            status: 'PENDING'
        }
    });

    console.log('✅ Seed data created successfully!');
    console.log('\n📧 Test accounts:');
    console.log('Admin: admin@flowpartner.com / password123');
    console.log('Business Owner: john@business.com / password123');
    console.log('Freelancer 1: sarah@freelance.com / password123');
    console.log('Freelancer 2: mike@freelance.com / password123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
