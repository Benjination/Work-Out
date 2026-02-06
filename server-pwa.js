// Production-ready server with PWA support and modern email/SMS services
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize email service (SendGrid preferred, Gmail fallback)
let emailService;
if (process.env.SENDGRID_API_KEY) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    emailService = sgMail;
    console.log('📧 Using SendGrid for email service');
} else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    const nodemailer = require('nodemailer');
    emailService = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });
    console.log('📧 Using Gmail for email service');
}

// Initialize Twilio for SMS
let smsService;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    smsService = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('📱 Using Twilio for SMS service');
}

// PWA Download Link API
app.post('/api/send-download-link', async (req, res) => {
    const { method, contact, installInstructions } = req.body;
    const appUrl = `${req.protocol}://${req.get('host')}`;
    
    try {
        if (method === 'sms') {
            if (!smsService) {
                throw new Error('SMS service not configured');
            }
            
            const smsMessage = `🏋️ BEN'S WORKOUT APP

${appUrl}

📱 INSTALL AS APP:
${installInstructions}

💪 Features:
• 30-min complete workout
• Built-in timers
• Progress tracking
• Works offline

Install for the best experience!`;

            await smsService.messages.create({
                body: smsMessage,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: contact
            });
            
            console.log(`📱 PWA SMS sent to ${contact}`);
        } 
        else if (method === 'email') {
            if (!emailService) {
                throw new Error('Email service not configured');
            }
            
            const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { 
                        font-family: 'Arial Black', Arial, sans-serif; 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 0; 
                        background: #000;
                        color: #fff;
                    }
                    .header { 
                        background: linear-gradient(135deg, #000, #333); 
                        color: #fff; 
                        padding: 30px 20px; 
                        text-align: center; 
                        border: 2px solid #ff0000;
                    }
                    .header h1 {
                        font-size: 2.5rem;
                        color: #ff0000;
                        letter-spacing: 2px;
                        text-shadow: 2px 2px 0px #000;
                        margin: 0;
                        font-weight: 900;
                    }
                    .content { 
                        padding: 30px 20px; 
                        background: #fff;
                        color: #000;
                    }
                    .install-btn { 
                        background: #ff0000; 
                        color: white; 
                        padding: 20px 40px; 
                        text-decoration: none; 
                        border: 2px solid #000; 
                        display: inline-block; 
                        margin: 20px 0; 
                        font-weight: 900;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                        transition: all 0.2s ease;
                    }
                    .install-btn:hover {
                        background: #fff;
                        color: #ff0000;
                    }
                    .instructions { 
                        background: #f0f0f0; 
                        padding: 20px; 
                        border-left: 6px solid #ff0000; 
                        margin: 25px 0; 
                    }
                    .instructions h3 {
                        color: #ff0000;
                        font-weight: 900;
                        letter-spacing: 1px;
                    }
                    .benefits {
                        background: #000;
                        color: #fff;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .benefits ul {
                        list-style: none;
                        padding: 0;
                    }
                    .benefits li {
                        padding: 8px 0;
                        font-weight: bold;
                    }
                    .benefits li:before {
                        content: "💪 ";
                        color: #ff0000;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>BEN'S WORKOUT APP</h1>
                </div>
                <div class="content">
                    <p><strong>Ready to dominate your fitness goals?</strong></p>
                    <p>Your complete 30-minute workout routine is ready to install!</p>
                    
                    <center>
                        <a href="${appUrl}" class="install-btn">OPEN WORKOUT APP</a>
                    </center>
                    
                    <div class="instructions">
                        <h3>📱 INSTALL AS APP:</h3>
                        <p><strong>${installInstructions}</strong></p>
                    </div>
                    
                    <div class="benefits">
                        <h3 style="color: #ff0000;">INSTALLING AS APP GIVES YOU:</h3>
                        <ul>
                            <li>LIGHTNING FAST LOADING</li>
                            <li>WORKS 100% OFFLINE</li>
                            <li>HOME SCREEN ICON</li>
                            <li>PUSH NOTIFICATIONS</li>
                            <li>NO BROWSER CLUTTER</li>
                        </ul>
                    </div>
                    
                    <h3>🎯 WORKOUT FEATURES:</h3>
                    <ul>
                        <li>✅ Step-by-step exercise guide</li>
                        <li>⏱️ Built-in workout timers</li>
                        <li>📈 Progress tracking system</li>
                        <li>🎯 Mark exercises complete</li>
                        <li>🔥 30-minute full body routine</li>
                    </ul>
                    
                    <center>
                        <p><strong>STAY STRONG! 💪</strong></p>
                    </center>
                </div>
            </body>
            </html>`;

            const emailData = {
                from: {
                    name: "Ben's Workout App",
                    email: process.env.SENDGRID_FROM_EMAIL || process.env.GMAIL_USER
                },
                to: contact,
                subject: "💪 Your Ben's Workout App is Ready to Install!",
                html: emailHtml,
                text: `BEN'S WORKOUT APP\n\n${appUrl}\n\nINSTALL AS APP:\n${installInstructions}\n\nInstalling as an app gives you faster loading, offline access, and push notifications!\n\nStay strong! 💪`
            };

            if (process.env.SENDGRID_API_KEY) {
                await emailService.send(emailData);
            } else {
                await emailService.sendMail(emailData);
            }
            
            console.log(`📧 PWA Email sent to ${contact}`);
        }
        
        res.json({ 
            success: true, 
            message: `PWA download link sent via ${method}`,
            installable: true 
        });
        
    } catch (error) {
        console.error(`Error sending PWA link via ${method}:`, error);
        res.status(500).json({ 
            success: false, 
            error: `Failed to send via ${method}`,
            details: error.message 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        services: {
            email: !!emailService,
            sms: !!smsService
        }
    });
});

// Serve PWA
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Ben's Workout App Server running at:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`\n📱 PWA Features:`);
    console.log(`   ✅ Installable Progressive Web App`);
    console.log(`   ✅ Automated SMS/Email sending`);
    console.log(`   ✅ Professional email templates`);
    console.log(`\n🔧 Services Status:`);
    console.log(`   Email: ${emailService ? '✅ Ready' : '❌ Not configured'}`);
    console.log(`   SMS:   ${smsService ? '✅ Ready' : '❌ Not configured'}`);
    console.log(`\n💡 To configure services, see .env.example\n`);
});

module.exports = app;