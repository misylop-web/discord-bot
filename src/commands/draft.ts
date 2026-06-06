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
      const existing = get
