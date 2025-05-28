const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const app = express();

const PORT = 3000;
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = '1369340935829459006'; // Replace with your server ID

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const statusMap = new Map(); // Stores enable/disable status per member

app.use(express.static('public'));
app.use(express.json());

// Serve the dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard2.html'));
});
const cors = require('cors');
app.use(cors());

// Get members
app.get('/api/members', async (req, res) => {
const guild = client.guilds.cache.get(GUILD_ID);
await guild.members.fetch();
const members = guild.members.cache
.filter((m) => !m.user.bot)
.map((m) => ({
id: m.id,
username: m.user.username,
avatar: m.user.displayAvatarURL(),
enabled: statusMap.get(m.id) ?? true,
}));
res.json(members);
});

// Toggle member status
app.post('/api/toggle', (req, res) => {
const { id } = req.body;
const current = statusMap.get(id) ?? true;
statusMap.set(id, !current);
res.json({ success: true, status: !current });
});

client.login(TOKEN).then(() => {
    app.listen(PORT, () => console.log(`Dashboard running at http://localhost:${PORT}`));
  });
  