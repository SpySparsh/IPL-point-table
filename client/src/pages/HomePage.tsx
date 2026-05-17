import type { JSX } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage(): JSX.Element {
  return (
    <main className="page home-page">
      <section className="home-hero">
        <div>
          <p className="eyebrow">Live standings</p>
          <h1>IPL Points Table</h1>
          <p>
            Track wins, losses, no-results, points, and net run rate from match
            data entered by the admin.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/points-table">
              View Table
            </Link>
            <Link className="secondary-button" to="/admin">
              Add Result
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
