const express = require('express');
const router = express.Router();
const User = require('../models/user');
const UserNotification = require('../models/notification');
const transporter = require('../config/mailConfig');
require('dotenv').config();

// Send notification to all users + email
router.post('/send', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // Fetch all users
    const users = await User.find({}, '_id email');

    const emailList = [];

    for (const user of users) {
      // Push notification to user document
      await UserNotification.findOneAndUpdate(
        { userId: user._id },
        { $push: { notifications: { message } } },
        { upsert: true, new: true }
      );

      if (user.email) emailList.push(user.email);
    }

    // Send bulk email
    if (emailList.length > 0) {
      const mailOptions = {
        from: `"Investment Software" <${process.env.EMAIL_USERNAME}>`,
        to: emailList,
        subject: '📢 New Notification from Admin',
        html: `<p>${message}</p><p><small>Sent from Investment Software</small></p>`,
      };
      await transporter.sendMail(mailOptions);
    }

    return res.status(201).json({ success: true, message: 'Notification sent to all users.' });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get notifications for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userNotif = await UserNotification.findOne({ userId }).sort({ 'notifications.createdAt': -1 });

    if (!userNotif) {
      return res.json([]);
    }

    return res.json(userNotif.notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as seen for a user
router.put("/mark-all-seen/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    await UserNotification.updateOne(
      { userId },
      { $set: { "notifications.$[].seen": true } }
    );

    res.status(200).json({ message: "All notifications marked as seen." });
  } catch (error) {
    console.error("Error updating notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
