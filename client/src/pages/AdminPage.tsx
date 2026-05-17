import { useEffect, useState, type FormEvent, type JSX } from 'react';
import { addMatch } from '../api/matchesApi';
import { getPointsTable } from '../api/pointsTableApi';
import { getTeams } from '../api/teamsApi';
import MatchResultForm, {
  type AdminFormState,
  type StatsFormState,
} from '../components/MatchResultForm';
import PointsTable from '../components/PointsTable';
import type { MatchPayload, MatchStatus, Standing, Team, TeamStats } from '../types';

type AdminFieldKey = 'team1Id' | 'team2Id' | 'winnerId' | 'matchStatus' | 'venue' | 'date' | 'adminKey';

const initialFormState: AdminFormState = {
  team1Id: '',
  team2Id: '',
  team1Stats: { runs: '', wickets: '', overs: '' },
  team2Stats: { runs: '', wickets: '', overs: '' },
  winnerId: '',
  matchStatus: 'COMPLETED',
  venue: '',
  date: '',
  adminKey: '',
};

function parseStats(stats: StatsFormState): TeamStats {
  return {
    runs: Number(stats.runs),
    wickets: Number(stats.wickets),
    overs: Number(stats.overs),
  };
}

function toIsoString(dateValue: string): string {
  return new Date(dateValue).toISOString();
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

export default function AdminPage(): JSX.Element {
  const [form, setForm] = useState<AdminFormState>(initialFormState);
  const [teams, setTeams] = useState<Team[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState<boolean>(true);
  const [isLoadingStandings, setIsLoadingStandings] = useState<boolean>(true);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchTeams = async (): Promise<void> => {
    try {
      setIsLoadingTeams(true);
      const data = await getTeams();
      setTeams(data);
    } catch {
      setErrors(['Failed to load teams. Please try again.']);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const fetchStandings = async (): Promise<void> => {
    try {
      setIsLoadingStandings(true);
      setStandingsError(null);
      const data = await getPointsTable();
      setStandings(data);
    } catch {
      setStandingsError('Failed to load standings. Please try again.');
    } finally {
      setIsLoadingStandings(false);
    }
  };

  useEffect((): void => {
    void fetchTeams();
    void fetchStandings();
  }, []);

  const handleFieldChange = (field: AdminFieldKey, value: string): void => {
    setForm((current: AdminFormState): AdminFormState => {
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
    setForm((current: AdminFormState): AdminFormState => ({
      ...current,
      [teamKey]: {
        ...current[teamKey],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSuccessMessage(null);

    const nextErrors = validateForm(form);
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: MatchPayload = {
      team1Id: form.team1Id,
      team2Id: form.team2Id,
      team1Stats: parseStats(form.team1Stats),
      team2Stats: parseStats(form.team2Stats),
      winnerId: form.matchStatus === 'COMPLETED' ? form.winnerId : null,
      matchStatus: form.matchStatus,
      venue: form.venue.trim(),
      date: toIsoString(form.date),
    };

    try {
      setIsSubmitting(true);
      setErrors([]);
      await addMatch(payload);
      await fetchStandings();
      setSuccessMessage('Match result saved.');
      setForm(initialFormState);
    } catch {
      setErrors(['Failed to save match result.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <div className="page-heading">
        <p className="eyebrow">Admin</p>
        <h1>Add Match Result</h1>
      </div>
      {isLoadingTeams ? (
        <div className="spinner">Loading...</div>
      ) : (
        <MatchResultForm
          form={form}
          teams={teams}
          errors={errors}
          isSubmitting={isSubmitting}
          showAdminKey={false}
          onSubmit={(event: FormEvent<HTMLFormElement>): void => {
            void handleSubmit(event);
          }}
          onFieldChange={handleFieldChange}
          onStatsChange={handleStatsChange}
        />
      )}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <section className="admin-standings">
        <h2>Updated Standings</h2>
        <PointsTable
          standings={standings}
          isLoading={isLoadingStandings}
          error={standingsError}
        />
      </section>
    </main>
  );
}
