import { calculatePointsTable } from '../src/services/pointsCalculator';
import { MATCH_STATUS } from '../src/utils/constants';
import type { Match, Standing, Team } from '../src/types';
import { describe, test, expect } from '@jest/globals';

const teams: Team[] = [
  { id: 'csk', name: 'Chennai Super Kings', shortCode: 'CSK', logoUrl: '', city: 'Chennai' },
  { id: 'mi', name: 'Mumbai Indians', shortCode: 'MI', logoUrl: '', city: 'Mumbai' },
  { id: 'rcb', name: 'Royal Challengers', shortCode: 'RCB', logoUrl: '', city: 'Bengaluru' },
];

const find = (table: Standing[], teamId: string): Standing => {
  const row = table.find((team: Standing): boolean => team.teamId === teamId);

  if (!row) {
    throw new Error(`Team ${teamId} not in standings`);
  }

  return row;
};

const now = new Date();

describe('pointsCalculator', () => {
  test('TEST 1 - Win: winner gets 2 pts, loser gets 0 pts', () => {
    const matches: Match[] = [
      {
        id: 'm1',
        team1Id: 'csk',
        team2Id: 'mi',
        team1Stats: { runs: 180, wickets: 5, overs: 20.0 },
        team2Stats: { runs: 175, wickets: 7, overs: 20.0 },
        winnerId: 'csk',
        matchStatus: MATCH_STATUS.COMPLETED,
        venue: 'Chepauk',
        date: now,
      },
    ];

    const table = calculatePointsTable(matches, teams);
    const csk = find(table, 'csk');
    const mi = find(table, 'mi');

    expect(csk.points).toBe(2);
    expect(csk.wins).toBe(1);
    expect(csk.rank).toBe(1);
    expect(mi.points).toBe(0);
    expect(mi.losses).toBe(1);
  });

  test('TEST 2 - Tie: both teams receive 1 pt each', () => {
    const matches: Match[] = [
      {
        id: 'm2',
        team1Id: 'csk',
        team2Id: 'mi',
        team1Stats: { runs: 160, wickets: 6, overs: 20.0 },
        team2Stats: { runs: 160, wickets: 8, overs: 20.0 },
        winnerId: null,
        matchStatus: MATCH_STATUS.TIE,
        venue: 'Wankhede',
        date: now,
      },
    ];

    const table = calculatePointsTable(matches, teams);
    const csk = find(table, 'csk');
    const mi = find(table, 'mi');

    expect(csk.points).toBe(1);
    expect(mi.points).toBe(1);
  });

  test('TEST 3 - Bowled-out edge case: oversFaced must use FULL_OVER_QUOTA (20.0) in NRR', () => {
    const matches: Match[] = [
      {
        id: 'm3',
        team1Id: 'csk',
        team2Id: 'rcb',
        team1Stats: { runs: 131, wickets: 3, overs: 15.0 },
        team2Stats: { runs: 130, wickets: 10, overs: 14.2 },
        winnerId: 'csk',
        matchStatus: MATCH_STATUS.COMPLETED,
        venue: 'Dharamsala',
        date: now,
      },
    ];

    const table = calculatePointsTable(matches, teams);
    const rcb = find(table, 'rcb');

    expect(rcb.nrr).toBeCloseTo(-2.233, 2);
  });
});
