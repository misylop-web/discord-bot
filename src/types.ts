import { Collection, SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction, Client } from "discord.js";

export interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export interface BotClient extends Client {
  commands: Collection<string, Command>;
}

export type DraftPhase = "setup" | "banning" | "picking" | "complete";
export type Team = 0 | 1;

export interface DraftSession {
  channelId: string;
  guildId: string;
  hostUserId: string;
  mode: string;
  mapName: string;
  phase: DraftPhase;
  currentTeam: Team;
  banTurn: number;
  pickTurn: number;
  bans: string[];
  picks: [string[], string[]];
  messageId?: string;
  createdAt: number;
  teamNames: [string, string];
  teamColors: [number, number];
}

export const DRAFT_BAN_ORDER = [0, 1, 0, 1, 0, 1];
export const DRAFT_PICK_ORDER: Team[] = [0, 1, 1, 0, 0, 1];
