import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { JSX, ReactNode } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PointsTablePage from './pages/PointsTablePage';
import AdminPage from './pages/AdminPage';
import MatchResultsPage from './pages/MatchResultsPage';
import MatchHistoryPage from './pages/MatchHistoryPage';
import MatchDetailPage from './pages/MatchDetailPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="page">
        <div className="spinner">Loading...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <style>{`
        :root {
          color: #162019;
          background: #f6f8f5;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          min-width: 320px;
          background: #f6f8f5;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button,
        input,
        select {
          font: inherit;
        }

        .navbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 16px clamp(16px, 4vw, 48px);
          border-bottom: 1px solid #dce5db;
          background: rgba(246, 248, 245, 0.94);
          backdrop-filter: blur(12px);
        }

        .brand {
          font-size: 1.15rem;
          font-weight: 800;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 16px;
          color: #526056;
          font-weight: 650;
        }

        .nav-links a.active {
          color: #0b6b3a;
        }

        .nav-button {
          border: 0;
          padding: 0;
          color: #526056;
          background: transparent;
          font-weight: 650;
          cursor: pointer;
        }

        .menu-toggle {
          display: none;
          width: 42px;
          height: 42px;
          border: 1px solid #cbd8cb;
          border-radius: 8px;
          background: #ffffff;
          padding: 9px;
        }

        .menu-toggle span {
          display: block;
          height: 2px;
          margin: 5px 0;
          background: #162019;
        }

        .page {
          width: min(1120px, calc(100% - 32px));
          margin: 0 auto;
          padding: 36px 0 64px;
        }

        .home-hero {
          min-height: 62vh;
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #ffffff 0%, #edf5ee 54%, #dceae1 100%);
          border: 1px solid #dce5db;
          border-radius: 8px;
          padding: clamp(28px, 6vw, 72px);
        }

        .home-hero h1,
        .page-heading h1 {
          margin: 0;
          font-size: clamp(2rem, 5vw, 4.5rem);
          line-height: 1.02;
        }

        .home-hero p {
          max-width: 680px;
          color: #526056;
          font-size: 1.1rem;
          line-height: 1.6;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: #0b6b3a;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
        }

        .primary-button,
        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          border-radius: 8px;
          padding: 0 18px;
          border: 1px solid #0b6b3a;
          font-weight: 800;
          cursor: pointer;
        }

        .primary-button {
          color: #ffffff;
          background: #0b6b3a;
        }

        .primary-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .secondary-button {
          color: #0b6b3a;
          background: #ffffff;
        }

        .page-heading {
          margin-bottom: 24px;
        }

        .table-shell {
          overflow-x: auto;
          border: 1px solid #dce5db;
          border-radius: 8px;
          background: #ffffff;
        }

        .points-table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
        }

        .points-table th,
        .points-table td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #edf1ed;
          white-space: nowrap;
        }

        .points-table th {
          color: #526056;
          background: #f8faf8;
          font-size: 0.8rem;
          text-transform: uppercase;
        }

        .playoff-zone {
          background: #eef8f1;
          box-shadow: inset 4px 0 0 #1e9d59;
        }

        .team-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .team-cell img,
        .team-logo-fallback {
          border-radius: 50%;
          flex: 0 0 auto;
        }

        .team-logo-fallback {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: #dceae1;
          color: #0b6b3a;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .spinner,
        .error,
        .empty-state,
        .success-message {
          border: 1px solid #dce5db;
          border-radius: 8px;
          padding: 18px;
          background: #ffffff;
        }

        .error,
        .error-list {
          color: #8a1c1c;
          background: #fff4f2;
          border-color: #f0c8c2;
        }

        .success-message {
          color: #0b6b3a;
          margin-top: 16px;
        }

        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 20px;
          border: 1px solid #dce5db;
          border-radius: 8px;
          background: #ffffff;
        }

        .form-grid,
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .form-grid label,
        fieldset {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
          color: #526056;
          font-weight: 700;
        }

        fieldset {
          margin: 0;
          border: 1px solid #dce5db;
          border-radius: 8px;
          padding: 14px;
        }

        fieldset input + input {
          margin-top: 8px;
        }

        input,
        select {
          width: 100%;
          min-height: 42px;
          border: 1px solid #cbd8cb;
          border-radius: 8px;
          padding: 8px 10px;
          background: #ffffff;
          color: #162019;
        }

        .error-list {
          border: 1px solid #f0c8c2;
          border-radius: 8px;
          padding: 10px 14px;
        }

        .error-list p {
          margin: 6px 0;
        }

        .match-card {
          border: 1px solid #dce5db;
          border-radius: 8px;
          padding: 16px;
          background: #ffffff;
        }

        .match-card-header,
        .score-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .history-list {
          display: grid;
          gap: 12px;
        }

        .history-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          border: 1px solid #dce5db;
          border-radius: 8px;
          padding: 16px;
          background: #ffffff;
        }

        .history-card h2 {
          margin: 0;
          font-size: 1rem;
          line-height: 1.35;
        }

        .history-result {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 180px;
          color: #526056;
        }

        .history-result strong {
          color: #162019;
        }

        .detail-panel,
        .admin-match-panel {
          border: 1px solid #dce5db;
          border-radius: 8px;
          padding: 20px;
          background: #ffffff;
        }

        .admin-match-panel {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .admin-match-panel h2 {
          margin: 0;
        }

        .detail-grid,
        .score-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .detail-grid div,
        .score-detail-grid article {
          border: 1px solid #edf1ed;
          border-radius: 8px;
          padding: 14px;
          min-width: 0;
        }

        .detail-grid span,
        .score-detail-grid span {
          display: block;
          color: #526056;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .score-detail-grid {
          margin-top: 16px;
        }

        .score-detail-grid h2 {
          margin: 0 0 10px;
          font-size: 1rem;
        }

        .score-detail-grid p {
          margin: 0;
          font-size: 2rem;
          font-weight: 850;
        }

        .danger-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          border-radius: 8px;
          padding: 0 18px;
          border: 1px solid #8a1c1c;
          color: #ffffff;
          background: #8a1c1c;
          font-weight: 800;
          cursor: pointer;
        }

        .danger-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        @media (max-width: 767px) {
          .navbar {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .menu-toggle {
            display: block;
          }

          .nav-links {
            display: none;
            width: 100%;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
          }

          .nav-links.open {
            display: flex;
          }

          .nav-links a {
            padding: 12px 0;
            border-top: 1px solid #dce5db;
          }

          .form-grid,
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .admin-form {
            padding: 16px;
          }

          .history-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .history-result {
            min-width: 0;
          }

          .detail-grid,
          .score-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/points-table" element={<PointsTablePage />} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/match-results" element={<MatchResultsPage />} />
        <Route path="/history" element={<MatchHistoryPage />} />
        <Route path="/matches/:id" element={<MatchDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
