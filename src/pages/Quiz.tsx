import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { quizAPI, scoresAPI, type Question } from '../api/client';
import { Pin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import ScoreStrip from '../components/ScoreStrip';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'English'];
const LETTERS  = ['A', 'B', 'C', 'D'];

type AnswerState = 'unanswered' | 'correct' | 'wrong';

export default function Quiz() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  const [subject,   setSubject]   = useState(params.get('subject') || 'Physics');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx,       setIdx]       = useState(0);
  const [answered,  setAnswered]  = useState(false);
  const [chosen,    setChosen]    = useState<number | null>(null);
  const [correct,   setCorrect]   = useState(0);
  const [wrong,     setWrong]     = useState(0);
  const [done,      setDone]      = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [cardKey,   setCardKey]   = useState(0); // triggers re-animation

  const loadQuestions = useCallback(async (sub: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await quizAPI.getQuestions(sub);
      setQuestions(res.data);
      setIdx(0);
      setAnswered(false);
      setChosen(null);
      setCorrect(0);
      setWrong(0);
      setDone(0);
      setCardKey(k => k + 1);
    } catch {
      setError(`Could not load ${sub} questions. Make sure the backend is running.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQuestions(subject); }, [subject, loadQuestions]);

  const switchSubject = (sub: string) => {
    setSubject(sub);
    setParams({ subject: sub });
  };

  const handleSelect = (optIdx: number) => {
    if (answered) return;
    setAnswered(true);
    setChosen(optIdx);
    const isCorrect = optIdx === questions[idx].answer_index;
    const newCorrect = isCorrect ? correct + 1 : correct;
    const newWrong   = isCorrect ? wrong : wrong + 1;
    setCorrect(newCorrect);
    setWrong(newWrong);
    setDone(done + 1);
  };

  const nextQuestion = () => {
    if (idx + 1 >= questions.length) {
      // Save score if logged in
      if (user) {
        scoresAPI.save(subject, undefined, correct, done).catch(() => {});
      }
      setIdx(questions.length); // triggers complete screen
    } else {
      setIdx(i => i + 1);
      setAnswered(false);
      setChosen(null);
      setCardKey(k => k + 1);
    }
  };

  const restart = () => loadQuestions(subject);

  const optionState = (i: number): AnswerState => {
    if (!answered) return 'unanswered';
    if (i === questions[idx]?.answer_index) return 'correct';
    if (i === chosen) return 'wrong';
    return 'unanswered';
  };

  const optBg = (state: AnswerState) => ({
    unanswered: 'var(--off-white)',
    correct: '#f0fdf4',
    wrong: '#fef2f2',
  }[state]);

  const optBorder = (state: AnswerState) => ({
    unanswered: 'rgba(10,61,31,0.08)',
    correct: 'var(--correct)',
    wrong: '#dc2626',
  }[state]);

  const letBg = (state: AnswerState) => ({
    unanswered: '#fff',
    correct: 'var(--correct)',
    wrong: '#dc2626',
  }[state]);

  const letColor = (state: AnswerState) => state === 'unanswered' ? 'var(--green-mid)' : '#fff';
  const txtColor = (state: AnswerState) => ({ unanswered: 'var(--text-dark)', correct: '#15803d', wrong: '#b91c1c' }[state]);

  // ── COMPLETE SCREEN ───────────────────────────────
  if (!loading && idx >= questions.length && questions.length > 0) {
    const pct = done > 0 ? Math.round((correct / done) * 100) : 0;
    const grade = pct >= 70 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep practising!';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px 64px' }}>
        <div style={{ width: '100%', maxWidth: 500, marginTop: 32 }}>
          <div className="card animate-fadeUp" style={{ overflow: 'hidden' }}>
            <div className="card-ribbon" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px 0' }}>
              <div className="subject-pill"><div className="subject-dot" /><span className="subject-name">{subject}</span></div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Complete!</span>
            </div>
            <div style={{ textAlign: 'center', padding: '32px 24px 30px' }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--green-light)', marginBottom: 10 }}>Session Complete</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 72, fontWeight: 700, color: 'var(--green-deep)', lineHeight: 1, margin: '10px 0' }}>{pct}%</div>
              <div style={{ fontSize: 14, color: 'var(--text-mid)', fontWeight: 600, marginBottom: 6 }}>{grade}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 28 }}>{correct} correct · {wrong} wrong · out of {done} questions</div>
              {!user && (
                <div className="alert alert-success" style={{ marginBottom: 20, textAlign: 'left' }}>
                  <strong>Save your progress!</strong><br />
                  <Link to="/register" style={{ color: 'var(--green-mid)', fontWeight: 700 }}>Create a free account</Link> to track your scores over time.
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={restart} className="btn btn-primary btn-md" style={{ flex: 1, padding: 13, fontSize: 13 }}>
                  Try Again
                </button>
                <Link to="/topics" className="btn btn-secondary btn-md" style={{ flex: 1, padding: 13, fontSize: 13 }}>
                  Browse Topics
                </Link>
              </div>
            </div>
          </div>
          <ScoreStrip done={done} correct={correct} wrong={wrong} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 64px' }}>

      {/* Subject Tabs */}
      <div style={{ width: '100%', maxWidth: 500, display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {SUBJECTS.map(sub => (
          <button
            key={sub}
            onClick={() => switchSubject(sub)}
            style={{
              background: subject === sub ? 'var(--green-deep)' : '#fff',
              color: subject === sub ? '#fff' : 'var(--text-muted)',
              border: subject === sub ? '1.5px solid var(--green-deep)' : '1.5px solid rgba(10,61,31,0.12)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
              padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
              boxShadow: subject === sub ? '0 4px 12px rgba(10,61,31,0.25)' : '0 1px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
            }}
          >
            {sub}
          </button>
        ))}
      </div>

      {loading && <div className="spinner" />}
      {error && <div className="alert alert-error" style={{ maxWidth: 500, width: '100%' }}>{error}</div>}

      {!loading && !error && questions.length > 0 && idx < questions.length && (
        <>
          <ProgressBar subject={subject} current={idx} total={questions.length} />

          {/* Quiz Card */}
          <div style={{ width: '100%', maxWidth: 500 }}>
            <div
              key={cardKey}
              className="card"
              style={{ overflow: 'hidden', animation: 'cardIn 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}
            >
              <div className="card-ribbon" />

              {/* Meta row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px 0' }}>
                <div className="subject-pill">
                  <div className="subject-dot" />
                  <span className="subject-name">{subject}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Q {idx + 1} / {questions.length}</span>
              </div>

              {/* Question box */}
              <div style={{ margin: '16px 20px', background: 'linear-gradient(135deg, var(--green-deep), var(--green-mid))', borderRadius: 16, padding: '22px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Fraunces, serif', fontSize: 80, color: 'rgba(255,255,255,0.05)', lineHeight: 1, pointerEvents: 'none' }}>?</div>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>Question</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.55, position: 'relative', zIndex: 1, maxWidth: '90%' }}>
                  {questions[idx].question}
                </div>
              </div>

              {/* Options */}
              <div style={{ padding: '4px 20px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {questions[idx].options.map((opt, i) => {
                  const state = optionState(i);
                  return (
                    <div
                      key={i}
                      onClick={() => handleSelect(i)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 13,
                        background: optBg(state),
                        border: `1.5px solid ${optBorder(state)}`,
                        borderRadius: 14, padding: '13px 15px',
                        cursor: answered ? 'default' : 'pointer',
                        transition: 'all 0.18s ease',
                        boxShadow: state === 'correct' ? '0 3px 12px rgba(22,163,74,0.12)' : 'none',
                      }}
                      onMouseEnter={e => { if (!answered) { const el = e.currentTarget; el.style.background='var(--green-ghost)'; el.style.borderColor='var(--green-light)'; el.style.transform='translateX(5px)'; } }}
                      onMouseLeave={e => { if (!answered) { const el = e.currentTarget; el.style.background='var(--off-white)'; el.style.borderColor='rgba(10,61,31,0.08)'; el.style.transform='translateX(0)'; } }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: letBg(state),
                        border: state === 'unanswered' ? '1.5px solid rgba(10,61,31,0.12)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, color: letColor(state),
                        flexShrink: 0, transition: 'all 0.18s',
                      }}>
                        {LETTERS[i]}
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: txtColor(state), lineHeight: 1.35 }}>
                        {opt}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {answered && (
                <div style={{ margin: '0 20px 16px', background: 'var(--green-ghost)', border: '1.5px solid var(--green-pale)', borderLeft: '4px solid var(--green-light)', borderRadius: 12, padding: '13px 15px', animation: 'fadeSlide 0.3s ease' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--green-mid)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}><Pin size={10} /> Explanation</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-mid)', lineHeight: 1.65 }}>
                    {questions[idx].explanation}
                    {questions[idx].exam_source && (
                      <span style={{ display: 'inline-block', marginLeft: 6, background: 'var(--green-pale)', borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: 'var(--green-mid)' }}>
                        {questions[idx].exam_source}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer buttons */}
              <div style={{ padding: '4px 20px 22px', display: 'flex', gap: 10 }}>
                <button type="button" onClick={nextQuestion} className="btn btn-ghost btn-md" style={{ flex: 0.5, padding: 13, fontSize: 13 }}>
                  Skip
                </button>
                {answered && (
                  <button type="button" onClick={nextQuestion} className="btn btn-primary btn-md" style={{ flex: 1, padding: 13, fontSize: 13 }}>
                    {idx + 1 >= questions.length ? 'Finish' : 'Next →'}
                  </button>
                )}
              </div>
            </div>

            <ScoreStrip done={done} correct={correct} wrong={wrong} />
          </div>
        </>
      )}

      {/* Exam badge footer */}
      <div style={{ marginTop: 22, textAlign: 'center' }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>
          <span style={{ color: 'var(--green-mid)', fontWeight: 800 }}>SCOT Free</span> · Empowering Every Nigerian Student · 2026
        </p>
      </div>
    </div>
  );
}
