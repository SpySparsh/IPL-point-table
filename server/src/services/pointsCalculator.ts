import { FULL_OVER_QUOTA, MATCH_STATUS, POINTS } from '../utils/constants';
import type { Match, Standing, Team, TeamAccumulator, TeamStats } from '../types';

export function oversToDecimal(overs: number): number {
  const wholeOvers = Math.floor(overs);
  const balls = Math.round((overs - wholeOvers) * 10);
  return wholeOvers + balls / 6;
}

function getEffectiveOversFaced(stats: TeamStats): number {
  return stats.wickets === 10 ? FULL_OVER_QUOTA : oversToDecimal(stats.overs);
}

function createAccumulator(): TeamAccumulator {
  return {
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    noResults: 0,
    points: 0,
    totalRunsScored: 0,
    totalOversFaced: 0,
    totalRunsConceded: 0,
    totalOversBowled: 0,
  };
}

function getAccumulator(
  statsMap: Map<string, TeamAccumulator>,
  teamId: string,
): TeamAccumulator {
  const accumulator = statsMap.get(teamId);

  if (!accumulator) {
    throw new Error(`Team ${teamId} is not present in the teams list`);
  }

  return accumulator;
}

function accumulateStats(
  accumulator: TeamAccumulator,
  battingStats: TeamStats,
  opponentStats: TeamStats,
): void {
  accumulator.totalRunsScored += battingStats.runs;
  accumulator.totalOversFaced += getEffectiveOversFaced(battingStats);
  accumulator.totalRunsConceded += opponentStats.runs;
  accumulator.totalOversBowled += oversToDecimal(opponentStats.overs);
}

export function calculatePointsTable(
  matches: Match[],
  teams: Team[],
): Standing[] {
  const statsMap: Map<string, TeamAccumulator> = new Map<string, TeamAccumulator>();

  teams.forEach((team: Team): void => {
    statsMap.set(team.id, createAccumulator());
  });

  matches.forEach((match: Match): void => {
    const team1Accumulator = getAccumulator(statsMap, match.team1Id);
    const team2Accumulator = getAccumulator(statsMap, match.team2Id);

    team1Accumulator.matchesPlayed += 1;
    team2Accumulator.matchesPlayed += 1;

    if (match.matchStatus === MATCH_STATUS.COMPLETED) {
      const winnerAccumulator =
        match.winnerId === match.team1Id ? team1Accumulator : team2Accumulator;
      const loserAccumulator =
        match.winnerId === match.team1Id ? team2Accumulator : team1Accumulator;

      winnerAccumulator.wins += 1;
      winnerAccumulator.points += POINTS.WIN;
      loserAccumulator.losses += 1;

      accumulateStats(team1Accumulator, match.team1Stats, match.team2Stats);
      accumulateStats(team2Accumulator, match.team2Stats, match.team1Stats);
      return;
    }

    if (match.matchStatus === MATCH_STATUS.TIE) {
      team1Accumulator.points += POINTS.TIE_OR_NR;
      team2Accumulator.points += POINTS.TIE_OR_NR;

      accumulateStats(team1Accumulator, match.team1Stats, match.team2Stats);
      accumulateStats(team2Accumulator, match.team2Stats, match.team1Stats);
      return;
    }

    if (match.matchStatus === MATCH_STATUS.NO_RESULT) {
      team1Accumulator.noResults += 1;
      team2Accumulator.noResults += 1;
      team1Accumulator.points += POINTS.TIE_OR_NR;
      team2Accumulator.points += POINTS.TIE_OR_NR;
    }
  });

  const standings: Standing[] = teams.map((team: Team): Standing => {
    const accumulator = getAccumulator(statsMap, team.id);
    const nrr =
      accumulator.totalOversFaced > 0
        ? accumulator.totalRunsScored / accumulator.totalOversFaced -
          accumulator.totalRunsConceded / accumulator.totalOversBowled
        : 0;
    const roundedNrr = Math.round(nrr * 1000) / 1000;

    return {
      rank: 0,
      teamId: team.id,
      teamName: team.name,
      shortCode: team.shortCode,
      logoUrl: team.logoUrl,
      matchesPlayed: accumulator.matchesPlayed,
      wins: accumulator.wins,
      losses: accumulator.losses,
      noResults: accumulator.noResults,
      points: accumulator.points,
      nrr: roundedNrr,
    };
  });

  standings.sort((a: Standing, b: Standing): number => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    return b.nrr - a.nrr;
  });

  return standings.map((standing: Standing, index: number): Standing => ({
    ...standing,
    rank: index + 1,
  }));
}
