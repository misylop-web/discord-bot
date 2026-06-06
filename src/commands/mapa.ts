import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../types";
import { MAPS, MODES, GameMode, getMapsByMode } from "../data/maps";
import { BRAWLERS } from "../data/brawlers";
import { buildErrorEmbed } from "../utils/embeds";

export const mapa: Command = {
  data: new SlashCommandBuilder()
    .setName("mapa")
    .setDescription("🗺️ Informacje o mapach i trybach w Rankowanym")
    .addSubcommand(sub =>
      sub.setName("tryb").setDescription("Pokaż mapy i wskazówki dla wybranego trybu")
        .addStringOption(opt =>
          opt.setName("tryb").setDescription("Tryb gry").setRequired(true)
            .addChoices(
              { name: "💎 Gem Grab", value: "gem_grab" },
              { name: "⚽ Brawl Ball", value: "brawl_ball" },
              { name: "🏦 Heist", value: "heist" },
              { name: "❌ Knockout", value: "knockout" },
              { name: "🏹 Bounty", value: "bounty" },
              { name: "🔥 Hot Zone", value: "hot_zone" }
            )
        )
    )
    .addSubcommand(sub => sub.setName("lista").setDescription("Pokaż wszystkie tryby i mapy w rotacji")) as SlashCommandBuilder,
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "lista") {
      const embed = new EmbedBuilder()
        .setColor(0xF6A21D)
        .setTitle("🗺️ Rotacja Map Rankowanego — Czerwiec 2026")
        .setDescription("Aktualne tryby i mapy w rotacji.\nOd 19.06.2025: system **Featured Mode**.\n\n*Użyj `/mapa tryb` by zobaczyć szczegóły.*")
        .setTimestamp()
        .setFooter({ text: "Brawl Stars Rankedy Bot • Sezon Czerwiec 2026" });
      for (const [key, mode] of Object.entries(MODES)) {
        const maps = getMapsByMode(key as GameMode);
        embed.addFields({ name: `${mode.emoji} ${mode.name} (${maps.length} map)`, value: `${mode.description}\n${maps.map(m => `• ${m.emoji} ${m.name}`).join("\n")}\n*Kluczowe bany: ${mode.keyBans.join(", ")}*`, inline: false });
      }
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (subcommand === "tryb") {
      const trybValue = interaction.options.getString("tryb", true) as GameMode;
      const mode = MODES[trybValue];
      const maps = getMapsByMode(trybValue);
      if (!mode) { await interaction.editReply({ embeds: [buildErrorEmbed("Nieznany tryb.")] }); return; }

      const embed = new EmbedBuilder()
        .setColor(mode.color)
        .setTitle(`${mode.emoji} ${mode.name} — Ranki Czerwiec 2026`)
        .setDescription(mode.description)
        .setTimestamp()
        .setFooter({ text: "Brawl Stars Rankedy Bot • 4 mapy per tryb w rotacji" });
      embed.addFields({ name: "💡 Wskazówki Draftu", value: mode.generalTips.map(t => `• ${t}`).join("\n"), inline: false });
      embed.addFields({ name: "🚫 Kluczowe Bany", value: mode.keyBans.join(", "), inline: false });
      for (const map of maps) {
        const typeEmoji = map.type === "open" ? "🏜️" : map.type === "closed" ? "🏚️" : "🔀";
        const bestStr = map.bestBrawlers.slice(0, 4).map(b => { const d = BRAWLERS[b.toLowerCase().replace(" ", "_")]; return d ? `${d.emoji} ${d.name}` : b; }).join(", ");
        embed.addFields({ name: `${map.emoji} ${map.name} ${typeEmoji}`, value: `*${map.description}*\n**Najlepsi:** ${bestStr}\n**Bany:** ${map.banTargets.join(", ")}`, inline: false });
      }
      await interaction.editReply({ embeds: [embed] });
    }
  }
};
