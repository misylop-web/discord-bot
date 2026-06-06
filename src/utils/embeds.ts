import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { DraftSession, DRAFT_BAN_ORDER, DRAFT_PICK_ORDER } from "../types";
import { BRAWLERS, getTierColor, getTierEmoji, getBrawlersByTier } from "../data/brawlers";
import { MODES, GameMode } from "../data/maps";

const MAIN_COLOR = 0xF6A21D;
const SUCCESS_COLOR = 0x2ECC71;
const ERROR_COLOR = 0xE74C3C;
const BAN_COLOR = 0xC0392B;
const PICK_COLOR = 0x2980B9;

export function formatBrawlerName(key: string): string {
  const b = BRAWLERS[key];
  if (b) return b.name;
  return key.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function buildMetaEmbed(modeFilter?: GameMode): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(MAIN_COLOR)
    .setTitle("🏆 Meta Brawl Stars Rankedy — Czerwiec 2026")
    .setThumbnail("https://cdn.brawlify.com/brawlstars/logo.png")
    .setTimestamp()
    .setFooter({ text: "Dane z top-200 graczy • Aktualizacja: Czerwiec 2026 • v67.264" });

  const tiers: Array<"S" | "A" | "B" | "C"> = ["S", "A", "B", "C"];
  const tierLabels: Record<string, string> = {
    S: "🔴 S-Tier — Dominują, pickuj natychmiast",
    A: "🟠 A-Tier — Silne, gotowe na Ranki",
    B: "🟡 B-Tier — Sytuacyjne, ale żywotne",
    C: "🟢 C-Tier — Unikaj w wysokim rankowanym"
  };

  for (const tier of tiers) {
    let brawlers = getBrawlersByTier(tier);
    if (modeFilter) {
      brawlers = brawlers.filter(b => b.bestModes.some(m =>
        m.toLowerCase().replace(" ", "_") === modeFilter ||
        MODES[modeFilter]?.name.toLowerCase() === m.toLowerCase()
      ));
    }
    if (brawlers.length === 0) continue;
    const names = brawlers.map(b => `${b.emoji} **${b.name}**`).join(", ");
    embed.addFields({ name: tierLabels[tier], value: names, inline: false });
  }

  if (modeFilter) {
    const mode = MODES[modeFilter];
    embed.setDescription(`Filtr: ${mode.emoji} **${mode.name}**\n\n*Kluczowe bany: ${mode.keyBans.join(", ")}*`);
  } else {
    embed.setDescription(
      "Aktualna meta po update **v67.264** i majntensie z **13 maja 2026**.\n" +
      "Damian dostał nerfy do Super charge i obrażeń. Sirius stracił HP.\n" +
      "*Użyj `/meta [tryb]` by filtrować po trybie.*"
    );
  }
  return embed;
}

export function buildBrawlerEmbed(brawlerKey: string): EmbedBuilder | null {
  const b = BRAWLERS[brawlerKey];
  if (!b) return null;
  const color = getTierColor(b.tier);
  const tierEmoji = getTierEmoji(b.tier);
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`${b.emoji} ${b.name} — ${tierEmoji} ${b.tier}-Tier`)
    .setDescription(b.description)
    .addFields(
      { name: "🎯 Rola", value: b.role, inline: true },
      { name: "🏆 Tier", value: `${tierEmoji} **${b.tier}-Tier**`, inline: true },
      { name: "🗺️ Najlepsze Tryby", value: b.bestModes.map(m => `• ${m}`).join("\n") || "—", inline: false },
      { name: "✅ Kontruje", value: b.counters.length > 0 ? b.counters.join(", ") : "Brak danych", inline: true },
      { name: "❌ Słabości", value: b.counteredBy.length > 0 ? b.counteredBy.join(", ") : "Brak danych", inline: true },
      { name: "💡 Wskazówki Rankowe", value: b.tips, inline: false }
    )
    .setTimestamp()
    .setFooter({ text: "Meta: Czerwiec 2026 • Brawl Stars Ranki" });
}

export function buildDraftEmbed(session: DraftSession): EmbedBuilder {
  const phaseColors: Record<string, number> = { banning: BAN_COLOR, picking: PICK_COLOR, complete: SUCCESS_COLOR };
  const phaseLabels: Record<string, string> = { banning: "🚫 Faza Banowania", picking: "✅ Faza Pickowania", complete: "🏁 Draft Zakończony" };
  const mode = MODES[session.mode as GameMode];
  const modeDisplay = mode ? `${mode.emoji} ${mode.name}` : session.mode;

  const embed = new EmbedBuilder()
    .setColor(phaseColors[session.phase] ?? MAIN_COLOR)
    .setTitle(`🎯 Draft Rankowy — ${phaseLabels[session.phase]}`)
    .setDescription(
      `**Tryb:** ${modeDisplay}\n**Mapa:** 🗺️ ${session.mapName}\n\n` +
      (session.phase === "complete" ? "✅ **Draft został zakończony!**" : buildCurrentTurnDescription(session))
    )
    .setTimestamp()
    .setFooter({ text: "Brawl Stars Rankedy Bot • Format: 3 bany, 3 picki na drużynę" });

  const banDisplay = session.bans.length > 0 ? session.bans.map(b => `~~${formatBrawlerName(b)}~~`).join(", ") : "*Brak banów*";
  embed.addFields({ name: "🚫 Zbanowani Brawlerzy", value: banDisplay, inline: false });

  const team1Picks = session.picks[0].length > 0 ? session.picks[0].map(b => `✅ ${formatBrawlerName(b)}`).join("\n") : "*Brak*";
  const team2Picks = session.picks[1].length > 0 ? session.picks[1].map(b => `✅ ${
