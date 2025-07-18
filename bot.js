const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./config');

// Generate 8-digit code (XXXX-XXXX)
function generatePairingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return [...Array(8)].map((_,i) => i === 4 ? '-' : chars[Math.floor(Math.random()*32)]).join('');
}

// Notification with retries
async function sendAlert(message, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await client.sendMessage(
        `${config.myNumber}@c.us`, 
        `🔔 BOT ALERT:\n${message}`
      );
      console.log('Notification sent successfully');
      return true;
    } catch (error) {
      console.error(`Attempt ${i+1}: Failed to send alert - ${error.message}`);
      if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: `bot-${config.myNumber}`,
    dataPath: './sessions'
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  }
});

// ========================
// EVENT HANDLERS
// ========================

client.on('qr', async () => {
  const code = generatePairingCode();
  console.log(`\nPAIRING CODE: ${code}`);
  
  await sendAlert(
    `Pairing Code: ${code}\n` +
    `Expires in 2 minutes\n` +
    `Go to: WhatsApp → Linked Devices → "Link with number"`
  );
});

client.on('authenticated', () => {
  console.log('✅ Authenticated!');
  sendAlert('Device linked successfully!');
});

client.on('ready', () => {
  console.log('🤖 Bot ready');
  sendAlert('Bot is now online');
});

client.on('message', async msg => {
  if (msg.body === config.command && msg.isGroupMsg) {
    try {
      const chat = await msg.getChat();
      const mentions = chat.participants
        .filter(p => !p.isMe)
        .map(p => p.id._serialized);
      
      await msg.reply(
        `${config.mentionText} ${mentions.map(m => `@${m.split('@')[0]}`).join(' ')}`,
        { mentions }
      );
    } catch (error) {
      console.error('Tagging error:', error);
      await sendAlert(`⚠️ Tagging failed: ${error.message}`);
    }
  }
});

client.initialize();

// Keep alive
setInterval(() => console.log('[Heartbeat]'), 30000);
