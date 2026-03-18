import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicsAPI, type Topic } from '../api/client';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'English'];

const SUBJECT_EMOJIS: Record<string, string> = {
  Physics: '⚛️', Chemistry: '🧪', Biology: '🧬', English: '📖',
};

export default function Topics() {
  const navigate = useNavigate();
  const [activeSubject, setActiveSubject] = useState('Physics');
  const [topicsBySubject, setTopicsBySubject] = useState<Record<string, Topic[]>>({});
  const [loading, setLoading] = useState(false);
  const loadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (loadedRef.current.has(activeSubject)) return;
    loadedRef.current.add(activeSubject);
    setLoading(true);
    topicsAPI.getBySubject(activeSubject)
      .then(res => setTopicsBySubject(prev => ({ ...prev, [activeSubject]: res.data })))
      .catch(() => { loadedRef.current.delete(activeSubject); })
      .finally(() => setLoading(false));
  }, [activeSubject]);

  const topics = topicsBySubject[activeSubject] || [];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div className="section-badge animate-fadeUp" style={{ marginBottom: 16 }}>✦ Topic Library</div>
        <h1 className="animate-fadeUp delay-1" style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(28px,5vw,40px)', fontWeight: 700, color: 'var(--green-deep)', marginBottom: 12 }}>
          Drill Any Topic You Want
        </h1>
        <p className="animate-fadeUp delay-2" style={{ fontSize: 15, color: 'var(--text-mid)', fontWeight: 500, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
          Choose a subject, then pick a specific topic to practise. Perfect for targeting your weak areas.
        </p>
      </div>

      {/* Subject Tabs */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
        {SUBJECTS.map(sub => (
          <button
            key={sub}
            onClick={() => setActiveSubject(sub)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: activeSubject === sub ? 'var(--green-deep)' : '#fff',
              color: activeSubject === sub ? '#fff' : 'var(--text-muted)',
              border: activeSubject === sub ? '1.5px solid var(--green-deep)' : '1.5px solid rgba(10,61,31,0.12)',
              borderRadius: 20, padding: '9px 20px', cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, fontWeight: 700,
              letterSpacing: 0.5, transition: 'all 0.2s',
              boxShadow: activeSubject === sub ? '0 4px 12px rgba(10,61,31,0.2)' : '0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            <span>{SUBJECT_EMOJIS[sub]}</span>
            {sub}
          </button>
        ))}
      </div>

      {/* Topics grid */}
      {loading && <div className="spinner" />}

      {!loading && topics.length > 0 && (
        <>
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{SUBJECT_EMOJIS[activeSubject]}</span>
            <div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: 'var(--green-deep)', lineHeight: 1 }}>{activeSubject}</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 3 }}>{topics.length} topics available</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {topics.map(topic => (
              <div
                key={topic.id}
                className="card"
                style={{ padding: '22px 20px', cursor: 'pointer', transition: 'all 0.22s ease', position: 'relative', overflow: 'hidden' }}
                onClick={() => navigate(`/quiz?subject=${activeSubject}&topic=${topic.slug}`)}
                onMouseEnter={e => { const el = e.currentTarget; el.style.transform='translateY(-4px)'; el.style.boxShadow='0 12px 36px rgba(10,61,31,0.1)'; el.style.borderColor='rgba(10,61,31,0.15)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.transform='translateY(0)'; el.style.boxShadow='var(--shadow-md)'; el.style.borderColor='rgba(10,61,31,0.08)'; }}
              >
                {/* top accent bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--green-deep), var(--green-light))', borderRadius: '20px 20px 0 0' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--green-deep)', marginBottom: 6, lineHeight: 1.3 }}>
                      {topic.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ background: 'var(--green-ghost)', border: '1px solid var(--green-pale)', borderRadius: 8, padding: '3px 9px', fontSize: 11, fontWeight: 700, color: 'var(--green-mid)' }}>
                        {topic.questionCount ?? '?'} Qs
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{activeSubject}</span>
                    </div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--green-ghost)', border: '1.5px solid var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {SUBJECT_EMOJIS[activeSubject]}
                  </div>
                </div>

                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--green-mid)' }}>
                  Start practising →
                </div>
              </div>
            ))}

            {/* Mixed practice card */}
            <div
              className="card"
              style={{ padding: '22px 20px', cursor: 'pointer', transition: 'all 0.22s ease', background: 'var(--green-deep)', border: '1px solid var(--green-deep)' }}
              onClick={() => navigate(`/quiz?subject=${activeSubject}`)}
              onMouseEnter={e => { const el = e.currentTarget; el.style.transform='translateY(-4px)'; el.style.background='var(--green-mid)'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.transform='translateY(0)'; el.style.background='var(--green-deep)'; }}
            >
              <div style={{ fontSize: 22, marginBottom: 12 }}>🔀</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Mixed Practice</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginBottom: 16, lineHeight: 1.5 }}>
                All topics shuffled together — the real exam experience.
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                Start all topics →
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && topics.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>No topics found for {activeSubject}.<br />Make sure the backend is running.</p>
        </div>
      )}
    </div>
  );
}
