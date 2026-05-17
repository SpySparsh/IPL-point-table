import type { JSX } from 'react';
import type { Match, Team } from '../types';

interface MatchCardProps {
  match: Match;
  teams: Team[];
}

function getTeamLabel(teams: Team[], teamId: string): string {
  const team = teams.find((item: Team): boolean => item.id === teamId);
  return team ? team.shortCode : teamId;
}

export default function MatchCard({ match, teams }: MatchCardProps): JSX.Element {
  const team1Label = getTeamLabel(teams, match.team1Id);
  const team2Label = getTeamLabel(teams, match.team2Id);
  const winnerLabel = match.winnerId ? getTeamLabel(teams, match.winnerId) : match.matchStatus;

  return (
    <article className="match-card">
      <div className="match-card-header">
        <strong>{team1Label} vs {team2Label}</strong>
        <span>{winnerLabel}</span>
      </div>
      <div className="score-line">
        <span>{team1Label}</span>
        <strong>
          {match.team1Stats.runs}/{match.team1Stats.wickets} ({match.team1Stats.overs})
        </strong>
      </div>
      <div className="score-line">
        <span>{team2Label}</span>
        <strong>
          {match.team2Stats.runs}/{match.team2Stats.wickets} ({match.team2Stats.overs})
        </strong>
      </div>
      <p>{match.venue}</p>
    </article>
  );
}
