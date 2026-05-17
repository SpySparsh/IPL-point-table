export type MatchStatus = 'COMPLETED' | 'NO_RESULT' | 'TIE';

export interface Team {
  id: string;
  name: string;
  shortCode: string;
  logoUrl: string;
  city: string;
}

export interface TeamStats {
  runs: number;
  wickets: number;
  overs: number;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  team1Stats: TeamStats;
  team2Stats: TeamStats;
  winnerId: string | null;
  matchStatus: MatchStatus;
  venue: string;
  date: string;
}

export interface Standing {
  rank: number;
  teamId: string;
  teamName: string;
  shortCode: string;
  logoUrl: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  noResults: number;
  points: number;
  nrr: number;
}

export interface MatchPayload {
  team1Id: string;
  team2Id: string;
  team1Stats: TeamStats;
  team2Stats: TeamStats;
  winnerId: string | null;
  matchStatus: MatchStatus;
  venue: string;
  date: string;
}
