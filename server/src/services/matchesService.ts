import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../config/firebase';
import type { Match, MatchPayload, TeamStats } from '../types';
import type { MatchStatus } from '../utils/constants';

interface MatchFirestoreData {
  team1Id: string;
  team2Id: string;
  team1Stats: TeamStats;
  team2Stats: TeamStats;
  winnerId: string | null;
  matchStatus: MatchStatus;
  venue: string;
  date: Timestamp;
}

function toMatch(id: string, data: MatchFirestoreData): Match {
  return {
    id,
    team1Id: data.team1Id,
    team2Id: data.team2Id,
    team1Stats: data.team1Stats,
    team2Stats: data.team2Stats,
    winnerId: data.winnerId,
    matchStatus: data.matchStatus,
    venue: data.venue,
    date: data.date.toDate(),
  };
}

function toFirestoreData(data: MatchPayload): MatchFirestoreData {
  return {
    team1Id: data.team1Id,
    team2Id: data.team2Id,
    team1Stats: data.team1Stats,
    team2Stats: data.team2Stats,
    winnerId: data.winnerId,
    matchStatus: data.matchStatus,
    venue: data.venue,
    date: Timestamp.fromDate(new Date(data.date)),
  };
}

export async function getAllMatches(): Promise<Match[]> {
  const snapshot = await db.collection('matches').orderBy('date', 'desc').get();

  return snapshot.docs.map((doc): Match => {
    const data = doc.data() as MatchFirestoreData;
    return toMatch(doc.id, data);
  });
}

export async function getMatchById(id: string): Promise<Match> {
  const doc = await db.collection('matches').doc(id).get();

  if (!doc.exists) {
    const error = new Error(`Match ${id} not found`) as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  const data = doc.data() as MatchFirestoreData;
  return toMatch(doc.id, data);
}

export async function addMatch(data: MatchPayload): Promise<Match> {
  const firestoreData = toFirestoreData(data);
  const docRef = await db.collection('matches').add(firestoreData);

  return toMatch(docRef.id, firestoreData);
}

export async function updateMatch(id: string, data: MatchPayload): Promise<Match> {
  const docRef = db.collection('matches').doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    const error = new Error(`Match ${id} not found`) as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  const firestoreData = toFirestoreData(data);
  await docRef.set(firestoreData, { merge: true });

  return toMatch(id, firestoreData);
}

export async function deleteMatch(id: string): Promise<void> {
  const docRef = db.collection('matches').doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    const error = new Error(`Match ${id} not found`) as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  await docRef.delete();
}
