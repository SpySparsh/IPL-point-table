import type { NextFunction, Request, Response } from 'express';
import * as pointsTableService from '../services/pointsTableService';
import type { Standing } from '../types';

export async function getPointsTable(
  req: Request,
  res: Response<Standing[]>,
  next: NextFunction,
): Promise<void> {
  void req;

  try {
    const table = await pointsTableService.getPointsTable();
    res.status(200).json(table);
  } catch (err) {
    next(err);
  }
}
