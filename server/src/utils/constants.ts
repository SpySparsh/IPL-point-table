export const MATCH_STATUS = {
  COMPLETED: 'COMPLETED',
  NO_RESULT: 'NO_RESULT',
  TIE: 'TIE',
} as const;

export type MatchStatus = typeof MATCH_STATUS[keyof typeof MATCH_STATUS];

export const POINTS = {
  WIN: 2,
  LOSS: 0,
  TIE_OR_NR: 1,
} as const;

export const FULL_OVER_QUOTA = 20.0;
