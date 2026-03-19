/**
 * Post-test review page
 * Shows every question with:
 *  – The student's answer (green if correct, red if wrong)
 *  – The correct answer highlighted
 *  – Full explanation
 *  – Score summary at top
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { attemptsAPI, type ReviewQuestion, type Test, type Attempt } from '../api/client';
import { Trophy, ThumbsUp, Dumbbell, BookMarked, Clock, Check, X, Pin } from 'lucide-react';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export default function TestReview() {
  const { testId } = useParams<{ testId: string }>();
  const navigate   = useNavigate();
  const location   = useLocation();
  const timedOut   = (location.state as any)?.timedOut === true;
  const id         = Number(testId);

  const [test,      setTest]      = useState<Test | null>(null);
  const [attempt,   setAttempt]   = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<'all' | 'wrong' | 'correct'>('all');

  useEffect(() => {
    attemptsAPI.review(id)
      .then(res => { 
        setTest(res.data.test); 
        setAttempt(res.data.attempt); 
        setQuestions(Array.isArray(res.data.questions) ? res.data.questions : []);
      })
      .catch(() => navigate('/tests', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const pct       = attempt?.pct ?? 0;
  const score     = attempt?.score ?? 0;
  const total     = attempt?.total ?? 0;
  const skipped   = questions.filter(q => q.chosen_index === null).length;
  const wrong     = total - score - skipped;
  const pctColor  = (p: number) => p >= 70 ? 'var(--correct)' : p >= 50 ? '#ca8a04' : 'var(--wrong)';
  const grade     = pct >= 80 ? <><Trophy size={15} /> Excellent!</> : pct >= 60 ? <><ThumbsUp size={15} /> Good effort!</> : pct >= 40 ? <><Dumbbell size={15} /> Keep going!</> : <><BookMarked size={15} /> More practice needed</>;

  const filtered = questions.filter(q => {
    if (filter === 'correct') return q.student_correct === 1;
    if (filter === 'wrong')   return q.student_correct === 0;
    return true;
  });

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!attempt || !test) return null;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px 80px' }}>

      {/* Score card */}
      <div className="card animate-fadeUp" style={{ overflow: 'hidden', marginBottom: 28 }}>
        <div className="card-ribbon" />
        <div style={{ padding: '28px 28px 24px', textAlign: 'center' }}>
          {timedOut && (
            <div className="alert alert-error" style={{ marginBottom: 16, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={14} /> Time expired — your answers were automatically submitted.
            </div>
          )}
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--green-light)', marginBottom: 10 }}>Test Complete</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 4 }}>{test.title}</h1>

          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 72, fontWeight: 700, color: pctColor(pct), lineHeight: 1, margin: '12px 0 6px' }}>{Math.round(pct)}%</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>{grade}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{score} correct · {wrong} wrong · {total} total questions</div>

          {/* Mini stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            {[
              { label: 'Correct', val: score,   color: 'var(--correct)' },
              { label: 'Wrong',   val: wrong,   color: 'var(--wrong)' },
              { label: 'Skipped', val: skipped, color: 'var(--text-muted)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--off-white)', border: '1px solid rgba(10,61,31,0.08)', borderRadius: 12, padding: '10px 20px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => navigate('/tests')} className="btn btn-primary btn-md" style={{ width: '100%' }}>
            ← Back to All Tests
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all', 'wrong', 'correct'] as const).map(f => (
          <button type="button" key={f} onClick={() => setFilter(f)} style={{
            background: filter===f?'var(--green-deep)':'#fff',
            color: filter===f?'#fff':'var(--text-muted)',
            border: filter===f?'1.5px solid var(--green-deep)':'1.5px solid rgba(10,61,31,0.12)',
            borderRadius: 20, padding: '7px 18px', cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, transition: 'all 0.18s',
          }}>
            {f === 'all' ? `All (${total})` : f === 'wrong' ? <span style={{display:'inline-flex',alignItems:'center',gap:4}}><X size={11}/> Wrong ({wrong + skipped})</span> : <span style={{display:'inline-flex',alignItems:'center',gap:4}}><Check size={11}/> Correct ({score})</span>}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((q, i) => {
          const isCorrect = q.student_correct === 1;
          const isSkipped = q.chosen_index === null;

          return (
            <div key={q.id} className="card" style={{ overflow: 'hidden' }}>
              {/* Top line: green if correct, red if wrong */}
              <div style={{ height: 4, background: isCorrect ? 'var(--correct)' : 'var(--wrong)' }} />
              <div style={{ padding: '16px 20px' }}>

                {/* Q number + result badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Q{q.position ?? i + 1} · {q.subject} · {q.exam_source}</span>
                  <span style={{
                    background: isCorrect?'#f0fdf4':'#fef2f2', color: isCorrect?'var(--correct)':'var(--wrong)',
                    border: `1px solid ${isCorrect?'var(--green-pale)':'#fecaca'}`,
                    borderRadius: 8, padding: '3px 9px', fontSize: 11, fontWeight: 800, flexShrink: 0,
                  }}>{isSkipped ? 'Skipped' : isCorrect ? <span style={{display:'inline-flex',alignItems:'center',gap:3}}><Check size={10}/> Correct</span> : <span style={{display:'inline-flex',alignItems:'center',gap:3}}><X size={10}/> Wrong</span>}</span>
                </div>

                {/* Question text */}
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-deep)', lineHeight: 1.5, marginBottom: 14 }}>
                  {q.question}
                </p>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {q.options.map((opt, oi) => {
                    const isAnswer   = oi === q.answer_index;
                    const isChosen   = oi === q.chosen_index;
                    let bg = 'var(--off-white)'; let border = 'rgba(10,61,31,0.08)'; let color = 'var(--text-dark)';

                    if (isAnswer) { bg = '#f0fdf4'; border = 'var(--correct)'; color = '#15803d'; }
                    else if (isChosen && !isAnswer) { bg = '#fef2f2'; border = '#dc2626'; color = '#b91c1c'; }

                    return (
                      <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10, background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: '10px 13px' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0,
                          background: isAnswer ? 'var(--correct)' : isChosen && !isAnswer ? '#dc2626' : '#fff',
                          color: (isAnswer || (isChosen && !isAnswer)) ? '#fff' : 'var(--green-mid)',
                          border: (!isAnswer && !(isChosen && !isAnswer)) ? '1.5px solid rgba(10,61,31,0.12)' : 'none',
                        }}>
                          {isAnswer ? <Check size={12}/> : isChosen && !isAnswer ? <X size={12}/> : LETTERS[oi]}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color, lineHeight: 1.35, flex: 1 }}>{opt}</span>
                        {isAnswer && <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--correct)', letterSpacing: 1, textTransform: 'uppercase' }}>Correct answer</span>}
                        {isChosen && !isAnswer && <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--wrong)', letterSpacing: 1, textTransform: 'uppercase' }}>Your answer</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div style={{ marginTop: 12, background: 'var(--green-ghost)', border: '1.5px solid var(--green-pale)', borderLeft: '4px solid var(--green-light)', borderRadius: 10, padding: '11px 13px' }}>
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--green-mid)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}><Pin size={10}/> Explanation</div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-mid)', lineHeight: 1.65 }}>{q.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 14, fontWeight: 600 }}>No questions in this filter.</p>
        </div>
      )}

      <button type="button" onClick={() => navigate('/tests')} className="btn btn-secondary btn-md" style={{ width: '100%', marginTop: 24 }}>
        ← Back to All Tests
      </button>
    </div>
  );
}
