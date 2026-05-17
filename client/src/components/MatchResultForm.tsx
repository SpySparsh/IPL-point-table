import type { ChangeEvent, FormEvent, JSX } from 'react';
import type { MatchStatus, Team } from '../types';

export interface StatsFormState {
  runs: string;
  wickets: string;
  overs: string;
}

export interface AdminFormState {
  team1Id: string;
  team2Id: string;
  team1Stats: StatsFormState;
  team2Stats: StatsFormState;
  winnerId: string;
  matchStatus: MatchStatus;
  venue: string;
  date: string;
  adminKey: string;
}

interface MatchResultFormProps {
  form: AdminFormState;
  teams: Team[];
  errors: string[];
  isSubmitting: boolean;
  submitLabel?: string;
  showAdminKey?: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: (
    field: 'team1Id' | 'team2Id' | 'winnerId' | 'matchStatus' | 'venue' | 'date' | 'adminKey',
    value: string,
  ) => void;
  onStatsChange: (
    teamKey: 'team1Stats' | 'team2Stats',
    field: keyof StatsFormState,
    value: string,
  ) => void;
}

export default function MatchResultForm({
  form,
  teams,
  errors,
  isSubmitting,
  submitLabel = 'Save Result',
  showAdminKey = true,
  onSubmit,
  onFieldChange,
  onStatsChange,
}: MatchResultFormProps): JSX.Element {
  const handleFieldChange =
    (field: 'team1Id' | 'team2Id' | 'winnerId' | 'matchStatus' | 'venue' | 'date' | 'adminKey') =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      onFieldChange(field, event.target.value);
    };

  const handleStatsChange =
    (teamKey: 'team1Stats' | 'team2Stats', field: keyof StatsFormState) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      onStatsChange(teamKey, field, event.target.value);
    };

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {errors.length > 0 && (
        <div className="error-list">
          {errors.map((error: string): JSX.Element => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      <div className="form-grid">
        <label>
          Team 1
          <select value={form.team1Id} onChange={handleFieldChange('team1Id')}>
            <option value="">Select team</option>
            {teams.map((team: Team): JSX.Element => (
              <option key={team.id} value={team.id}>
                {team.shortCode} - {team.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Team 2
          <select value={form.team2Id} onChange={handleFieldChange('team2Id')}>
            <option value="">Select team</option>
            {teams.map((team: Team): JSX.Element => (
              <option key={team.id} value={team.id}>
                {team.shortCode} - {team.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="stats-grid">
        <fieldset>
          <legend>Team 1 Score</legend>
          <input placeholder="Runs" inputMode="numeric" value={form.team1Stats.runs} onChange={handleStatsChange('team1Stats', 'runs')} />
          <input placeholder="Wickets" inputMode="numeric" value={form.team1Stats.wickets} onChange={handleStatsChange('team1Stats', 'wickets')} />
          <input placeholder="Overs" inputMode="decimal" value={form.team1Stats.overs} onChange={handleStatsChange('team1Stats', 'overs')} />
        </fieldset>
        <fieldset>
          <legend>Team 2 Score</legend>
          <input placeholder="Runs" inputMode="numeric" value={form.team2Stats.runs} onChange={handleStatsChange('team2Stats', 'runs')} />
          <input placeholder="Wickets" inputMode="numeric" value={form.team2Stats.wickets} onChange={handleStatsChange('team2Stats', 'wickets')} />
          <input placeholder="Overs" inputMode="decimal" value={form.team2Stats.overs} onChange={handleStatsChange('team2Stats', 'overs')} />
        </fieldset>
      </div>

      <div className="form-grid">
        <label>
          Status
          <select value={form.matchStatus} onChange={handleFieldChange('matchStatus')}>
            <option value="COMPLETED">Completed</option>
            <option value="TIE">Tie</option>
            <option value="NO_RESULT">No Result</option>
          </select>
        </label>
        <label>
          Winner
          <select value={form.winnerId} onChange={handleFieldChange('winnerId')}>
            <option value="">None</option>
            {teams.map((team: Team): JSX.Element => (
              <option key={team.id} value={team.id}>
                {team.shortCode}
              </option>
            ))}
          </select>
        </label>
        <label>
          Venue
          <input value={form.venue} onChange={handleFieldChange('venue')} />
        </label>
        <label>
          Date
          <input type="datetime-local" value={form.date} onChange={handleFieldChange('date')} />
        </label>
        {showAdminKey && (
          <label>
            Admin Key
            <input type="password" value={form.adminKey} onChange={handleFieldChange('adminKey')} />
          </label>
        )}
      </div>

      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
