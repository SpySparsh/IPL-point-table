import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { useEffect, useState, type JSX } from 'react';
import PointsTable from '../components/PointsTable';
import { db } from '../config/firebase';
import type { Standing } from '../types';

interface CurrentStandingsDocument {
  standings?: Standing[];
}

export default function PointsTablePage(): JSX.Element {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect((): Unsubscribe => {
    setIsLoading(true);
    setError(null);

    const standingsRef = doc(db, 'standings', 'current');

    const unsubscribe = onSnapshot(
      standingsRef,
      (snapshot): void => {
        const data = snapshot.data() as CurrentStandingsDocument | undefined;
        setStandings(data?.standings ?? []);
        setIsLoading(false);
      },
      (): void => {
        setError('Failed to load live standings. Please try again.');
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return (
    <main className="page">
      <div className="page-heading">
        <p className="eyebrow">Standings</p>
        <h1>IPL 2026 Points Table</h1>
      </div>
      <PointsTable standings={standings} isLoading={isLoading} error={error} />
    </main>
  );
}
