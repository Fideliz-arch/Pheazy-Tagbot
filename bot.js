const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./config');

// Generate 8-digit code (XXXX-XXXX)
function generatePairingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3) code += '-';
  }
  return code;
}

console.log(`🚀 Starting bot for ${config.myName} (${config.myNumber})`);

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

// Keep alive heartbeat
setInterval(() => {
  console.log(`[${new Date().toLocaleTimeString()}] Bot active`);
}, 30000);

client.on('qr', () => {
  const code = generatePairingCode();
  console.log('\n=== WHATSAPP LINKING ===');
  console.log(`For: ${config.myNumber}`);
  console.log(`Code: ${code}`);
  console.log('1. WhatsApp → Linked Devices → "Link with number"');
  console.log(`2. Enter code: ${code}\n`);
});

client.on('ready', () => {
  console.log('\n🤖 BOT ONLINE');
  console.log(`Use "${config.command}" in groups`);
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
      console.error('⚠️ Tagging error:', error.message);
    }
  }
});

client.initialize();
