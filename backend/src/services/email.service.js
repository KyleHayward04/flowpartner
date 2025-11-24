// Email Service - Handles sending verification and notification emails using SendGrid Web API
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

// Initialize SendGrid
const initializeSendGrid = () => {
    if (!process.env.SENDGRID_API_KEY && !process.env.EMAIL_PASSWORD) {
        console.error('Missing SendGrid API key');
        throw new Error('SENDGRID_API_KEY or EMAIL_PASSWORD environment variable required');
    }

    // Use SENDGRID_API_KEY if available, otherwise EMAIL_PASSWORD
    const apiKey = process.env.SENDGRID_API_KEY || process.env.EMAIL_PASSWORD;
    sgMail.setApiKey(apiKey);
    console.log('SendGrid initialized successfully');
};

// Initialize on module load
initializeSendGrid();

// Generate verification token
export const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Send email verification
export const sendVerificationEmail = async (email, name, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/#/verify-email/${token}`;

    const msg = {
        to: email,
        from: process.env.EMAIL_FROM || 'noreply@flowpartner.xyz',
        subject: 'Verify Your Email - FlowPartner',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #94a3b8; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to FlowPartner!</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${name},</p>
                        <p>Thank you for signing up for FlowPartner! We're excited to have you on board.</p>
                        <p>To complete your registration and start connecting with ${email.includes('business') ? 'talented freelancers' : 'exciting projects'}, please verify your email address by clicking the button below:</p>
                        <center>
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </center>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="background: #e2e8f0; padding: 10px; border-radius: 5px; word-break: break-all;">${verificationUrl}</p>
                        <p><strong>This link will expire in 24 hours.</strong></p>
                        <p>If you didn't create an account with FlowPartner, you can safely ignore this email.</p>
                        <p>Best regards,<br>The FlowPartner Team</p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} FlowPartner. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`Verification email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('SendGrid error:', error.response?.body || error.message);
        throw new Error('Failed to send verification email');
    }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email, name, role) => {
    const dashboardUrl = role === 'BUSINESS_OWNER'
        ? `${process.env.FRONTEND_URL}/#/business/dashboard`
        : `${process.env.FRONTEND_URL}/#/freelancer/dashboard`;

    const msg = {
        to: email,
        from: process.env.EMAIL_FROM || 'noreply@flowpartner.xyz',
        subject: 'Welcome to FlowPartner - Email Verified!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Email Verified!</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${name},</p>
                        <p>Your email has been successfully verified! You now have full access to FlowPartner.</p>
                        ${role === 'BUSINESS_OWNER' ? `
                            <p>As a business owner, you can now:</p>
                            <ul>
                                <li>Post unlimited jobs</li>
                                <li>Review proposals from vetted freelancers</li>
                                <li>Communicate directly with talent</li>
                                <li>Build your team</li>
                            </ul>
                        ` : `
                            <p>As a freelancer, you can now:</p>
                            <ul>
                                <li>Browse and apply to quality projects</li>
                                <li>Submit proposals to businesses</li>
                                <li>Build your reputation</li>
                                <li>Grow your freelance business</li>
                            </ul>
                        `}
                        <center>
                            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
                        </center>
                        <p>If you have any questions, feel free to reach out to our support team.</p>
                        <p>Happy collaborating!<br>The FlowPartner Team</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error('Welcome email error:', error.response?.body || error.message);
        // Don't throw - welcome email is not critical
    }
};

export default {
    generateVerificationToken,
    sendVerificationEmail,
    sendWelcomeEmail
};
