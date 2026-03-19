import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attemptsAPI, type Test } from '../api/client';
import { ClipboardList, Inbox, Clock, FileText } from 'lucide-react';

type TestRow = Test & { attempt_id?: number; attempt_status?: string; attempt_pct?: number };

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string; border: string }> = {
  completed:   { label: 'Completed',   bg: '#f0fdf4', color: 'var(--correct)',  border: 'var(--green-pale)' },
  in_progress: { label: 'In Progress', bg: '#fefce8', color: '#ca8a04',          border: '#fef08a' },
  timed_out:   { label: 'Timed Out',   bg: '#fef2f2', color: 'var(--wrong)',     border: '#fecaca' },
};

export default function StudentTests() {
  const navigate = useNavigate();
  const [tests,   setTests]   = useState<TestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    attemptsAPI.listTests()
      .then(res => setTests(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Could not load tests. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (test: TestRow) => {
    try {
      if (test.attempt_status === 'completed' || test.attempt_status === 'timed_out') {
        navigate(`/tests/${test.id}/review`);
        return;
      }
      await attemptsAPI.start(test.id);
      navigate(`/tests/${test.id}/take`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        navigate(`/tests/${test.id}/review`);
      } else if (err.response?.status === 410) {
        alert('Time expired for a previous attempt.');
        window.location.reload();
      } else {
        alert(err.response?.data?.error ?? 'Could not start test.');
      }
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div className="section-badge animate-fadeUp" style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}><ClipboardList size={12} /> Available Tests</div>
        <h1 className="animate-fadeUp delay-1" style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(26px,5vw,36px)', fontWeight: 700, color: 'var(--green-deep)', marginBottom: 12 }}>
          Your Mock Tests
        </h1>
        <p className="animate-fadeUp delay-2" style={{ fontSize: 15, color: 'var(--text-mid)', fontWeight: 500, lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
          Each test is timed. Once you start, the clock runs. Submit when you're done to see your results.
        </p>
      </div>

      {loading && <div className="spinner" />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && tests.length === 0 && (
        <div className="card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}><Inbox size={48} color="var(--text-muted)" /></div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 8 }}>No tests available yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your teacher hasn't published any tests yet. Check back soon!</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tests.map(test => {
          const statusInfo = test.attempt_status ? STATUS_LABEL[test.attempt_status] : null;
          const done = test.attempt_status === 'completed' || test.attempt_status === 'timed_out';
          const inProg = test.attempt_status === 'in_progress';

          return (
            <div key={test.id} className="card" style={{ overflow: 'hidden', transition: 'all 0.22s ease' }}
              onMouseEnter={e => { const el=e.currentTarget; el.style.transform='translateY(-2px)'; el.style.boxShadow='0 10px 32px rgba(10,61,31,0.1)'; }}
              onMouseLeave={e => { const el=e.currentTarget; el.style.transform='translateY(0)'; el.style.boxShadow='var(--shadow-md)'; }}>
              <div className="card-ribbon" />
              <div style={{ padding: '20px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                    <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: 'var(--green-deep)' }}>{test.title}</h3>
                    {statusInfo && (
                      <span style={{ background: statusInfo.bg, color: statusInfo.color, border: `1px solid ${statusInfo.border}`, borderRadius: 8, padding: '3px 9px', fontSize: 11, fontWeight: 700 }}>
                        {statusInfo.label}
                      </span>
                    )}
                  </div>
                  {test.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 500, lineHeight: 1.5 }}>{test.description}</p>}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {test.subject && <span style={{ background: 'var(--green-ghost)', border: '1px solid var(--green-pale)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'var(--green-mid)' }}>{test.subject}</span>}
                    <span style={{ background: 'var(--off-white)', border: '1px solid rgba(10,61,31,0.1)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {test.time_limit} minutes</span>
                    <span style={{ background: 'var(--off-white)', border: '1px solid rgba(10,61,31,0.1)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><FileText size={11} /> {test.question_count ?? '?'} questions</span>
                    {done && test.attempt_pct != null && (
                      <span style={{ background: test.attempt_pct>=70?'#f0fdf4':'#fef2f2', border: `1px solid ${test.attempt_pct>=70?'var(--green-pale)':'#fecaca'}`, borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: test.attempt_pct>=70?'var(--correct)':'var(--wrong)' }}>
                        Your score: {Math.round(test.attempt_pct)}%
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStart(test)}
                  className={`btn btn-md ${done ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ whiteSpace: 'nowrap', minWidth: 130 }}
                >
                  {done ? 'View Results' : inProg ? 'Continue →' : 'Start Test →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
