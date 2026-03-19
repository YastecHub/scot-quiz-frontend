import { useState, useEffect } from 'react';
import { resourcesAPI, topicsAPI, type Resource, type Topic } from '../api/client';
import { Inbox, BookOpen, FileText } from 'lucide-react';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'English', 'Mathematics'];

export default function Resources() {
  const [subject, setSubject]     = useState('Physics');
  const [topics, setTopics]       = useState<Topic[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      topicsAPI.getBySubject(subject),
      resourcesAPI.getAll(subject),
    ])
      .then(([topicsRes, resourcesRes]) => {
        setTopics(Array.isArray(topicsRes.data) ? topicsRes.data : []);
        setResources(Array.isArray(resourcesRes.data) ? resourcesRes.data : []);
      })
      .catch(() => setError('Could not load resources. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, [subject]);

  const getResource = (topicSlug: string, type: 'note' | 'pq'): Resource | null =>
    resources.find(r => r.topic === topicSlug && r.resource_type === type) ?? null;

  const handleOpen = (r: Resource) => window.open(r.file_url, '_blank');

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div className="section-badge animate-fadeUp" style={{ marginBottom: 16 }}>✦ Study Materials</div>
        <h1 className="animate-fadeUp delay-1" style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(26px,5vw,38px)', fontWeight: 700, color: 'var(--green-deep)', marginBottom: 10 }}>
          Notes &amp; Past Questions
        </h1>
        <p className="animate-fadeUp delay-2" style={{ fontSize: 14, color: 'var(--text-mid)', fontWeight: 500, lineHeight: 1.7, maxWidth: 460, margin: '0 auto' }}>
          Pick a subject, then download the SCOT Note or Past Questions for any topic all free.
        </p>
      </div>

      {/* Subject tabs */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
        {SUBJECTS.map(sub => (
          <button
            type="button"
            key={sub}
            onClick={() => setSubject(sub)}
            style={{
              background: subject === sub ? 'var(--green-deep)' : '#fff',
              color: subject === sub ? '#fff' : 'var(--text-muted)',
              border: subject === sub ? '1.5px solid var(--green-deep)' : '1.5px solid rgba(10,61,31,0.12)',
              borderRadius: 20, padding: '8px 20px', cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, fontWeight: 700,
              letterSpacing: 0.5, transition: 'all 0.2s',
              boxShadow: subject === sub ? '0 4px 12px rgba(10,61,31,0.2)' : '0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            {sub}
          </button>
        ))}
      </div>

      {loading && <div className="spinner" />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && topics.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ marginBottom: 12 }}><Inbox size={40} color="var(--text-muted)" /></div>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No topics listed for {subject} yet.</p>
          <p style={{ fontSize: 13 }}>Check back soon!</p>
        </div>
      )}

      {!loading && !error && topics.length > 0 && (
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1.5px solid rgba(10,61,31,0.1)', boxShadow: '0 4px 24px rgba(10,61,31,0.07)' }}>

          {/* Table header */}
          <div style={{ background: 'var(--green-deep)', padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
              Topic
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
              Materials
            </span>
          </div>

          {/* Topic rows */}
          {topics.map((t, i) => {
            const note = getResource(t.slug, 'note');
            const pq   = getResource(t.slug, 'pq');
            const even = i % 2 === 0;
            return (
              <div
                key={t.id}
                style={{
                  background: even ? '#fff' : 'rgba(10,61,31,0.03)',
                  padding: '15px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  borderBottom: i < topics.length - 1 ? '1px solid rgba(10,61,31,0.07)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(10,61,31,0.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = even ? '#fff' : 'rgba(10,61,31,0.03)'; }}
              >
                {/* Row number + topic name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    background: 'var(--green-ghost)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--green-mid)',
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--green-deep)', lineHeight: 1.35 }}>
                    {t.name}
                  </span>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => note && handleOpen(note)}
                    disabled={!note}
                    title={note ? `Download: ${note.title}` : 'Not uploaded yet'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: note ? 'var(--green-deep)' : 'transparent',
                      color: note ? '#fff' : 'rgba(10,61,31,0.3)',
                      border: note ? 'none' : '1.5px dashed rgba(10,61,31,0.2)',
                      borderRadius: 8, padding: '7px 14px',
                      cursor: note ? 'pointer' : 'not-allowed',
                      fontSize: 11, fontWeight: 800, letterSpacing: 0.3,
                      transition: 'all 0.18s', whiteSpace: 'nowrap',
                    }}
                  >
                    <BookOpen size={12} /> SCOT Note
                  </button>

                  <button
                    type="button"
                    onClick={() => pq && handleOpen(pq)}
                    disabled={!pq}
                    title={pq ? `Download: ${pq.title}` : 'Not uploaded yet'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: pq ? 'var(--accent)' : 'transparent',
                      color: pq ? 'var(--green-deep)' : 'rgba(10,61,31,0.3)',
                      border: pq ? '1.5px solid rgba(211,255,124,0.6)' : '1.5px dashed rgba(10,61,31,0.2)',
                      borderRadius: 8, padding: '7px 14px',
                      cursor: pq ? 'pointer' : 'not-allowed',
                      fontSize: 11, fontWeight: 800, letterSpacing: 0.3,
                      transition: 'all 0.18s', whiteSpace: 'nowrap',
                    }}
                  >
                    <FileText size={12} /> Past Q's
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
