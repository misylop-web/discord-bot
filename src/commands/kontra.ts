import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, AutocompleteInteraction } from "discord.js";
import { Command } from "../types";
import { BRAWLERS, ALL_BRAWLER_NAMES, getTierColor, getTierEmoji } from "../data/brawlers";

export const kontra: Command = {
  data: new SlashCommandBuilder()
    .setName("kontra")
    .setDescription("⚔️ Znajdź liczniki do wybranego brawlera")
    .addStringOption(opt =>
      opt.setName("brawler").setDescription("Brawler którego chcesz kontrować (np. damian, edgar)").setRequired(true).setAutocomplete(true)
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
    const brawlerKey = interaction.options.getString("brawler", true).toLowerCase().replace(/\s+/g, "_");
    const target = BRAWLERS[brawlerKey];
    if (!target) {
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xE74C3C).setTitle("❌ Nieznany brawler").setDescription(`Nie znaleziono **${brawlerKey}**. Użyj autocomplete lub /meta.`).setTimestamp()] });
      return;
    }
    const counters = target.counteredBy
      .map(name => { const key = name.toLowerCase().replace(/\s+/g, "_"); const b = BRAWLERS[key]; if (b) return { key, data: b }; return null; })
      .filter(Boolean) as { key: string; data: typeof BRAWLERS[string] }[];

    const embed = new EmbedBuilder()
      .setColor(getTierColor(target.tier))
      .setTitle(`⚔️ Jak kontrować: ${target.emoji} ${target.name}`)
      .setDescription(`${target.emoji} **${target.name}** jest **${getTierEmoji(target.tier)} ${target.tier}-Tier** (${target.role}).\n\n${target.description}`)
      .setTimestamp()
      .setFooter({ text: "Brawl Stars Rankedy Bot • Meta: Czerwiec 2026" });

    if (counters.length > 0) {
      embed.addFields({ name: "🎯 Najlepsze Liczniki", value: counters.map(c => `${c.data.emoji} **${c.data.name}** (${getTierEmoji(c.data.tier)} ${c.data.tier}-Tier)\n*${c.data.tips.slice(0, 80)}...*`).join("\n\n"), inline: false });
    } else {
      embed.addFields({ name: "🎯 Liczniki", value: target.counteredBy.length > 0 ? target.counteredBy.join(", ") : "Brak danych — trudny do kontrowania!", inline: false });
    }
    embed.addFields(
      { name: "✅ Co kontruje", value: target.counters.join(", ") || "Brak danych", inline: true },
      { name: "📋 Strategie Draftowe", value: `• Pickuj licznik **jako ostatni** gdy wiesz, że wróg gra ${target.name}\n• Rozważ **ban ${target.name}** jeśli mapa mu służy\n• Unikaj brawlerów, które ${target.name} łatwo kontruje`, inline: false }
    );
    await interaction.editReply({ embeds: [embed] });
  }
};
