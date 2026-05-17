import { z } from 'zod';
import { MATCH_STATUS } from '../utils/constants';

const teamStatsSchema = z.object({
  runs: z.number().int().min(0),
  wickets: z.number().int().min(0).max(10),
  overs: z.number().min(0).max(20.5),
});

export const matchSchema = z
  .object({
    team1Id: z.string().min(1),
    team2Id: z.string().min(1),
    team1Stats: teamStatsSchema,
    team2Stats: teamStatsSchema,
    winnerId: z.string().nullable(),
    matchStatus: z.enum([
      MATCH_STATUS.COMPLETED,
      MATCH_STATUS.NO_RESULT,
      MATCH_STATUS.TIE,
    ]),
    date: z.string().datetime(),
    venue: z.string().min(1),
  })
  .refine(
    (data): boolean => {
      if (data.matchStatus === MATCH_STATUS.COMPLETED && !data.winnerId) {
        return false;
      }

      if (data.matchStatus !== MATCH_STATUS.COMPLETED && data.winnerId !== null) {
        return false;
      }

      return true;
    },
    {
      message: 'winnerId must be non-null for COMPLETED, and null for TIE / NO_RESULT',
    },
  );

export type MatchPayloadInput = z.infer<typeof matchSchema>;
