import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../types";
import { MODES, MAPS, GameMode } from "../data/maps";
import { createSession, getSession, deleteSession } from "../utils/draftSession";
import { buildDraftEmbed, buildBrawlerSelectMenu, buildCancelButton, buildErrorEmbed } from "../utils/embeds";

export const draft: Command = {
  data: new SlashCommandBuilder()
    .setName("draft")
    .setDescription("🎯 Zarządzaj sesjami draftu rankowego")
    .addSubcommand(sub =>
      sub.setName("start").setDescription("Rozpocznij nową sesję draftu ban/pick")
        .addStringOption(opt => opt.setName("tryb").setDescription("Tryb gry").setRequired(true)
          .addChoices(
            { name: "💎 Gem Grab", value: "gem_grab" },
            { name: "⚽ Brawl Ball", value: "brawl_ball" },
            { name: "🏦 Heist", value: "heist" },
            { name: "❌ Knockout", value: "knockout" },
            { name: "🏹 Bounty", value: "bounty" },
            { name: "🔥 Hot Zone", value: "hot_zone" }
          ))
        .addStringOption(opt => opt.setName("mapa").setDescription("Nazwa mapy (np. Hard Rock Mine)").setRequired(true).setAutocomplete(true))
        .addStringOption(opt => opt.setName("druzyna1").setDescription("Nazwa pierwszej drużyny").setRequired(false))
        .addStringOption(opt => opt.setName("druzyna2").setDescription("Nazwa drugiej drużyny").setRequired(false))
    )
    .addSubcommand(sub => sub.setName("anuluj").setDescription("Anuluj aktywną sesję draftu"))
    .addSubcommand(sub => sub.setName("status").setDescription("Pokaż status aktywnego draftu")) as SlashCommandBuilder,

  async autocomplete(interaction: any): Promise<void> {
    const focused = interaction.options.getFocused().toLowerCase();
    const tryb = interaction.options.getString("tryb") as GameMode | null;
    const filteredMaps = MAPS
      .filter(m => (!tryb || m.mode === tryb) && m.name.toLowerCase().includes(focused))
      .slice(0, 25)
      .map(m => ({ name: `${m.emoji} ${m.name} (${MODES[m.mode].name})`, value: m.name }));
    await interaction.respond(filteredMaps);
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "anuluj") {
      const existing = getSession(interaction.channelId);
      if (!existing) { await interaction.reply({ embeds: [buildErrorEmbed("Brak aktywnej sesji draftu.")], ephemeral: true }); return; }
      deleteSession(interaction.channelId);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xE74C3C).setTitle("🗑️ Draft Anulowany").setDescription("Sesja draftu została zakończona.").setTimestamp()] });
      return;
    }

    if (subcommand === "status") {
      const existing = getSession(interaction.channelId);
      if (!existing) { await interaction.reply({ embeds: [buildErrorEmbed("Brak aktywnej sesji. Użyj `/draft start`.") ], ephemeral: true }); return; }
      await interaction.reply({ embeds: [buildDraftEmbed(existing)], components: [buildBrawlerSelectMenu(existing, "draft_action", existing.phase === "banning" ? "🚫 Wybierz bana" : "✅ Wybierz picka"), buildCancelButton()] });
      return;
    }

    if (subcommand === "start") {
      const existing = getSession(interaction.channelId);
      if (existing) { await interaction.reply({ embeds: [buildErrorEmbed("Na tym kanale jest już aktywna sesja. Użyj `/draft anuluj`.")], ephemeral: true }); return; }

      const tryb = interaction.options.getString("tryb", true) as GameMode;
      const mapaNazwa = interaction.options.getString("mapa", true);
      const team1 = interaction.options.getString("druzyna1") ?? "🔵 Drużyna 1";
      const team2 = interaction.options.getString("druzyna2") ?? "🔴 Drużyna 2";
      const mode = MODES[tryb];
      if (!mode) { await interaction.reply({ embeds: [buildErrorEmbed("Nieznany tryb gry.")], ephemeral: true }); return; }

      const session = createSession(interaction.channelId, interaction.guildId ?? "dm", interaction.user.id, tryb, mapaNazwa, team1, team2);
      const introEmbed = new EmbedBuilder()
        .setColor(0xF6A21D)
        .setTitle("🎯 Nowa Sesja Draftu Rankowego!")
        .setDescription(
          `**Host:** <@${interaction.user.id}>\n**Tryb:** ${mode.emoji} ${mode.name}\n**Mapa:** 🗺️ ${mapaNazwa}\n\n` +
          `**${team1}** vs **${team2}**\n\n` +
          `📋 **Format:** 6 banów (3 per drużyna) → 6 picków (3 per drużyna)\n` +
          `*Bany: 🔵→🔴→🔵→🔴→🔵→🔴 | Picki: 🔵→🔴→🔴→🔵→🔵→🔴*`
        )
        .setTimestamp()
        .setFooter({ text: "Użyj menu poniżej by banować" });
      await interaction.reply({ embeds: [introEmbed, buildDraftEmbed(session)], components: [buildBrawlerSelectMenu(session, "draft_action", "🚫 Wybierz brawlera do zbanowania"), buildCancelButton()] });
    }
  }
};
