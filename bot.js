const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const config = require('./config');

// ========================
// LOGGER SETUP
// ========================
const logStream = fs.createWriteStream('./bot.log', { flags: 'a' });
const log = (message) => {
  const timestamp = new Date().toISOString();
  logStream.write(`${timestamp} - ${message}\n`);
  console.log(`[${timestamp}] ${message}`);
};

// ========================
// NOTIFICATION SYSTEMS
// ========================
const notifications = {
  whatsapp: async (text) => {
    try {
      await client.sendMessage(
        `${config.myNumber}@c.us`,
        `🔔 BOT ALERT:\n${text}`
      );
      log(`WhatsApp notification sent`);
    } catch (error) {
      log(`WhatsApp notify failed: ${error.message}`);
    }
  },

  email: (subject, body) => {
    if (process.env.CI) {
      require('child_process').execSync(
        `echo "${body}" | mail -s "${subject}" ${config.notificationEmail}`
      );
      log(`Email alert sent`);
    }
  }
};

// ========================
// CORE FUNCTIONS
// ========================
function generatePairingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3) code += '-';
  }
  return code;
}

// ========================
// CLIENT SETUP
// ========================
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: `bot-${config.myNumber}`,
    dataPath: './sessions',
    backupSyncIntervalMs: 300000 // 5 min sync
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--single-process'
    ]
  },
  takeoverOnConflict: true,
  restartOnAuthFail: true
});

// ========================
// EVENT HANDLERS
// ========================
client.on('qr', async () => {
  const code = generatePairingCode();
  log(`Pairing code generated: ${code}`);
  
  // Send alerts
  await notifications.whatsapp(
    `Pairing Code: ${code}\nExpires in 2 minutes`
  );
  notifications.email(
    'New WhatsApp Pairing Code', 
    `Code: ${code}\nFor: ${config.myNumber}`
  );
});

client.on('authenticated', () => {
  log('Authentication successful');
  notifications.whatsapp('✅ Device linked successfully');
});

client.on('ready', () => {
  log('Bot operational');
  notifications.whatsapp('🚀 Bot is now online');
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
      
      log(`Tagged ${mentions.length} users in ${chat.name}`);
    } catch (error) {
      log(`Tagging error: ${error.message}`);
      notifications.whatsapp(`⚠️ Tagging failed: ${error.message}`);
    }
  }
});

// ========================
// INITIALIZATION
// ========================
client.initialize();

// Keep alive
setInterval(() => log('Heartbeat'), 30000);

// Error handling
process.on('unhandledRejection', (err) => {
  log(`CRITICAL ERROR: ${err.stack}`);
  notifications.whatsapp('🆘 Bot crashed! Check logs');
});
