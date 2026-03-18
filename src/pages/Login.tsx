import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/quiz';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Login failed. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Card */}
        <div className="card animate-fadeUp" style={{ overflow: 'hidden' }}>
          <div className="card-ribbon" />
          <div style={{ padding: '32px 32px 36px' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 52, height: 52, background: 'var(--green-deep)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 22, color: '#fff', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(10,61,31,0.25)' }}>S</div>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 8 }}>Welcome back</h1>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                Log in to continue your practice
              </p>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-md"
                disabled={loading}
                style={{ width: '100%', padding: '14px', fontSize: 14, marginTop: 4, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Signing in…' : 'Log In →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--green-mid)', fontWeight: 700, textDecoration: 'none' }}>
                Register free
              </Link>
            </p>

            <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--green-ghost)', border: '1px solid var(--green-pale)', borderRadius: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', lineHeight: 1.5 }}>
                Or <Link to="/quiz" style={{ color: 'var(--green-mid)', fontWeight: 700, textDecoration: 'none' }}>try the quiz as a guest</Link> — no account needed
              </p>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
          SCOT Free by EduRaj Consult · JAMB · WAEC · NECO 2026
        </p>
      </div>
    </div>
  );
}
