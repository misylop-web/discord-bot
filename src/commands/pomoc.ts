import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../types";

export const pomoc: Command = {
  data: new SlashCommandBuilder().setName("pomoc").setDescription("📖 Pokaż pomoc i wszystkie komendy bota") as SlashCommandBuilder,
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0xF6A21D)
      .setTitle("🤖 Brawl Stars Ranked Bot — Pomoc")
      .setDescription("Profesjonalny bot do pomocy w **Rankowanym Brawl Stars**.\nAktualna meta: **Czerwiec 2026 (v67.264)**\n\n*Wpisz `/` by zobaczyć listę komend.*")
      .addFields(
        { name: "📊 `/meta [tryb]`", value: "Pełna lista tierów brawlerów. Opcjonalny filtr po trybie.", inline: false },
        { name: "🔍 `/brawler <nazwa>`", value: "Tier, rola, najlepsze tryby, liczniki i wskazówki.", inline: false },
        { name: "⚔️ `/kontra <brawler>`", value: "Najlepsze liczniki do wybranego brawlera.", inline: false },
        { name: "🗺️ `/mapa tryb <tryb>`", value: "Mapy i wskazówki draftowe dla wybranego trybu.", inline: false },
        { name: "🗺️ `/mapa lista`", value: "Wszystkie tryby i mapy w aktualnej rotacji.", inline: false },
        { name: "🎯 `/draft start <tryb> <mapa>`", value: "Interaktywny draft ban/pick.\n• 6 banów (3 per drużyna)\n• 6 picków (format 1-2-2-1)", inline: false },
        { name: "📋 `/draft status` • 🗑️ `/draft anuluj`", value: "Zarządzanie aktywnym draftem.", inline: false }
      )
      .addFields({ name: "🏆 S-Tier (Czerwiec 2026)", value: "🦇 Edgar · 🦁 Damian ·
