const { Client, Intents, MessageActionRow, MessageButton } = require('discord.js');
const mongoose = require('mongoose');
const ms = require('ms');

// MongoDB Schema for Invites and Tickets
const inviteSchema = new mongoose.Schema({
  userId: String,
  invites: Number,
});

const ticketSchema = new mongoose.Schema({
  userId: String,
  ticketChannelId: String,
  createdAt: { type: Date, default: Date.now },
});

const Invite = mongoose.model('Invite', inviteSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });

const prefix = "!"; // Command prefix
const token = 'YOUR_DISCORD_BOT_TOKEN'; // Replace with your bot's token

mongoose.connect('mongodb://localhost/discord-bot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Giveaway System
let giveawayMessage = '';
let giveawayEndTime = 0;
let giveawayParticipants = [];

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(`${prefix}giveaway`)) {
    if (!message.member.permissions.has('ADMINISTRATOR')) return message.reply("You don't have permission to create a giveaway.");

    const args = message.content.slice(prefix.length).trim().split(' ');
    const duration = ms(args[1]);
    if (!duration || isNaN(duration)) return message.reply("Please provide a valid duration for the giveaway!");

    giveawayEndTime = Date.now() + duration;
    giveawayMessage = args.slice(2).join(' ') || "No prize specified!";

    message.reply(`Started giveaway! Prize: ${giveawayMessage}. Duration: ${args[1]}. React with 🎉 to participate.`);

    const giveawayMsg = await message.channel.send(`🎉 **GIVEAWAY** 🎉\nPrize: ${giveawayMessage}\nReact with 🎉 to participate.`);
    giveawayMsg.react('🎉');

    setTimeout(async () => {
      const giveawayUsers = await giveawayMsg.reactions.cache.get('🎉').users.fetch();
      giveawayParticipants = giveawayUsers.filter(user => !user.bot).map(user => user.id);
      const winner = giveawayParticipants[Math.floor(Math.random() * giveawayParticipants.length)];

      message.channel.send(`🎉 Congratulations <@${winner}>! You won the giveaway: ${giveawayMessage}.`);
    }, duration);
  }

  // Ticket System
  if (message.content.startsWith(`${prefix}ticket`)) {
    const ticketChannel = await message.guild.channels.create(`ticket-${message.author.username}`, {
      type: 'text',
      topic: `Support Ticket for ${message.author.tag}`,
      permissionOverwrites: [
        {
          id: message.guild.id,
          deny: ['VIEW_CHANNEL'],
        },
        {
          id: message.author.id,
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        },
      ],
    });

    const newTicket = new Ticket({
      userId: message.author.id,
      ticketChannelId: ticketChannel.id,
    });

    await newTicket.save();
    message.reply(`Your support ticket has been created: <#${ticketChannel.id}>.`);
    ticketChannel.send(`Hello ${message.author}, how can we assist you today?`);
  }

  // Invite Tracking System (Invites)
  if (message.content.startsWith(`${prefix}invites`)) {
    const user = message.mentions.users.first() || message.author;
    const inviteData = await Invite.findOne({ userId: user.id });

    if (!inviteData) return message.reply(`${user.tag} has no invites yet.`);

    message.reply(`${user.tag} has invited ${inviteData.invites} people.`);
  }

  // Auto Mod: Anti-Spam or Swearing (for example)
  const badWords = ['badword1', 'badword2']; // Add words to blacklist here.
  const messageContent = message.content.toLowerCase();

  if (badWords.some(word => messageContent.includes(word))) {
    await message.delete();
    message.reply("Your message contains prohibited words and has been deleted.");
  }
});

client.on('guildMemberAdd', async (member) => {
  // Track invites on member join
  const invites = await member.guild.invites.fetch();
  const usedInvite = invites.find(inv => inv.uses > 0);

  const inviteRecord = await Invite.findOne({ userId: usedInvite.inviter.id });
  if (!inviteRecord) {
    await new Invite({
      userId: usedInvite.inviter.id,
      invites: 1,
    }).save();
  } else {
    inviteRecord.invites += 1;
    await inviteRecord.save();
  }
});

client.on('ready', () => {
  console.log(`${client.user.tag} is online!`);
});

client.login(token);
