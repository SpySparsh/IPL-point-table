import { useState, type FormEvent, type JSX } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LoginFormState {
  email: string;
  password: string;
}

interface LocationState {
  from?: {
    pathname: string;
  };
}

export default function LoginPage(): JSX.Element {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const redirectTo = locationState?.from?.pathname ?? '/admin';
  const [form, setForm] = useState<LoginFormState>({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError(null);
      await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch {
      setError('Unable to sign in. Check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <div className="page-heading">
        <p className="eyebrow">Admin</p>
        <h1>Login</h1>
      </div>
      <form className="admin-form" onSubmit={(event: FormEvent<HTMLFormElement>): void => {
        void handleSubmit(event);
      }}>
        {error && <div className="error">{error}</div>}
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event): void => {
              setForm((current: LoginFormState): LoginFormState => ({
                ...current,
                email: event.target.value,
              }));
            }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event): void => {
              setForm((current: LoginFormState): LoginFormState => ({
                ...current,
                password: event.target.value,
              }));
            }}
          />
        </label>
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </main>
  );
}
