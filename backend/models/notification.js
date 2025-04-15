const mongoose = require('mongoose');

const notificationItemSchema = new mongoose.Schema({
  message: { type: String, required: true },
  seen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const userNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  notifications: [notificationItemSchema]
});

module.exports = mongoose.model('UserNotification', userNotificationSchema);
