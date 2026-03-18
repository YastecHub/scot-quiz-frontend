interface ScoreStripProps {
  done: number;
  correct: number;
  wrong: number;
}

export default function ScoreStrip({ done, correct, wrong }: ScoreStripProps) {
  const pct = done > 0 ? Math.round((correct / done) * 100) + '%' : '—';

  const Item = ({ num, label, color }: { num: string | number; label: string; color?: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <span style={{
        fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700,
        color: color || 'var(--text-dark)', lineHeight: 1,
      }}>{num}</span>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  );

  const Divider = () => (
    <div style={{ width: 1, height: 32, background: 'rgba(10,61,31,0.08)' }} />
  );

  return (
    <div style={{
      width: '100%', maxWidth: 500, margin: '14px auto 0',
      background: '#fff', border: '1px solid rgba(10,61,31,0.08)',
      borderRadius: 16, padding: '14px 20px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      boxShadow: '0 2px 10px rgba(10,61,31,0.05)',
    }}>
      <Item num={done}    label="Done"    color="var(--green-bright)" />
      <Divider />
      <Item num={correct} label="Correct" color="var(--correct)" />
      <Divider />
      <Item num={wrong}   label="Wrong"   color="var(--wrong)" />
      <Divider />
      <Item num={pct}     label="Score %" />
    </div>
  );
}
