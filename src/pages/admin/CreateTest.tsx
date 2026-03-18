import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/client';
import axios from 'axios';

const SUBJECTS = ['', 'Physics', 'Chemistry', 'Biology', 'English', 'Mathematics'];

export default function CreateTest() {
  const navigate = useNavigate();
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [subject,     setSubject]     = useState('');
  const [timeLimit,   setTimeLimit]   = useState(30);
  const [isActive,    setIsActive]    = useState(true);
  const [error,       setError]       = useState('');
  const [saving,      setSaving]      = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Test title is required.'); return; }
    if (timeLimit < 1 || timeLimit > 300) { setError('Time limit must be between 1 and 300 minutes.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await adminAPI.createTest({
        title: title.trim(), description: description.trim(),
        subject: subject || undefined, time_limit: timeLimit,
        is_active: isActive ? 1 : 0,
      });
      navigate(`/admin/tests/${res.data.id}/manage`);
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error ?? 'Failed to create test.');
      else setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 24px 80px' }}>
      {/* Back */}
      <button type="button" onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 24, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Back to Dashboard
      </button>

      <div className="section-badge" style={{ marginBottom: 12 }}>⚙ Admin</div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 6 }}>Create New Test</h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 32 }}>
        Set the test details. You'll add questions on the next screen.
      </p>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-ribbon" />
        <form onSubmit={handleSubmit} style={{ padding: '28px 28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div className="form-group">
            <label className="form-label" htmlFor="title">Test Title *</label>
            <input id="title" className="form-input" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. JAMB Physics Mock Test 1" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="desc">Description (optional)</label>
            <textarea id="desc" className="form-input" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of what this test covers…" rows={3}
              style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="subject">Subject (optional)</label>
              <select id="subject" className="form-input" value={subject} onChange={e => setSubject(e.target.value)}
                style={{ cursor: 'pointer' }}>
                <option value="">Mixed / All Subjects</option>
                {SUBJECTS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="time">Time Limit (minutes) *</label>
              <input id="time" type="number" className="form-input" value={timeLimit}
                onChange={e => setTimeLimit(Number(e.target.value))} min={1} max={300} required />
            </div>
          </div>

          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--green-ghost)', borderRadius: 12, border: '1px solid var(--green-pale)' }}>
            <button
              type="button"
              onClick={() => setIsActive(a => !a)}
              style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: isActive ? 'var(--green-light)' : 'rgba(10,61,31,0.15)',
                position: 'relative', transition: 'background 0.2s',
              }}
            >
              <div style={{ position: 'absolute', top: 3, left: isActive ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-deep)' }}>{isActive ? 'Active — students can see and take this test' : 'Inactive — hidden from students'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>You can toggle this anytime from the dashboard.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={() => navigate('/admin')} className="btn btn-secondary btn-md" style={{ flex: 0.5 }}>Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary btn-md" style={{ flex: 1, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Creating…' : 'Create Test & Add Questions →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
