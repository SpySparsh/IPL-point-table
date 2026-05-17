import type { NextFunction, Request, Response } from 'express';
import * as matchesService from '../services/matchesService';
import * as pointsTableService from '../services/pointsTableService';
import type { Match, MatchPayload } from '../types';

export async function getAllMatches(
  req: Request,
  res: Response<Match[]>,
  next: NextFunction,
): Promise<void> {
  void req;

  try {
    const matches = await matchesService.getAllMatches();
    res.status(200).json(matches);
  } catch (err) {
    next(err);
  }
}

export async function getMatchById(
  req: Request<{ id: string }, Match>,
  res: Response<Match>,
  next: NextFunction,
): Promise<void> {
  try {
    const match = await matchesService.getMatchById(req.params.id);
    res.status(200).json(match);
  } catch (err) {
    next(err);
  }
}

export async function addMatch(
  req: Request<Record<string, never>, Match, MatchPayload>,
  res: Response<Match>,
  next: NextFunction,
): Promise<void> {
  try {
    const match = await matchesService.addMatch(req.body);
    await pointsTableService.refreshCurrentStandings();
    res.status(201).json(match);
  } catch (err) {
    next(err);
  }
}

export async function deleteMatch(
  req: Request<{ id: string }, { success: boolean }>,
  res: Response<{ success: boolean }>,
  next: NextFunction,
): Promise<void> {
  try {
    await matchesService.deleteMatch(req.params.id);
    await pointsTableService.refreshCurrentStandings();
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function updateMatch(
  req: Request<{ id: string }, Match, MatchPayload>,
  res: Response<Match>,
  next: NextFunction,
): Promise<void> {
  try {
    const match = await matchesService.updateMatch(req.params.id, req.body);
    await pointsTableService.refreshCurrentStandings();
    res.status(200).json(match);
  } catch (err) {
    next(err);
  }
}
