const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./config');

// Generate guaranteed 8-digit code (XXXX-XXXX)
function generatePairingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 unambiguous chars
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3) code += '-'; // Insert hyphen after 4 chars
  }
  
  return code; // Example: "5XK9-2F8M"
}

console.log(`🚀 Starting bot for ${config.myName} (${config.myNumber})`);

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: `bot-${config.myNumber}`, // Unique session per number
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

// Pairing Code Event
client.on('qr', () => {
  const code = generatePairingCode();
  console.log('\n=== WHATSAPP LINKING ===');
  console.log(`Number: ${config.myNumber}`);
  console.log(`8-Digit Code: ${code}`);
  console.log('1. Open WhatsApp → Linked Devices');
  console.log('2. Tap "Link with phone number"');
  console.log(`3. Enter code: ${code}\n`);
});

client.on('authenticated', () => {
  console.log(`✅ Linked to ${config.myNumber}`);
});

client.on('ready', () => {
  console.log(`\n🤖 BOT ONLINE | Use "${config.command}" in groups`);
});

// Message Handling
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
      console.error('Tagging failed:', error.message);
    }
  }
});

client.initialize();

// Keep process alive
setInterval(() => {}, 1000);
