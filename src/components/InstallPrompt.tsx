import { useState, useEffect } from 'react';
import { Download, X, GraduationCap, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Detect iOS
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
  || (window.navigator as any).standalone === true;

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible,    setVisible]    = useState(false);
  const [showIOS,    setShowIOS]    = useState(false);
  const [installing, setInstalling] = useState(false);
  const [dismissed,  setDismissed]  = useState(false);

  useEffect(() => {
    // Already installed — don't show
    if (isInStandaloneMode) return;

    // iOS: show manual instructions after 4s
    if (isIOS) {
      const t = setTimeout(() => setShowIOS(true), 4000);
      return () => clearTimeout(t);
    }

    // Android / Desktop Chrome / Edge
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setVisible(false); setDismissed(true); });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setInstalling(false);
    if (outcome === 'accepted') {
      setVisible(false);
      setDismissed(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setShowIOS(false);
    setDismissed(true);
  };

  // Nothing to show
  if (isInStandaloneMode || dismissed) return null;
  if (!visible && !showIOS) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: '100%', maxWidth: 400, padding: '0 16px',
      animation: 'fadeUp 0.4s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{
        background: '#fff',
        border: '1.5px solid rgba(10,61,31,0.15)',
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(10,61,31,0.22)',
        overflow: 'hidden',
      }}>
        {/* Green top bar */}
        <div style={{ height: 5, background: 'linear-gradient(90deg, var(--green-deep), var(--green-light), var(--accent))' }} />

        <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Icon */}
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'var(--green-deep)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 4px 14px rgba(10,61,31,0.3)',
          }}>
            <GraduationCap size={26} color="#fff" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--green-deep)', marginBottom: 3 }}>
              Install SCOT Free
            </div>

            {showIOS ? (
              <>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.6, marginBottom: 10 }}>
                  To install on iPhone/iPad:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {[
                    { step: '1', text: 'Tap the Share button', icon: <Share size={12} /> },
                    { step: '2', text: 'Scroll down and tap "Add to Home Screen"' },
                    { step: '3', text: 'Tap "Add" to confirm' },
                  ].map(s => (
                    <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--green-ghost)', border: '1px solid var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--green-mid)', flexShrink: 0 }}>{s.step}</div>
                      <span style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 500 }}>{s.text}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleDismiss} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>Got it</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.5, marginBottom: 12 }}>
                  Add to your home screen — works offline, loads instantly!
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleInstall}
                    disabled={installing}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, opacity: installing ? 0.7 : 1 }}
                  >
                    <Download size={13} />
                    {installing ? 'Installing…' : 'Install App'}
                  </button>
                  <button onClick={handleDismiss} className="btn btn-ghost btn-sm">Not now</button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleDismiss}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)', flexShrink: 0, marginTop: -2 }}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
