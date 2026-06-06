import "dotenv/config";
import { Client, GatewayIntentBits, Collection, ActivityType } from "discord.js";
import { BotClient, Command } from "./types";
import { meta } from "./commands/meta";
import { brawler } from "./commands/brawler";
import { draft } from "./commands/draft";
import { mapa } from "./commands/mapa";
import { kontra } from "./commands/kontra";
import { pomoc } from "./commands/pomoc";
import { handleInteraction } from "./handlers/interactionHandler";
import { cleanExpiredSessions } from "./utils/draftSession";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
}) as BotClient;

client.commands = new Collection<string, Command>();

const commands: Command[] = [meta, brawler, draft, mapa, kontra, pomoc];
for (const cmd of commands) {
  client.commands.set(cmd.data.name, cmd);
}

client.once("ready", (c) => {
  console.log(`✅ Zalogowano jako ${c.user.tag}`);
  console.log(`📡 Serwery: ${c.guilds.cache.size}`);
  console.log(`🎮 Komendy załadowane: ${client.commands.size}`);
  c.user.setPresence({
    activities: [{ name: "🏆 Brawl Stars Ranki • /pomoc", type: ActivityType.Watching }],
    status: "online"
  });
  setInterval(() => { cleanExpiredSessions(); }, 30 * 60 * 1000);
});

client.on("interactionCreate", async (interaction) => {
  try { await handleInteraction(interaction, client); }
  catch (err) { console.error("Błąd interakcji:", err); }
});

client.on("error", (err) => { console.error("Błąd klienta:", err); });

process.on("unhandledRejection", (reason, promise) => {
  console.error("Nieobsługiane odrzucenie:", promise, reason);
});

process.on("uncaughtException", (err) => {
  console.error("Nieobsługiwany wyjątek:", err);
  process.exit(1);
});

const token = process.env.DISCORD_TOKEN;
if (!token) { console.error("❌ Brak DISCORD_TOKEN!"); process.exit(1); }

client.login(token).catch((err) => {
  console.error("❌ Nie można zalogować:", err);
  process.exit(1);
});
