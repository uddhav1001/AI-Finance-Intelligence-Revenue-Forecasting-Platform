const nodemailer = require('nodemailer');

// Set up the Nodemailer transporter (SMTP config is pulled from .env)
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        requireTLS: true, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

/**
 * Sends the monthly financial report email to a user
 * @param {string} userEmail - The recipient's email address
 * @param {Object} data - The aggregated financial data
 * @param {string} data.username - The user's name
 * @param {number} data.totalRevenue - Total revenue for the past month
 * @param {number} data.totalExpense - Total expense for the past month
 * @param {number} data.netProfit - Net profit for the past month
 * @param {number} data.forecastRevenue - Projected 30-day forecast
 * @param {Array} data.aiInsights - AI-generated insights/recommendations
 */
const sendMonthlyReportEmail = async (userEmail, data) => {
    try {
        const transporter = createTransporter();

        // Format currency helper
        const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

        // Generate Insights HTML list
        const insightsHtml = data.aiInsights.map(insight =>
            `<li><strong>${insight.title}:</strong> ${insight.message}</li>`
        ).join('');

        // Provide a default if no insights exist
        const finalInsightsHtml = insightsHtml || `<li>Keep logging your transactions to get personalized AI recommendations!</li>`;

        const mailOptions = {
            from: `"Finance AI Intelligence" <${process.env.SMTP_USER || 'noreply@financeai.com'}>`, // Sender address
            to: userEmail, // List of receivers
            subject: '📊 Your Monthly Finance Summary is Here!', // Subject line
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eaeaea; border-radius: 8px;">
                <!-- Header -->
                <div style="background-color: #1e293b; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h2 style="color: #ffffff; margin: 0;">Finance AI Intelligence</h2>
                </div>
                
                <!-- Body -->
                <div style="padding: 30px;">
                    <p>Hi <strong>${data.username}</strong>,</p>
                    <p>Here is your financial summary for the last 30 days. Let's see how you did!</p>
                    
                    <!-- Stats Grid -->
                    <table style="width: 100%; text-align: center; margin-bottom: 25px; border-collapse: separate; border-spacing: 10px;">
                        <tr>
                            <td style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; width: 33%;">
                                <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Revenue</div>
                                <div style="font-size: 18px; font-weight: bold; color: #10b981;">${formatCurrency(data.totalRevenue)}</div>
                            </td>
                            <td style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; width: 33%;">
                                <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Expenses</div>
                                <div style="font-size: 18px; font-weight: bold; color: #ef4444;">${formatCurrency(data.totalExpense)}</div>
                            </td>
                            <td style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; width: 33%;">
                                <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Net Profit</div>
                                <div style="font-size: 18px; font-weight: bold; color: #3b82f6;">${formatCurrency(data.netProfit)}</div>
                            </td>
                        </tr>
                    </table>

                    <!-- Forecast Section -->
                    <div style="background-color: #ede9fe; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <h3 style="margin-top: 0; color: #5b21b6; border-bottom: 1px solid #ddd6fe; padding-bottom: 10px;">🚀 Next 30-Day Forecast</h3>
                        <p style="margin-bottom: 0;">Based on your current trend, you are projected to generate a net profit of <strong>${formatCurrency(data.forecastRevenue)}</strong> over the next 30 days.</p>
                    </div>

                    <!-- AI Insights Section -->
                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px;">
                        <h3 style="margin-top: 0; color: #166534; border-bottom: 1px solid #dcfce7; padding-bottom: 10px;">🤖 AI Recommendations</h3>
                        <ul style="margin-bottom: 0; color: #15803d; padding-left: 20px;">
                            ${finalInsightsHtml}
                        </ul>
                    </div>
                    
                    <p style="margin-top: 30px;">Access your full interactive dashboard below:</p>
                    <div style="text-align: center;">
                        <a href="http://localhost:5173/dashboard" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px;">View Dashboard</a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0;">You are receiving this because you opted into monthly financial summaries.</p>
                    <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Finance AI Intelligence. All rights reserved.</p>
                </div>
            </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Monthly Report email sent to ${userEmail} [MessageId: ${info.messageId}]`);
        return true;
    } catch (error) {
        console.error(`Error sending monthly report to ${userEmail}:`, error);
        return false;
    }
};

/**
 * Sends a password reset email to a user
 * @param {string} userEmail - The recipient's email address
 * @param {string} resetUrl - The secure link that contains the reset token
 * @param {string} username - The user's name
 */
const sendPasswordResetEmail = async (userEmail, resetUrl, username) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Finance AI Intelligence" <${process.env.SMTP_USER || 'noreply@financeai.com'}>`,
            to: userEmail,
            subject: '🔒 Reset Your Finance AI Password',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eaeaea; border-radius: 8px;">
                <!-- Header -->
                <div style="background-color: #1e293b; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h2 style="color: #ffffff; margin: 0;">Finance AI Intelligence</h2>
                </div>
                
                <!-- Body -->
                <div style="padding: 30px;">
                    <p>Hi <strong>${username}</strong>,</p>
                    <p>We received a request to reset the password for your Finance AI Intelligence account.</p>
                    <p>If you made this request, click the button below to securely set a new password. This link will safely expire in 1 hour.</p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; box-shadow: 0px 4px 6px rgba(59, 130, 246, 0.25);">Reset Password</a>
                    </div>

                    <p style="font-size: 14px; color: #64748b; background-color: #f8fafc; padding: 15px; border-radius: 6px; word-break: break-all;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${resetUrl}" style="color: #3b82f6;">${resetUrl}</a>
                    </p>

                    <p style="margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email.</p>
                    <p>Thanks,<br>The Finance AI Team</p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0;">© ${new Date().getFullYear()} Finance AI Intelligence. All rights reserved.</p>
                </div>
            </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Password Reset email sent to ${userEmail} [MessageId: ${info.messageId}]`);
        return true;
    } catch (error) {
        console.error(`Error sending password reset to ${userEmail}:`, error);
        return false;
    }
};

module.exports = { sendMonthlyReportEmail, sendPasswordResetEmail };
