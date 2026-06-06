import { Interaction, StringSelectMenuInteraction, ButtonInteraction, EmbedBuilder } from "discord.js";
import { BotClient, DraftPhase } from "../types";
import { getSession, banBrawler, pickBrawler, deleteSession } from "../utils/draftSession";
import { buildDraftEmbed, buildDraftCompleteEmbed, buildBrawlerSelectMenu, buildCancelButton, buildErrorEmbed, formatBrawlerName } from "../utils/embeds";
import { BRAWLERS } from "../data/brawlers";

export async function handleInteraction(interaction: Interaction, client: BotClient): Promise<void> {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`Błąd w komendzie ${interaction.commandName}:`, err);
      const errEmbed = buildErrorEmbed("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [errEmbed] }).catch(() => {});
      } else {
        await interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch(() => {});
      }
    }
    return;
  }
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (!command?.autocomplete) return;
    try { await command.autocomplete(interaction); } catch (err) { console.error("Błąd autocomplete:", err); }
    return;
  }
  if (interaction.isStringSelectMenu()) { await handleSelectMenu(interaction); return; }
  if (interaction.isButton()) { await handleButton(interaction); return; }
}

async function handleSelectMenu(interaction: StringSelectMenuInteraction): Promise<void> {
  if (interaction.customId !== "draft_action") return;
  const session = getSession(interaction.channelId);
  if (!session) {
    await interaction.reply({ embeds: [buildErrorEmbed("Brak aktywnej sesji draftu. Użyj `/draft start` by rozpocząć.")], ephemeral: true });
    return;
  }
  const selected = interaction.values[0];
  const brawlerData = BRAWLERS[selected];
  const brawlerName = brawlerData ? brawlerData.name : formatBrawlerName(selected);

  if (session.phase === "banning") {
    const success = banBrawler(session, selected);
    if (!success) {
      await interaction.reply({ embeds: [buildErrorEmbed(`**${brawlerName}** jest już zbanowany lub wybrany!`)], ephemeral: true });
      return;
    }
    const phaseAfterBan = session.phase as DraftPhase;
    if (phaseAfterBan === "picking") {
      const embed = buildDraftEmbed(session);
      await interaction.update({
        embeds: [
          new EmbedBuilder().setColor(0xC0392B).setTitle("🚫 Brawler Zbanowany!")
            .setDescription(`${brawlerData?.emoji ?? "🎯"} **${brawlerName}** został zbanowany!\n*Wszystkie bany ukończone — rozpoczyna się faza pickowania!* ✅`)
            .setTimestamp(),
          embed
        ],
        components: [buildBrawlerSelectMenu(session, "draft_action", "✅ Wybierz brawlera do pickowania"), buildCancelButton()]
      });
    } else {
      const nextTeamEmoji = session.currentTeam === 0 ? "🔵" : "🔴";
      const nextTeamName = session.teamNames[session.currentTeam];
      const embed = buildDraftEmbed(session);
      await interaction.update({
        embeds: [
          new EmbedBuilder().setColor(0xC0392B).setTitle("🚫 Brawler Zbanowany!")
            .setDescription(`${brawlerData?.emoji ?? "🎯"} **${brawlerName}** został zbanowany!\n*Teraz banuje: ${nextTeamEmoji} **${nextTeamName}***`)
            .setTimestamp(),
          embed
        ],
        components: [buildBrawlerSelectMenu(session, "draft_action", `🚫 ${nextTeamEmoji} ${nextTeamName} — wybierz bana`), buildCancelButton()]
      });
    }
  } else if (session.phase === "picking") {
    const currentTeamName = session.teamNames[session.currentTeam];
    const currentTeamEmoji = session.currentTeam === 0 ? "🔵" : "🔴";
    const success = pickBrawler(session, selected);
    if (!success) {
      await interaction.reply({ embeds: [buildErrorEmbed(`**${brawlerName}** jest już zbanowany lub wybrany!`)], ephemeral: true });
      return;
    }
    const phaseAfterPick = session.phase as DraftPhase;
    if (phaseAfterPick === "complete") {
      deleteSession(interaction.channelId);
      const completeEmbed = buildDraftCompleteEmbed(session);
      await interaction.update({
        embeds: [
          new EmbedBuilder().setColor(0x2ECC71).setTitle("✅ Draft Zakończony!")
            .setDescription(`${brawlerData?.emoji ?? "🎯"} **${brawlerName}** wybrany przez ${currentTeamEmoji} **${currentTeamName}**!\n\n*🏁 Draft jest kompletny — powodzenia!* 🎮`)
            .setTimestamp(),
          completeEmbed
        ],
        components: []
      });
    } else {
      const nextTeamEmoji = session.currentTeam === 0 ? "🔵" : "🔴";
      const nextTeamName = session.teamNames[session.currentTeam];
      const embed = buildDraftEmbed(session);
      await interaction.update({
        embeds: [
          new EmbedBuilder().setColor(0x2980B9).setTitle("✅ Brawler Wybrany!")
            .setDescription(`${brawlerData?.emoji ?? "🎯"} **${brawlerName}** wybrany przez ${currentTeamEmoji} **${currentTeamName}**!\n*Teraz pickuje: ${nextTeamEmoji} **${nextTeamName}***`)
            .setTimestamp(),
          embed
        ],
        components: [buildBrawlerSelectMenu(session, "draft_action", `✅ ${nextTeamEmoji} ${nextTeamName} — wybierz brawlera`), buildCancelButton()]
      });
    }
  }
}

async function handleButton(interaction: ButtonInteraction): Promise<void> {
  if (interaction.customId === "draft_cancel") {
    const session = getSession(interaction.channelId);
    if (!session) {
      await interaction.reply({ embeds: [buildErrorEmbed("Brak aktywnej sesji draftu.")], ephemeral: true });
      return;
    }
    deleteSession(interaction.channelId);
    await interaction.update({
      embeds: [new EmbedBuilder().setColor(0xE74C3C).setTitle("🗑️ Draft Anulowany").setDescription(`Draft **${session.mode}** na mapie **${session.mapName}** został anulowany.`).setTimestamp()],
      components: []
    });
  }
}
