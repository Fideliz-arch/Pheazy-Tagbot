const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./config');

// Generate 8-digit pairing code (XXXX-XXXX)
function generatePairingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3) code += '-';
  }
  return code;
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

// WhatsApp Notification Handler
async function sendAlert(message) {
  try {
    await client.sendMessage(
      `${config.myNumber}@c.us`,
      `🔔 BOT NOTIFICATION:\n${message}`
    );
    console.log('Notification sent');
  } catch (error) {
    console.error('Failed to send alert:', error.message);
  }
}

client.on('qr', async () => {
  const code = generatePairingCode();
  console.log(`\nPAIRING CODE: ${code}`);
  await sendAlert(
    `Pairing Code: ${code}\n` +
    `Expires in 2 minutes\n` +
    `Go to: WhatsApp → Linked Devices → "Link with number"`
  );
});

client.on('ready', () => {
  console.log('🤖 Bot ready');
  sendAlert('✅ Bot is now online');
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
setInterval(() => console.log('❤️ Pulse check'), 30000);