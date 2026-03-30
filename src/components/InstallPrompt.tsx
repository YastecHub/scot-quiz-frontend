import { useState, useEffect } from 'react';
import { Download, X, GraduationCap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible]               = useState(false);
  const [installing, setInstalling]         = useState(false);
  const [installed, setInstalled]           = useState(false);

  useEffect(() => {
    // Don't show if already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    // Don't show if dismissed before
    if (localStorage.getItem('pwa_dismissed')) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small delay so it doesn't pop up immediately on page load
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setInstalled(true); setVisible(false); });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setVisible(false);
    } else {
      setInstalling(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('pwa_dismissed', '1');
  };

  if (!visible || installed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 300, width: '100%', maxWidth: 420, padding: '0 16px',
      animation: 'fadeUp 0.4s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{
        background: '#fff',
        border: '1.5px solid rgba(10,61,31,0.12)',
        borderRadius: 20,
        boxShadow: '0 16px 48px rgba(10,61,31,0.18)',
        padding: '18px 20px',
        display: 'flex', alignItems: 'flex-start', gap: 14,
      }}>
        {/* App icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: 'var(--green-deep)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: '0 4px 12px rgba(10,61,31,0.3)',
        }}>
          <GraduationCap size={24} color="#fff" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--green-deep)', marginBottom: 2 }}>
            Install SCOT Free
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.5, marginBottom: 12 }}>
            Add to your home screen for instant access — works offline too!
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
            <button
              onClick={handleDismiss}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12 }}
            >
              Not now
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)', flexShrink: 0 }}
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
