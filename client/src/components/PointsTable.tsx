import type { JSX } from 'react';
import TeamRow from './TeamRow';
import type { Standing } from '../types';

interface PointsTableProps {
  standings: Standing[];
  isLoading: boolean;
  error: string | null;
}

export default function PointsTable({
  standings,
  isLoading,
  error,
}: PointsTableProps): JSX.Element {
  if (isLoading) {
    return <div className="spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="table-shell">
      <table className="points-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>M</th>
            <th>W</th>
            <th>L</th>
            <th>NR</th>
            <th>Pts</th>
            <th>NRR</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row: Standing): JSX.Element => (
            <TeamRow key={row.teamId} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
