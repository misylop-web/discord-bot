import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ActivityType,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { readFileSync, existsSync } from "fs";

if (existsSync(".env")) {
  const env = readFileSync(".env", "utf8");
  for (const line of env.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
if (!DISCORD_TOKEN) { console.error("Brak DISCORD_TOKEN!"); process.exit(1); }

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

const BRAWLERS = {
  "Angelo": {
    overall: 93,
    modes: { "Gem Grab": 68, "Brawl Ball": 55, "Bounty": 96, "Heist": 65, "Hot Zone": 74, "Knockout": 96, "Wipeout": 91 },
    maps: {
      "Shooting Star": 98, "Dry Season": 97, "Layer Cake": 90, "Canal Grande": 88, "Snake Prairie": 72,
      "Forsaken Falls": 97, "New Horizons": 96, "Belle's Rock": 88, "Flaring Phoenix": 72, "Goldarm Gulch": 70,
      "Open Business": 85, "Ring of Fire": 72, "Parallel Plays": 70,
      "Hard Lane": 95, "Dark Passage": 88, "Overgrown Oasis": 70,
    },
  },
  "Lily": {
    overall: 95,
    modes: { "Gem Grab": 72, "Brawl Ball": 75, "Bounty": 68, "Heist": 60, "Hot Zone": 74, "Knockout": 96, "Wipeout": 82 },
    maps: {
      "Forsaken Falls": 95, "Flaring Phoenix": 98, "Belle's Rock": 90, "Goldarm Gulch": 88, "New Horizons": 75,
      "Dark Passage": 90, "Hideout": 95, "Overgrown Oasis": 92,
      "Backyard Bowl": 80, "Super Beach": 78,
    },
  },
  "Cordelius": {
    overall: 91,
    modes: { "Gem Grab": 78, "Brawl Ball": 72, "Bounty": 68, "Heist": 55, "Hot Zone": 78, "Knockout": 96, "Wipeout": 76 },
    maps: {
      "Flaring Phoenix": 98, "Forsaken Falls": 96, "Goldarm Gulch": 85, "Belle's Rock": 82,
      "Hideout": 95, "Overgrown Oasis": 88,
      "Hard Rock Mine": 80, "Undermine": 78,
    },
  },
  "Melodie": {
    overall: 96,
    modes: { "Gem Grab": 92, "Brawl Ball": 85, "Bounty": 58, "Heist": 68, "Hot Zone": 92, "Knockout": 80, "Wipeout": 70 },
    maps: {
      "Double Swoosh": 96, "Hard Rock Mine": 90, "Crystal Arcade": 88, "Minecart Madness": 85, "Undermine": 82,
      "Ring of Fire": 95, "Parallel Plays": 90, "Dueling Beetles": 88, "Outbreak": 92, "Open Business": 88,
      "Super Beach": 88, "Backyard Bowl": 85,
    },
  },
  "Juju": {
    overall: 97,
    modes: { "Gem Grab": 96, "Brawl Ball": 68, "Bounty": 58, "Heist": 62, "Hot Zone": 96, "Knockout": 74, "Wipeout": 64 },
    maps: {
      "Double Swoosh": 98, "Hard Rock Mine": 92, "Crystal Arcade": 94, "Undermine": 88, "Minecart Madness": 85,
      "Ring of Fire": 98, "Outbreak": 96, "Parallel Plays": 92, "Dueling Beetles": 90, "Open Business": 88,
    },
  },
  "Sandy": {
    overall: 88,
    modes: { "Gem Grab": 94, "Brawl Ball": 65, "Bounty": 62, "Heist": 55, "Hot Zone": 91, "Knockout": 62, "Wipeout": 64 },
    maps: {
      "Double Swoosh": 96, "Minecart Madness": 90, "Crystal Arcade": 88, "Hard Rock Mine": 86, "Undermine": 84,
      "Ring of Fire": 94, "Parallel Plays": 92, "Outbreak": 90, "Open Business": 85,
      "Overgrown Oasis": 75, "Snake Prairie": 70,
    },
  },
  "Charlie": {
    overall: 94,
    modes: { "Gem Grab": 84, "Brawl Ball": 72, "Bounty": 62, "Heist": 58, "Hot Zone": 90, "Knockout": 92, "Wipeout": 74 },
    maps: {
      "Forsaken Falls": 94, "Belle's Rock": 90, "Flaring Phoenix": 88, "Goldarm Gulch": 82,
      "Ring of Fire": 92, "Outbreak": 90, "Parallel Plays": 86,
      "Hard Rock Mine": 86, "Undermine": 82,
    },
  },
  "Clancy": {
    overall: 90,
    modes: { "Gem Grab": 86, "Brawl Ball": 80, "Bounty": 64, "Heist": 74, "Hot Zone": 86, "Knockout": 80, "Wipeout": 70 },
    maps: {
      "Double Swoosh": 90, "Hard Rock Mine": 88, "Crystal Arcade": 86, "Minecart Madness": 84,
      "Outbreak": 88, "Ring of Fire": 84,
      "Safe Zone": 78, "Bridge Too Far": 76,
    },
  },
  "Moe": {
    overall: 100,
    modes: { "Gem Grab": 84, "Brawl Ball": 96, "Bounty": 58, "Heist": 90, "Hot Zone": 80, "Knockout": 86, "Wipeout": 70 },
    maps: {
      "Super Beach": 98, "Pinhole Punt": 94, "Backyard Bowl": 95, "Beach Ball": 96, "Triple Dribble": 94,
      "Safe Zone": 92, "Hot Potato": 95, "Kaboom Canyon": 80,
      "Flaring Phoenix": 90, "Goldarm Gulch": 88,
    },
  },
  "Draco": {
    overall: 92,
    modes: { "Gem Grab": 78, "Brawl Ball": 90, "Bounty": 58, "Heist": 86, "Hot Zone": 78, "Knockout": 84, "Wipeout": 70 },
    maps: {
      "Super Beach": 92, "Backyard Bowl": 90, "Triple Dribble": 92, "Pinhole Punt": 88,
      "Hot Potato": 90, "Safe Zone": 88, "Bridge Too Far": 82,
      "Forsaken Falls": 86, "Flaring Phoenix": 82,
    },
  },
  "Finx": {
    overall: 98,
    modes: { "Gem Grab": 80, "Brawl Ball": 90, "Bounty": 74, "Heist": 84, "Hot Zone": 84, "Knockout": 92, "Wipeout": 80 },
    maps: {
      "Forsaken Falls": 94, "Belle's Rock": 92, "Goldarm Gulch": 88, "Flaring Phoenix": 85,
      "Hard Lane": 88, "Dark Passage": 84,
      "Super Beach": 92, "Beach Ball": 90, "Triple Dribble": 88,
      "Ring of Fire": 86,
    },
  },
  "Leon": {
    overall: 87,
    modes: { "Gem Grab": 72, "Brawl Ball": 78, "Bounty": 68, "Heist": 62, "Hot Zone": 68, "Knockout": 90, "Wipeout": 76 },
    maps: {
      "Flaring Phoenix": 96, "Snake Prairie": 92, "Overgrown Oasis": 94, "Hideout": 96,
      "Forsaken Falls": 88, "Goldarm Gulch": 86, "Belle's Rock": 80,
      "Dark Passage": 85, "Brassmaster": 72,
    },
  },
  "Crow": {
    overall: 86,
    modes: { "Gem Grab": 72, "Brawl Ball": 68, "Bounty": 80, "Heist": 52, "Hot Zone": 72, "Knockout": 88, "Wipeout": 80 },
    maps: {
      "Snake Prairie": 90, "Flaring Phoenix": 88, "Forsaken Falls": 88, "Belle's Rock": 86,
      "Overgrown Oasis": 88, "Hideout": 85,
      "Shooting Star": 84, "Dry Season": 82,
    },
  },
  "Mortis": {
    overall: 85,
    modes: { "Gem Grab": 68, "Brawl Ball": 94, "Bounty": 62, "Heist": 58, "Hot Zone": 68, "Knockout": 86, "Wipeout": 70 },
    maps: {
      "Super Beach": 96, "Backyard Bowl": 94, "Triple Dribble": 92, "Pinhole Punt": 85, "Beach Ball": 95,
      "Goldarm Gulch": 88, "Forsaken Falls": 84,
    },
  },
  "Buzz": {
    overall: 85,
    modes: { "Gem Grab": 78, "Brawl Ball": 88, "Bounty": 58, "Heist": 74, "Hot Zone": 78, "Knockout": 82, "Wipeout": 65 },
    maps: {
      "Super Beach": 90, "Triple Dribble": 88, "Backyard Bowl": 86,
      "Hard Rock Mine": 84, "Double Swoosh": 80,
      "Goldarm Gulch": 84, "Belle's Rock": 80,
    },
  },
  "Fang": {
    overall: 84,
    modes: { "Gem Grab": 72, "Brawl Ball": 92, "Bounty": 52, "Heist": 68, "Hot Zone": 72, "Knockout": 80, "Wipeout": 60 },
    maps: {
      "Super Beach": 94, "Backyard Bowl": 92, "Beach Ball": 94, "Triple Dribble": 90, "Pinhole Punt": 82,
      "Hot Potato": 74,
    },
  },
  "Max": {
    overall: 83,
    modes: { "Gem Grab": 90, "Brawl Ball": 78, "Bounty": 62, "Heist": 58, "Hot Zone": 84, "Knockout": 68, "Wipeout": 64 },
    maps: {
      "Double Swoosh": 94, "Minecart Madness": 88, "Crystal Arcade": 86, "Hard Rock Mine": 84,
      "Parallel Plays": 86, "Open Business": 82,
    },
  },
  "Frank": {
    overall: 82,
    modes: { "Gem Grab": 92, "Brawl Ball": 88, "Bounty": 48, "Heist": 80, "Hot Zone": 78, "Knockout": 58, "Wipeout": 54 },
    maps: {
      "Hard Rock Mine": 96, "Minecart Madness": 92, "Undermine": 90, "Crystal Arcade": 86, "Double Swoosh": 84,
      "Pinhole Punt": 92, "Backyard Bowl": 86,
      "Safe Zone": 86, "Hot Potato": 90, "Dueling Beetles": 86,
    },
  },
  "Poco": {
    overall: 81,
    modes: { "Gem Grab": 94, "Brawl Ball": 74, "Bounty": 58, "Heist": 52, "Hot Zone": 88, "Knockout": 52, "Wipeout": 58 },
    maps: {
      "Double Swoosh": 96, "Minecart Madness": 90, "Hard Rock Mine": 88, "Crystal Arcade": 86, "Undermine": 84,
      "Ring of Fire": 90, "Parallel Plays": 88, "Outbreak": 86,
    },
  },
  "Emz": {
    overall: 80,
    modes: { "Gem Grab": 88, "Brawl Ball": 62, "Bounty": 68, "Heist": 52, "Hot Zone": 90, "Knockout": 70, "Wipeout": 70 },
    maps: {
      "Double Swoosh": 92, "Crystal Arcade": 88, "Hard Rock Mine": 82,
      "Ring of Fire": 94, "Outbreak": 90, "Dueling Beetles": 92, "Open Business": 86, "Parallel Plays": 86,
    },
  },
  "Sprout": {
    overall: 79,
    modes: { "Gem Grab": 86, "Brawl Ball": 58, "Bounty": 62, "Heist": 70, "Hot Zone": 88, "Knockout": 64, "Wipeout": 64 },
    maps: {
      "Minecart Madness": 90, "Hard Rock Mine": 88, "Undermine": 88, "Crystal Arcade": 84,
      "Pinhole Punt": 80, "Dueling Beetles": 92, "Ring of Fire": 86,
      "Kaboom Canyon": 78,
    },
  },
  "Grom": {
    overall: 78,
    modes: { "Gem Grab": 78, "Brawl Ball": 52, "Bounty": 68, "Heist": 85, "Hot Zone": 78, "Knockout": 64, "Wipeout": 70 },
    maps: {
      "Minecart Madness": 86, "Hard Rock Mine": 84, "Undermine": 82,
      "Kaboom Canyon": 90, "Bridge Too Far": 82, "Bandit Bash": 80,
      "Dueling Beetles": 86, "Ring of Fire": 80,
    },
  },
  "Belle": {
    overall: 78,
    modes: { "Gem Grab": 62, "Brawl Ball": 52, "Bounty": 93, "Heist": 58, "Hot Zone": 64, "Knockout": 91, "Wipeout": 88 },
    maps: {
      "Shooting Star": 96, "Dry Season": 94, "Canal Grande": 90, "Layer Cake": 88, "Snake Prairie": 78,
      "Forsaken Falls": 94, "New Horizons": 92, "Belle's Rock": 90,
      "Hard Lane": 92, "Dark Passage": 88, "Brassmaster": 84,
    },
  },
  "Piper": {
    overall: 77,
    modes: { "Gem Grab": 58, "Brawl Ball": 48, "Bounty": 93, "Heist": 52, "Hot Zone": 58, "Knockout": 86, "Wipeout": 90 },
    maps: {
      "Shooting Star": 96, "Dry Season": 96, "Layer Cake": 90, "Canal Grande": 84, "Snake Prairie": 70,
      "Hard Lane": 94, "Brassmaster": 88, "Dark Passage": 78,
      "New Horizons": 88, "Forsaken Falls": 84,
    },
  },
  "Brock": {
    overall: 76,
    modes: { "Gem Grab": 62, "Brawl Ball": 58, "Bounty": 88, "Heist": 80, "Hot Zone": 62, "Knockout": 84, "Wipeout": 85 },
    maps: {
      "Shooting Star": 90, "Dry Season": 88, "Canal Grande": 86, "Layer Cake": 88,
      "Kaboom Canyon": 90, "Bridge Too Far": 86, "Bandit Bash": 82,
      "Hard Lane": 88, "Dark Passage": 84, "Brassmaster": 90,
      "Belle's Rock": 88, "New Horizons": 84,
    },
  },
  "Nani": {
    overall: 75,
    modes: { "Gem Grab": 62, "Brawl Ball": 52, "Bounty": 86, "Heist": 58, "Hot Zone": 62, "Knockout": 82, "Wipeout": 82 },
    maps: {
      "Shooting Star": 88, "Dry Season": 86, "Layer Cake": 88, "Canal Grande": 80,
      "Hard Lane": 86, "Brassmaster": 84, "New Horizons": 82,
    },
  },
  "Mandy": {
    overall: 74,
    modes: { "Gem Grab": 62, "Brawl Ball": 48, "Bounty": 86, "Heist": 58, "Hot Zone": 62, "Knockout": 80, "Wipeout": 82 },
    maps: {
      "Shooting Star": 88, "Dry Season": 88, "Layer Cake": 86, "Canal Grande": 80,
      "Hard Lane": 88, "Brassmaster": 82, "New Horizons": 82,
    },
  },
  "Byron": {
    overall: 73,
    modes: { "Gem Grab": 80, "Brawl Ball": 58, "Bounty": 62, "Heist": 52, "Hot Zone": 88, "Knockout": 62, "Wipeout": 62 },
    maps: {
      "Double Swoosh": 84, "Minecart Madness": 80, "Hard Rock Mine": 78,
      "Ring of Fire": 90, "Parallel Plays": 88, "Outbreak": 86, "Open Business": 82,
    },
  },
  "Gray": {
    overall: 72,
    modes: { "Gem Grab": 80, "Brawl Ball": 74, "Bounty": 58, "Heist": 62, "Hot Zone": 76, "Knockout": 68, "Wipeout": 64 },
    maps: {
      "Hard Rock Mine": 84, "Undermine": 80, "Minecart Madness": 80, "Double Swoosh": 78,
      "Parallel Plays": 78, "Ring of Fire": 76,
    },
  },
  "Otis": {
    overall: 71,
    modes: { "Gem Grab": 74, "Brawl Ball": 64, "Bounty": 68, "Heist": 52, "Hot Zone": 78, "Knockout": 75, "Wipeout": 70 },
    maps: {
      "Double Swoosh": 76, "Crystal Arcade": 74,
      "Ring of Fire": 80, "Dueling Beetles": 80,
      "Belle's Rock": 78, "New Horizons": 76,
    },
  },
  "Amber": {
    overall: 70,
    modes: { "Gem Grab": 62, "Brawl Ball": 52, "Bounty": 62, "Heist": 88, "Hot Zone": 68, "Knockout": 62, "Wipeout": 64 },
    maps: {
      "Kaboom Canyon": 94, "Bridge Too Far": 88, "Bandit Bash": 84, "Safe Zone": 80, "Hot Potato": 74,
      "Open Business": 72, "Dry Season": 68,
    },
  },
  "Gene": {
    overall: 68,
    modes: { "Gem Grab": 82, "Brawl Ball": 64, "Bounty": 58, "Heist": 52, "Hot Zone": 78, "Knockout": 62, "Wipeout": 58 },
    maps: { "Hard Rock Mine": 84, "Double Swoosh": 82, "Minecart Madness": 80, "Parallel Plays": 80, "Ring of Fire": 76 },
  },
  "Lola": {
    overall: 67,
    modes: { "Gem Grab": 70, "Brawl Ball": 68, "Bounty": 72, "Heist": 58, "Hot Zone": 70, "Knockout": 74, "Wipeout": 70 },
    maps: { "Canal Grande": 76, "Layer Cake": 74, "Shooting Star": 72, "Belle's Rock": 76, "Forsaken Falls": 74 },
  },
  "Bo": {
    overall: 66,
    modes: { "Gem Grab": 68, "Brawl Ball": 62, "Bounty": 82, "Heist": 62, "Hot Zone": 68, "Knockout": 75, "Wipeout": 78 },
    maps: { "Snake Prairie": 88, "Flaring Phoenix": 84, "Layer Cake": 82, "Overgrown Oasis": 82, "Dark Passage": 76 },
  },
  "Penny": {
    overall: 65,
    modes: { "Gem Grab": 74, "Brawl Ball": 52, "Bounty": 64, "Heist": 78, "Hot Zone": 70, "Knockout": 58, "Wipeout": 62 },
    maps: { "Safe Zone": 80, "Kaboom Canyon": 76, "Bandit Bash": 78, "Hard Rock Mine": 76, "Crystal Arcade": 74 },
  },
  "Griff": {
    overall: 64,
    modes: { "Gem Grab": 68, "Brawl Ball": 52, "Bounty": 62, "Heist": 82, "Hot Zone": 65, "Knockout": 58, "Wipeout": 60 },
    maps: { "Safe Zone": 84, "Hot Potato": 80, "Bandit Bash": 82, "Kaboom Canyon": 72, "Bridge Too Far": 74 },
  },
  "Bibi": {
    overall: 63,
    modes: { "Gem Grab": 62, "Brawl Ball": 82, "Bounty": 48, "Heist": 62, "Hot Zone": 62, "Knockout": 62, "Wipeout": 52 },
    maps: { "Super Beach": 86, "Beach Ball": 84, "Backyard Bowl": 80, "Triple Dribble": 78 },
  },
  "Edgar": {
    overall: 62,
    modes: { "Gem Grab": 52, "Brawl Ball": 80, "Bounty": 44, "Heist": 58, "Hot Zone": 58, "Knockout": 68, "Wipeout": 54 },
    maps: { "Pinhole Punt": 84, "Backyard Bowl": 82, "Super Beach": 78, "Beach Ball": 80, "Goldarm Gulch": 72, "Flaring Phoenix": 76 },
  },
  "Rosa": {
    overall: 60,
    modes: { "Gem Grab": 65, "Brawl Ball": 72, "Bounty": 48, "Heist": 62, "Hot Zone": 65, "Knockout": 52, "Wipeout": 50 },
    maps: { "Pinhole Punt": 76, "Hot Potato": 74, "Backyard Bowl": 72 },
  },
  "Jacky": {
    overall: 60,
    modes: { "Gem Grab": 68, "Brawl Ball": 70, "Bounty": 46, "Heist": 66, "Hot Zone": 65, "Knockout": 50, "Wipeout": 48 },
    maps: { "Hot Potato": 76, "Pinhole Punt": 74, "Undermine": 70 },
  },
  "Carl": {
    overall: 59,
    modes: { "Gem Grab": 66, "Brawl Ball": 58, "Bounty": 64, "Heist": 58, "Hot Zone": 63, "Knockout": 64, "Wipeout": 62 },
    maps: { "Layer Cake": 68, "Belle's Rock": 68, "Canal Grande": 66 },
  },
  "Darryl": {
    overall: 58,
    modes: { "Gem Grab": 58, "Brawl Ball": 75, "Bounty": 48, "Heist": 66, "Hot Zone": 58, "Knockout": 58, "Wipeout": 50 },
    maps: { "Backyard Bowl": 78, "Super Beach": 76, "Hot Potato": 70 },
  },
  "Bull": {
    overall: 57,
    modes: { "Gem Grab": 52, "Brawl Ball": 78, "Bounty": 44, "Heist": 80, "Hot Zone": 52, "Knockout": 48, "Wipeout": 46 },
    maps: { "Hot Potato": 86, "Safe Zone": 82, "Pinhole Punt": 80, "Backyard Bowl": 78 },
  },
  "El Primo": {
    overall: 56,
    modes: { "Gem Grab": 58, "Brawl Ball": 75, "Bounty": 40, "Heist": 66, "Hot Zone": 56, "Knockout": 46, "Wipeout": 44 },
    maps: { "Hot Potato": 80, "Pinhole Punt": 78, "Super Beach": 72 },
  },
  "Ash": {
    overall: 55,
    modes: { "Gem Grab": 62, "Brawl Ball": 70, "Bounty": 44, "Heist": 62, "Hot Zone": 62, "Knockout": 50, "Wipeout": 46 },
    maps: { "Hard Rock Mine": 68, "Hot Potato": 72, "Undermine": 66 },
  },
  "Lou": {
    overall: 55,
    modes: { "Gem Grab": 64, "Brawl Ball": 56, "Bounty": 58, "Heist": 50, "Hot Zone": 66, "Knockout": 58, "Wipeout": 58 },
    maps: { "Double Swoosh": 68, "Ring of Fire": 70, "Parallel Plays": 68 },
  },
  "Janet": {
    overall: 54,
    modes: { "Gem Grab": 58, "Brawl Ball": 48, "Bounty": 70, "Heist": 52, "Hot Zone": 60, "Knockout": 70, "Wipeout": 68 },
    maps: { "Shooting Star": 74, "Hard Lane": 72, "New Horizons": 72 },
  },
  "Surge": {
    overall: 53,
    modes: { "Gem Grab": 66, "Brawl Ball": 64, "Bounty": 50, "Heist": 52, "Hot Zone": 66, "Knockout": 54, "Wipeout": 50 },
    maps: { "Double Swoosh": 70, "Outbreak": 68 },
  },
  "Colonel Ruffs": {
    overall: 52,
    modes: { "Gem Grab": 66, "Brawl Ball": 58, "Bounty": 56, "Heist": 50, "Hot Zone": 63, "Knockout": 58, "Wipeout": 56 },
    maps: { "Crystal Arcade": 68, "Parallel Plays": 66 },
  },
  "Meg": {
    overall: 51,
    modes: { "Gem Grab": 58, "Brawl Ball": 60, "Bounty": 48, "Heist": 63, "Hot Zone": 58, "Knockout": 50, "Wipeout": 48 },
    maps: { "Safe Zone": 66, "Bandit Bash": 64 },
  },
  "Sam": {
    overall: 50,
    modes: { "Gem Grab": 52, "Brawl Ball": 70, "Bounty": 40, "Heist": 62, "Hot Zone": 52, "Knockout": 48, "Wipeout": 44 },
    maps: { "Hot Potato": 74, "Pinhole Punt": 72 },
  },
  "Shelly":         { overall: 48, modes: { "Gem Grab": 48, "Brawl Ball": 62, "Bounty": 44, "Heist": 58, "Hot Zone": 48, "Knockout": 46, "Wipeout": 44 }, maps: {} },
  "Colt":           { overall: 47, modes: { "Gem Grab": 50, "Brawl Ball": 48, "Bounty": 64, "Heist": 72, "Hot Zone": 50, "Knockout": 58, "Wipeout": 58 }, maps: { "Bridge Too Far": 74 } },
  "Nita":           { overall: 46, modes: { "Gem Grab": 54, "Brawl Ball": 56, "Bounty": 46, "Heist": 50, "Hot Zone": 54, "Knockout": 46, "Wipeout": 46 }, maps: {} },
  "Barley":         { overall: 45, modes: { "Gem Grab": 58, "Brawl Ball": 38, "Bounty": 54, "Heist": 64, "Hot Zone": 58, "Knockout": 48, "Wipeout": 54 }, maps: { "Undermine": 68, "Pinhole Punt": 72 } },
  "Dynamike":       { overall: 44, modes: { "Gem Grab": 58, "Brawl Ball": 36, "Bounty": 54, "Heist": 64, "Hot Zone": 58, "Knockout": 48, "Wipeout": 54 }, maps: { "Undermine": 70, "Pinhole Punt": 70 } },
  "Tick":           { overall: 43, modes: { "Gem Grab": 56, "Brawl Ball": 36, "Bounty": 50, "Heist": 58, "Hot Zone": 58, "Knockout": 46, "Wipeout": 50 }, maps: {} },
  "8-Bit":          { overall: 42, modes: { "Gem Grab": 58, "Brawl Ball": 44, "Bounty": 54, "Heist": 64, "Hot Zone": 56, "Knockout": 50, "Wipeout": 54 }, maps: {} },
  "Jessie":         { overall: 41, modes: { "Gem Grab": 56, "Brawl Ball": 46, "Bounty": 48, "Heist": 58, "Hot Zone": 54, "Knockout": 46, "Wipeout": 48 }, maps: {} },
  "Squeak":         { overall: 40, modes: { "Gem Grab": 60, "Brawl Ball": 38, "Bounty": 50, "Heist": 54, "Hot Zone": 60, "Knockout": 48, "Wipeout": 50 }, maps: {} },
  "Rico":           { overall: 39, modes: { "Gem Grab": 48, "Brawl Ball": 50, "Bounty": 56, "Heist": 58, "Hot Zone": 48, "Knockout": 54, "Wipeout": 56 }, maps: { "Minecart Madness": 64 } },
  "Pam":            { overall: 38, modes: { "Gem Grab": 54, "Brawl Ball": 48, "Bounty": 44, "Heist": 54, "Hot Zone": 56, "Knockout": 40, "Wipeout": 44 }, maps: {} },
  "Tara":           { overall: 37, modes: { "Gem Grab": 54, "Brawl Ball": 48, "Bounty": 48, "Heist": 46, "Hot Zone": 54, "Knockout": 50, "Wipeout": 48 }, maps: {} },
  "Eve":            { overall: 36, modes: { "Gem Grab": 54, "Brawl Ball": 46, "Bounty": 56, "Heist": 46, "Hot Zone": 56, "Knockout": 54, "Wipeout": 56 }, maps: {} },
  "Bonnie":         { overall: 35, modes: { "Gem Grab": 48, "Brawl Ball": 50, "Bounty": 54, "Heist": 54, "Hot Zone": 50, "Knockout": 54, "Wipeout": 54 }, maps: {} },
  "Chester":        { overall: 34, modes: { "Gem Grab": 50, "Brawl Ball": 54, "Bounty": 48, "Heist": 50, "Hot Zone": 54, "Knockout": 54, "Wipeout": 50 }, maps: {} },
  "Larry & Lawrie": { overall: 33, modes: { "Gem Grab": 46, "Brawl Ball": 38, "Bounty": 56, "Heist": 72, "Hot Zone": 48, "Knockout": 54, "Wipeout": 56 }, maps: { "Kaboom Canyon": 78 } },
  "Bea":            { overall: 32, modes: { "Gem Grab": 44, "Brawl Ball": 38, "Bounty": 64, "Heist": 46, "Hot Zone": 46, "Knockout": 62, "Wipeout": 62 }, maps: { "Shooting Star": 70 } },
  "Gale":           { overall: 30, modes: { "Gem Grab": 50, "Brawl Ball": 44, "Bounty": 48, "Heist": 44, "Hot Zone": 56, "Knockout": 48, "Wipeout": 48 }, maps: {} },
};

const BRAWLER_NAMES = Object.keys(BRAWLERS);
const MODES = ["Gem Grab", "Brawl Ball", "Bounty", "Heist", "Hot Zone", "Knockout", "Wipeout"];
const MAPS = {
  "Gem Grab":   ["Double Swoosh", "Hard Rock Mine", "Undermine", "Crystal Arcade", "Minecart Madness"],
  "Brawl Ball": ["Super Beach", "Pinhole Punt", "Backyard Bowl", "Beach Ball", "Triple Dribble"],
  "Bounty":     ["Shooting Star", "Canal Grande", "Layer Cake", "Dry Season", "Snake Prairie"],
  "Heist":      ["Safe Zone", "Hot Potato", "Kaboom Canyon", "Bridge Too Far", "Bandit Bash"],
  "Hot Zone":   ["Ring of Fire", "Parallel Plays", "Open Business", "Dueling Beetles", "Outbreak"],
  "Knockout":   ["Forsaken Falls", "Belle's Rock", "Flaring Phoenix", "Goldarm Gulch", "New Horizons"],
  "Wipeout":    ["Hard Lane", "Overgrown Oasis", "Hideout", "Dark Passage", "Brassmaster"],
};
const MAP_NOTES = {
  "Double Swoosh": "Otwarte centrum, długie linie — kontrolerzy strefy i suppoci świetni.",
  "Hard Rock Mine": "Wąskie korytarze i dużo ścian — tankowie i throwerzy dominują.",
  "Undermine": "Zamknięta mapa z bushami — assassyni i throwerzy mocni.",
  "Crystal Arcade": "Długie linie z przeszkodami — kontrola zasięgiem kluczowa.",
  "Minecart Madness": "Dynamiczna, pół-otwarta — versatile picksy i suppoci.",
  "Super Beach": "Bardzo otwarta — assassyni i szybcy brawlerzy.",
  "Pinhole Punt": "Dużo ścian — throwerzy i tankowie z bliska.",
  "Backyard Bowl": "Półotwarta — mix assassynów i wytrzymałych brawlerów.",
  "Beach Ball": "Otwarte centrum — szybcy melee i zasięgowi.",
  "Triple Dribble": "Trzy linie — tankowie blokujący i szybcy skrzydłowi.",
  "Shooting Star": "Bardzo otwarta — sniperzy i długi zasięg absolutnie dominują.",
  "Canal Grande": "Otwarte z bushami — sniperzy + brawlerzy z bushów.",
  "Layer Cake": "Wielopoziomowa — sniperzy z góry i brawlerzy kontroli.",
  "Dry Season": "Praktycznie brak osłon — czysty sniper map.",
  "Snake Prairie": "Dużo bushów — brawlerzy z bushów i ambush.",
  "Safe Zone": "Korytarzowa — bliskosiężni i tankowie.",
  "Hot Potato": "Bardzo zamknięta — tankowie bliskie walki.",
  "Kaboom Canyon": "Duża, półotwarta — zasięg i damage dealers.",
  "Bridge Too Far": "Most = korek — brawlerzy kontrolujący wejście.",
  "Bandit Bash": "Średnio otwarta — dobry mix damage i przeżywalności.",
  "Ring of Fire": "Centrum to strefa — kontrolerzy i suppoci kluczowi.",
  "Parallel Plays": "Trzy strefy — suppoci obejmujący zasięg i kontrolerzy.",
  "Open Business": "Otwarta strefa — długi zasięg i suppoci.",
  "Dueling Beetles": "Wąskie strefy ze ścianami — tankowie i kontrolerzy krótkich dystansów.",
  "Outbreak": "Gęste busze przy strefach — mix all-rounderów.",
  "Forsaken Falls": "Duże otwarte linie — zasięg i assassyni z dash.",
  "Belle's Rock": "Półotwarta — versatile, lekka przewaga zasięgu.",
  "Flaring Phoenix": "Dużo bushów i osłon — ambush i stealth.",
  "Goldarm Gulch": "Korytarzowa z osłonami — melee assassyni świetni.",
  "New Horizons": "Otwarta z długimi liniami — sniperzy i zasięgowi.",
  "Hard Lane": "Jedna otwarta linia — sniperzy i damage dealers.",
  "Overgrown Oasis": "Busze i osłony — stealth i ambush.",
  "Hideout": "Bardzo gęste busze — stealth brawlerzy topowi.",
  "Dark Passage": "Zamknięta z bushami — mix, lekka przewaga zasięgu.",
  "Brassmaster": "Otwarta z korytarzami — sniperzy i długi zasięg.",
};

function getScore(data, mode, map) {
  if (map && data.maps?.[map] != null) return data.maps[map];
  if (mode && data.modes?.[mode] != null) return data.modes[mode];
  return data.overall;
}
function getTier(s) { return s >= 90 ? "S" : s >= 75 ? "A" : s >= 60 ? "B" : s >= 45 ? "C" : "D"; }
function tierEmoji(t) { return { S: "⭐", A: "🟢", B: "🔵", C: "🟡", D: "🔴" }[t] ?? "⚪"; }

function findBrawler(input) {
  const l = input.toLowerCase();
  return BRAWLER_NAMES.find(b => b.toLowerCase() === l)
    ?? BRAWLER_NAMES.find(b => b.toLowerCase().startsWith(l))
    ?? null;
}
function parseBrawlers(text) {
  const tokens = text.split(/[\s,]+/).filter(Boolean);
  const found = [], notFound = [];
  let i = 0;
  while (i < tokens.length) {
    if (i + 1 < tokens.length) { const t = findBrawler(tokens[i] + " " + tokens[i+1]); if (t) { found.push(t); i += 2; continue; } }
    const o = findBrawler(tokens[i]);
    if (o) found.push(o); else notFound.push(tokens[i]);
    i++;
  }
  return { found, notFound };
}
function getRecs(mode, map, exclude, n = 5) {
  const ex = exclude.map(x => x.toLowerCase());
  return Object.entries(BRAWLERS)
    .filter(([name]) => !ex.includes(name.toLowerCase()))
    .map(([name, data]) => ({ name, score: getScore(data, mode, map) }))
    .sort((a, b) => b.score - a.score).slice(0, n);
}

function modeRow(sid, cur) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId(`mode:${sid}`).setPlaceholder("1️⃣ Wybierz tryb gry…")
      .addOptions(MODES.map(m => ({ label: m, value: m, default: m === cur })))
  );
}
function mapRow(sid, mode, cur) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId(`map:${sid}`).setPlaceholder("2️⃣ Wybierz mapę…")
      .addOptions([{ label: "Dowolna mapa", value: "__any__", default: !cur }, ...(MAPS[mode]??[]).map(m => ({ label: m, value: m, default: m === cur }))])
  );
}
function setupEmbed(mode, map) {
  return new EmbedBuilder().setColor(0xf5a623).setTitle("🎮 Brawl Stars Pick Helper")
    .setDescription("Wybierz tryb i mapę z menu poniżej.\nGdy skończysz — napisz postacie **wroga** (1–3) w tym kanale.\n\n" +
      `🎮 Tryb: ${mode ? `✅ **${mode}**` : "❌ nie wybrano"}\n` +
      `🗺️ Mapa: ${map ? `✅ **${map}**` : mode ? "❌ nie wybrano" : "_(najpierw wybierz tryb)_"}`)
    .setFooter({ text: "Napisz np: Sandy Leon Crow" });
}
function recsEmbed(mode, map, enemies, recs) {
  const medals = ["🥇","🥈","🥉","4️⃣","5️⃣"];
  return new EmbedBuilder().setColor(0x1e90ff).setTitle("🏆 Top 5 picków")
    .addFields(
      { name: `🎮 ${mode ?? "Ogólnie"}  ·  🗺️ ${map ?? "Dowolna mapa"}`, value: "\u200b" },
      { name: "🔴 Postacie wroga", value: enemies.length ? enemies.join(", ") : "_(brak)_", inline: true },
      { name: "✅ Rekomendacje", value: recs.map((r,i) => `${medals[i]} **${r.name}** ${tierEmoji(getTier(r.score))} Tier ${getTier(r.score)} · ${r.score}/100`).join("\n") }
    ).setFooter({ text: "Napisz inne postacie aby odświeżyć | !pick aby zmienić tryb/mapę" }).setTimestamp();
}
function fpEmbed(mode, map, recs) {
  const medals = ["🥇","🥈","🥉","4️⃣","5️⃣"];
  const note = map ? (MAP_NOTES[map] ?? "") : "";
  return new EmbedBuilder().setColor(0x9b59b6).setTitle("🎯 First Pick — co wybrać jako pierwsze?")
    .addFields(
      { name: `🎮 ${mode ?? "Ogólnie"}  ·  🗺️ ${map ?? "Dowolna mapa"}`, value: note || "\u200b" },
      { name: "🏆 Best first picki (trudne do skontrowania)", value: recs.map((r,i) => `${medals[i]} **${r.name}** ${tierEmoji(getTier(r.score))} Tier ${getTier(r.score)} · ${r.score}/100`).join("\n") }
    ).setFooter({ text: "First pick = silny niezależnie od enemy compu" }).setTimestamp();
}

const sessions = new Map();

client.once(Events.ClientReady, c => {
  console.log(`Zalogowany jako: ${c.user.tag}`);
  c.user.setActivity("rankedach Brawl Stars", { type: ActivityType.Watching });
});

client.on(Events.MessageCreate, async msg => {
  if (msg.author.bot) return;
  const channelId = msg.channelId;
  const content = msg.content.trim();

  if (content.startsWith("!")) {
    const [rawCmd] = content.slice(1).trim().split(/\s+/);
    const cmd = rawCmd?.toLowerCase();
    if (cmd === "ping") { await msg.reply(`Pong! 🏓 ${client.ws.ping}ms`); return; }
    if (cmd === "pomoc" || cmd === "help") {
      await msg.reply({ embeds: [new EmbedBuilder().setColor(0xf5a623).setTitle("🎮 Komendy")
        .addFields(
          { name: "`!pick`", value: "Uruchamia sesję: wybierasz tryb+mapę, piszesz postacie wroga (1–3) — dostajesz top 5 picków." },
          { name: "`!firstpick`", value: "Pokazuje najlepsze first picki na aktualną mapę/tryb (bez podawania postaci wroga)." },
          { name: "`!ping`", value: "Sprawdza czy bot żyje.", inline: true },
          { name: "`!pomoc`", value: "Ta wiadomość.", inline: true },
        ).setFooter({ text: "Meta: czerwiec 2026 | Oceny per mapa" })] });
      return;
    }
    if (cmd === "pick" || cmd === "bs" || cmd === "draft") {
      sessions.set(channelId, { mode: null, map: null, sessionId: channelId, state: "setup" });
      await msg.reply({ embeds: [setupEmbed(null, null)], components: [modeRow(channelId, null)] });
      return;
    }
    if (cmd === "firstpick" || cmd === "fp") {
      const s = sessions.get(channelId);
      if (!s?.mode) { await msg.reply("Najpierw ustaw tryb i mapę przez `!pick`, a potem użyj `!firstpick`."); return; }
      await msg.reply({ embeds: [fpEmbed(s.mode, s.map, getRecs(s.mode, s.map, []))] });
      return;
    }
    return;
  }

  const session = sessions.get(channelId);
  if (!session) return;
  if (session.state !== "ready") { await msg.reply("Najpierw wybierz tryb i mapę z menu powyżej! 👆"); return; }
  const { found: enemies, notFound } = parseBrawlers(content);
  if (!enemies.length) return;
  const recs = getRecs(session.mode, session.map, enemies);
  const warn = notFound.length ? `⚠️ Nie znalazłem: **${notFound.join(", ")}**\n` : "";
  await msg.reply({ content: warn || undefined, embeds: [recsEmbed(session.mode, session.map, enemies, recs)] });
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isStringSelectMenu()) return;
  const [type, sid] = interaction.customId.split(":");
  const session = sessions.get(interaction.channelId);
  if (!session || session.sessionId !== sid) {
    await interaction.reply({ content: "Sesja wygasła. Wpisz `!pick` jeszcze raz.", ephemeral: true }); return;
  }
  const value = interaction.values[0];
  if (type === "mode") {
    session.mode = value; session.map = null;
    await interaction.update({ embeds: [setupEmbed(session.mode, null)], components: [modeRow(sid, session.mode), mapRow(sid, session.mode, null)] });
  } else if (type === "map") {
    session.map = value === "__any__" ? null : value;
    session.state = "ready";
    const note = session.map ? (MAP_NOTES[session.map] ? `\n📌 ${MAP_NOTES[session.map]}\n` : "") : "";
    await interaction.update({ embeds: [new EmbedBuilder().setColor(0x2ecc71).setTitle("✅ Gotowe! Napisz postacie wroga")
      .setDescription(`🎮 Tryb: **${session.mode}**\n🗺️ Mapa: **${session.map ?? "Dowolna"}**${note}\nNapisz **1–3 postacie wroga** — bot poda top 5 picków.\nUżyj \`!firstpick\` dla best first picków.\nWpisz \`!pick\` żeby zmienić tryb/mapę.`)],
      components: [modeRow(sid, session.mode), mapRow(sid, session.mode, session.map)] });
  }
});

client.on(Events.Error, err => console.error("Discord error:", err));
client.login(DISCORD_TOKEN);
