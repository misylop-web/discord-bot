export type GameMode = "gem_grab" | "brawl_ball" | "heist" | "knockout" | "bounty" | "hot_zone";

export interface MapData { name: string; mode: GameMode; emoji: string; description: string; bestBrawlers: string[]; banTargets: string[]; type: "open" | "closed" | "mixed"; }
export interface ModeData { name: string; emoji: string; color: number; description: string; mapsCount: number; keyBans: string[]; generalTips: string[]; }

export const MODES: Record<GameMode, ModeData> = {
  gem_grab: { name: "Gem Grab", emoji: "💎", color: 0x9B59B6, description: "Zbierz 10 klejnotów i utrzymaj je przez 15 sekund. Kontrola środka jest kluczowa.", mapsCount: 4, keyBans: ["Gene", "Sandy", "Otis", "Spike"], generalTips: ["Banuj Gene — jego Super wyciągający gem carriera zmienia mecz", "Potrzebujesz kontrolera, damage dealera i supporta/tanka", "Kontrola środkowej osi mapy = kontrola gry", "Sandy Super na klejnotach to game-changer"] },
  brawl_ball: { name: "Brawl Ball", emoji: "⚽", color: 0x27AE60, description: "Strzelaj gole. Trzy uderzenia obalają ścianę. Brawler trzymający piłkę nie może atakować.", mapsCount: 4, keyBans: ["Mortis", "Edgar", "Bibi"], generalTips: ["Banuj Mortis — dominuje w Brawl Ball każdego sezonu", "Meeple + Hank to potężna synergii w tym trybie", "Tank + Healer to klasyczna skuteczna kompozycja", "Piłkarz musi mieć eskortę — nie biegaj sam"] },
  heist: { name: "Heist", emoji: "🏦", color: 0xE74C3C, description: "Zniszcz sejf wroga lub broń swojego. Wysokie obrażenia = wygrana.", mapsCount: 4, keyBans: ["Griff", "Damian", "Brock"], generalTips: ["Priorytet: jak najszybsze obrażenia na sejfie wroga", "Throwerzy są silni jeśli mapa ma osłony", "Potrzebujesz co najmniej 2 brawlerów do ataku sejfu", "Obrona: 1 brawler na linii, 2 atakują sejf wroga"] },
  knockout: { name: "Knockout", emoji: "❌", color: 0xE67E22, description: "Wyeliminuj całą drużynę wroga. Jeden szans na mecz — respawn tylko między rundami.", mapsCount: 4, keyBans: ["Chester", "Crow", "Piper"], generalTips: ["Brak respawnu = każde życie się liczy, graj ostrożnie", "Unikaj pikowania dwóch brawlerów z tą samą słabością", "Snajperzy są tu wyjątkowo silni — Piper, Bea, Nani", "Last-pick do Knockout: wybierz twardy licznik do enemy comp"] },
  bounty: { name: "Bounty", emoji: "🏹", color: 0xF1C40F, description: "Zbieraj gwiazdki zabijając wrogów. Im więcej gwiazdek, tym wyższy bounty na Tobie.", mapsCount: 4, keyBans: ["Piper", "Bea", "Chester"], generalTips: ["Banuj Piper jeśli mapa jest otwarta", "Trzymaj się z dala od środkowej linii gdy masz wysoki bounty", "Snajperzy i długi zasięg > melee na większości map Bounty", "Crow do kontry healerów i izolowanych wrogów"] },
  hot_zone: { name: "Hot Zone", emoji: "🔥", color: 0xFF6B35, description: "Kontroluj strefy przez określony czas. Kluczowe: ciągła obecność na punktach.", mapsCount: 4, keyBans: ["Sandy", "Edgar", "Damian"], generalTips: ["Sandy Super na strefie = natychmiastowa kontrola punktu", "Potrzebujesz brawlerów mogących utrzymać się na strefie", "Unikaj pickowania 3 melee — jeden snajper kontruje wszystkich", "Gray + Tank na Hot Zone to silna synergii"] }
};

export const MAPS: MapData[] = [
  { name: "Hard Rock Mine", mode: "gem_grab", emoji: "⛏️", description: "Klasyczna mapa z mineralami i wąskim centrum. Idealna dla kontrolerów.", bestBrawlers: ["Spike", "Gene", "Otis", "Sandy"], banTargets: ["Gene", "Sandy", "Mortis"], type: "closed" },
  { name: "Crystal Arcade", mode: "gem_grab", emoji: "🎮", description: "Otwarta mapa z korytarzami po bokach. Snajperzy i ranged dominują.", bestBrawlers: ["Piper", "Bea", "Spike", "Griff"], banTargets: ["Piper", "Leon", "Crow"], type: "open" },
  { name: "Undermine", mode: "gem_grab", emoji: "🏚️", description: "Mapa z wieloma wąskimi przejściami. Throwerzy i kontrolerzy.", bestBrawlers: ["Barley", "Dynamike", "Gene", "Sandy"], banTargets: ["Barley", "Dynamike", "Mortis"], type: "closed" },
  { name: "Double Swoosh", mode: "gem_grab", emoji: "💫", description: "Symetryczna mapa z dwiema głównymi osiami. Silny drafting jest kluczem.", bestBrawlers: ["Otis", "Byron", "Colette", "Chester"], banTargets: ["Sandy", "Gene", "Otis"], type: "mixed" },
  { name: "Backyard Bowl", mode: "brawl_ball", emoji: "🏡", description: "Klasyczna, otwarta mapa Brawl Ball. Tanks i szybkie brawlery dominują.", bestBrawlers: ["Bibi", "Edgar", "Mortis", "Frank"], banTargets: ["Mortis", "Edgar", "Bibi"], type: "open" },
  { name: "Super Beach", mode: "brawl_ball", emoji: "🏖️", description: "Otwarta mapa plażowa. Brawlerzy z mobilnością i zasięgiem mają przewagę.", bestBrawlers: ["Leon", "Crow", "Bibi", "Chester"], banTargets: ["Mortis", "Leon", "Edgar"], type: "open" },
  { name: "Pinhole Punt", mode: "brawl_ball", emoji: "🕳️", description: "Mapa z wąskim środkowym przejściem. Silna dla kontrolerów i throwerów.", bestBrawlers: ["Barley", "Sprout", "Sandy", "Meeple"], banTargets: ["Mortis", "Sandy", "Barley"], type: "closed" },
  { name: "Triple Dribble", mode: "brawl_ball", emoji: "🏀", description: "Mapa z trzema równoległymi korytarzami. Bardzo otwarta — snajperzy silni.", bestBrawlers: ["Piper", "Bibi", "Nani", "Chester"], banTargets: ["Piper", "Mortis", "Edgar"], type: "open" },
  { name: "Safe Zone", mode: "heist", emoji: "🔒", description: "Klasyczna mapa Heist z silnymi pozycjami obronnymi.", bestBrawlers: ["Griff", "Brock", "Dynamike", "Bull"], banTargets: ["Griff", "Bull", "Dynamike"], type: "mixed" },
  { name: "Kaboom Canyon", mode: "heist", emoji: "💥", description: "Mapa z wąwozem — dużo bushy i osłon. Silna dla throwerów.", bestBrawlers: ["Dynamike", "Barley", "Griff", "Tick"], banTargets: ["Dynamike", "Barley", "Brock"], type: "closed" },
  { name: "Bridge Too Far", mode: "heist", emoji: "🌉", description: "Most centralny — kto kontroluje środek, kontroluje grę.", bestBrawlers: ["Brock", "Piper", "Griff", "Sam"], banTargets: ["Brock", "Piper", "Griff"], type: "open" },
  { name: "Hot Potato", mode: "heist", emoji: "🥔", description: "Kompaktowa mapa wymagająca szybkich ataków na sejf.", bestBrawlers: ["Bull", "Darryl", "Sam", "Griff"], banTargets: ["Bull", "Griff", "Sam"], type: "closed" },
  { name: "Sunset Vista", mode: "knockout", emoji: "🌅", description: "Otwarta mapa — snajperzy i długi zasięg dominują. Uważaj na flanki.", bestBrawlers: ["Piper", "Bea", "Chester", "Crow"], banTargets: ["Piper", "Bea", "Chester"], type: "open" },
  { name: "Dueling Beetles", mode: "knockout", emoji: "🐛", description: "Mapa z bushy i wąskimi przejściami. Assassini mają tu pole do popisu.", bestBrawlers: ["Leon", "Crow", "Mortis", "Edgar"], banTargets: ["Leon", "Mortis", "Edgar"], type: "closed" },
  { name: "Out in the Open", mode: "knockout", emoji: "🏜️", description: "Bardzo otwarta — mało osłon. Ranged i snipers mają ogromną przewagę.", bestBrawlers: ["Piper", "Nani", "Chester", "Crow"], banTargets: ["Piper", "Chester", "Crow"], type: "open" },
  { name: "Brasswork", mode: "knockout", emoji: "⚙️", description: "Mapa z mechanicznymi elementami. Mieszany styl — wymaga wszechstronności.", bestBrawlers: ["Chester", "Crow", "Leon", "Spike"], banTargets: ["Chester", "Crow", "Piper"], type: "mixed" },
  { name: "Snake Prairie", mode: "bounty", emoji: "🐍", description: "Otwarta mapa preryjna — snajperzy rządzą. Uważaj na ekspozycję.", bestBrawlers: ["Piper", "Bea", "Nani", "Chester"], banTargets: ["Piper", "Bea", "Crow"], type: "open" },
  { name: "Hideout", mode: "bounty", emoji: "🌿", description: "Mapa z dużą ilością bushy — flankerzy i assassini silni.", bestBrawlers: ["Leon", "Crow", "Chester", "Mortis"], banTargets: ["Leon", "Crow", "Mortis"], type: "closed" },
  { name: "Layer Cake", mode: "bounty", emoji: "🎂", description: "Wielopoziomowa mapa — kontrola wysokości daje przewagę.", bestBrawlers: ["Piper", "Chester", "Crow", "Spike"], banTargets: ["Piper", "Chester", "Crow"], type: "mixed" },
  { name: "Excel", mode: "bounty", emoji: "📊", description: "Siatka ścieżek — wielokierunkowe zagrożenia. Wszechstronne picke sprawdzają się.", bestBrawlers: ["Spike", "Crow", "Chester", "Leon"], banTargets: ["Crow", "Chester", "Leon"], type: "mixed" },
  { name: "Open Business", mode: "hot_zone", emoji: "🏪", description: "Otwarta mapa z centralną strefą. Silna obecność ranged.", bestBrawlers: ["Sandy", "Spike", "Otis", "Chester"], banTargets: ["Sandy", "Edgar", "Damian"], type: "open" },
  { name: "Ring of Fire", mode: "hot_zone", emoji: "🔥", description: "Okrągła strefa — brawlerzy z AoE dominują.", bestBrawlers: ["Barley", "Sandy", "Frank", "Otis"], banTargets: ["Sandy", "Barley", "Edgar"], type: "mixed" },
  { name: "Parallel Plays", mode: "hot_zone", emoji: "⏸️", description: "Dwie równoległe strefy — split push jest kluczowy.", bestBrawlers: ["Crow", "Sandy", "Byron", "Chester"], banTargets: ["Sandy", "Crow", "Edgar"], type: "mixed" },
  { name: "Flooded Mine", mode: "hot_zone", emoji: "💧", description: "Ciasna mapa z ograniczonymi ścieżkami. Throwerzy i kontrolerzy silni.", bestBrawlers: ["Dynamike", "Sandy", "Otis", "Barley"], banTargets: ["Sandy", "Dynamike", "Edgar"], type: "closed" }
];

export function getMapsByMode(mode: GameMode): MapData[] { return MAPS.filter(m => m.mode === mode); }

export function getModeKey(modeName: string): GameMode | null {
  const normalized = modeName.toLowerCase().replace(/\s/g, "_");
  if (MODES[normalized as GameMode]) return normalized as GameMode;
  const modeMap: Record<string, GameMode> = {
    "gem grab": "gem_grab", "gemgrab": "gem_grab", "klejnoty": "gem_grab",
    "brawl ball": "brawl_ball", "brawlball": "brawl_ball", "pilka": "brawl_ball",
    "heist": "heist", "skok": "heist", "knockout": "knockout", "ko": "knockout",
    "bounty": "bounty", "nagroda": "bounty", "hot zone": "hot_zone", "hotzone": "hot_zone", "strefa": "hot_zone"
  };
  return modeMap[modeName.toLowerCase()] ?? null;
}
