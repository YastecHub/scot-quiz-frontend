/**
 * Timed test page — with full anti-cheat protection
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptsAPI, type QuestionBlind, type Test, type Attempt } from '../api/client';
import Timer from '../components/Timer';
import { useAntiCheat, MAX_VIOLATIONS } from '../hooks/useAntiCheat';
import { AlertTriangle, ShieldAlert, EyeOff } from 'lucide-react';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export default function TakeTest() {
  const { testId } = useParams<{ testId: string }>();
  const navigate   = useNavigate();
  const id         = Number(testId);

  const [test,       setTest]       = useState<Test | null>(null);
  const [attempt,    setAttempt]    = useState<Attempt | null>(null);
  const [questions,  setQuestions]  = useState<QuestionBlind[]>([]);
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [answers,    setAnswers]    = useState<Record<number, number | null>>({});
  const [idx,        setIdx]        = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [cardKey,    setCardKey]    = useState(0);
  const submitRef = useRef(false);

  useEffect(() => {
    attemptsAPI.getActive(id)
      .then(res => {
        const { attempt: a, test: t, questions: qs, time_remaining, saved_answers } = res.data;
        if (a.status !== 'in_progress') {
          navigate(`/tests/${id}/review`, { replace: true }); return;
        }
        setAttempt(a);
        setTest(t);
        setQuestions(Array.isArray(qs) ? qs : []);
        setTimeLeft(time_remaining);
        setAnswers(saved_answers ?? {});
      })
      .catch(err => {
        if (err.response?.status === 404) {
          attemptsAPI.start(id)
            .then(() => window.location.reload())
            .catch(() => setError('Could not start test.'));
        } else {
          setError(err.response?.data?.error ?? 'Could not load test.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(async (isTimeout = false) => {
    if (submitRef.current) return;
    submitRef.current = true;
    setSubmitting(true);
    try {
      await attemptsAPI.submit(id, answers);
      navigate(`/tests/${id}/review`, { replace: true, state: { timedOut: isTimeout } });
    } catch (err: any) {
      if (err.response?.status === 409) {
        navigate(`/tests/${id}/review`, { replace: true }); return;
      }
      setError(err.response?.data?.error ?? 'Submission failed. Please try again.');
      submitRef.current = false;
    } finally { setSubmitting(false); }
  }, [id, answers, navigate]);

  const handleTimeout = useCallback(() => { handleSubmit(true); }, [handleSubmit]);

  const { violations, blurred, warningMsg } = useAntiCheat({
    testId: id,
    onAutoSubmit: () => handleSubmit(false),
  });

  const selectAnswer = async (qId: number, optIdx: number) => {
    const newAnswers = { ...answers, [qId]: optIdx };
    setAnswers(newAnswers);
    attemptsAPI.saveAnswer(id, qId, optIdx).catch(() => {});
  };

  const goTo = (newIdx: number) => { setIdx(newIdx); setCardKey(k => k + 1); };

  const answered = Object.values(answers).filter(v => v !== null && v !== undefined).length;
  const total    = questions.length;
  const currentQ = questions[idx];
  const chosen   = currentQ ? (answers[currentQ.id] ?? null) : null;
  const remaining = MAX_VIOLATIONS - violations;

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (error)   return <div style={{ maxWidth: 500, margin: '60px auto', padding: '0 24px' }}><div className="alert alert-error">{error}</div></div>;
  if (!test || !attempt) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 60px' }}>

      {/* ── SOLID LOCK SCREEN — completely hides content when away ── */}
      {blurred && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#0a3d1f',   /* solid — no see-through on mobile */
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 20, padding: 32,
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <EyeOff size={40} color="rgba(255,255,255,0.5)" />
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
            Test Paused
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500, textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
            Questions are hidden while you are away from this screen.
          </div>
          <div style={{
            background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)',
            borderRadius: 12, padding: '10px 18px', marginTop: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>
              ⚠ This absence has been flagged ({violations}/{MAX_VIOLATIONS})
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
            Return to this tab/app to continue
          </div>
        </div>
      )}

      {/* ── VIOLATION WARNING BANNER ── */}
      {warningMsg && !blurred && (
        <div style={{
          position: 'fixed', top: 68, left: '50%', transform: 'translateX(-50%)',
          zIndex: 500, width: '100%', maxWidth: 560, padding: '0 16px',
          animation: 'fadeSlide 0.3s ease',
        }}>
          <div style={{
            background: violations >= MAX_VIOLATIONS ? '#7f1d1d' : '#fef2f2',
            border: `1.5px solid ${violations >= MAX_VIOLATIONS ? '#dc2626' : '#fecaca'}`,
            borderRadius: 14, padding: '14px 18px',
            display: 'flex', alignItems: 'flex-start', gap: 12,
            boxShadow: '0 8px 32px rgba(220,38,38,0.25)',
          }}>
            {violations >= MAX_VIOLATIONS
              ? <ShieldAlert size={20} color="#fff" style={{ flexShrink: 0, marginTop: 1 }} />
              : <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />}
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: violations >= MAX_VIOLATIONS ? '#fff' : '#b91c1c', marginBottom: 3 }}>
                {violations >= MAX_VIOLATIONS ? 'Auto-submitting…' : `⚠ Warning ${violations}/${MAX_VIOLATIONS}`}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: violations >= MAX_VIOLATIONS ? 'rgba(255,255,255,0.85)' : '#b91c1c', lineHeight: 1.5 }}>
                {warningMsg}
                {violations < MAX_VIOLATIONS && (
                  <span style={{ display: 'block', marginTop: 3, fontWeight: 700 }}>
                    {remaining} more violation{remaining !== 1 ? 's' : ''} will auto-submit your test.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIOLATION COUNTER STRIP ── */}
      {violations > 0 && (
        <div style={{ width: '100%', maxWidth: 600, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '6px 12px' }}>
            <ShieldAlert size={13} color="#dc2626" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c' }}>
              {violations} integrity violation{violations !== 1 ? 's' : ''} recorded — {remaining} remaining before auto-submit
            </span>
          </div>
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div style={{ width: '100%', maxWidth: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: 'var(--green-deep)' }}>{test.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
            {answered} of {total} answered
          </div>
        </div>
        <Timer seconds={timeLeft} onExpire={handleTimeout} />
      </div>

      {/* ── PROGRESS BAR ── */}
      <div style={{ width: '100%', maxWidth: 600, marginBottom: 16 }}>
        <div style={{ height: 6, background: 'rgba(10,61,31,0.08)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${total > 0 ? ((idx + 1) / total) * 100 : 0}%`, background: 'linear-gradient(90deg,var(--green-bright),var(--accent))', borderRadius: 10, transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>
          <span>Q {idx + 1} of {total}</span>
          <span>{Math.round(total > 0 ? ((idx + 1) / total) * 100 : 0)}%</span>
        </div>
      </div>

      {/* ── QUESTION CARD ── */}
      {currentQ && (
        <div key={cardKey} style={{ width: '100%', maxWidth: 600 }}>
          <div className="card" style={{ overflow: 'hidden', animation: 'cardIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div className="card-ribbon" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px 0' }}>
              <div className="subject-pill"><div className="subject-dot" /><span className="subject-name">{currentQ.subject}</span></div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Q {idx + 1} / {total}</span>
            </div>

            <div style={{ margin: '14px 20px', background: 'linear-gradient(135deg, var(--green-deep), var(--green-mid))', borderRadius: 16, padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Fraunces, serif', fontSize: 70, color: 'rgba(255,255,255,0.05)', lineHeight: 1 }}>?</div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Question</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.55, position: 'relative', zIndex: 1, maxWidth: '92%' }}>
                {currentQ.question}
              </div>
            </div>

            <div style={{ padding: '4px 20px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {currentQ.options.map((opt, i) => {
                const selected = chosen === i;
                return (
                  <div
                    key={i}
                    onClick={() => selectAnswer(currentQ.id, i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 13,
                      background: selected ? 'var(--green-ghost)' : 'var(--off-white)',
                      border: `1.5px solid ${selected ? 'var(--green-light)' : 'rgba(10,61,31,0.08)'}`,
                      borderRadius: 14, padding: '13px 15px', cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: selected ? '0 3px 12px rgba(34,160,79,0.15)' : 'none',
                    }}
                    onMouseEnter={e => { if (!selected) { const el = e.currentTarget; el.style.background = 'var(--green-ghost)'; el.style.borderColor = 'var(--green-light)'; el.style.transform = 'translateX(4px)'; } }}
                    onMouseLeave={e => { if (!selected) { const el = e.currentTarget; el.style.background = 'var(--off-white)'; el.style.borderColor = 'rgba(10,61,31,0.08)'; el.style.transform = 'translateX(0)'; } }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0, transition: 'all 0.18s', background: selected ? 'var(--green-light)' : '#fff', color: selected ? '#fff' : 'var(--green-mid)', border: selected ? 'none' : '1.5px solid rgba(10,61,31,0.12)' }}>
                      {selected ? '✓' : LETTERS[i]}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: selected ? 'var(--green-mid)' : 'var(--text-dark)', lineHeight: 1.35 }}>{opt}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '4px 20px 20px', display: 'flex', gap: 10 }}>
              <button onClick={() => idx > 0 && goTo(idx - 1)} disabled={idx === 0} className="btn btn-ghost btn-md" style={{ flex: 0.5, padding: 12, fontSize: 13, opacity: idx === 0 ? 0.4 : 1 }}>← Prev</button>
              {idx < total - 1
                ? <button onClick={() => goTo(idx + 1)} className="btn btn-primary btn-md" style={{ flex: 1, padding: 12, fontSize: 13 }}>Next →</button>
                : <button onClick={() => handleSubmit(false)} disabled={submitting} className="btn btn-primary btn-md" style={{ flex: 1, padding: 12, fontSize: 13, opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? 'Submitting…' : 'Submit Test ✓'}
                  </button>
              }
            </div>
          </div>
        </div>
      )}

      {/* ── QUESTION NAV DOTS ── */}
      <div style={{ width: '100%', maxWidth: 600, marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {questions.map((q, i) => {
            const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
            const isCurrent  = i === idx;
            return (
              <button key={q.id} onClick={() => goTo(i)} style={{
                width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                background: isCurrent ? 'var(--green-deep)' : isAnswered ? 'var(--green-ghost)' : 'var(--off-white)',
                color: isCurrent ? '#fff' : isAnswered ? 'var(--green-mid)' : 'var(--text-muted)',
                fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, fontWeight: 800,
                border: `1.5px solid ${isCurrent ? 'var(--green-deep)' : isAnswered ? 'var(--green-pale)' : 'rgba(10,61,31,0.1)'}`,
                transition: 'all 0.15s',
              }}>{i + 1}</button>
            );
          })}
        </div>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--green-ghost)', border: '1px solid var(--green-pale)' }} /> Answered ({answered})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--off-white)', border: '1px solid rgba(10,61,31,0.1)' }} /> Unanswered ({total - answered})
          </div>
        </div>
      </div>

      {/* ── SUBMIT BUTTON ── */}
      {total > 0 && (
        <div style={{ width: '100%', maxWidth: 600, marginTop: 20 }}>
          <button
            onClick={() => { if (confirm(`Submit the test now? You have answered ${answered} of ${total} questions.`)) handleSubmit(false); }}
            disabled={submitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Submitting…' : `Submit Test (${answered}/${total} answered)`}
          </button>
        </div>
      )}
    </div>
  );
}
