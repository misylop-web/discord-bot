import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import { Command } from "../types";
import { BRAWLERS, ALL_BRAWLER_NAMES } from "../data/brawlers";
import { buildBrawlerEmbed, buildErrorEmbed } from "../utils/embeds";

export const brawler: Command = {
  data: new SlashCommandBuilder()
    .setName("brawler")
    .setDescription("🔍 Sprawdź informacje o brawlerze: tier, rola, kontruje, liczniki")
    .addStringOption(option =>
      option.setName("nazwa").setDescription("Nazwa brawlera (np. edgar, colette, mortis)").setRequired(true).setAutocomplete(true)
    ) as SlashCommandBuilder,
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focused = interaction.options.getFocused().toLowerCase();
    const choices = ALL_BRAWLER_NAMES
      .filter(key => { const b = BRAWLERS[key]; return key.includes(focused) || b.name.toLowerCase().includes(focused); })
      .slice(0, 25)
      .map(key => ({ name: `${BRAWLERS[key].emoji} ${BRAWLERS[key].name} (${BRAWLERS[key].tier}-Tier)`, value: key }));
    await interaction.respond(choices);
  },
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    const nazwaProp = interaction.options.getString("nazwa", true).toLowerCase().replace(/\s+/g, "_");
    const embed = buildBrawlerEmbed(nazwaProp);
    if (!embed) {
      const suggestions = ALL_BRAWLER_NAMES
        .filter(k => BRAWLERS[k].name.toLowerCase().startsWith(nazwaProp[0] ?? ""))
        .slice(0, 5).map(k => `• ${BRAWLERS[k].emoji} ${BRAWLERS[k].name}`).join("\n");
      await interaction.editReply({ embeds: [buildErrorEmbed(`Nie znaleziono brawlera **${nazwaProp}**.\n\n${suggestions ? `**Sugestie:**\n${suggestions}` : "Użyj /meta by zobaczyć listę."}`)] });
      return;
    }
    await interaction.editReply({ embeds: [embed] });
  }
};
