import "dotenv/config";
import { REST, Routes } from "discord.js";
import { meta } from "./commands/meta";
import { brawler } from "./commands/brawler";
import { draft } from "./commands/draft";
import { mapa } from "./commands/mapa";
import { kontra } from "./commands/kontra";
import { pomoc } from "./commands/pomoc";

const commands = [meta, brawler, draft, mapa, kontra, pomoc].map(cmd => cmd.data.toJSON());
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) { console.error("❌ Brak DISCORD_TOKEN lub CLIENT_ID!"); process.exit(1); }

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`🔄 Rejestrowanie ${commands.length} komend...`);
    if (guildId) {
      const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands }) as unknown[];
      console.log(`✅ Zarejestrowano ${data.length} komend na serwerze.`);
    } else {
      const data = await rest.put(Routes.applicationCommands(clientId), { body: commands }) as unknown[];
      console.log(`✅ Zarejestrowano ${data.length} komend globalnie.`);
    }
  } catch (err) { console.error("❌ Błąd:", err); process.exit(1); }
})();
