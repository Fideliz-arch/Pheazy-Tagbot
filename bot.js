const { Client, LocalAuth } = require('whatsapp-web.js');

// Generate pairing code
function generateCode() {
  return Array.from({length: 8}, (_,i) => 
    i === 4 ? '-' : 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]
  ).join('');
}

console.log('🚀 Starting WhatsApp Bot...');

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './session' }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]
  }
});

client.on('qr', () => {
  const code = generateCode();
  console.log('\n🔢 PAIRING CODE:', code);
  console.log('1. Open WhatsApp → Linked Devices');
  console.log('2. Tap "Link with phone number"');
  console.log(`3. Enter code: ${code}\n`);
});

client.on('authenticated', () => {
  console.log('✅ Authentication successful!');
});

client.on('ready', () => {
  console.log('\n🤖 Bot is ONLINE!');
  console.log('Use !tagall in any group chat');
});

client.on('message', async msg => {
  if (msg.body === '!tagall' && msg.isGroupMsg) {
    try {
      const chat = await msg.getChat();
      const mentions = chat.participants
        .filter(p => !p.isMe)
        .map(p => p.id._serialized);
      
      await msg.reply(
        `📢 @everyone: ${mentions.map(m => `@${m.split('@')[0]}`).join(' ')}`,
        { mentions }
      );
    } catch (error) {
      console.error('⚠️ Tagging error:', error.message);
    }
  }
});

// Handle errors
client.on('auth_failure', () => console.error('❌ Authentication failed'));
client.on('disconnected', () => console.error('❌ Disconnected'));

client.initialize();

// Keep process alive
setInterval(() => {}, 1000);
