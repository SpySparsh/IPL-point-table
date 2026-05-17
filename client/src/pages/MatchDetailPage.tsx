import { useEffect, useState, type FormEvent, type JSX } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  deleteMatch,
  getMatchById,
  updateMatch,
} from '../api/matchesApi';
import { getTeams } from '../api/teamsApi';
import MatchResultForm, {
  type AdminFormState,
  type StatsFormState,
} from '../components/MatchResultForm';
import { useAuth } from '../context/AuthContext';
import type { Match, MatchPayload, MatchStatus, Team, TeamStats } from '../types';

type AdminFieldKey = 'team1Id' | 'team2Id' | 'winnerId' | 'matchStatus' | 'venue' | 'date' | 'adminKey';

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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(value));
}

function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  const offsetMilliseconds = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMilliseconds).toISOString().slice(0, 16);
}

function parseStats(stats: StatsFormState): TeamStats {
  return {
    runs: Number(stats.runs),
    wickets: Number(stats.wickets),
    overs: Number(stats.overs),
  };
}

function buildFormState(match: Match): AdminFormState {
  return {
    team1Id: match.team1Id,
    team2Id: match.team2Id,
    team1Stats: {
      runs: String(match.team1Stats.runs),
      wickets: String(match.team1Stats.wickets),
      overs: String(match.team1Stats.overs),
    },
    team2Stats: {
      runs: String(match.team2Stats.runs),
      wickets: String(match.team2Stats.wickets),
      overs: String(match.team2Stats.overs),
    },
    winnerId: match.winnerId ?? '',
    matchStatus: match.matchStatus,
    venue: match.venue,
    date: toDateTimeLocal(match.date),
    adminKey: '',
  };
}

function validateForm(form: AdminFormState): string[] {
  const errors: string[] = [];

  if (!form.team1Id || !form.team2Id) {
    errors.push('Select both teams.');
  }

  if (form.team1Id && form.team1Id === form.team2Id) {
    errors.push('Teams must be different.');
  }

  if (!form.venue.trim()) {
    errors.push('Venue is required.');
  }

  if (!form.date) {
    errors.push('Date is required.');
  }

  if (form.matchStatus === 'COMPLETED' && !form.winnerId) {
    errors.push('Winner is required for a completed match.');
  }

  if (form.matchStatus !== 'COMPLETED' && form.winnerId) {
    errors.push('Winner must be empty for tie or no-result.');
  }

  const statValues: string[] = [
    form.team1Stats.runs,
    form.team1Stats.wickets,
    form.team1Stats.overs,
    form.team2Stats.runs,
    form.team2Stats.wickets,
    form.team2Stats.overs,
  ];

  if (statValues.some((value: string): boolean => value.trim() === '' || Number.isNaN(Number(value)))) {
    errors.push('All score fields must be valid numbers.');
  }

  return errors;
}

function buildPayload(form: AdminFormState): MatchPayload {
  return {
    team1Id: form.team1Id,
    team2Id: form.team2Id,
    team1Stats: parseStats(form.team1Stats),
    team2Stats: parseStats(form.team2Stats),
    winnerId: form.matchStatus === 'COMPLETED' ? form.winnerId : null,
    matchStatus: form.matchStatus,
    venue: form.venue.trim(),
    date: new Date(form.date).toISOString(),
  };
}

export default function MatchDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState<AdminFormState | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchMatch = async (): Promise<void> => {
    if (!id) {
      setError('Missing match ID.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [nextMatch, nextTeams] = await Promise.all([
        getMatchById(id),
        getTeams(),
      ]);
      setMatch(nextMatch);
      setTeams(nextTeams);
      setForm(buildFormState(nextMatch));
    } catch {
      setError('Failed to load match details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect((): void => {
    void fetchMatch();
  }, [id]);

  const handleFieldChange = (field: AdminFieldKey, value: string): void => {
    setForm((current: AdminFormState | null): AdminFormState | null => {
      if (!current) {
        return current;
      }

      if (field === 'matchStatus') {
        const matchStatus = value as MatchStatus;

        return {
          ...current,
          matchStatus,
          winnerId: matchStatus === 'COMPLETED' ? current.winnerId : '',
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  };

  const handleStatsChange = (
    teamKey: 'team1Stats' | 'team2Stats',
    field: keyof StatsFormState,
    value: string,
  ): void => {
    setForm((current: AdminFormState | null): AdminFormState | null => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [teamKey]: {
          ...current[teamKey],
          [field]: value,
        },
      };
    });
  };

  const handleEditClick = (): void => {
    if (match) {
      setForm(buildFormState(match));
      setIsEditing(true);
      setErrors([]);
      setSuccessMessage(null);
    }
  };

  const handleUpdateSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!id || !form) {
      return;
    }

    const nextErrors = validateForm(form);
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors([]);
      const updatedMatch = await updateMatch(id, buildPayload(form));
      setMatch(updatedMatch);
      setForm(buildFormState(updatedMatch));
      setIsEditing(false);
      setSuccessMessage('Match updated. The points table will reflect this change immediately.');
    } catch {
      setErrors(['Failed to update match. Check your admin login and try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!id) {
      setErrors(['Missing match ID.']);
      return;
    }

    const shouldDelete = window.confirm('Delete this match permanently?');
    if (!shouldDelete) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteMatch(id);
      navigate('/history');
    } catch {
      setErrors(['Failed to delete match. Check your admin login and try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="page">
        <div className="spinner">Loading...</div>
      </main>
    );
  }

  if (error || !match) {
    return (
      <main className="page">
        <div className="error">{error ?? 'Match not found.'}</div>
        <Link className="secondary-button" to="/history">
          Back to History
        </Link>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-heading">
        <p className="eyebrow">Match Details</p>
        <h1>{getTeamLabel(teams, match.team1Id)} vs {getTeamLabel(teams, match.team2Id)}</h1>
      </div>

      <section className="detail-panel">
        <div className="detail-grid">
          <div>
            <span>Date</span>
            <strong>{formatDate(match.date)}</strong>
          </div>
          <div>
            <span>Venue</span>
            <strong>{match.venue}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{match.matchStatus}</strong>
          </div>
          <div>
            <span>Winner</span>
            <strong>{getWinnerLabel(match, teams)}</strong>
          </div>
        </div>

        <div className="score-detail-grid">
          <article>
            <h2>{getTeamLabel(teams, match.team1Id)}</h2>
            <p>{match.team1Stats.runs}/{match.team1Stats.wickets}</p>
            <span>{match.team1Stats.overs} overs</span>
          </article>
          <article>
            <h2>{getTeamLabel(teams, match.team2Id)}</h2>
            <p>{match.team2Stats.runs}/{match.team2Stats.wickets}</p>
            <span>{match.team2Stats.overs} overs</span>
          </article>
        </div>
      </section>

      {isAuthenticated && (
      <section className="admin-match-panel">
        <h2>Admin Controls</h2>
        {errors.length > 0 && (
          <div className="error-list">
            {errors.map((item: string): JSX.Element => (
              <p key={item}>{item}</p>
            ))}
          </div>
        )}
        {successMessage && <p className="success-message">{successMessage}</p>}

        {!isEditing && (
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={handleEditClick}>
              Edit Match
            </button>
            <button className="danger-button" type="button" disabled={isSubmitting} onClick={(): void => {
              void handleDelete();
            }}>
              Delete Match
            </button>
          </div>
        )}

        {isEditing && form && (
          <MatchResultForm
            form={form}
            teams={teams}
            errors={[]}
            isSubmitting={isSubmitting}
            submitLabel="Update Match"
            showAdminKey={false}
            onSubmit={(event: FormEvent<HTMLFormElement>): void => {
              void handleUpdateSubmit(event);
            }}
            onFieldChange={handleFieldChange}
            onStatsChange={handleStatsChange}
          />
        )}
      </section>
      )}
    </main>
  );
}
