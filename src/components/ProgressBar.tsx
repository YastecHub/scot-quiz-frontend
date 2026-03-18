interface ProgressBarProps {
  subject: string;
  current: number;   // 0-based index of current question
  total: number;
  topicName?: string;
}

export default function ProgressBar({ subject, current, total, topicName }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const label = topicName
    ? `${subject} · ${topicName} · Q${current + 1} of ${total}`
    : `${subject} · Q${current + 1} of ${total}`;

  return (
    <div style={{ width: '100%', maxWidth: 500, margin: '0 auto 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div style={{ width: '100%', height: 6, background: 'rgba(10,61,31,0.1)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--green-bright), var(--accent))',
          borderRadius: 10,
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}
