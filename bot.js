import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ActivityType,
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

if (!DISCORD_TOKEN) {
  console.error("Błąd: DISCORD_TOKEN nie jest ustawiony!");
  process.exit(1);
}
if (!GROQ_API_KEY) {
  console.error("Błąd: GROQ_API_KEY nie jest ustawiony!");
  process.exit(1);
}

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

const SYSTEM_PROMPT = `Jesteś krótkim, wulgarnym i bezpośrednim asystentem na Discordzie. 
Odpowiadasz po polsku, bardzo krótko (1-3 zdania max), używasz przekleństw naturalnie w zdaniach, 
jesteś chamski ale pomocny. Nie przesadzasz z przekleństwami w każdym słowie — wplatasz je naturalnie. 
Odpowiadasz na pytania merytorycznie mimo chamskiego tonu. Nigdy nie piszesz długich elaboratów.`;

const conversationHistory = new Map();
const MAX_HISTORY = 10;

async function askGroq(userId, message) {
  const history = conversationHistory.get(userId) ?? [];
  history.push({ role: "user", content: message });
  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
    max_tokens: 300,
    temperature: 0.9,
  });

  const reply =
    response.choices[0]?.message?.content ??
    "nie wiem co powiedzieć, kurwa.";
  history.push({ role: "assistant", content: reply });
  conversationHistory.set(userId, history);
  return reply;
}

const PREFIX = "!";

client.once(Events.ClientReady, (c) => {
  console.log(`Bot zalogowany jako: ${c.user.tag}`);
  c.user.setActivity("z waszymi pytaniami", { type: ActivityType.Playing });
});

client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot) return;

  const isMentioned = client.user ? msg.mentions.has(client.user) : false;
  const isCommand = msg.content.startsWith(PREFIX);
  const isDM = !msg.guild;

  if (isCommand) {
    const [rawCmd, ...args] = msg.content.slice(PREFIX.length).trim().split(/\s+/);
    const cmd = rawCmd?.toLowerCase() ?? "";

    if (cmd === "ping") {
      await msg.reply(`Pong! 🏓 Ping: ${client.ws.ping}ms`);
      return;
    }
    if (cmd === "reset") {
      conversationHistory.delete(msg.author.id);
      await msg.reply("Historia rozmowy wyczyszczona, kurwa.");
      return;
    }
    if (cmd === "pomoc") {
      await msg.reply(
        "**Komendy:**\n" +
          "`!ping` — czy żyję\n" +
          "`!reset` — wyczyść historię rozmowy\n" +
          "`!pomoc` — to co teraz widzisz\n\n" +
          `Możesz też oznaczyć mnie <@${client.user?.id}> albo pisać na DM.`
      );
      return;
    }
    const question = [cmd, ...args].join(" ");
    if (question.trim()) {
      await handleAI(msg, question);
    }
    return;
  }

  if (isMentioned || isDM) {
    const content = msg.content.replace(/<@!?\d+>/g, "").trim();
    if (!content) {
      await msg.reply("No co kurwa, pisz pytanie.");
      return;
    }
    await handleAI(msg, content);
  }
});

async function handleAI(msg, question) {
  try {
    if (msg.channel && "sendTyping" in msg.channel) {
      await msg.channel.sendTyping();
    }
    const reply = await askGroq(msg.author.id, question);
    await msg.reply(reply);
  } catch (err) {
    console.error("Błąd Groq AI:", err);
    await msg.reply("Coś się posrało po stronie AI, spróbuj jeszcze raz.");
  }
}

client.on(Events.Error, (err) => {
  console.error("Błąd klienta Discord:", err);
});

client.login(DISCORD_TOKEN);
