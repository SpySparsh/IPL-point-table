import { useEffect, useMemo, useState, type JSX } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getPointsTable } from '../api/pointsTableApi';
import type { Standing } from '../types';

interface ChartDatum {
  shortCode: string;
  wins: number;
  losses: number;
  points: number;
}

export default function MatchResultsPage(): JSX.Element {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPointsTable();
      setStandings(data);
    } catch {
      setError('Failed to load analytics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect((): void => {
    void fetchStandings();
  }, []);

  const chartData = useMemo<ChartDatum[]>(
    (): ChartDatum[] =>
      standings.map((standing: Standing): ChartDatum => ({
        shortCode: standing.shortCode,
        wins: standing.wins,
        losses: standing.losses,
        points: standing.points,
      })),
    [standings],
  );

  if (isLoading) {
    return (
      <main className="page">
        <div className="page-heading">
          <p className="eyebrow">Analytics</p>
          <h1>Performance Dashboard</h1>
        </div>
        <div className="spinner">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <div className="page-heading">
          <p className="eyebrow">Analytics</p>
          <h1>Performance Dashboard</h1>
        </div>
        <div className="error">{error}</div>
      </main>
    );
  }

  return (
    <main className="page">
      <style>{`
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .chart-panel {
          min-width: 0;
          border: 1px solid #dce5db;
          border-radius: 8px;
          padding: 18px;
          background: #ffffff;
        }

        .chart-panel h2 {
          margin: 0 0 14px;
          font-size: 1.05rem;
        }

        .chart-frame {
          width: 100%;
          min-width: 0;
          height: 320px;
        }

        .analytics-summary {
          margin-top: 18px;
        }

        @media (max-width: 767px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="page-heading">
        <p className="eyebrow">Analytics</p>
        <h1>Performance Dashboard</h1>
      </div>

      {chartData.length === 0 ? (
        <section className="empty-state">
          <p>No standings data is available yet.</p>
        </section>
      ) : (
        <div className="analytics-grid">
          <section className="chart-panel">
            <h2>Wins vs Losses</h2>
            <div className="chart-frame">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 16, right: 20, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shortCode" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="wins" name="Wins" fill="#1e9d59" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="losses" name="Losses" fill="#c95045" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="chart-panel">
            <h2>Total Points</h2>
            <div className="chart-frame">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 16, right: 20, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shortCode" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="points"
                    name="Points"
                    stroke="#0b6b3a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}

      <section className="empty-state analytics-summary">
        <p>
          Showing chart data for {chartData.length} teams from the computed points table.
        </p>
      </section>
    </main>
  );
}
