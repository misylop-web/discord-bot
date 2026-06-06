import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ActivityType,
  EmbedBuilder,
} from "discord.js";
import Groq from "groq-sdk";
import { readFileSync, existsSync } from "fs";

if (existsSync(".env")) {
  const env = readFileSync(".env", "utf8");
  for (const line of env.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
}

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!DISCORD_TOKEN) { console.error("Brak DISCORD_TOKEN!"); process.exit(1); }
if (!GROQ_API_KEY)  { console.error("Brak GROQ_API_KEY!");  process.exit(1); }

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

const groq = new Groq({ apiKey: GROQ_API_KEY });

const CHAT_PROMPT = `Jesteś krótkim, wulgarnym i bezpośrednim asystentem na Discordzie.
Odpowiadasz po polsku, bardzo krótko (1-3 zdania max), używasz przekleństw naturalnie,
jesteś chamski ale pomocny. Nigdy nie piszesz długich elaboratów.`;

const PICK_PROMPT = `Jesteś ekspertem od Brawl Stars Ranked (rankedów). Znasz aktualną metę, mapy, synergie i counter-picki.

Gdy dostaniesz informację o mapie, trybie i brawlerach (wrogich lub już wybranych), odpowiadasz WYŁĄCZNIE w tym formacie — nic więcej, zero gadania poza formatem:

**Top 5 picków:**
1. 🥇 [Brawler] — [1 zdanie dlaczego]
2. 🥈 [Brawler] — [1 zdanie dlaczego]
3. 🥉 [Brawler] — [1 zdanie dlaczego]
4. 4️⃣ [Brawler] — [1 zdanie dlaczego]
5. 5️⃣ [Brawler] — [1 zdanie dlaczego]

💡 **Tip:** [1 krótkie zdanie o strategii]

Zasady:
- Nie proponuj brawlerów już wymienionych przez użytkownika
- Dopasuj do trybu gry i mapy jeśli podane
- Jeśli nie podano mapy/trybu, bazuj na ogólnej metcie`;

const history = new Map();

async function chat(userId, message) {
  const h = history.get(userId) ?? [];
  h.push({ role: "user", content: message });
  if (h.length > 10) h.splice(0, h.length - 10);

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: CHAT_PROMPT }, ...h],
    max_tokens: 300,
    temperature: 0.9,
  });

  const reply = res.choices[0]?.message?.content ?? "nie wiem, kurwa.";
  h.push({ role: "assistant", content: reply });
  history.set(userId, h);
  return reply;
}

async function getPickSuggestions(brawlers, map, mode) {
  const context = [
    mode  ? `Tryb gry: ${mode}` : null,
    map   ? `Mapa: ${map}`      : null,
    `Brawlerzy już w grze (wrogowie lub już wybrani): ${brawlers.join(", ")}`,
    `Zaproponuj 5 najlepszych brawlerów do wybrania w tej sytuacji.`,
  ].filter(Boolean).join("\n");

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: PICK_PROMPT },
      { role: "user",   content: context },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return res.choices[0]?.message?.content ?? "Nie udało się wygenerować podpowiedzi.";
}

const MODES = [
  "gem grab", "brawl ball", "bounty", "heist", "hot zone",
  "knockout", "wipeout", "duels", "showdown", "payload",
  "siege", "big game", "boss fight",
];

function parsePickArgs(args) {
  const raw = args.join(" ").toLowerCase();

  let mode = null;
  let rest = raw;

  for (const m of MODES) {
    if (raw.includes(m)) {
      mode = m;
      rest = rest.replace(m, "").trim();
      break;
    }
  }

  const mapMatch = raw.match(/"([^"]+)"/);
  const map = mapMatch ? mapMatch[1] : null;

  const parts = rest
    .split(/[,|]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const brawlers = parts
    .flatMap(p => p.split(/\s+/))
    .map(b => b.charAt(0).toUpperCase() + b.slice(1))
    .filter(b => b.length > 1);

  return { brawlers, map, mode };
}

const PREFIX = "!";

client.once(Events.ClientReady, (c) => {
  console.log(`Zalogowany jako: ${c.user.tag}`);
  c.user.setActivity("rankedach Brawl Stars", { type: ActivityType.Watching });
});

client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot) return;

  const isMentioned = client.user ? msg.mentions.has(client.user) : false;
  const isDM        = !msg.guild;
  const isCommand   = msg.content.startsWith(PREFIX);

  if (!isCommand && !isMentioned && !isDM) return;

  const content = isCommand
    ? msg.content.slice(PREFIX.length).trim()
    : msg.content.replace(/<@!?\d+>/g, "").trim();

  if (!content) { await msg.reply("Napisz coś, kurwa."); return; }

  const [cmd, ...args] = content.split(/\s+/);
  const cmdLow = cmd.toLowerCase();

  if (cmdLow === "ping") {
    await msg.reply(`Pong! 🏓 ${client.ws.ping}ms`);
    return;
  }

  if (cmdLow === "reset") {
    history.delete(msg.author.id);
    await msg.reply("Historia wyczyszczona.");
    return;
  }

  if (cmdLow === "pomoc" || cmdLow === "help") {
    const embed = new EmbedBuilder()
      .setColor(0xf5a623)
      .setTitle("🎮 Brawl Stars Pick Helper")
      .setDescription("Podajesz brawlerów → bot daje top 5 picków do wyboru")
      .addFields(
        {
          name: "`!pick [brawlerzy]`",
          value:
            "Podaj brawlerów przeciwnika (lub już wybranych) oddzielonych spacją lub przecinkiem.\n" +
            "Opcjonalnie dodaj tryb gry i mapę w cudzysłowie.\n\n" +
            "**Przykłady:**\n" +
            "`!pick Sandy Leon Crow`\n" +
            "`!pick Sandy Leon gem grab`\n" +
            '`!pick Sandy Leon gem grab "Snake Prairie"`',
        },
        { name: "`!ping`", value: "Sprawdza czy bot żyje", inline: true },
        { name: "`!reset`", value: "Czyści historię rozmowy", inline: true },
        { name: "Oznaczenie lub DM", value: "Możesz też pisać do bota normalnie — odpowie jako AI asystent.", inline: false },
      );
    await msg.reply({ embeds: [embed] });
    return;
  }

  if (cmdLow === "pick" || cmdLow === "bs" || cmdLow === "draft") {
    if (args.length === 0) {
      await msg.reply("Podaj brawlerów! Np. `!pick Sandy Leon Crow`");
      return;
    }

    if (msg.channel && "sendTyping" in msg.channel) await msg.channel.sendTyping();

    const { brawlers, map, mode } = parsePickArgs(args);

    if (brawlers.length === 0) {
      await msg.reply("Nie rozpoznałem żadnych brawlerów. Napisz ich nazwy po komendzie.");
      return;
    }

    try {
      const result = await getPickSuggestions(brawlers, map, mode);

      const contextParts = [];
      if (mode) contextParts.push(`Tryb: **${mode}**`);
      if (map)  contextParts.push(`Mapa: **${map}**`);
      contextParts.push(`Brawlerzy w grze: **${brawlers.join(", ")}**`);

      const embed = new EmbedBuilder()
        .setColor(0x1e90ff)
        .setTitle("🏆 Rekomendacje picków")
        .setDescription(contextParts.join(" · ") + "\n\n" + result)
        .setFooter({ text: "!pick [brawlerzy] — zmień brawlerów żeby odświeżyć" });

      await msg.reply({ embeds: [embed] });
    } catch (err) {
      console.error("Błąd AI:", err);
      await msg.reply("AI się posrało, spróbuj jeszcze raz.");
    }
    return;
  }

  try {
    if (msg.channel && "sendTyping" in msg.channel) await msg.channel.sendTyping();
    const reply = await chat(msg.author.id, content);
    await msg.reply(reply);
  } catch (err) {
    console.error("Błąd AI:", err);
    await msg.reply("Coś się posrało, spróbuj jeszcze raz.");
  }
});

client.on(Events.Error, (err) => console.error("Discord error:", err));
client.login(DISCORD_TOKEN);
