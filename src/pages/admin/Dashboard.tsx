import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, type Test } from '../../api/client';
import { Settings, FolderOpen, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
  const [tests, setTests]       = useState<Test[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getTests(), adminAPI.getStudents()])
      .then(([t, s]) => { 
        setTests(Array.isArray(t.data) ? t.data : []);
        setStudents(Array.isArray(s.data) ? s.data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeTests    = tests.filter(t => t.is_active);
  const totalAttempts  = tests.reduce((s, t) => s + (t.attempt_count ?? 0), 0);

  const deleteTest = async (id: number) => {
    if (!confirm('Delete this test and all its results?')) return;
    await adminAPI.deleteTest(id);
    setTests(prev => prev.filter(t => t.id !== id));
  };

  const toggleActive = async (test: Test) => {
    const updated = await adminAPI.updateTest(test.id, { ...test, is_active: test.is_active ? 0 : 1 });
    setTests(prev => prev.map(t => t.id === test.id ? updated.data : t));
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="section-badge" style={{ marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Settings size={12} /> Admin Panel</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: 'var(--green-deep)' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>
            Manage tests, questions, and view student results.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/resources" className="btn btn-secondary btn-md" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FolderOpen size={13} /> Resources</Link>
          <Link to="/admin/tests/new" className="btn btn-primary btn-md">+ Create New Test</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 36 }} className="admin-stats">
        {[
          { num: tests.length,      label: 'Total Tests',     color: 'var(--green-deep)' },
          { num: activeTests.length, label: 'Active Tests',   color: 'var(--correct)' },
          { num: students.length,   label: 'Students',        color: 'var(--green-bright)' },
          { num: totalAttempts,     label: 'Attempts Taken',  color: 'var(--text-mid)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.num}</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tests table */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: 'var(--green-deep)' }}>All Tests</h2>
          <Link to="/admin/tests/new" className="btn btn-secondary btn-sm">+ New Test</Link>
        </div>

        {loading && <div className="spinner" />}

        {!loading && tests.length === 0 && (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ marginBottom: 14 }}><ClipboardList size={40} color="var(--text-muted)" /></div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 8 }}>No tests yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Create your first test to get started.</p>
            <Link to="/admin/tests/new" className="btn btn-primary btn-md">Create Test</Link>
          </div>
        )}

        {!loading && tests.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-ribbon" />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--green-ghost)' }}>
                    {['Test Title', 'Subject', 'Time', 'Questions', 'Attempts', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--green-mid)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test, i) => (
                    <tr key={test.id} style={{ borderTop: '1px solid rgba(10,61,31,0.06)', background: i % 2 === 0 ? '#fff' : 'var(--off-white)' }}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--green-deep)', fontSize: 14 }}>{test.title}</div>
                        {test.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{test.description.slice(0,60)}{test.description.length>60?'…':''}</div>}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>{test.subject ?? 'Mixed'}</td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-mid)', fontWeight: 600, whiteSpace: 'nowrap' }}>{test.time_limit} min</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ background: 'var(--green-ghost)', borderRadius: 8, padding: '3px 9px', fontSize: 12, fontWeight: 700, color: 'var(--green-mid)' }}>{test.question_count ?? 0}</span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ background: 'var(--off-white)', borderRadius: 8, padding: '3px 9px', fontSize: 12, fontWeight: 700, color: 'var(--text-mid)' }}>{test.attempt_count ?? 0}</span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <button onClick={() => toggleActive(test)} style={{
                          background: test.is_active ? '#f0fdf4' : '#fef2f2',
                          color: test.is_active ? 'var(--correct)' : 'var(--wrong)',
                          border: `1px solid ${test.is_active ? 'var(--green-pale)' : '#fecaca'}`,
                          borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        }}>
                          {test.is_active ? '● Active' : '○ Inactive'}
                        </button>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                          <Link to={`/admin/tests/${test.id}/manage`} className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '5px 10px' }}>Edit</Link>
                          <Link to={`/admin/tests/${test.id}/results`} className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '5px 10px' }}>Results</Link>
                          <button onClick={() => deleteTest(test.id)} style={{ background: '#fef2f2', color: 'var(--wrong)', border: '1px solid #fecaca', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Students */}
      <div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 16 }}>Students ({students.length})</h2>
        {!loading && students.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--green-ghost)' }}>
                    {['Name', 'Email', 'Tests Taken', 'Avg Score', 'Registered'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--green-mid)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s: any, i: number) => (
                    <tr key={s.id} style={{ borderTop: '1px solid rgba(10,61,31,0.06)', background: i%2===0?'#fff':'var(--off-white)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--green-deep)', fontSize: 14 }}>{s.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-mid)' }}>{s.tests_taken}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {s.avg_pct != null
                          ? <span style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 700, color: s.avg_pct>=70?'var(--correct)':s.avg_pct>=50?'#ca8a04':'var(--wrong)' }}>{s.avg_pct}%</span>
                          : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{new Date(s.created_at).toLocaleDateString('en-NG')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`@media(max-width:768px){.admin-stats{grid-template-columns:repeat(2,1fr)!important;}}`}</style>
    </div>
  );
}
