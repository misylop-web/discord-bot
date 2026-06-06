import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ActivityType,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { readFileSync, existsSync } from "fs";

if (existsSync(".env")) {
  const env = readFileSync(".env", "utf8");
  for (const line of env.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
if (!DISCORD_TOKEN) { console.error("Brak DISCORD_TOKEN!"); process.exit(1); }

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

const BRAWLERS = {
  "Moe":       { overall: 100, "Gem Grab": 85, "Brawl Ball": 95, "Bounty": 60, "Heist": 90, "Hot Zone": 80, "Knockout": 85, "Wipeout": 70 },
  "Finx":      { overall: 98,  "Gem Grab": 80, "Brawl Ball": 90, "Bounty": 75, "Heist": 85, "Hot Zone": 85, "Knockout": 90, "Wipeout": 80 },
  "Juju":      { overall: 97,  "Gem Grab": 95, "Brawl Ball": 70, "Bounty": 60, "Heist": 65, "Hot Zone": 95, "Knockout": 75, "Wipeout": 65 },
  "Melodie":   { overall: 96,  "Gem Grab": 90, "Brawl Ball": 85, "Bounty": 60, "Heist": 70, "Hot Zone": 90, "Knockout": 80, "Wipeout": 70 },
  "Lily":      { overall: 95,  "Gem Grab": 75, "Brawl Ball": 80, "Bounty": 70, "Heist": 65, "Hot Zone": 75, "Knockout": 95, "Wipeout": 80 },
  "Charlie":   { overall: 94,  "Gem Grab": 85, "Brawl Ball": 75, "Bounty": 65, "Heist": 60, "Hot Zone": 90, "Knockout": 90, "Wipeout": 75 },
  "Angelo":    { overall: 93,  "Gem Grab": 70, "Brawl Ball": 65, "Bounty": 95, "Heist": 70, "Hot Zone": 75, "Knockout": 95, "Wipeout": 90 },
  "Draco":     { overall: 92,  "Gem Grab": 80, "Brawl Ball": 90, "Bounty": 60, "Heist": 85, "Hot Zone": 80, "Knockout": 85, "Wipeout": 70 },
  "Cordelius": { overall: 91,  "Gem Grab": 80, "Brawl Ball": 75, "Bounty": 70, "Heist": 60, "Hot Zone": 80, "Knockout": 95, "Wipeout": 75 },
  "Clancy":    { overall: 90,  "Gem Grab": 85, "Brawl Ball": 80, "Bounty": 65, "Heist": 75, "Hot Zone": 85, "Knockout": 80, "Wipeout": 70 },
  "Sandy":     { overall: 88,  "Gem Grab": 95, "Brawl Ball": 70, "Bounty": 65, "Heist": 60, "Hot Zone": 90, "Knockout": 65, "Wipeout": 65 },
  "Leon":      { overall: 87,  "Gem Grab": 75, "Brawl Ball": 80, "Bounty": 70, "Heist": 65, "Hot Zone": 70, "Knockout": 90, "Wipeout": 75 },
  "Crow":      { overall: 86,  "Gem Grab": 75, "Brawl Ball": 70, "Bounty": 80, "Heist": 55, "Hot Zone": 75, "Knockout": 88, "Wipeout": 80 },
  "Mortis":    { overall: 85,  "Gem Grab": 70, "Brawl Ball": 92, "Bounty": 65, "Heist": 60, "Hot Zone": 70, "Knockout": 85, "Wipeout": 70 },
  "Buzz":      { overall: 85,  "Gem Grab": 80, "Brawl Ball": 88, "Bounty": 60, "Heist": 75, "Hot Zone": 80, "Knockout": 82, "Wipeout": 65 },
  "Fang":      { overall: 84,  "Gem Grab": 75, "Brawl Ball": 90, "Bounty": 55, "Heist": 70, "Hot Zone": 75, "Knockout": 80, "Wipeout": 60 },
  "Max":       { overall: 83,  "Gem Grab": 90, "Brawl Ball": 80, "Bounty": 65, "Heist": 60, "Hot Zone": 85, "Knockout": 70, "Wipeout": 65 },
  "Frank":     { overall: 82,  "Gem Grab": 90, "Brawl Ball": 88, "Bounty": 50, "Heist": 80, "Hot Zone": 80, "Knockout": 60, "Wipeout": 55 },
  "Poco":      { overall: 81,  "Gem Grab": 92, "Brawl Ball": 75, "Bounty": 60, "Heist": 55, "Hot Zone": 88, "Knockout": 55, "Wipeout": 60 },
  "Emz":       { overall: 80,  "Gem Grab": 88, "Brawl Ball": 65, "Bounty": 70, "Heist": 55, "Hot Zone": 90, "Knockout": 70, "Wipeout": 70 },
  "Sprout":    { overall: 79,  "Gem Grab": 85, "Brawl Ball": 60, "Bounty": 65, "Heist": 70, "Hot Zone": 88, "Knockout": 65, "Wipeout": 65 },
  "Grom":      { overall: 78,  "Gem Grab": 80, "Brawl Ball": 55, "Bounty": 70, "Heist": 85, "Hot Zone": 80, "Knockout": 65, "Wipeout": 70 },
  "Belle":     { overall: 78,  "Gem Grab": 65, "Brawl Ball": 55, "Bounty": 92, "Heist": 60, "Hot Zone": 65, "Knockout": 90, "Wipeout": 88 },
  "Piper":     { overall: 77,  "Gem Grab": 60, "Brawl Ball": 50, "Bounty": 92, "Heist": 55, "Hot Zone": 60, "Knockout": 85, "Wipeout": 90 },
  "Brock":     { overall: 76,  "Gem Grab": 65, "Brawl Ball": 60, "Bounty": 88, "Heist": 80, "Hot Zone": 65, "Knockout": 85, "Wipeout": 85 },
  "Nani":      { overall: 75,  "Gem Grab": 65, "Brawl Ball": 55, "Bounty": 85, "Heist": 60, "Hot Zone": 65, "Knockout": 82, "Wipeout": 82 },
  "Mandy":     { overall: 74,  "Gem Grab": 65, "Brawl Ball": 50, "Bounty": 85, "Heist": 60, "Hot Zone": 65, "Knockout": 80, "Wipeout": 82 },
  "Byron":     { overall: 73,  "Gem Grab": 80, "Brawl Ball": 60, "Bounty": 65, "Heist": 55, "Hot Zone": 88, "Knockout": 65, "Wipeout": 65 },
  "Gray":      { overall: 72,  "Gem Grab": 80, "Brawl Ball": 75, "Bounty": 60, "Heist": 65, "Hot Zone": 78, "Knockout": 70, "Wipeout": 65 },
  "Otis":      { overall: 71,  "Gem Grab": 75, "Brawl Ball": 65, "Bounty": 70, "Heist": 55, "Hot Zone": 78, "Knockout": 75, "Wipeout": 70 },
  "Amber":     { overall: 70,  "Gem Grab": 65, "Brawl Ball": 55, "Bounty": 65, "Heist": 88, "Hot Zone": 70, "Knockout": 65, "Wipeout": 65 },
  "Gene":      { overall: 68,  "Gem Grab": 82, "Brawl Ball": 65, "Bounty": 60, "Heist": 55, "Hot Zone": 80, "Knockout": 65, "Wipeout": 60 },
  "Lola":      { overall: 67,  "Gem Grab": 70, "Brawl Ball": 70, "Bounty": 72, "Heist": 60, "Hot Zone": 72, "Knockout": 75, "Wipeout": 70 },
  "Bo":        { overall: 66,  "Gem Grab": 70, "Brawl Ball": 65, "Bounty": 82, "Heist": 65, "Hot Zone": 70, "Knockout": 75, "Wipeout": 78 },
  "Penny":     { overall: 65,  "Gem Grab": 75, "Brawl Ball": 55, "Bounty": 65, "Heist": 78, "Hot Zone": 72, "Knockout": 60, "Wipeout": 65 },
  "Griff":     { overall: 64,  "Gem Grab": 70, "Brawl Ball": 55, "Bounty": 65, "Heist": 82, "Hot Zone": 68, "Knockout": 60, "Wipeout": 62 },
  "Bibi":      { overall: 63,  "Gem Grab": 65, "Brawl Ball": 82, "Bounty": 50, "Heist": 65, "Hot Zone": 65, "Knockout": 65, "Wipeout": 55 },
  "Edgar":     { overall: 62,  "Gem Grab": 55, "Brawl Ball": 80, "Bounty": 45, "Heist": 60, "Hot Zone": 60, "Knockout": 70, "Wipeout": 55 },
  "Rosa":      { overall: 60,  "Gem Grab": 68, "Brawl Ball": 72, "Bounty": 50, "Heist": 65, "Hot Zone": 68, "Knockout": 55, "Wipeout": 52 },
  "Jacky":     { overall: 60,  "Gem Grab": 70, "Brawl Ball": 70, "Bounty": 48, "Heist": 68, "Hot Zone": 68, "Knockout": 52, "Wipeout": 50 },
  "Carl":      { overall: 59,  "Gem Grab": 68, "Brawl Ball": 60, "Bounty": 65, "Heist": 60, "Hot Zone": 65, "Knockout": 65, "Wipeout": 62 },
  "Darryl":    { overall: 58,  "Gem Grab": 60, "Brawl Ball": 75, "Bounty": 50, "Heist": 68, "Hot Zone": 60, "Knockout": 60, "Wipeout": 52 },
  "Bull":      { overall: 57,  "Gem Grab": 55, "Brawl Ball": 78, "Bounty": 45, "Heist": 80, "Hot Zone": 55, "Knockout": 50, "Wipeout": 48 },
  "El Primo":  { overall: 56,  "Gem Grab": 60, "Brawl Ball": 75, "Bounty": 42, "Heist": 68, "Hot Zone": 58, "Knockout": 48, "Wipeout": 45 },
  "Ash":       { overall: 55,  "Gem Grab": 65, "Brawl Ball": 70, "Bounty": 45, "Heist": 65, "Hot Zone": 65, "Knockout": 52, "Wipeout": 48 },
  "Lou":       { overall: 55,  "Gem Grab": 65, "Brawl Ball": 58, "Bounty": 60, "Heist": 52, "Hot Zone": 68, "Knockout": 60, "Wipeout": 60 },
  "Janet":     { overall: 54,  "Gem Grab": 60, "Brawl Ball": 50, "Bounty": 70, "Heist": 55, "Hot Zone": 62, "Knockout": 70, "Wipeout": 68 },
  "Surge":     { overall: 53,  "Gem Grab": 68, "Brawl Ball": 65, "Bounty": 52, "Heist": 55, "Hot Zone": 68, "Knockout": 55, "Wipeout": 52 },
  "Colonel Ruffs": { overall: 52, "Gem Grab": 68, "Brawl Ball": 60, "Bounty": 58, "Heist": 52, "Hot Zone": 65, "Knockout": 60, "Wipeout": 58 },
  "Meg":       { overall: 51,  "Gem Grab": 60, "Brawl Ball": 62, "Bounty": 50, "Heist": 65, "Hot Zone": 60, "Knockout": 52, "Wipeout": 50 },
  "Sam":       { overall: 50,  "Gem Grab": 55, "Brawl Ball": 70, "Bounty": 42, "Heist": 65, "Hot Zone": 55, "Knockout": 50, "Wipeout": 45 },
  "Shelly":    { overall: 48,  "Gem Grab": 50, "Brawl Ball": 62, "Bounty": 45, "Heist": 60, "Hot Zone": 50, "Knockout": 48, "Wipeout": 45 },
  "Colt":      { overall: 47,  "Gem Grab": 52, "Brawl Ball": 50, "Bounty": 65, "Heist": 72, "Hot Zone": 52, "Knockout": 60, "Wipeout": 60 },
  "Nita":      { overall: 46,  "Gem Grab": 55, "Brawl Ball": 58, "Bounty": 48, "Heist": 52, "Hot Zone": 55, "Knockout": 48, "Wipeout": 48 },
  "Barley":    { overall: 45,  "Gem Grab": 60, "Brawl Ball": 40, "Bounty": 55, "Heist": 65, "Hot Zone": 60, "Knockout": 50, "Wipeout": 55 },
  "Dynamike":  { overall: 44,  "Gem Grab": 60, "Brawl Ball": 38, "Bounty": 55, "Heist": 65, "Hot Zone": 60, "Knockout": 50, "Wipeout": 55 },
  "Tick":      { overall: 43,  "Gem Grab": 58, "Brawl Ball": 38, "Bounty": 52, "Heist": 60, "Hot Zone": 60, "Knockout": 48, "Wipeout": 52 },
  "8-Bit":     { overall: 42,  "Gem Grab": 60, "Brawl Ball": 45, "Bounty": 55, "Heist": 65, "Hot Zone": 58, "Knockout": 52, "Wipeout": 55 },
  "Jessie":    { overall: 41,  "Gem Grab": 58, "Brawl Ball": 48, "Bounty": 50, "Heist": 60, "Hot Zone": 55, "Knockout": 48, "Wipeout": 50 },
  "Squeak":    { overall: 40,  "Gem Grab": 62, "Brawl Ball": 40, "Bounty": 52, "Heist": 55, "Hot Zone": 62, "Knockout": 50, "Wipeout": 52 },
  "Rico":      { overall: 39,  "Gem Grab": 50, "Brawl Ball": 52, "Bounty": 58, "Heist": 60, "Hot Zone": 50, "Knockout": 55, "Wipeout": 58 },
  "Pam":       { overall: 38,  "Gem Grab": 55, "Brawl Ball": 50, "Bounty": 45, "Heist": 55, "Hot Zone": 58, "Knockout": 42, "Wipeout": 45 },
  "Tara":      { overall: 37,  "Gem Grab": 55, "Brawl Ball": 50, "Bounty": 50, "Heist": 48, "Hot Zone": 55, "Knockout": 52, "Wipeout": 50 },
  "Eve":       { overall: 36,  "Gem Grab": 55, "Brawl Ball": 48, "Bounty": 58, "Heist": 48, "Hot Zone": 58, "Knockout": 55, "Wipeout": 58 },
  "Bonnie":    { overall: 35,  "Gem Grab": 50, "Brawl Ball": 52, "Bounty": 55, "Heist": 55, "Hot Zone": 52, "Knockout": 55, "Wipeout": 55 },
  "Chester":   { overall: 34,  "Gem Grab": 52, "Brawl Ball": 55, "Bounty": 50, "Heist": 52, "Hot Zone": 55, "Knockout": 55, "Wipeout": 52 },
  "Larry & Lawrie": { overall: 33, "Gem Grab": 48, "Brawl Ball": 40, "Bounty": 58, "Heist": 72, "Hot Zone": 50, "Knockout": 55, "Wipeout": 58 },
  "Bea":       { overall: 32,  "Gem Grab": 45, "Brawl Ball": 40, "Bounty": 65, "Heist": 48, "Hot Zone": 48, "Knockout": 62, "Wipeout": 62 },
  "Gale":      { overall: 30,  "Gem Grab": 52, "Brawl Ball": 45, "Bounty": 50, "Heist": 45, "Hot Zone": 58, "Knockout": 50, "Wipeout": 50 },
};

const MODES = ["Gem Grab","Brawl Ball","Bounty","Heist","Hot Zone","Knockout","Wipeout"];

const MAPS = {
  "Gem Grab":   ["Double Swoosh","Hard Rock Mine","Undermine","Crystal Arcade","Minecart Madness"],
  "Brawl Ball": ["Super Beach","Pinhole Punt","Backyard Bowl","Beach Ball","Triple Dribble"],
  "Bounty":     ["Shooting Star","Canal Grande","Layer Cake","Dry Season","Snake Prairie"],
  "Heist":      ["Safe Zone","Hot Potato","Kaboom Canyon","Bridge Too Far","Bandit Bash"],
  "Hot Zone":   ["Ring of Fire","Parallel Plays","Open Business","Dueling Beetles","Outbreak"],
  "Knockout":   ["Forsaken Falls","Belle's Rock","Flaring Phoenix","Goldarm Gulch","New Horizons"],
  "Wipeout":    ["Hard Lane","Overgrown Oasis","Hideout","Dark Passage","Brassmaster"],
};

function getTier(score) {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 45) return "C";
  return "D";
}

function tierEmoji(tier) {
  return { S: "⭐", A: "🟢", B: "🔵", C: "🟡", D: "🔴" }[tier] ?? "⚪";
}

function getRecommendations(mode, excludeNames, topN = 5) {
  const modeKey = mode || "overall";
  const excluded = excludeNames.map(n => n.toLowerCase());

  return Object.entries(BRAWLERS)
    .filter(([name]) => !excluded.includes(name.toLowerCase()))
    .map(([name, data]) => ({ name, score: data[modeKey] ?? data.overall }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

const pickSessions = new Map();

function buildPickEmbed(brawlers, mode, map, recs) {
  const medals = ["🥇","🥈","🥉","4️⃣","5️⃣"];
  const lines = recs.map((r, i) => {
    const tier = getTier(r.score);
    return `${medals[i]} **${r.name}** ${tierEmoji(tier)} Tier ${tier} · ${r.score}/100`;
  });

  return new EmbedBuilder()
    .setColor(0x1e90ff)
    .setTitle("🏆 Top 5 picków do wyboru")
    .addFields(
      { name: "🚫 Brawlerzy w grze (wykluczone)", value: brawlers.join(", ") },
      { name: `🎮 Tryb: ${mode ?? "—"}  |  🗺️ Mapa: ${map ?? "—"}`, value: lines.join("\n") }
    )
    .setFooter({ text: "Zmień tryb lub mapę używając menu poniżej" })
    .setTimestamp();
}

function buildModeRow(sessionId, currentMode) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`mode:${sessionId}`)
    .setPlaceholder("Wybierz tryb gry…")
    .addOptions(MODES.map(m => ({ label: m, value: m, default: m === currentMode })));
  return new ActionRowBuilder().addComponents(menu);
}

function buildMapRow(sessionId, mode, currentMap) {
  const maps = MAPS[mode] ?? [];
  if (!maps.length) return null;
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`map:${sessionId}`)
    .setPlaceholder("Wybierz mapę (opcjonalnie)…")
    .addOptions([
      { label: "Dowolna mapa", value: "__any__", default: !currentMap },
      ...maps.map(m => ({ label: m, value: m, default: m === currentMap })),
    ]);
  return new ActionRowBuilder().addComponents(menu);
}

async function sendPickMessage(target, sessionId, brawlers, mode, map, isEdit = false) {
  const recs = getRecommendations(mode, brawlers);
  const embed = buildPickEmbed(brawlers, mode, map, recs);
  const rows = [buildModeRow(sessionId, mode)];
  if (mode) {
    const mapRow = buildMapRow(sessionId, mode, map);
    if (mapRow) rows.push(mapRow);
  }
  const payload = { embeds: [embed], components: rows };
  if (isEdit) {
    await target.update(payload);
  } else {
    await target.reply(payload);
    pickSessions.set(sessionId, { brawlers, mode, map });
  }
}

client.once(Events.ClientReady, (c) => {
  console.log(`Zalogowany jako: ${c.user.tag}`);
  c.user.setActivity("rankedach Brawl Stars", { type: ActivityType.Watching });
});

client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot || !msg.content.startsWith("!")) return;

  const [rawCmd, ...args] = msg.content.slice(1).trim().split(/\s+/);
  const cmd = rawCmd?.toLowerCase();

  if (cmd === "ping") { await msg.reply(`Pong! 🏓 ${client.ws.ping}ms`); return; }

  if (cmd === "pomoc" || cmd === "help") {
    const embed = new EmbedBuilder()
      .setColor(0xf5a623)
      .setTitle("🎮 Brawl Stars Pick Helper")
      .addFields({
        name: "`!pick [brawlerzy]`",
        value: "Podaj brawlerów wrogów lub już wybranych — bot pokaże top 5 picków z dropdown do wyboru trybu i mapy.\n\n**Przykłady:**\n`!pick Sandy Leon Crow`\n`!pick Frank Poco Melodie`",
      },
      { name: "`!ping`", value: "Sprawdza czy bot żyje", inline: true },
      { name: "`!pomoc`", value: "Ta wiadomość", inline: true })
      .setFooter({ text: "Meta: czerwiec 2026" });
    await msg.reply({ embeds: [embed] });
    return;
  }

  if (cmd === "pick" || cmd === "bs" || cmd === "draft") {
    if (!args.length) { await msg.reply("Podaj brawlerów! Np. `!pick Sandy Leon Crow`"); return; }

    const brawlers = args.map(a => {
      const match = Object.keys(BRAWLERS).find(b => b.toLowerCase() === a.toLowerCase());
      return match ?? (a.charAt(0).toUpperCase() + a.slice(1).toLowerCase());
    });

    const sessionId = `${msg.channelId}-${msg.id}`;
    await sendPickMessage(msg, sessionId, brawlers, null, null);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  const [type, sessionId] = interaction.customId.split(":");
  const session = pickSessions.get(sessionId);
  if (!session) {
    await interaction.reply({ content: "Sesja wygasła. Wpisz `!pick` jeszcze raz.", ephemeral: true });
    return;
  }

  if (type === "mode") { session.mode = interaction.values[0]; session.map = null; }
  else if (type === "map") { session.map = interaction.values[0] === "__any__" ? null : interaction.values[0]; }

  pickSessions.set(sessionId, session);
  await sendPickMessage(interaction, sessionId, session.brawlers, session.mode, session.map, true);
});

client.on(Events.Error, (err) => console.error("Discord error:", err));
client.login(DISCORD_TOKEN);
