import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../types";
import { buildMetaEmbed } from "../utils/embeds";
import { getModeKey } from "../data/maps";

export const meta: Command = {
  data: new SlashCommandBuilder()
    .setName("meta")
    .setDescription("📊 Pokaż aktualną metę Brawl Stars Rankedy (Czerwiec 2026)")
    .addStringOption(option =>
      option.setName("tryb").setDescription("Filtruj meta po trybie gry").setRequired(false)
        .addChoices(
          { name: "💎 Gem Grab", value: "gem_grab" },
          { name: "⚽ Brawl Ball", value: "brawl_ball" },
          { name: "🏦 Heist", value: "heist" },
          { name: "❌ Knockout", value: "knockout" },
          { name: "🏹 Bounty", value: "bounty" },
          { name: "🔥 Hot Zone", value: "hot_zone" }
        )
    ) as SlashCommandBuilder,
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    const trybValue = interaction.options.getString("tryb");
    const modeKey = trybValue ? getModeKey(trybValue) ?? (trybValue as any) : undefined;
    const embed = buildMetaEmbed(modeKey);
    await interaction.editReply({ embeds: [embed] });
  }
};
