const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const cors=require("cors");
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())

app.post('/referrals', async (req, res) => {
  const { yourName, friendName, friendEmail } = req.body;

  // Validate the input
  if (!yourName || !friendName || !friendEmail) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Save the referral data to the database
    const referral = await prisma.referral.create({
      data: { yourName, friendName, friendEmail },
    });

    // Send referral email
    await sendReferralEmail(referral);

    res.status(201).json(referral);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the referral.' });
  }
});

// Function to send referral email
async function sendReferralEmail(referral) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: referral.friendEmail,
    subject: 'You have been referred!',
    text: `Hello ${referral.friendName},\n\n${referral.yourName} has referred you to our service!`,
  };

  await transporter.sendMail(mailOptions);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
