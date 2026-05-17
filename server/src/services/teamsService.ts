import { db } from '../config/firebase';
import type { Team } from '../types';

export async function getAllTeams(): Promise<Team[]> {
  const snapshot = await db.collection('teams').get();

  return snapshot.docs.map((doc): Team => {
    const data = doc.data() as Omit<Team, 'id'>;

    return {
      id: doc.id,
      name: data.name,
      shortCode: data.shortCode,
      logoUrl: data.logoUrl,
      city: data.city,
    };
  });
}
