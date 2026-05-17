import type { NextFunction, Request, Response } from 'express';
import * as teamsService from '../services/teamsService';
import type { Team } from '../types';

export async function getAllTeams(
  req: Request,
  res: Response<Team[]>,
  next: NextFunction,
): Promise<void> {
  void req;

  try {
    const teams = await teamsService.getAllTeams();
    res.status(200).json(teams);
  } catch (err) {
    next(err);
  }
}
