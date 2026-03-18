import { useState, useEffect, useRef } from 'react';

interface TimerProps {
  seconds: number;          // initial seconds remaining
  onExpire: () => void;     // called when timer hits 0
  warningAt?: number;       // seconds threshold to turn red (default 60)
}

export default function Timer({ seconds: initialSeconds, onExpire, warningAt = 60 }: TimerProps) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    setRemaining(initialSeconds);
    expiredRef.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      if (!expiredRef.current) { expiredRef.current = true; onExpire(); }
      return;
    }
    const id = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onExpire]);

  const h   = Math.floor(remaining / 3600);
  const m   = Math.floor((remaining % 3600) / 60);
  const s   = remaining % 60;
  const fmt = h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  const isWarning  = remaining <= warningAt && remaining > 0;
  const isUrgent   = remaining <= 20 && remaining > 0;
  const color      = isUrgent ? 'var(--wrong)' : isWarning ? '#ca8a04' : 'var(--green-mid)';
  const bgColor    = isUrgent ? '#fef2f2' : isWarning ? '#fefce8' : 'var(--green-ghost)';
  const borderColor= isUrgent ? '#fecaca' : isWarning ? '#fef08a' : 'var(--green-pale)';

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: bgColor, border: `1.5px solid ${borderColor}`,
      borderRadius: 12, padding: '8px 14px',
      animation: isUrgent ? 'pulse 0.8s infinite' : 'none',
    }}>
      <span style={{ fontSize: 14 }}>⏱</span>
      <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color, lineHeight: 1, letterSpacing: 1 }}>
        {fmt}
      </span>
    </div>
  );
}
