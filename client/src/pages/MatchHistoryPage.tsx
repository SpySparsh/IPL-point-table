import { useEffect, useMemo, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { getAllMatches } from '../api/matchesApi';
import { getTeams } from '../api/teamsApi';
import type { Match, Team } from '../types';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getTeamLabel(teams: Team[], teamId: string): string {
  const team = teams.find((item: Team): boolean => item.id === teamId);
  return team ? `${team.shortCode} - ${team.name}` : teamId;
}

function getWinnerLabel(match: Match, teams: Team[]): string {
  if (match.matchStatus === 'NO_RESULT') {
    return 'No Result';
  }

  if (match.matchStatus === 'TIE') {
    return 'Tie';
  }

  return match.winnerId ? getTeamLabel(teams, match.winnerId) : 'Pending';
}

export default function MatchHistoryPage(): JSX.Element {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const [nextMatches, nextTeams] = await Promise.all([
        getAllMatches(),
        getTeams(),
      ]);
      setMatches(nextMatches);
      setTeams(nextTeams);
    } catch {
      setError('Failed to load match history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect((): void => {
    void fetchHistory();
  }, []);

  const sortedMatches = useMemo<Match[]>(
    (): Match[] =>
      [...matches].sort(
        (first: Match, second: Match): number =>
          new Date(second.date).getTime() - new Date(first.date).getTime(),
      ),
    [matches],
  );

  return (
    <main className="page">
      <div className="page-heading">
        <p className="eyebrow">Archive</p>
        <h1>Match History</h1>
      </div>

      {isLoading && <div className="spinner">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {!isLoading && !error && sortedMatches.length === 0 && (
        <section className="empty-state">
          <p>No matches have been recorded yet.</p>
        </section>
      )}

      {!isLoading && !error && sortedMatches.length > 0 && (
        <section className="history-list">
          {sortedMatches.map((match: Match): JSX.Element => (
            <Link className="history-card" key={match.id} to={`/matches/${match.id}`}>
              <div>
                <p className="eyebrow">{formatDate(match.date)}</p>
                <h2>
                  {getTeamLabel(teams, match.team1Id)} vs {getTeamLabel(teams, match.team2Id)}
                </h2>
              </div>
              <div className="history-result">
                <span>Winner</span>
                <strong>{getWinnerLabel(match, teams)}</strong>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
