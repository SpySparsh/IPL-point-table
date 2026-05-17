import type { JSX } from 'react';
import type { Standing } from '../types';

interface TeamRowProps {
  row: Standing;
}

export default function TeamRow({ row }: TeamRowProps): JSX.Element {
  return (
    <tr className={row.rank <= 4 ? 'playoff-zone' : ''}>
      <td>{row.rank}</td>
      <td>
        <div className="team-cell">
          {row.logoUrl ? (
            <img src={row.logoUrl} alt={row.shortCode} width={28} height={28} />
          ) : (
            <span className="team-logo-fallback">{row.shortCode.slice(0, 2)}</span>
          )}
          <span>
            <strong>{row.shortCode}</strong> - {row.teamName}
          </span>
        </div>
      </td>
      <td>{row.matchesPlayed}</td>
      <td>{row.wins}</td>
      <td>{row.losses}</td>
      <td>{row.noResults}</td>
      <td>
        <strong>{row.points}</strong>
      </td>
      <td>{row.nrr >= 0 ? '+' : ''}{row.nrr.toFixed(3)}</td>
    </tr>
  );
}
