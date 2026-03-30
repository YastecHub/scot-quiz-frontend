import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Settings, X, Menu, GraduationCap, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isInStandaloneMode =
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as any).standalone === true;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isInStandaloneMode);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setInstalled(true); setInstallPrompt(null); });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    fontSize: '13px', fontWeight: 600,
    color: isActive ? 'var(--green-mid)' : 'var(--text-muted)',
    textDecoration: 'none', padding: '8px 16px', borderRadius: '8px',
    background: isActive ? 'var(--green-ghost)' : 'transparent',
    transition: 'all 0.18s',
  });

  const showInstallBtn = !!installPrompt && !installed;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(247,250,248,0.95)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(10,61,31,0.08)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 24px',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40, background: 'var(--green-deep)', borderRadius: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(10,61,31,0.25)', flexShrink: 0,
          }}><GraduationCap size={22} color="#fff" strokeWidth={2} /></div>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 19, fontWeight: 700, color: 'var(--green-deep)', lineHeight: 1 }}>
              SCOT COMPREHENSIVE CLASSES
            </div>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', marginTop: 3 }}>
              by EduRaj Consult
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {!user?.is_admin && <NavLink to="/tests"     style={navLinkStyle}>Tests</NavLink>}
          {!user?.is_admin && <NavLink to="/quiz"      style={navLinkStyle}>Practice</NavLink>}
          {!user?.is_admin && <NavLink to="/topics"    style={navLinkStyle}>Topics</NavLink>}
          <NavLink to="/resources" style={navLinkStyle}>Resources</NavLink>
          {user?.is_admin && (
            <NavLink to="/admin" style={({ isActive }) => ({
              ...navLinkStyle({ isActive }),
              background: isActive ? 'var(--green-deep)' : 'rgba(10,61,31,0.07)',
              color: isActive ? '#fff' : 'var(--green-mid)',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            })}><Settings size={13} /> Admin</NavLink>
          )}

          <div style={{ width: 1, height: 28, background: 'rgba(10,61,31,0.1)', margin: '0 8px' }} />

          {/* Install button — always visible when browser supports it */}
          {showInstallBtn && (
            <button
              onClick={handleInstall}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '1.5px solid var(--green-pale)', color: 'var(--green-mid)' }}
              title="Install SCOT Free as an app"
            >
              <Download size={13} /> Install App
            </button>
          )}

          {user ? (
            <>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-mid)', padding: '0 8px' }}>
                Hi, {user.name.split(' ')[0]}
              </span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ border: '1.5px solid rgba(10,61,31,0.15)' }}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost btn-sm" style={{ border: '1.5px solid rgba(10,61,31,0.15)' }}>Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(m => !m)}
          style={{
            display: 'none', width: 36, height: 36, borderRadius: 8,
            border: '1.5px solid rgba(10,61,31,0.15)', background: '#fff',
            cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
          }}
          className="mobile-menu-btn"
          aria-label="Menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          background: '#fff', borderTop: '1px solid rgba(10,61,31,0.08)',
          padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {[
            ...(!user?.is_admin ? [{ to: '/tests', label: 'Tests' }, { to: '/quiz', label: 'Practice' }, { to: '/topics', label: 'Topics' }] : []),
            { to: '/resources', label: 'Resources' },
            ...(user?.is_admin ? [{ to: '/admin', label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Settings size={14} /> Admin</span> }] : []),
          ].map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                fontSize: 14, fontWeight: 600,
                color: isActive ? 'var(--green-mid)' : 'var(--text-muted)',
                textDecoration: 'none', padding: '10px 12px', borderRadius: 8,
                background: isActive ? 'var(--green-ghost)' : 'transparent',
              })}
            >
              {item.label}
            </NavLink>
          ))}

          <div style={{ height: 1, background: 'rgba(10,61,31,0.08)', margin: '8px 0' }} />

          {/* Install button in mobile menu */}
          {showInstallBtn && (
            <button
              onClick={() => { handleInstall(); setMenuOpen(false); }}
              className="btn btn-secondary btn-md"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1.5px solid var(--green-pale)', color: 'var(--green-mid)', marginBottom: 6 }}
            >
              <Download size={14} /> Install App
            </button>
          )}

          {user ? (
            <button onClick={handleLogout} className="btn btn-ghost btn-md" style={{ border: '1.5px solid rgba(10,61,31,0.1)' }}>
              Log Out
            </button>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost btn-md" onClick={() => setMenuOpen(false)} style={{ border: '1.5px solid rgba(10,61,31,0.1)', marginBottom: 6 }}>Log In</Link>
              <Link to="/register" className="btn btn-primary btn-md" onClick={() => setMenuOpen(false)}>Get Started Free</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
