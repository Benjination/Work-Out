// Simple Node.js server for handling SMS/Email functionality
// To install dependencies: npm install express nodemailer twilio dotenv
// To run: node server.js

const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Email transporter setup (using Gmail as example)
const emailTransporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // your-email@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD // your-app-password
    }
});

// Twilio client setup
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Route for sending download links
app.post('/api/send-download-link', async (req, res) => {
    const { method, contact, message, appUrl } = req.body;
    
    try {
        if (method === 'sms') {
            // Send SMS via Twilio
            await twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
                to: contact
            });
            console.log(`SMS sent to ${contact}`);
        } else if (method === 'email') {
            // Send Email via Nodemailer
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: contact,
                subject: "Ben's Workout App - Download Link",
                text: message,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #ff0000;">💪 Ben's Workout App</h2>
                        <p>Hi there!</p>
                        <p>Here's your download link for Ben's Workout App:</p>
                        <a href="${appUrl}" style="
                            display: inline-block;
                            background: #ff0000;
                            color: white;
                            padding: 12px 24px;
                            text-decoration: none;
                            border-radius: 6px;
                            font-weight: bold;
                            margin: 20px 0;
                        ">OPEN WORKOUT APP</a>
                        <p>Your complete 30-minute workout routine with timer and progress tracking.</p>
                        <p>Stay fit! 💪</p>
                        <hr>
                        <p style="font-size: 0.9em; color: #666;">
                            If you enjoy the app, consider supporting us with a small donation to keep it free for everyone!
                        </p>
                    </div>
                `
            };
            
            await emailTransporter.sendMail(mailOptions);
            console.log(`Email sent to ${contact}`);
        }
        
        res.json({ success: true, message: 'Download link sent successfully' });
    } catch (error) {
        console.error('Error sending download link:', error);
        res.status(500).json({ success: false, error: 'Failed to send download link' });
    }
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the PWA
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Workout App Server running at:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`\n📱 To test SMS/Email functionality:`);
    console.log(`   1. Create a .env file with your credentials`);
    console.log(`   2. Install dependencies: npm install express nodemailer twilio dotenv`);
    console.log(`   3. Configure your email and Twilio settings\n`);
});

module.exports = app;