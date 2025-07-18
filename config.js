module.exports = {
  // REQUIRED CONFIG
  myNumber: '1234567890', // International format (no +)
  
  // NOTIFICATIONS
  notificationEmail: 'your-email@example.com',
  notificationGroup: '1234567890-123456@g.us', // Group ID
  
  // BOT BEHAVIOR
  command: '!tagall',
  mentionText: '📢 Attention:',
  
  // SECURITY
  adminNumbers: ['1234567890'], // Control numbers
  pairingCodeExpiry: 120000 // 2 minutes
};
