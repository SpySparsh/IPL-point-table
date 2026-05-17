# `codex-spec.md` — IPL Points Table Full-Stack Application (TypeScript)
> **For AI Coding Assistants (Codex / Cursor)**
> Read this document top-to-bottom before writing any code. Execute in phases as numbered. Do not skip any section. Where this spec and any other instruction conflict, this spec wins.
> **This entire monorepo is strictly TypeScript. Do not write any `.js` file outside of config tooling. No `any` types. No implicit `any`. Compiler errors are build failures.**

---

## Project Overview

Build a production-grade **IPL Points Table** web application. An admin can enter match results; users see a live, auto-ranked standings table computed entirely from match data. The app is a monorepo containing a Node.js/Express REST API (`/server`) and a React + Vite frontend (`/client`), both written entirely in **TypeScript**.

| Field              | Value                                                          |
|--------------------|----------------------------------------------------------------|
| **Tech Stack**     | React + Vite (TSX), Node.js, Express, Firebase Firestore       |
| **Language**       | **TypeScript (strict mode) — server and client**               |
| **Validation**     | Zod (server-side schema validation with inferred TS types)     |
| **Testing**        | Jest + ts-jest (unit tests for the services layer)             |
| **Difficulty**     | Intermediate / Production-grade                                |
| **Submission**     | Public GitHub repo + live deployed URL                         |

---

## Monorepo Folder Structure

Generate **exactly** this structure. Do not deviate. Every source file uses `.ts` or `.tsx`.

```
ipl-points-table/
├── client/                              # React + Vite frontend (TypeScript)
│   ├── public/
│   ├── tsconfig.json                    # Client TypeScript config
│   ├── vite.config.ts
│   └── src/
│       ├── api/                         # Axios instance + per-resource wrappers
│       │   ├── axiosInstance.ts
│       │   ├── teamsApi.ts
│       │   ├── matchesApi.ts
│       │   └── pointsTableApi.ts
│       ├── components/                  # Reusable UI components
│       │   ├── Navbar.tsx
│       │   ├── PointsTable.tsx
│       │   ├── TeamRow.tsx
│       │   ├── MatchResultForm.tsx
│       │   └── MatchCard.tsx
│       ├── pages/                       # Route-level page components
│       │   ├── HomePage.tsx
│       │   ├── PointsTablePage.tsx
│       │   ├── AdminPage.tsx
│       │   └── MatchResultsPage.tsx
│       ├── types/
│       │   └── index.ts                 # Shared frontend TypeScript interfaces
│       ├── App.tsx
│       └── main.tsx
│
├── server/                              # Node.js / Express backend (TypeScript)
│   ├── tsconfig.json                    # Server TypeScript config
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.ts             # Firebase Admin SDK init (singleton)
│   │   ├── controllers/                # HTTP layer — parse req, call service, send res
│   │   │   ├── teamsController.ts
│   │   │   ├── matchesController.ts
│   │   │   └── pointsTableController.ts
│   │   ├── services/                   # Core business logic — no Express objects here
│   │   │   ├── teamsService.ts
│   │   │   ├── matchesService.ts
│   │   │   ├── pointsTableService.ts
│   │   │   └── pointsCalculator.ts     # NRR & ranking engine (pure functions)
│   │   ├── routes/
│   │   │   ├── teamRoutes.ts
│   │   │   ├── matchRoutes.ts
│   │   │   └── pointsTableRoutes.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts       # API key guard for admin routes
│   │   │   ├── validate.ts             # Zod validation middleware factory
│   │   │   └── errorHandler.ts         # Global error handler (must be last middleware)
│   │   ├── types/
│   │   │   └── index.ts                # All shared server-side TypeScript interfaces
│   │   ├── utils/
│   │   │   └── constants.ts            # MATCH_STATUS enum, POINTS, FULL_OVER_QUOTA
│   │   └── app.ts                      # Express app factory (no listen() here)
│   ├── server.ts                       # Entry point — imports app.ts, calls listen()
│   ├── tests/
│   │   └── pointsCalculator.test.ts    # Jest + ts-jest unit tests
│   ├── jest.config.ts
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Phase 1 — Backend Setup

### 1.1 Prerequisites & Dependencies

Install the following in `/server`:

```bash
# Core runtime dependencies
npm install express cors dotenv firebase-admin zod

# TypeScript compiler and runtime
npm install --save-dev typescript ts-node ts-node-dev

# Type definitions
npm install --save-dev @types/node @types/express @types/cors

# Testing
npm install --save-dev jest ts-jest @types/jest
```

Install the following in `/client`:

```bash
# Vite + React + TypeScript scaffold
npm create vite@latest client -- --template react-ts

# Then add:
npm install axios react-router-dom
npm install --save-dev @types/react @types/react-dom
```

### 1.2 `server/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*", "server.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

> **Note:** Tests are excluded from the main tsconfig and handled by `ts-jest` via `jest.config.ts`.

### 1.3 `client/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  },
  "include": ["src"]
}
```

### 1.4 `server/jest.config.ts`

```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
```

### 1.5 `server/package.json` — Scripts

```json
{
  "scripts": {
    "dev":   "ts-node-dev --respawn --transpile-only server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test":  "jest"
  }
}
```

### 1.6 Environment Variables

Create `server/.env.example`. The actual `server/.env` must be gitignored.

```
PORT=5000
ADMIN_API_KEY=your_secret_admin_key_here

# Firebase Admin SDK service account (individual fields — never paste the whole JSON)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=
```

### 1.7 `src/utils/constants.ts`

```typescript
export const MATCH_STATUS = {
  COMPLETED: 'COMPLETED',
  NO_RESULT: 'NO_RESULT',
  TIE:       'TIE',
} as const;

// Derive the union type from the object values — do not use a plain enum
export type MatchStatus = typeof MATCH_STATUS[keyof typeof MATCH_STATUS];

export const POINTS = {
  WIN:       2,
  LOSS:      0,
  TIE_OR_NR: 1,
} as const;

// T20 full quota — used as the oversFaced denominator for bowled-out teams
export const FULL_OVER_QUOTA = 20.0;
```

> Using `as const` + a derived `MatchStatus` union type is idiomatic TypeScript. Do not use a plain `enum` declaration for `MATCH_STATUS`, as `as const` objects produce narrower, safer types.

### 1.8 `src/config/firebase.ts` — Firebase Admin SDK Singleton

```typescript
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const db = admin.firestore();

export { admin, db };
```

> **Critical:** Always use the `admin.apps.length` guard to prevent re-initialisation on hot reload with `ts-node-dev`.

### 1.9 `src/app.ts` — Express App Factory

```typescript
import express, { Application } from 'express';
import cors from 'cors';
import teamRoutes        from './routes/teamRoutes';
import matchRoutes       from './routes/matchRoutes';
import pointsTableRoutes from './routes/pointsTableRoutes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/api/teams',        teamRoutes);
app.use('/api/matches',      matchRoutes);
app.use('/api/points-table', pointsTableRoutes);

// Global error handler — MUST be the last middleware registered
app.use(errorHandler);

export default app;
```

### 1.10 `server.ts` — Entry Point

```typescript
import 'dotenv/config';
import app from './src/app';

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Phase 2 — Core TypeScript Interfaces

Define all shared types in `server/src/types/index.ts`. Every service, controller, and calculator function must import types from this file — never inline ad-hoc object shapes.

```typescript
// server/src/types/index.ts

import { MatchStatus } from '../utils/constants';
import { Timestamp }   from 'firebase-admin/firestore';

// ─── Firestore Document Shapes ─────────────────────────────────────────────

/** Represents a row in the `teams` Firestore collection. */
export interface Team {
  id:        string;   // Firestore document ID (e.g. "csk")
  name:      string;   // e.g. "Chennai Super Kings"
  shortCode: string;   // e.g. "CSK"
  logoUrl:   string;
  city:      string;
}

/** Granular batting stats for one team in one match. */
export interface TeamStats {
  runs:    number;  // Total runs scored
  wickets: number;  // Wickets lost (0–10)
  overs:   number;  // Actual overs in decimal notation (e.g. 14.2 = 14 overs + 2 balls)
}

/** Represents a row in the `matches` Firestore collection. */
export interface Match {
  id:          string;
  team1Id:     string;
  team2Id:     string;
  team1Stats:  TeamStats;
  team2Stats:  TeamStats;
  winnerId:    string | null;  // null for TIE or NO_RESULT
  matchStatus: MatchStatus;
  venue:       string;
  date:        Timestamp | Date;
}

// ─── Computed / API Response Shape ─────────────────────────────────────────

/**
 * One row in the computed points table.
 * Never stored in Firestore — always derived at request time.
 */
export interface Standing {
  rank:          number;
  teamId:        string;
  teamName:      string;
  shortCode:     string;
  logoUrl:       string;
  matchesPlayed: number;
  wins:          number;
  losses:        number;
  noResults:     number;
  points:        number;
  nrr:           number;  // Rounded to 3 decimal places
}

// ─── Internal Calculator Shape ──────────────────────────────────────────────

/**
 * Mutable accumulator used only inside pointsCalculator.ts.
 * Not exported to the API layer.
 */
export interface TeamAccumulator {
  matchesPlayed:     number;
  wins:              number;
  losses:            number;
  noResults:         number;
  points:            number;
  totalRunsScored:   number;
  totalOversFaced:   number;  // Bowled-out rule applied before accumulation
  totalRunsConceded: number;
  totalOversBowled:  number;
}

// ─── Request Body Shape ─────────────────────────────────────────────────────

/** Validated and typed body for POST /api/matches and PUT /api/matches/:id */
export interface MatchPayload {
  team1Id:     string;
  team2Id:     string;
  team1Stats:  TeamStats;
  team2Stats:  TeamStats;
  winnerId:    string | null;
  matchStatus: MatchStatus;
  venue:       string;
  date:        string;  // ISO 8601 string — converted to Firestore Timestamp in the service layer
}
```

Define a parallel `client/src/types/index.ts` for frontend use:

```typescript
// client/src/types/index.ts

export type MatchStatus = 'COMPLETED' | 'NO_RESULT' | 'TIE';

export interface Team {
  id:        string;
  name:      string;
  shortCode: string;
  logoUrl:   string;
  city:      string;
}

export interface TeamStats {
  runs:    number;
  wickets: number;
  overs:   number;
}

export interface Match {
  id:          string;
  team1Id:     string;
  team2Id:     string;
  team1Stats:  TeamStats;
  team2Stats:  TeamStats;
  winnerId:    string | null;
  matchStatus: MatchStatus;
  venue:       string;
  date:        string;
}

export interface Standing {
  rank:          number;
  teamId:        string;
  teamName:      string;
  shortCode:     string;
  logoUrl:       string;
  matchesPlayed: number;
  wins:          number;
  losses:        number;
  noResults:     number;
  points:        number;
  nrr:           number;
}

export interface MatchPayload {
  team1Id:     string;
  team2Id:     string;
  team1Stats:  TeamStats;
  team2Stats:  TeamStats;
  winnerId:    string | null;
  matchStatus: MatchStatus;
  venue:       string;
  date:        string;
}
```

---

## Phase 3 — Database Schema (Firestore)

### Collection: `teams`

Each document represents one IPL team. The document ID is the `shortCode` in lowercase (e.g. `"csk"`).

| Field       | TS Type  | Example                   | Notes                    |
|-------------|----------|---------------------------|--------------------------|
| `id`        | `string` | `"csk"`                   | Firestore document ID    |
| `name`      | `string` | `"Chennai Super Kings"`   |                          |
| `shortCode` | `string` | `"CSK"`                   | 3-letter abbreviation    |
| `logoUrl`   | `string` | `"https://..."`           | Team badge image URL     |
| `city`      | `string` | `"Chennai"`               |                          |

### Collection: `matches`

> **⚠️ Critical Schema Override:** Do NOT store `runMargin` or `wicketMargin`. Those fields make NRR computation impossible. Always use the granular `team1Stats` / `team2Stats` objects as defined in the `TeamStats` interface.

Each document maps directly to the `Match` interface defined in Phase 2.

| Field          | TS Type            | Example / Enum                          | Notes                                    |
|----------------|--------------------|-----------------------------------------|------------------------------------------|
| `id`           | `string`           | Firestore auto-ID                       |                                          |
| `team1Id`      | `string`           | `"csk"`                                 | Ref to `teams` collection doc ID         |
| `team2Id`      | `string`           | `"mi"`                                  |                                          |
| `team1Stats`   | `TeamStats`        | `{ runs: 180, wickets: 5, overs: 20.0 }` | See `TeamStats` interface               |
| `team2Stats`   | `TeamStats`        | `{ runs: 175, wickets: 7, overs: 20.0 }` |                                         |
| `winnerId`     | `string \| null`   | `"csk"` or `null`                       | `null` for `NO_RESULT` or `TIE`          |
| `matchStatus`  | `MatchStatus`      | `"COMPLETED" \| "NO_RESULT" \| "TIE"`  | Must use `MATCH_STATUS` constants        |
| `date`         | `Timestamp`        | Firestore Timestamp                     |                                          |
| `venue`        | `string`           | `"Wankhede Stadium"`                    |                                          |

#### `TeamStats` Sub-Schema

| Field     | TS Type  | Example  | Notes                                                            |
|-----------|----------|----------|------------------------------------------------------------------|
| `runs`    | `number` | `187`    | Total runs scored                                                |
| `wickets` | `number` | `10`     | Wickets lost (0–10)                                              |
| `overs`   | `number` | `14.2`   | Actual overs as decimal notation (14 overs + 2 balls = `14.2`)  |

---

## Phase 4 — Business Logic & Points Calculator

### File: `src/services/pointsCalculator.ts`

This is the **most critical file** in the project. It must be a **pure module** — no Firestore calls, no Express imports, no side effects. Every exported function is independently unit-testable.

#### 4.1 Overs-to-Decimal Conversion

Overs stored as `14.2` (14 overs and 2 balls) must be converted to a true decimal before arithmetic. Do not treat `14.2` as the floating-point number fourteen-point-two.

```typescript
/**
 * Converts cricket overs notation (e.g. 14.2 = 14 overs + 2 balls)
 * into a true decimal value (14.333...).
 */
export function oversToDecimal(overs: number): number {
  const wholeOvers = Math.floor(overs);
  const balls      = Math.round((overs - wholeOvers) * 10); // e.g. 0.2 * 10 = 2 balls
  return wholeOvers + balls / 6;
}
```

#### 4.2 NRR Calculation — Critical Bowled-Out Edge Case

**Standard Formula:**
```
NRR = (Total Runs Scored / Total Overs Faced) − (Total Runs Conceded / Total Overs Bowled)
```

**Bowled-Out Rule (MANDATORY — backed by a unit test):**

> If a team is dismissed for all **10 wickets**, they did not "bat out" their partial overs — for the NRR denominator they are treated as having faced the **full quota of 20.0 overs**, regardless of actual overs faced.
>
> **Example:** PBKS dismissed for 130 in 14.2 overs (10 wickets):
> - Actual overs faced: `14.2` → decimal `14.333`
> - NRR-effective overs faced: `20.0` (because `wickets === 10`)
> - Run rate for scoring: `130 / 20.0 = 6.50` — **NOT** `130 / 14.333 = 9.07`

Apply this rule in the accumulation loop using `FULL_OVER_QUOTA`:

```typescript
import { FULL_OVER_QUOTA } from '../utils/constants';
import { TeamStats }       from '../types';

function getEffectiveOversFaced(stats: TeamStats): number {
  return stats.wickets === 10 ? FULL_OVER_QUOTA : oversToDecimal(stats.overs);
}
```

#### 4.3 Points Allocation Rules

```
matchStatus === 'COMPLETED'  → winnerId team gets 2 pts; the other gets 0 pts
matchStatus === 'TIE'        → both teams get 1 pt; both teams' stats count toward NRR
matchStatus === 'NO_RESULT'  → both teams get 1 pt; neither team's stats count toward NRR
```

#### 4.4 `calculatePointsTable` — Function Signature

```typescript
import { Match, Team, Standing, TeamAccumulator } from '../types';

export function calculatePointsTable(
  matches: Match[],
  teams:   Team[],
): Standing[]
```

**Algorithm — implement exactly these steps:**

1. Build a `statsMap: Map<string, TeamAccumulator>` keyed by `teamId`, initialising one entry per team with all numeric fields set to `0`.

2. Iterate over `matches`. For every match, increment `matchesPlayed` for both `team1Id` and `team2Id`, then:
   - **`COMPLETED`:** winner → `wins++`, `points += 2`; loser → `losses++`. Accumulate **both** teams' batting and bowling stats.
   - **`TIE`:** both → `points += 1`. Accumulate **both** teams' stats.
   - **`NO_RESULT`:** both → `noResults++`, `points += 1`. **Do not** accumulate stats (excluded from NRR).

3. When accumulating a team's **batting** stats: add `stats.runs` to `totalRunsScored`; add `getEffectiveOversFaced(stats)` to `totalOversFaced`.

4. When accumulating a team's **bowling** stats (what they conceded to the opponent): add opponent `stats.runs` to `totalRunsConceded`; add `oversToDecimal(opponentStats.overs)` (no bowled-out adjustment for the bowling side) to `totalOversBowled`.

5. After all matches, compute NRR per team:
   ```typescript
   const nrr =
     acc.totalOversFaced > 0
       ? (acc.totalRunsScored  / acc.totalOversFaced) -
         (acc.totalRunsConceded / acc.totalOversBowled)
       : 0;
   const roundedNrr = Math.round(nrr * 1000) / 1000;
   ```

6. Build `Standing[]` by joining each `statsMap` entry with the corresponding `Team` object for metadata.

7. Sort by `points` descending; break ties by `nrr` descending.

8. Assign `rank` as `index + 1` after sorting. Return the sorted `Standing[]`.

---

## Phase 5 — Middleware

### 5.1 `src/middleware/authMiddleware.ts` — API Key Guard

```typescript
import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req:  Request,
  res:  Response,
  next: NextFunction,
): void {
  const apiKey = req.headers['x-admin-api-key'];

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
    return;
  }
  next();
}
```

### 5.2 Zod Schema — Match Payload

Define in `src/schemas/matchSchema.ts`:

```typescript
import { z } from 'zod';
import { MATCH_STATUS } from '../utils/constants';

const teamStatsSchema = z.object({
  runs:    z.number().int().min(0),
  wickets: z.number().int().min(0).max(10),
  overs:   z.number().min(0).max(20.5),
});

export const matchSchema = z.object({
  team1Id:     z.string().min(1),
  team2Id:     z.string().min(1),
  team1Stats:  teamStatsSchema,
  team2Stats:  teamStatsSchema,
  winnerId:    z.string().nullable(),
  matchStatus: z.enum([
    MATCH_STATUS.COMPLETED,
    MATCH_STATUS.NO_RESULT,
    MATCH_STATUS.TIE,
  ]),
  date:  z.string().datetime(),  // ISO 8601 — converted to Timestamp in service
  venue: z.string().min(1),
}).refine(
  (data) => {
    if (data.matchStatus === MATCH_STATUS.COMPLETED && !data.winnerId) return false;
    if (data.matchStatus !== MATCH_STATUS.COMPLETED && data.winnerId !== null) return false;
    return true;
  },
  { message: 'winnerId must be non-null for COMPLETED, and null for TIE / NO_RESULT' }
);

// Infer the TypeScript type from the Zod schema — do NOT duplicate it as a separate interface
export type MatchPayloadInput = z.infer<typeof matchSchema>;
```

### 5.3 `src/middleware/validate.ts` — Zod Validation Middleware Factory

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError }             from 'zod';

export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body) as T;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422).json({
          error:   'Validation failed',
          details: err.errors.map((e) => ({
            field:   e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(err);
    }
  };
}
```

### 5.4 `src/middleware/errorHandler.ts` — Global Error Handler

```typescript
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

// The four-parameter signature is required for Express to identify this as an error handler.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err:  AppError,
  req:  Request,
  res:  Response,
  next: NextFunction,
): void {
  console.error('[GlobalErrorHandler]', err);

  const status  = err.statusCode ?? 500;
  const message = err.message    ?? 'Internal Server Error';

  res.status(status).json({ error: message });
}
```

> **Critical:** This must be the **last** `app.use()` call in `app.ts`. The four-parameter signature cannot be omitted — both TypeScript and Express require it for error-handler detection.

---

## Phase 6 — REST API Routes & Controllers

### 6.1 Route Definitions

#### `src/routes/teamRoutes.ts`
```
GET  /api/teams        → teamsController.getAllTeams
```

#### `src/routes/matchRoutes.ts`
```
POST /api/matches      → [authMiddleware, validate(matchSchema)] → matchesController.addMatch
PUT  /api/matches/:id  → [authMiddleware, validate(matchSchema)] → matchesController.updateMatch
```

#### `src/routes/pointsTableRoutes.ts`
```
GET  /api/points-table → pointsTableController.getPointsTable
```

### 6.2 Controller Layer — Typing Rules

Controllers must:
- Type `req`, `res`, `next` with Express generic types (`Request<Params, ResBody, ReqBody>`, `Response<ResBody>`, `NextFunction`)
- Delegate all logic to services — zero business logic inside controllers
- Pass all errors to `next(err)` — never swallow with an empty `catch`
- Return `Promise<void>`, not `Promise<Response>`

Controllers must NOT:
- Import `db` from `firebase.ts` directly
- Contain NRR logic, sorting, or points math

#### `src/controllers/teamsController.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import * as teamsService from '../services/teamsService';
import { Team } from '../types';

export async function getAllTeams(
  req:  Request,
  res:  Response<Team[]>,
  next: NextFunction,
): Promise<void> {
  try {
    const teams = await teamsService.getAllTeams();
    res.status(200).json(teams);
  } catch (err) {
    next(err);
  }
}
```

#### `src/controllers/matchesController.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import * as matchesService from '../services/matchesService';
import { Match, MatchPayload } from '../types';

export async function addMatch(
  req:  Request<Record<string, never>, Match, MatchPayload>,
  res:  Response<Match>,
  next: NextFunction,
): Promise<void> {
  try {
    const match = await matchesService.addMatch(req.body);
    res.status(201).json(match);
  } catch (err) {
    next(err);
  }
}

export async function updateMatch(
  req:  Request<{ id: string }, Match, MatchPayload>,
  res:  Response<Match>,
  next: NextFunction,
): Promise<void> {
  try {
    const match = await matchesService.updateMatch(req.params.id, req.body);
    res.status(200).json(match);
  } catch (err) {
    next(err);
  }
}
```

#### `src/controllers/pointsTableController.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import * as pointsTableService from '../services/pointsTableService';
import { Standing } from '../types';

export async function getPointsTable(
  req:  Request,
  res:  Response<Standing[]>,
  next: NextFunction,
): Promise<void> {
  try {
    const table = await pointsTableService.getPointsTable();
    res.status(200).json(table);
  } catch (err) {
    next(err);
  }
}
```

### 6.3 Service Layer

#### `src/services/teamsService.ts`
- `getAllTeams(): Promise<Team[]>` — Fetch all docs from the `teams` collection

#### `src/services/matchesService.ts`
- `getAllMatches(): Promise<Match[]>` — Fetch all docs from `matches`
- `addMatch(data: MatchPayload): Promise<Match>` — Write to Firestore, return new doc
- `updateMatch(id: string, data: MatchPayload): Promise<Match>` — Update doc by ID, return updated doc

#### `src/services/pointsTableService.ts` (orchestrator)

```typescript
import * as matchesService from './matchesService';
import * as teamsService   from './teamsService';
import { calculatePointsTable } from './pointsCalculator';
import { Standing } from '../types';

export async function getPointsTable(): Promise<Standing[]> {
  const [matches, teams] = await Promise.all([
    matchesService.getAllMatches(),
    teamsService.getAllTeams(),
  ]);
  return calculatePointsTable(matches, teams);
}
```

---

## Phase 7 — Unit Tests

### File: `server/tests/pointsCalculator.test.ts`

Use `ts-jest` (configured via `jest.config.ts`). All fixture data is hardcoded — no Firestore mocking needed. The calculator is a pure function.

```typescript
import { calculatePointsTable } from '../src/services/pointsCalculator';
import { MATCH_STATUS }         from '../src/utils/constants';
import { Team, Match, Standing } from '../src/types';

// ─── Fixture Teams ──────────────────────────────────────────────────────────

const teams: Team[] = [
  { id: 'csk', name: 'Chennai Super Kings', shortCode: 'CSK', logoUrl: '', city: 'Chennai'   },
  { id: 'mi',  name: 'Mumbai Indians',      shortCode: 'MI',  logoUrl: '', city: 'Mumbai'    },
  { id: 'rcb', name: 'Royal Challengers',   shortCode: 'RCB', logoUrl: '', city: 'Bengaluru' },
];

// ─── Helper ─────────────────────────────────────────────────────────────────

const find = (table: Standing[], teamId: string): Standing => {
  const row = table.find((t) => t.teamId === teamId);
  if (!row) throw new Error(`Team ${teamId} not in standings`);
  return row;
};

const now = new Date();

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('pointsCalculator', () => {

  test('TEST 1 — Win: winner gets 2 pts, loser gets 0 pts', () => {
    const matches: Match[] = [{
      id: 'm1', team1Id: 'csk', team2Id: 'mi',
      team1Stats: { runs: 180, wickets: 5, overs: 20.0 },
      team2Stats: { runs: 175, wickets: 7, overs: 20.0 },
      winnerId:    'csk',
      matchStatus: MATCH_STATUS.COMPLETED,
      venue: 'Chepauk', date: now,
    }];

    const table = calculatePointsTable(matches, teams);
    const csk   = find(table, 'csk');
    const mi    = find(table, 'mi');

    expect(csk.points).toBe(2);
    expect(csk.wins).toBe(1);
    expect(csk.rank).toBe(1);
    expect(mi.points).toBe(0);
    expect(mi.losses).toBe(1);
  });

  test('TEST 2 — Tie: both teams receive 1 pt each', () => {
    const matches: Match[] = [{
      id: 'm2', team1Id: 'csk', team2Id: 'mi',
      team1Stats: { runs: 160, wickets: 6, overs: 20.0 },
      team2Stats: { runs: 160, wickets: 8, overs: 20.0 },
      winnerId:    null,
      matchStatus: MATCH_STATUS.TIE,
      venue: 'Wankhede', date: now,
    }];

    const table = calculatePointsTable(matches, teams);
    const csk   = find(table, 'csk');
    const mi    = find(table, 'mi');

    expect(csk.points).toBe(1);
    expect(mi.points).toBe(1);
  });

  test('TEST 3 — Bowled-out edge case: oversFaced must use FULL_OVER_QUOTA (20.0) in NRR', () => {
    /**
     * Scenario:
     *   CSK (team1): 131 runs / 3 wickets / 15.0 overs
     *   RCB (team2): 130 runs / 10 wickets / 14.2 overs  ← BOWLED OUT
     *
     * RCB NRR calculation:
     *   Runs scored rate   = 130 / 20.0  = 6.500   (uses FULL_OVER_QUOTA, NOT 14.333)
     *   Runs conceded rate = 131 / 15.0  ≈ 8.733
     *   NRR = 6.500 − 8.733 = −2.233
     */
    const matches: Match[] = [{
      id: 'm3', team1Id: 'csk', team2Id: 'rcb',
      team1Stats: { runs: 131, wickets: 3,  overs: 15.0 },
      team2Stats: { runs: 130, wickets: 10, overs: 14.2 }, // 10 wickets = bowled out
      winnerId:    'csk',
      matchStatus: MATCH_STATUS.COMPLETED,
      venue: 'Dharamsala', date: now,
    }];

    const table = calculatePointsTable(matches, teams);
    const rcb   = find(table, 'rcb');

    // Tolerance of 2 decimal places to account for floating-point arithmetic
    expect(rcb.nrr).toBeCloseTo(-2.233, 2);
  });

});
```

**Run tests with:**
```bash
cd server && npm test
```

---

## Phase 8 — Frontend (React + TypeScript)

### 8.1 React Router Setup (`src/App.tsx`)

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar           from './components/Navbar';
import HomePage         from './pages/HomePage';
import PointsTablePage  from './pages/PointsTablePage';
import AdminPage        from './pages/AdminPage';
import MatchResultsPage from './pages/MatchResultsPage';

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"              element={<HomePage />}         />
        <Route path="/points-table"  element={<PointsTablePage />}  />
        <Route path="/admin"         element={<AdminPage />}         />
        <Route path="/match-results" element={<MatchResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 8.2 `src/api/axiosInstance.ts`

```typescript
import axios, { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
});

export default axiosInstance;
```

### 8.3 `src/api/teamsApi.ts`

```typescript
import axiosInstance from './axiosInstance';
import { Team }      from '../types';

export async function getTeams(): Promise<Team[]> {
  const { data } = await axiosInstance.get<Team[]>('/teams');
  return data;
}
```

### 8.4 `src/api/pointsTableApi.ts`

```typescript
import axiosInstance from './axiosInstance';
import { Standing }  from '../types';

export async function getPointsTable(): Promise<Standing[]> {
  const { data } = await axiosInstance.get<Standing[]>('/points-table');
  return data;
}
```

### 8.5 `src/api/matchesApi.ts`

```typescript
import axiosInstance           from './axiosInstance';
import { Match, MatchPayload } from '../types';

export async function addMatch(
  payload:  MatchPayload,
  adminKey: string,
): Promise<Match> {
  const { data } = await axiosInstance.post<Match>('/matches', payload, {
    headers: { 'x-admin-api-key': adminKey },
  });
  return data;
}

export async function updateMatch(
  id:       string,
  payload:  MatchPayload,
  adminKey: string,
): Promise<Match> {
  const { data } = await axiosInstance.put<Match>(`/matches/${id}`, payload, {
    headers: { 'x-admin-api-key': adminKey },
  });
  return data;
}
```

### 8.6 `src/components/PointsTable.tsx` — Props Typing

```tsx
import { Standing } from '../types';

interface PointsTableProps {
  standings: Standing[];
  isLoading: boolean;
  error:     string | null;
}

export default function PointsTable({
  standings,
  isLoading,
  error,
}: PointsTableProps): JSX.Element {
  if (isLoading) return <div className="spinner">Loading...</div>;
  if (error)     return <div className="error">{error}</div>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Rank</th><th>Team</th><th>M</th><th>W</th>
            <th>L</th><th>NR</th><th>Pts</th><th>NRR</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => (
            <tr
              key={row.teamId}
              className={row.rank <= 4 ? 'playoff-zone' : ''}
            >
              <td>{row.rank}</td>
              <td>
                <img src={row.logoUrl} alt={row.shortCode} width={24} />
                {row.shortCode} — {row.teamName}
              </td>
              <td>{row.matchesPlayed}</td>
              <td>{row.wins}</td>
              <td>{row.losses}</td>
              <td>{row.noResults}</td>
              <td><strong>{row.points}</strong></td>
              <td>{row.nrr >= 0 ? '+' : ''}{row.nrr.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Playoff Zone Highlight Rule:** Rows where `rank <= 4` must receive a distinct visual style (e.g. green left border, highlighted row background) via the `playoff-zone` CSS class to denote playoff qualification.

### 8.7 `src/pages/PointsTablePage.tsx` — Typed Data Fetching Pattern

```tsx
import { useState, useEffect } from 'react';
import { getPointsTable }      from '../api/pointsTableApi';
import PointsTable             from '../components/PointsTable';
import { Standing }            from '../types';

export default function PointsTablePage(): JSX.Element {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetchStandings = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPointsTable();
      setStandings(data);
    } catch {
      setError('Failed to load standings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void fetchStandings(); }, []);

  return (
    <main>
      <h1>IPL 2024 Points Table</h1>
      <PointsTable standings={standings} isLoading={isLoading} error={error} />
    </main>
  );
}
```

### 8.8 Admin Panel — `AdminPage.tsx` — Typed Form State

All form state must be explicitly typed. Define a local `StatsFormState` using `string` for numeric inputs (pre-parse), then convert before calling the API:

```tsx
import { useState } from 'react';
import { addMatch } from '../api/matchesApi';
import { MatchStatus, MatchPayload, TeamStats } from '../types';

interface StatsFormState {
  runs:    string;
  wickets: string;
  overs:   string;
}

interface AdminFormState {
  team1Id:     string;
  team2Id:     string;
  team1Stats:  StatsFormState;
  team2Stats:  StatsFormState;
  winnerId:    string;
  matchStatus: MatchStatus;
  venue:       string;
  date:        string;
  adminKey:    string;  // Never store in localStorage
}

function parseStats(s: StatsFormState): TeamStats {
  return {
    runs:    Number(s.runs),
    wickets: Number(s.wickets),
    overs:   Number(s.overs),
  };
}
```

Parse string fields to numbers via `parseStats` before constructing the `MatchPayload` and calling `addMatch`. Show inline validation errors. Never persist `adminKey` beyond the current session.

### 8.9 Points Table — Required Columns (in order)

| # | Column Header | Data Field      | Notes                               |
|---|---------------|-----------------|-------------------------------------|
| 1 | Rank          | `rank`          |                                     |
| 2 | Team          | `teamName`      | Show logo + short code + full name  |
| 3 | M             | `matchesPlayed` |                                     |
| 4 | W             | `wins`          |                                     |
| 5 | L             | `losses`        |                                     |
| 6 | NR            | `noResults`     |                                     |
| 7 | Pts           | `points`        | **Bold**                            |
| 8 | NRR           | `nrr`           | 3 decimal places, prefixed with `+` if positive |

### 8.10 Responsiveness Requirements

- Points Table must be wrapped in `overflow-x: auto` — horizontally scrollable on mobile
- Navbar must collapse to a hamburger menu on screens `< 768px`
- Admin form must stack fields vertically on mobile (CSS `flex-direction: column`)

### 8.11 State & Data Fetching Rules

- Use `useState<T>` with explicit generic types — no implicit `any`
- Show a loading spinner while any request is in flight
- Show typed error state (`string | null`) if the API call fails
- After a match is added/updated, re-call `fetchStandings()` — no full page reload

---

## Phase 9 — Bonus Features (Implement If Time Permits)

### 9.1 Real-Time Updates (Firebase `onSnapshot`)

Replace the one-time `useEffect` fetch in `PointsTablePage.tsx` with a Firestore `onSnapshot` listener. Type the cleanup return as `Unsubscribe`:

```typescript
import { collection, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../config/firebase'; // Client-side Firebase SDK (not Admin SDK)

useEffect((): Unsubscribe => {
  const unsub = onSnapshot(collection(db, 'matches'), () => {
    void fetchStandings();
  });
  return unsub;
}, []);
```

### 9.2 Firebase Auth for Admin Login

- Use Firebase Authentication (Email/Password) on the client
- Send the Firebase ID token as a `Bearer` token in the `Authorization` header
- On the server, verify using `admin.auth().verifyIdToken(token)` inside `authMiddleware.ts` as an alternative or complement to the API key guard

### 9.3 Performance Charts (Recharts)

Add to `MatchResultsPage.tsx`. Type all Recharts component props using the library's exported interfaces:
- A **`BarChart`** showing Wins vs Losses per team
- A **`LineChart`** showing cumulative points per team over match dates

---

## Evaluation Criteria (from Assignment)

| Area                | What Is Evaluated                                     | Weight |
|---------------------|-------------------------------------------------------|--------|
| **Firebase Setup**  | Correct schema, Firestore rules, Admin SDK usage      | 20%    |
| **Backend API**     | Clean REST endpoints, validation, error handling      | 25%    |
| **Points Logic**    | Accurate calculation of points, NRR, and ranking      | 20%    |
| **React Frontend**  | Component structure, state management, UI quality     | 20%    |
| **Code Quality**    | Readability, folder structure, comments, `.env` usage | 10%    |
| **README**          | Setup instructions, assumptions, known issues         | 5%     |

---

## README.md Checklist

The submitted `README.md` must include:

- [ ] Project overview (1–2 sentences)
- [ ] Prerequisites: Node.js `>=18`, TypeScript `>=5.x`, Firebase project setup steps
- [ ] All environment variables listed and explained (reference `.env.example`)
- [ ] How to run the server in dev mode: `cd server && npm install && npm run dev`
- [ ] How to run the client: `cd client && npm install && npm run dev`
- [ ] How to build for production: `cd server && npm run build && npm start`
- [ ] How to seed initial team data into Firestore
- [ ] How to run tests: `cd server && npm test`
- [ ] Live deployment URL
- [ ] Assumptions made (T20 format assumed, 20-over full quota for bowled-out NRR)
- [ ] Any known issues or incomplete features

---

## Critical Constraints — Do Not Violate

1. **No `.js` source files.** Every file under `server/src/` and `client/src/` must be `.ts` or `.tsx`. Config files (`vite.config.ts`, `jest.config.ts`) are also TypeScript.
2. **No `any` types.** `"noImplicitAny": true` and `"strict": true` are enforced in both `tsconfig.json` files. The TypeScript compiler must produce zero errors.
3. **Never commit `.env` files.** Add `server/.env` and `client/.env` to `.gitignore` at the repo root.
4. **Never store points directly in Firestore.** Points and NRR are always computed at request time from raw `team1Stats` / `team2Stats` match data.
5. **Never put business logic in controllers.** Controllers call services; services call the calculator. The three-layer boundary is absolute.
6. **Never store `runMargin` or `wicketMargin`.** The `TeamStats` interface (`runs`, `wickets`, `overs`) is the only accepted shape.
7. **Always apply the bowled-out (10-wicket) NRR rule.** `wickets === 10` → substitute `FULL_OVER_QUOTA` as the `oversFaced` value. This is enforced by Test 3.
8. **The global error handler must be the last `app.use()` call** in `app.ts`, and it must have exactly four parameters `(err, req, res, next): void` for Express to recognise it as an error handler.
9. **All admin-mutating routes** (`POST /api/matches`, `PUT /api/matches/:id`) must apply `authMiddleware` **before** `validate(matchSchema)` in the middleware chain.
10. **Zod types must be inferred, not duplicated.** Use `z.infer<typeof matchSchema>` to derive `MatchPayloadInput` — do not manually re-declare the same shape as a redundant TypeScript interface alongside it.
