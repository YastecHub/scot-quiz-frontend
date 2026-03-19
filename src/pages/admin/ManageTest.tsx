/**
 * Admin: Manage test questions
 * - Left: questions in the test (reorder / remove)
 * - Right: question bank filtered by subject (add to test)
 * - Bottom: inline form to create a brand-new question and add it
 */
import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminAPI, type Question, type Test } from '../../api/client';
import axios from 'axios';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'English', 'Mathematics'];
const LETTERS  = ['A', 'B', 'C', 'D', 'E'];

export default function ManageTest() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const testId     = Number(id);

  const [test,        setTest]        = useState<Test | null>(null);
  const [testQs,      setTestQs]      = useState<Question[]>([]);
  const [bankQs,      setBankQs]      = useState<Question[]>([]);
  const [bankSubject, setBankSubject] = useState('Physics');
  const [bankSearch,  setBankSearch]  = useState('');
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);

  // New question form
  const [nSubject,  setNSubject]  = useState('Physics');
  const [nTopic,    setNTopic]    = useState('');
  const [nQuestion, setNQuestion] = useState('');
  const [nOptions,  setNOptions]  = useState(['', '', '', '']);
  const [nAnswer,   setNAnswer]   = useState(0);
  const [nExpl,     setNExpl]     = useState('');
  const [nSource,   setNSource]   = useState('');
  const [formError, setFormError] = useState('');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminAPI.getTests(),
      adminAPI.getTestQuestions(testId),
      adminAPI.getQuestions(bankSubject),
    ]).then(([tests, tqs, bqs]) => {
      const found = tests.data.find((t: Test) => t.id === testId);
      setTest(found ?? null);
      setTestQs(Array.isArray(tqs.data) ? tqs.data : []);
      setBankQs(Array.isArray(bqs.data) ? bqs.data : []);
    }).finally(() => setLoading(false));
  }, [testId]);

  const refreshBank = async () => {
    const res = await adminAPI.getQuestions(bankSubject);
    setBankQs(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => { refreshBank(); }, [bankSubject]);

  const inTest = (qId: number) => testQs.some(q => q.id === qId);

  const addToTest = async (qId: number) => {
    await adminAPI.addQuestionsToTest(testId, [qId]);
    const res = await adminAPI.getTestQuestions(testId);
    setTestQs(Array.isArray(res.data) ? res.data : []);
  };

  const removeFromTest = async (qId: number) => {
    await adminAPI.removeQuestionFromTest(testId, qId);
    setTestQs(prev => prev.filter(q => q.id !== qId));
  };

  const handleCreateQ = async (e: FormEvent) => {
    e.preventDefault();
    const filled = nOptions.filter(o => o.trim().length > 0);
    if (!nQuestion.trim() || filled.length < 2) { setFormError('Question text and at least 2 options are required.'); return; }
    setSaving(true); setFormError('');
    try {
      const opts = nOptions.filter(o => o.trim());
      const res = await adminAPI.createQuestion({ subject: nSubject, topic: nTopic, question: nQuestion, options: opts, answer_index: nAnswer, explanation: nExpl, exam_source: nSource });
      // Add to test automatically
      await adminAPI.addQuestionsToTest(testId, [res.data.id]);
      const [tqRes, bqRes] = await Promise.all([adminAPI.getTestQuestions(testId), adminAPI.getQuestions(bankSubject)]);
      setTestQs(Array.isArray(tqRes.data) ? tqRes.data : []); 
      setBankQs(Array.isArray(bqRes.data) ? bqRes.data : []);
      // Reset form
      setNQuestion(''); setNOptions(['','','','']); setNAnswer(0); setNExpl(''); setNSource(''); setNTopic('');
      setShowForm(false);
    } catch (err) {
      if (axios.isAxiosError(err)) setFormError(err.response?.data?.error ?? 'Failed to create question.');
    } finally { setSaving(false); }
  };

  const filteredBank = bankQs.filter(q => {
    if (bankSearch.trim()) return q.question.toLowerCase().includes(bankSearch.toLowerCase());
    return true;
  });

  if (loading) return <div className="spinner" style={{ marginTop: 60 }} />;
  if (!test)   return <div style={{ padding: 40, textAlign: 'center', color: 'var(--wrong)' }}>Test not found.</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Header */}
      <button type="button" onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 20, padding: 0 }}>← Back to Dashboard</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <div className="section-badge" style={{ marginBottom: 8 }}>⚙ Managing Test</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 4 }}>{test.title}</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            {test.subject ?? 'Mixed'} · {test.time_limit} min · {testQs.length} question{testQs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to={`/admin/tests/${testId}/results`} className="btn btn-secondary btn-sm">View Results</Link>
          <button onClick={() => setShowForm(f => !f)} className="btn btn-primary btn-sm">
            {showForm ? '✕ Cancel' : '+ New Question'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="manage-grid">

        {/* ── LEFT: Questions in this test ── */}
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--green-deep)', marginBottom: 12, letterSpacing: 0.3 }}>
            Questions in This Test ({testQs.length})
          </h2>
          {testQs.length === 0 && (
            <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No questions yet. Add from the bank →</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {testQs.map((q, i) => (
              <div key={q.id} className="card" style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--green-ghost)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--green-mid)', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.4, marginBottom: 4 }}>{q.question}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: 'var(--green-ghost)', borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: 'var(--green-mid)' }}>{q.subject}</span>
                    {q.exam_source && <span style={{ background: 'var(--off-white)', borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>{q.exam_source}</span>}
                  </div>
                </div>
                <button onClick={() => removeFromTest(q.id)} style={{ background: '#fef2f2', color: 'var(--wrong)', border: '1px solid #fecaca', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Question Bank ── */}
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--green-deep)', marginBottom: 12, letterSpacing: 0.3 }}>Question Bank</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setBankSubject(s)} style={{
                background: bankSubject===s?'var(--green-deep)':'#fff', color: bankSubject===s?'#fff':'var(--text-muted)',
                border: bankSubject===s?'1.5px solid var(--green-deep)':'1.5px solid rgba(10,61,31,0.12)',
                borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'all 0.18s',
              }}>{s}</button>
            ))}
          </div>
          <input className="form-input" placeholder="Search questions…" value={bankSearch} onChange={e => setBankSearch(e.target.value)} style={{ marginBottom: 12 }} />
          <div style={{ maxHeight: 480, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredBank.map(q => {
              const added = inTest(q.id);
              return (
                <div key={q.id} className="card" style={{ padding: '13px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', opacity: added ? 0.55 : 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.4, marginBottom: 4 }}>{q.question}</p>
                    <span style={{ background: 'var(--off-white)', borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>{q.topic || q.subject}</span>
                  </div>
                  <button
                    onClick={() => !added && addToTest(q.id)}
                    disabled={added}
                    style={{
                      background: added ? 'var(--green-ghost)' : 'var(--green-deep)',
                      color: added ? 'var(--green-mid)' : '#fff',
                      border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700,
                      cursor: added ? 'default' : 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                    }}>{added ? '✓ Added' : '+ Add'}</button>
                </div>
              );
            })}
            {filteredBank.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No questions found.</p>}
          </div>
        </div>
      </div>

      {/* ── NEW QUESTION FORM ── */}
      {showForm && (
        <div className="card" style={{ marginTop: 32, overflow: 'hidden' }}>
          <div className="card-ribbon" />
          <form onSubmit={handleCreateQ} style={{ padding: '24px 24px 28px' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 20 }}>Create New Question</h3>
            {formError && <div className="alert alert-error" style={{ marginBottom: 16 }}>{formError}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-input" value={nSubject} onChange={e => setNSubject(e.target.value)}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Topic (slug)</label>
                <input className="form-input" placeholder="e.g. atomic-quantum" value={nTopic} onChange={e => setNTopic(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Exam Source</label>
                <input className="form-input" placeholder="e.g. JAMB 2022" value={nSource} onChange={e => setNSource(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Question Text *</label>
              <textarea className="form-input" rows={2} value={nQuestion} onChange={e => setNQuestion(e.target.value)} placeholder="Enter the question…" style={{ resize: 'vertical', fontFamily: 'inherit' }} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {nOptions.map((opt, i) => (
                <div key={i} className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="radio" name="answer" checked={nAnswer === i} onChange={() => setNAnswer(i)} style={{ accentColor: 'var(--green-light)' }} />
                    Option {LETTERS[i]} {nAnswer === i && <span style={{ color: 'var(--correct)', fontSize: 10, fontWeight: 800 }}>✓ CORRECT</span>}
                  </label>
                  <input className="form-input" value={opt} onChange={e => { const o=[...nOptions]; o[i]=e.target.value; setNOptions(o); }} placeholder={`Option ${LETTERS[i]}…`} />
                </div>
              ))}
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Explanation (shown after test)</label>
              <textarea className="form-input" rows={2} value={nExpl} onChange={e => setNExpl(e.target.value)} placeholder="Explain why the correct answer is correct…" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary btn-md" style={{ flex: 0.4 }}>Cancel</button>
              <button type="submit" disabled={saving} className="btn btn-primary btn-md" style={{ flex: 1, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save Question & Add to Test'}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`@media(max-width:900px){.manage-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
