import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/client';
import { Clock, FileText, BookOpen, ToggleLeft, ToggleRight, Eye } from 'lucide-react';
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

  const h = Math.floor(timeLimit / 60);
  const m = timeLimit % 60;
  const timeDisplay = h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m} min`;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 24px 80px' }}>
      <button type="button" onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 24, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Back to Dashboard
      </button>

      <div className="section-badge" style={{ marginBottom: 12 }}>⚙ Admin</div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 6 }}>Create New Test</h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 32 }}>
        Fill in the details below. The preview on the right shows exactly how students will see this test.
      </p>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }} className="create-test-grid">

        {/* ── FORM ── */}
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

            <div className="form-group">
              <label className="form-label" htmlFor="subject">Subject (optional)</label>
              <select id="subject" className="form-input" value={subject} onChange={e => setSubject(e.target.value)}
                style={{ cursor: 'pointer' }}>
                <option value="">Mixed / All Subjects</option>
                {SUBJECTS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Time limit — prominent */}
            <div className="form-group">
              <label className="form-label" htmlFor="time">
                Time Limit * &nbsp;
                <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 11 }}>
                  (1 – 300 minutes)
                </span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  id="time" type="number" className="form-input"
                  value={timeLimit} onChange={e => setTimeLimit(Math.max(1, Math.min(300, Number(e.target.value))))}
                  min={1} max={300} required
                  style={{ maxWidth: 120 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--green-ghost)', border: '1.5px solid var(--green-pale)', borderRadius: 10, padding: '8px 14px' }}>
                  <Clock size={14} color="var(--green-mid)" />
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: 'var(--green-deep)' }}>{timeDisplay}</span>
                </div>
              </div>
              {/* Quick presets */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {[15, 30, 45, 60, 90, 120].map(t => (
                  <button key={t} type="button" onClick={() => setTimeLimit(t)} style={{
                    background: timeLimit === t ? 'var(--green-deep)' : '#fff',
                    color: timeLimit === t ? '#fff' : 'var(--text-muted)',
                    border: timeLimit === t ? '1.5px solid var(--green-deep)' : '1.5px solid rgba(10,61,31,0.12)',
                    borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                  }}>{t}m</button>
                ))}
              </div>
            </div>

            {/* Active toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--green-ghost)', borderRadius: 12, border: '1px solid var(--green-pale)', cursor: 'pointer' }}
              onClick={() => setIsActive(a => !a)}>
              {isActive
                ? <ToggleRight size={32} color="var(--green-light)" />
                : <ToggleLeft size={32} color="rgba(10,61,31,0.3)" />}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-deep)' }}>
                  {isActive ? 'Active — students can see and take this test' : 'Inactive — hidden from students'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Click to toggle. You can change this anytime from the dashboard.</div>
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

        {/* ── LIVE PREVIEW ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Eye size={14} color="var(--green-mid)" />
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--green-mid)' }}>Student Preview</span>
          </div>

          {/* Mimics the StudentTests card */}
          <div className="card" style={{ overflow: 'hidden', opacity: title ? 1 : 0.45, transition: 'opacity 0.2s' }}>
            <div className="card-ribbon" />
            <div style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: 'var(--green-deep)' }}>
                      {title || 'Test Title'}
                    </h3>
                    <span style={{
                      background: isActive ? '#f0fdf4' : '#fef2f2',
                      color: isActive ? 'var(--correct)' : 'var(--wrong)',
                      border: `1px solid ${isActive ? 'var(--green-pale)' : '#fecaca'}`,
                      borderRadius: 8, padding: '3px 9px', fontSize: 11, fontWeight: 700,
                    }}>
                      {isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                  {description && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 500, lineHeight: 1.5 }}>{description}</p>
                  )}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {subject && (
                      <span style={{ background: 'var(--green-ghost)', border: '1px solid var(--green-pale)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'var(--green-mid)' }}>
                        {subject}
                      </span>
                    )}
                    <span style={{ background: 'var(--off-white)', border: '1px solid rgba(10,61,31,0.1)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {timeLimit} minutes
                    </span>
                    <span style={{ background: 'var(--off-white)', border: '1px solid rgba(10,61,31,0.1)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <FileText size={11} /> 0 questions
                    </span>
                  </div>
                </div>
                <button className="btn btn-primary btn-md" style={{ whiteSpace: 'nowrap', minWidth: 120, pointerEvents: 'none' }}>
                  Start Test →
                </button>
              </div>
            </div>
          </div>

          {/* Timer preview */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--green-mid)', marginBottom: 10 }}>
              Timer students will see
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--green-ghost)', border: '1.5px solid var(--green-pale)', borderRadius: 12, padding: '8px 14px' }}>
              <Clock size={14} color="var(--green-mid)" />
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: 'var(--green-mid)', letterSpacing: 1 }}>
                {h > 0
                  ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`
                  : `${String(m).padStart(2,'0')}:00`}
              </span>
            </div>
          </div>

          {/* Summary checklist */}
          <div style={{ marginTop: 20, background: 'var(--green-ghost)', border: '1.5px solid var(--green-pale)', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--green-mid)', marginBottom: 12 }}>
              Confirm Details
            </div>
            {[
              { icon: <FileText size={13} />, label: 'Title', value: title || <span style={{ color: 'var(--wrong)' }}>Required</span> },
              { icon: <BookOpen size={13} />, label: 'Subject', value: subject || 'Mixed / All Subjects' },
              { icon: <Clock size={13} />, label: 'Time Limit', value: `${timeLimit} minutes (${timeDisplay})` },
              { icon: isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />, label: 'Visibility', value: isActive ? 'Active (visible to students)' : 'Inactive (hidden)' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <span style={{ color: 'var(--green-mid)', marginTop: 1, flexShrink: 0 }}>{row.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', minWidth: 70 }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dark)' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@media(max-width:860px){.create-test-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
