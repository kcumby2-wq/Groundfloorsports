// lib/notifications.js
export async function sendNotification(userId, { type, uploadId, message }) {
  // TODO: Integrate with email, in-app, or push notification system
  // For now, just log
  console.log(`[NOTIFY][${userId}] ${type} (${uploadId}): ${message}`);
}
