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
  const team2Picks = session.picks[1].length > 0 ? session.picks[1].map(b => `✅ ${formatBrawlerName(b)}`).join("\n") : "*Brak*";
  embed.addFields(
    { name: `🔵 ${session.teamNames[0]}`, value: team1Picks, inline: true },
    { name: `🔴 ${session.teamNames[1]}`, value: team2Picks, inline: true }
  );

  if (session.phase !== "complete") {
    embed.addFields({ name: "📋 Kolejność Banów/Picków", value: buildTurnOrderDisplay(session), inline: false });
  }
  return embed;
}

function buildCurrentTurnDescription(session: DraftSession): string {
  const teamName = session.teamNames[session.currentTeam];
  const teamEmoji = session.currentTeam === 0 ? "🔵" : "🔴";
  if (session.phase === "banning") {
    return `${teamEmoji} **${teamName}** banuje *(${session.banTurn + 1}/6)*\n*Użyj menu poniżej by wybrać bana*`;
  } else {
    return `${teamEmoji} **${teamName}** pickuje *(${session.pickTurn + 1}/6)*\n*Użyj menu poniżej by wybrać brawlera*`;
  }
}

function buildTurnOrderDisplay(session: DraftSession): string {
  const banOrder = DRAFT_BAN_ORDER.map((team, i) => {
    const emoji = team === 0 ? "🔵" : "🔴";
    const done = i < session.banTurn;
    const current = i === session.banTurn && session.phase === "banning";
    if (done) return `~~B${i + 1}~~`;
    if (current) return `**→B${i + 1}${emoji}**`;
    return `B${i + 1}${emoji}`;
  });
  const pickOrder = DRAFT_PICK_ORDER.map((team, i) => {
    const emoji = team === 0 ? "🔵" : "🔴";
    const done = session.phase === "picking" ? i < session.pickTurn : session.phase === "complete";
    const current = i === session.pickTurn && session.phase === "picking";
    if (done) return `~~P${i + 1}~~`;
    if (current) return `**→P${i + 1}${emoji}**`;
    return `P${i + 1}${emoji}`;
  });
  return `**Bany:** ${banOrder.join(" → ")}\n**Picki:** ${pickOrder.join(" → ")}`;
}

export function buildBrawlerSelectMenu(session: DraftSession, customId: string, placeholder: string): ActionRowBuilder<StringSelectMenuBuilder> {
  const available = Object.entries(BRAWLERS)
    .filter(([key]) => !session.bans.includes(key) && !session.picks[0].includes(key) && !session.picks[1].includes(key))
    .sort((a, b) => { const t = ["S","A","B","C","D"]; return t.indexOf(a[1].tier) - t.indexOf(b[1].tier); })
    .slice(0, 25);
  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .addOptions(available.map(([key, b]) =>
      new StringSelectMenuOptionBuilder().setLabel(b.name).setValue(key).setDescription(`${getTierEmoji(b.tier)} ${b.tier}-Tier • ${b.role}`).setEmoji(b.emoji)
    ));
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}

export function buildModeSelectMenu(): ActionRowBuilder<StringSelectMenuBuilder> {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("draft_mode_select")
    .setPlaceholder("Wybierz tryb gry")
    .addOptions(Object.entries(MODES).map(([key, m]) =>
      new StringSelectMenuOptionBuilder().setLabel(m.name).setValue(key).setDescription(m.description.slice(0, 100)).setEmoji(m.emoji)
    ));
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}

export function buildCancelButton(): ActionRowBuilder<ButtonBuilder> {
  const btn = new ButtonBuilder().setCustomId("draft_cancel").setLabel("❌ Anuluj Draft").setStyle(ButtonStyle.Danger);
  return new ActionRowBuilder<ButtonBuilder>().addComponents(btn);
}

export function buildDraftCompleteEmbed(session: DraftSession): EmbedBuilder {
  const mode = MODES[session.mode as GameMode];
  const modeDisplay = mode ? `${mode.emoji} ${mode.name}` : session.mode;
  return new EmbedBuilder()
    .setColor(SUCCESS_COLOR)
    .setTitle("🏁 Draft Zakończony — Powodzenia!")
    .setDescription(`**Tryb:** ${modeDisplay}\n**Mapa:** 🗺️ ${session.mapName}\n\n*Draft jest kompletny. Czas zagrać!* 🎮`)
    .addFields(
      { name: "🚫 Zbanowani", value: session.bans.map(b => `~~${formatBrawlerName(b)}~~`).join(", ") || "Brak", inline: false },
      { name: `🔵 ${session.teamNames[0]}`, value: session.picks[0].map(b => `• ${formatBrawlerName(b)}`).join("\n") || "Brak", inline: true },
      { name: `🔴 ${session.teamNames[1]}`, value: session.picks[1].map(b => `• ${formatBrawlerName(b)}`).join("\n") || "Brak", inline: true }
    )
    .setTimestamp()
    .setFooter({ text: "Brawl Stars Rankedy Bot • Dobrego meczu!" });
}

export function buildErrorEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder().setColor(ERROR_COLOR).setTitle("❌ Błąd").setDescription(message).setTimestamp();
}

export function buildSuccessEmbed(title: string, message: string): EmbedBuilder {
  return new EmbedBuilder().setColor(SUCCESS_COLOR).setTitle(`✅ ${title}`).setDescription(message).setTimestamp();
}
