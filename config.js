module.exports = {
  // REQUIRED: Your WhatsApp number in international format (no + or spaces)
  myNumber: '1234567890', // Example: '4917612345678' for Germany
  
  // Optional customization
  myName: 'MyBotAdmin',   // For console logs
  command: '!tagall',     // Trigger command
  mentionText: '📢 Attention everyone:', // Tag message
  
  // Security (whitelist numbers that can control the bot)
  adminNumbers: ['1234567890'] // Add other admins if needed
};
