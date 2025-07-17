const { Client, LocalAuth } = require('whatsapp-web.js');

// Generate 8-digit alphanumeric pairing code (XXXX-XXXX format)
function generatePairingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded easily confused chars
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
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Store and display pairing code
let pairingCode = generatePairingCode();
let pairingTimeout;

client.on('qr', () => {
  pairingCode = generatePairingCode(); // Refresh code on new QR event
  console.log('\n=== WHATSAPP PAIRING INSTRUCTIONS ===');
  console.log(`Pairing Code: ${pairingCode}`);
  console.log('1. Open WhatsApp on your phone');
  console.log('2. Go to Settings → Linked Devices → Link a Device');
  console.log('3. Choose "Link with phone number"');
  console.log(`4. Enter this code: ${pairingCode}\n`);
  
  // Refresh code every 2 minutes (WhatsApp's QR timeout)
  clearTimeout(pairingTimeout);
  pairingTimeout = setTimeout(() => {
    console.log('\n⚠️ Code expired. Generating new code...');
  }, 120000);
});

client.on('ready', () => {
  console.log('✅ Bot is online! Send !tagall in any group');
});

client.on('message', async msg => {
  if (msg.body === '!tagall' && msg.isGroupMsg) {
    try {
      const chat = await msg.getChat();
      const mentions = chat.participants
        .filter(p => p.id._serialized !== msg.from) // Exclude sender
        .map(p => p.id._serialized);
      
      await msg.reply(
        `📢 Attention: ${mentions.map(m => `@${m.split('@')[0]}`.join(' ')}`,
        { mentions }
      );
    } catch (error) {
      console.error('Tagging error:', error);
    }
  }
});

client.initialize();
