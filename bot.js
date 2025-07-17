const { Client, LocalAuth } = require('whatsapp-web.js');

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
  authStrategy: new LocalAuth({ dataPath: './session' }),
  puppeteer: { 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  }
});

client.on('qr', () => {
  const pairingCode = generatePairingCode();
  console.log('\n=== WHATSAPP PAIRING ===');
  console.log(`Code: ${pairingCode}`);
  console.log('1. Open WhatsApp → Linked Devices → Link with number');
  console.log(`2. Enter code: ${pairingCode}\n`);
});

client.on('ready', () => {
  console.log('✅ Bot ready! Use !tagall in groups');
});

client.on('message', async msg => {
  if (msg.body === '!tagall' && msg.isGroupMsg) {
    try {
      const chat = await msg.getChat();
      const mentions = chat.participants
        .filter(p => !p.isMe)
        .map(p => p.id._serialized);
      
      await msg.reply(
        `📢 @everyone: ${mentions.map(m => `@${m.split('@')[0]}`.join(' ')}`,
        { mentions }
      );
    } catch (error) {
      console.error('Tagging error:', error);
    }
  }
});

client.initialize();

// Keep process alive
process.on('SIGINT', () => process.exit());
