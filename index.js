// discord-bot.js
const Discord = require('discord.js');
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildMessageReactions] });
const config = require('./config.json');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', member => {
    // ... (welcomer code remains the same)
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('/giveaway')) {
    // Giveaway command
    // ... (giveaway code remains the same)
  }

  if (message.content.startsWith('/poll')) {
    // Poll command
    // ... (poll code remains the same)
  }

  if (message.content.startsWith('/send')) {
    // Send message command (admin only)
    // ... (send code remains the same)
  }

    if(message.content.startsWith('/ticket')){
        // ... (ticket code remains the same)
    }

    if (message.content.startsWith('/close')) {
        // ... (close code remains the same)
    }

    if (message.content.startsWith('/reactionrole')) {
        // ... (reactionrole code remains the same)
    }

    if (message.content.startsWith('/timedmessage')) {
        const args = message.content.split(' ').slice(1);
        const channelId = args[0];
        const time = parseInt(args[1]) * 1000; // Convert seconds to milliseconds
        const text = args.slice(2).join(' ');

        if (!channelId || !time || !text) {
            return message.reply("Usage: /timedmessage <channelId> <seconds> <text>");
        }

        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return message.reply("Invalid channel ID.");
        }

        setTimeout(() => {
            channel.send(text);
        }, time);

        message.reply(`Message will be sent in ${time / 1000} seconds.`);

    }

});

client.on('interactionCreate', async interaction => {
    // ... (interaction code remains the same)
});

client.login(config.token);
