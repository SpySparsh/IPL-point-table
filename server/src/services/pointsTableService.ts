import * as matchesService from './matchesService';
import * as teamsService from './teamsService';
import { calculatePointsTable } from './pointsCalculator';
import { db } from '../config/firebase';
import type { Standing } from '../types';

export async function getPointsTable(): Promise<Standing[]> {
  const [matches, teams] = await Promise.all([
    matchesService.getAllMatches(),
    teamsService.getAllTeams(),
  ]);

  return calculatePointsTable(matches, teams);
}

export async function refreshCurrentStandings(): Promise<Standing[]> {
  const standings = await getPointsTable();

  await db.collection('standings').doc('current').set({
    standings,
    updatedAt: new Date(),
  });

  return standings;
}
