import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Field({ id, label, type, value, onChange, placeholder, autoComplete }: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; autoComplete?: string;
}) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        autoComplete={autoComplete}
      />
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/quiz', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        <div className="card animate-fadeUp" style={{ overflow: 'hidden' }}>
          <div className="card-ribbon" />
          <div style={{ padding: '32px 32px 36px' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 52, height: 52, background: 'var(--green-deep)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 22, color: '#fff', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(10,61,31,0.25)' }}>S</div>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 8 }}>Create your account</h1>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                Free forever — no credit card required
              </p>
            </div>

            {/* Perks row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
              {['Daily mock quizzes', 'Score tracking', 'Instant explanations', 'Free resources'].map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, color: 'var(--text-mid)' }}>
                  <span style={{ color: 'var(--correct)', fontSize: 14 }}>✓</span> {p}
                </div>
              ))}
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field id="name"     label="Full Name"        type="text"     value={name}     onChange={setName}     placeholder="Amaka Johnson"      autoComplete="name" />
              <Field id="email"    label="Email Address"    type="email"    value={email}    onChange={setEmail}    placeholder="you@example.com"     autoComplete="email" />
              <Field id="password" label="Password"         type="password" value={password} onChange={setPassword} placeholder="At least 6 characters" autoComplete="new-password" />
              <Field id="confirm"  label="Confirm Password" type="password" value={confirm}  onChange={setConfirm}  placeholder="Repeat your password"  autoComplete="new-password" />

              <button
                type="submit"
                className="btn btn-primary btn-md"
                disabled={loading}
                style={{ width: '100%', padding: '14px', fontSize: 14, marginTop: 4, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Creating account…' : 'Create Free Account →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--green-mid)', fontWeight: 700, textDecoration: 'none' }}>
                Log in
              </Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
          SCOT Free by EduRaj Consult · JAMB · WAEC · NECO 2026
        </p>
      </div>
    </div>
  );
}
