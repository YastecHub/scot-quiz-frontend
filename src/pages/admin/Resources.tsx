/**
 * Admin: Manage uploaded SCOT Notes and Past Questions
 * - List all resources grouped by subject/topic
 * - Upload new PDFs with subject, topic, type (note/pq)
 * - Delete existing resources
 */
import { useState, useEffect, useRef, type FormEvent } from 'react';
import { adminAPI, type Resource } from '../../api/client';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'English', 'Mathematics'];
const TOPICS: Record<string, string[]> = {
  Physics:     ['atomic-quantum', 'waves-optics', 'electromagnetism', 'mechanics'],
  Chemistry:   [
    'separation-purification', 'kinetic-theory-gas-laws', 'air-water-solubility',
    'acids-bases-salts', 'electrolysis-energy', 'chemical-equilibria',
    'metals-compounds', 'organic-chemistry',
  ],
  Biology:     ['cell-biology', 'genetics', 'human-systems', 'ecology-nutrition'],
  English:     ['figures-of-speech', 'grammar', 'vocabulary', 'comprehension'],
  Mathematics: ['algebra', 'trigonometry', 'calculus', 'statistics', 'geometry'],
};

function prettifySlug(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function AdminResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filterSub, setFilterSub] = useState('All');
  const [showForm, setShowForm]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [fSubject, setFSubject]       = useState('Physics');
  const [fTopic, setFTopic]           = useState('atomic-quantum');
  const [fCustomTopic, setFCustomTopic] = useState('');
  const [fType, setFType]             = useState<'note' | 'pq'>('note');
  const [fTitle, setFTitle]           = useState('');
  const [fDesc, setFDesc]             = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const loadResources = async () => {
    const res = await adminAPI.getResources();
    setResources(res.data);
  };

  useEffect(() => {
    loadResources().finally(() => setLoading(false));
  }, []);

  // Reset topic when subject changes
  useEffect(() => {
    setFTopic(TOPICS[fSubject]?.[0] ?? '');
  }, [fSubject]);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    const file = fileRef.current?.files?.[0];
    if (!file) { setFormError('Please select a PDF file.'); return; }
    const topic = fCustomTopic.trim() || fTopic;
    if (!topic) { setFormError('Please enter a topic.'); return; }
    if (!fTitle.trim()) { setFormError('Title is required.'); return; }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', fSubject);
    formData.append('topic', topic);
    formData.append('resource_type', fType);
    formData.append('title', fTitle.trim());
    formData.append('description', fDesc.trim());

    try {
      await adminAPI.uploadResource(formData);
      await loadResources();
      setFTitle(''); setFDesc(''); setFCustomTopic('');
      if (fileRef.current) fileRef.current.value = '';
      setShowForm(false);
      setSuccessMsg('File uploaded successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setFormError(err.response?.data?.error ?? 'Upload failed. Please try again.');
    } finally { setUploading(false); }
  };

  const handleDelete = async (r: Resource) => {
    if (!confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    await adminAPI.deleteResource(r.id);
    setResources(prev => prev.filter(x => x.id !== r.id));
  };

  const filtered = filterSub === 'All' ? resources : resources.filter(r => r.subject === filterSub);

  // Group by subject → topic for display
  const grouped: Record<string, Record<string, Resource[]>> = {};
  for (const r of filtered) {
    if (!grouped[r.subject]) grouped[r.subject] = {};
    const key = r.topic || 'other';
    if (!grouped[r.subject][key]) grouped[r.subject][key] = [];
    grouped[r.subject][key].push(r);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <div className="section-badge" style={{ marginBottom: 8 }}>📁 Resources</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 4 }}>
            Manage Study Materials
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            Upload SCOT Notes and Past Question PDFs for each topic.
          </p>
        </div>
        <button type="button" onClick={() => { setShowForm(f => !f); setFormError(''); }} className="btn btn-primary btn-sm">
          {showForm ? '✕ Cancel' : '+ Upload Resource'}
        </button>
      </div>

      {successMsg && (
        <div className="alert" style={{ background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.3)', color: 'var(--correct)', marginBottom: 20, padding: '12px 18px', borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Upload Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 28, overflow: 'hidden' }}>
          <div className="card-ribbon" />
          <form onSubmit={handleUpload} style={{ padding: '24px 24px 28px' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 20 }}>
              Upload Study Material
            </h3>
            {formError && <div className="alert alert-error" style={{ marginBottom: 16 }}>{formError}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-input" aria-label="Subject" value={fSubject} onChange={e => setFSubject(e.target.value)}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select className="form-input" aria-label="Resource type" value={fType} onChange={e => setFType(e.target.value as 'note' | 'pq')}>
                  <option value="note">SCOT Note</option>
                  <option value="pq">Past Questions</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Topic (choose existing)</label>
                <select className="form-input" aria-label="Topic" value={fTopic} onChange={e => setFTopic(e.target.value)}>
                  {(TOPICS[fSubject] ?? []).map(t => <option key={t} value={t}>{prettifySlug(t)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Or enter custom topic slug</label>
                <input className="form-input" placeholder="e.g. nuclear-physics" value={fCustomTopic} onChange={e => setFCustomTopic(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="e.g. Atomic & Quantum Physics SCOT Note" value={fTitle} onChange={e => setFTitle(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Description (optional)</label>
              <input className="form-input" placeholder="Brief description of what's covered…" value={fDesc} onChange={e => setFDesc(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">PDF File * (max 50 MB)</label>
              <input ref={fileRef} type="file" accept=".pdf,application/pdf" className="form-input" style={{ cursor: 'pointer' }} title="Select a PDF file to upload" required />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary btn-md" style={{ flex: 0.4 }}>Cancel</button>
              <button type="submit" disabled={uploading} className="btn btn-primary btn-md" style={{ flex: 1, opacity: uploading ? 0.7 : 1 }}>
                {uploading ? 'Uploading…' : 'Upload & Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {['All', ...SUBJECTS].map(s => (
          <button type="button" key={s} onClick={() => setFilterSub(s)} style={{
            background: filterSub === s ? 'var(--green-deep)' : '#fff',
            color: filterSub === s ? '#fff' : 'var(--text-muted)',
            border: filterSub === s ? '1.5px solid var(--green-deep)' : '1.5px solid rgba(10,61,31,0.12)',
            borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'all 0.18s',
          }}>{s}</button>
        ))}
      </div>

      {loading && <div className="spinner" />}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>No resources uploaded yet.</p>
        </div>
      )}

      {/* Resource list grouped */}
      {!loading && Object.entries(grouped).map(([subj, topicMap]) => (
        <div key={subj} style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--green-deep)', letterSpacing: 0.5, marginBottom: 12, textTransform: 'uppercase' }}>
            {subj}
          </div>
          {Object.entries(topicMap).map(([topic, items]) => (
            <div key={topic} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 0.5, marginBottom: 6, paddingLeft: 4 }}>
                {prettifySlug(topic)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(r => (
                  <div key={r.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: r.resource_type === 'note' ? 'var(--green-ghost)' : 'rgba(211,255,124,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>
                      {r.resource_type === 'note' ? '📖' : '📝'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 2 }}>{r.title}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 800, borderRadius: 6, padding: '2px 7px',
                          background: r.resource_type === 'note' ? 'var(--green-ghost)' : 'rgba(211,255,124,0.25)',
                          color: r.resource_type === 'note' ? 'var(--green-mid)' : 'var(--green-deep)',
                          border: r.resource_type === 'note' ? '1px solid var(--green-pale)' : '1px solid rgba(211,255,124,0.5)',
                          textTransform: 'uppercase',
                        }}>
                          {r.resource_type === 'note' ? 'SCOT Note' : 'Past Questions'}
                        </span>
                        {r.description && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{r.description}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={{
                        background: 'var(--green-ghost)', color: 'var(--green-mid)', border: '1px solid var(--green-pale)',
                        borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, textDecoration: 'none',
                      }}>
                        View
                      </a>
                      <button type="button" onClick={() => handleDelete(r)} style={{
                        background: '#fef2f2', color: 'var(--wrong)', border: '1px solid #fecaca',
                        borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
