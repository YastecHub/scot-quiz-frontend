import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminAPI, type Test, type AttemptResult } from '../../api/client';
import { BarChart2, Medal, Download, Inbox } from 'lucide-react';

export default function TestResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [test,    setTest]    = useState<Test | null>(null);
  const [results, setResults] = useState<AttemptResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    adminAPI.getResults(Number(id))
      .then(res => { 
        setTest(res.data.test); 
        setResults(Array.isArray(res.data.results) ? res.data.results : []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleExport = async () => {
    if (!test) return;
    setExporting(true);
    try {
      const res = await adminAPI.exportPdf(Number(id));
      const url  = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href  = url;
      link.download = `${test.title.replace(/[^a-z0-9]/gi,'_')}_results.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally { setExporting(false); }
  };

  const medal = (rank: number) =>
    rank === 0 ? <Medal size={20} color="#f59e0b" /> :
    rank === 1 ? <Medal size={20} color="#94a3b8" /> :
    rank === 2 ? <Medal size={20} color="#cd7c3a" /> :
    `${rank + 1}`;
  const pctColor = (p: number) => p >= 70 ? 'var(--correct)' : p >= 50 ? '#ca8a04' : 'var(--wrong)';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
      <button type="button" onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 20, padding: 0 }}>
        ← Back to Dashboard
      </button>

      {loading && <div className="spinner" />}

      {!loading && test && (
        <>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}>
            <div>
              <div className="section-badge" style={{ marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}><BarChart2 size={12} /> Results</div>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 6 }}>{test.title}</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                {test.subject ?? 'Mixed'} · {test.time_limit} min · {results.length} submission{results.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to={`/admin/tests/${id}/manage`} className="btn btn-secondary btn-sm">Edit Test</Link>
              <button type="button" onClick={handleExport} disabled={exporting} className="btn btn-primary btn-sm" style={{ opacity: exporting ? 0.7 : 1 }}>
                {exporting ? 'Generating…' : <span style={{display:'inline-flex',alignItems:'center',gap:6}}><Download size={13}/> Export PDF</span>}
              </button>
            </div>
          </div>

          {/* Summary cards */}
          {results.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }} className="res-stats">
              {[
                { label: 'Participants', value: results.length, color: 'var(--green-deep)' },
                { label: 'Avg Score', value: `${Math.round(results.reduce((s,r)=>s+(r.pct??0),0)/results.length)}%`, color: 'var(--green-bright)' },
                { label: 'Highest', value: `${Math.round(results[0]?.pct ?? 0)}%`, color: 'var(--correct)' },
                { label: 'Lowest',  value: `${Math.round(results[results.length-1]?.pct ?? 0)}%`, color: 'var(--wrong)' },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Results table */}
          {results.length === 0 ? (
            <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ marginBottom: 14 }}><Inbox size={40} color="var(--text-muted)" /></div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 8 }}>No submissions yet</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Students have not completed this test yet.</p>
            </div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-ribbon" />
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--green-ghost)' }}>
                      {['Rank', 'Student', 'Email', 'Score', 'Percentage', 'Status', 'Submitted'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--green-mid)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                      const pct = r.pct ?? 0;
                      return (
                        <tr key={r.id} style={{ borderTop: '1px solid rgba(10,61,31,0.06)', background: i%2===0?'#fff':'var(--off-white)' }}>
                          <td style={{ padding: '13px 16px', fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700 }}>{medal(i)}</td>
                          <td style={{ padding: '13px 16px', fontWeight: 700, color: 'var(--green-deep)', fontSize: 14 }}>{r.name}</td>
                          <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{r.email}</td>
                          <td style={{ padding: '13px 16px', fontWeight: 700, color: 'var(--text-mid)', fontSize: 14 }}>{r.score ?? 0}/{r.total ?? 0}</td>
                          <td style={{ padding: '13px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 6, background: 'rgba(10,61,31,0.08)', borderRadius: 3, minWidth: 60 }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: pctColor(pct), borderRadius: 3, transition: 'width 0.6s' }} />
                              </div>
                              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 700, color: pctColor(pct), minWidth: 42 }}>{Math.round(pct)}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '13px 16px' }}>
                            <span style={{
                              background: r.status==='completed'?'#f0fdf4':'#fef2f2',
                              color: r.status==='completed'?'var(--correct)':'var(--wrong)',
                              border: `1px solid ${r.status==='completed'?'var(--green-pale)':'#fecaca'}`,
                              borderRadius: 8, padding: '3px 9px', fontSize: 11, fontWeight: 700,
                            }}>{r.status}</span>
                          </td>
                          <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {r.submitted_at ? new Date(r.submitted_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`@media(max-width:768px){.res-stats{grid-template-columns:repeat(2,1fr)!important;}}`}</style>
    </div>
  );
}
