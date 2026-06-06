import { DraftSession, DraftPhase, Team, DRAFT_BAN_ORDER, DRAFT_PICK_ORDER } from "../types";

const sessions = new Map<string, DraftSession>();

export function createSession(
  channelId: string, guildId: string, hostUserId: string,
  mode: string, mapName: string, team1Name: string, team2Name: string
): DraftSession {
  const session: DraftSession = {
    channelId, guildId, hostUserId, mode, mapName,
    phase: "banning", currentTeam: 0, banTurn: 0, pickTurn: 0,
    bans: [], picks: [[], []], createdAt: Date.now(),
    teamNames: [team1Name, team2Name], teamColors: [0x3498DB, 0xE74C3C]
  };
  sessions.set(channelId, session);
  return session;
}

export function getSession(channelId: string): DraftSession | undefined {
  return sessions.get(channelId);
}

export function deleteSession(channelId: string): void {
  sessions.delete(channelId);
}

export function banBrawler(session: DraftSession, brawler: string): boolean {
  if (session.phase !== "banning") return false;
  if (session.bans.includes(brawler.toLowerCase())) return false;
  if (isPicked(session, brawler)) return false;
  session.bans.push(brawler.toLowerCase());
  session.banTurn++;
  if (session.banTurn < DRAFT_BAN_ORDER.length) {
    session.currentTeam = DRAFT_BAN_ORDER[session.banTurn] as Team;
  } else {
    session.phase = "picking";
    session.currentTeam = DRAFT_PICK_ORDER[0];
  }
  return true;
}

export function pickBrawler(session: DraftSession, brawler: string): boolean {
  if (session.phase !== "picking") return false;
  if (session.bans.includes(brawler.toLowerCase())) return false;
  if (isPicked(session, brawler)) return false;
  const team = DRAFT_PICK_ORDER[session.pickTurn];
  session.picks[team].push(brawler.toLowerCase());
  session.pickTurn++;
  if (session.pickTurn < DRAFT_PICK_ORDER.length) {
    session.currentTeam = DRAFT_PICK_ORDER[session.pickTurn];
  } else {
    session.phase = "complete";
  }
  return true;
}

export function isPicked(session: DraftSession, brawler: string): boolean {
  const lower = brawler.toLowerCase();
  return session.picks[0].includes(lower) || session.picks[1].includes(lower);
}

export function isBanned(session: DraftSession, brawler: string): boolean {
  return session.bans.includes(brawler.toLowerCase());
}

export function getCurrentPhaseInfo(session: DraftSession): { phase: DraftPhase; team: number; turnNumber: number; totalTurns: number; } {
  if (session.phase === "banning") {
    return { phase: "banning", team: DRAFT_BAN_ORDER[session.banTurn] ?? 0, turnNumber: session.banTurn + 1, totalTurns: DRAFT_BAN_ORDER.length };
  } else if (session.phase === "picking") {
    return { phase: "picking", team: DRAFT_PICK_ORDER[session.pickTurn] ?? 0, turnNumber: session.pickTurn + 1, totalTurns: DRAFT_PICK_ORDER.length };
  }
  return { phase: "complete", team: 0, turnNumber: 0, totalTurns: 0 };
}

export function cleanExpiredSessions(): void {
  const now = Date.now();
  const EXPIRY = 2 * 60 * 60 * 1000;
  for (const [id, session] of sessions) {
    if (now - session.createdAt > EXPIRY) sessions.delete(id);
  }
}
