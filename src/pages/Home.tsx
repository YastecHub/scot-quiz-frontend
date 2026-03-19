import { Link } from 'react-router-dom';
import { Atom, FlaskConical, Dna, BookOpen, Zap, Pin, Target, BarChart2, BookMarked, Smartphone, Phone, Mail, GraduationCap, type LucideIcon } from 'lucide-react';

const SUBJECTS: { Icon: LucideIcon; name: string; desc: string; questions: string; topics: number }[] = [
  { Icon: Atom,          name: 'Physics',   desc: 'Waves · Optics · Atomic Models · Electromagnetism · Mechanics', questions: '40+', topics: 4 },
  { Icon: FlaskConical,  name: 'Chemistry', desc: 'Redox · Ionic Theory · Periodic Table · Organic · Equilibrium',  questions: '40+', topics: 4 },
  { Icon: Dna,           name: 'Biology',   desc: 'Cell Biology · Genetics · Ecology · Nutrition · Human Systems',  questions: '40+', topics: 4 },
  { Icon: BookOpen,      name: 'English',   desc: 'Comprehension · Grammar · Figures of Speech · Vocabulary',       questions: '40+', topics: 3 },
];

const FEATURES: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: Zap,        title: 'Daily Mock Quizzes',      desc: 'Fresh randomised questions every session across all four subjects. Timed conditions that mirror JAMB and WAEC.' },
  { Icon: Pin,        title: 'Instant Explanations',    desc: 'Every question shows a detailed explanation with the past-exam year reference so you learn why, not just what.' },
  { Icon: Target,     title: 'Topic-by-Topic Practice', desc: 'Struggling with Waves or Redox? Drill a specific topic until you master it before moving on.' },
  { Icon: BarChart2,  title: 'Score Tracking',          desc: 'Your progress is saved after every session. Watch your accuracy improve as you practice daily.' },
  { Icon: BookMarked, title: 'Downloadable Resources',  desc: 'Past question papers, summary notes and revision sheets ready for offline study.' },
  { Icon: Smartphone, title: 'Works on Any Phone',      desc: 'Beautifully responsive on every device. Practice on the bus, during break, or at home.' },
];

export default function Home() {
  return (
    <main>
      {/* ─── HERO ─── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }} className="hero-grid">
        <div>
          <div className="section-badge animate-fadeUp" style={{ marginBottom: 24 }}>
            JAMB · WAEC · NECO · 2026
          </div>

          <h1 className="animate-fadeUp delay-1" style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(36px, 5vw, 54px)', fontWeight: 700, color: 'var(--green-deep)', lineHeight: 1.12, marginBottom: 20 }}>
            Ace Your Exams,<br />
            <em style={{ fontStyle: 'italic', color: 'var(--green-bright)' }}>One Question</em><br />
            at a Time.
          </h1>

          <p className="animate-fadeUp delay-2" style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 36, maxWidth: 460 }}>
            Daily mock quizzes, past-question practice, and topic-by-topic break downs built specifically for Nigerian SS3 students preparing for JAMB, WAEC & NECO.
          </p>

          <div className="animate-fadeUp delay-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Start Practising Free →</Link>
            <Link to="/quiz"     className="btn btn-secondary btn-lg">Preview Quiz</Link>
          </div>

          <div className="animate-fadeUp delay-4" style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            <div style={{ display: 'flex' }}>
              {['#22a04f','#145a2e','#1a7a3c','#0a3d1f'].map((bg, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: bg, border: '2px solid #fff', marginRight: -8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            &nbsp;Join <strong style={{ color: 'var(--green-mid)' }}>5000+</strong>&nbsp;students already practising
          </div>
        </div>

        {/* Preview card */}
        <div className="animate-fadeUp delay-2 hero-visual" style={{ position: 'relative' }}>
          <div style={{ transform: 'rotate(1.5deg)', transition: 'transform 0.4s ease', background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 64px rgba(10,61,31,0.14)', border: '1px solid rgba(10,61,31,0.08)' }}
               onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(0deg) scale(1.01)')}
               onMouseLeave={e => (e.currentTarget.style.transform = 'rotate(1.5deg)')}>
            <div className="card-ribbon" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 0' }}>
              <div className="subject-pill"><div className="subject-dot" /><span className="subject-name">Physics</span></div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Q 3 / 10</span>
            </div>
            <div style={{ margin: '14px 18px', background: 'linear-gradient(135deg, var(--green-deep), var(--green-mid))', borderRadius: 14, padding: '18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Fraunces, serif', fontSize: 64, color: 'rgba(255,255,255,0.05)', lineHeight: 1 }}>?</div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Question</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.5, position: 'relative', zIndex: 1 }}>
                The de Broglie wavelength of a moving particle is inversely proportional to its:
              </div>
            </div>
            <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { letter: 'A', text: 'Velocity only', state: 'wrong' },
                { letter: 'B', text: 'Momentum',      state: 'correct' },
                { letter: 'C', text: 'Kinetic energy',state: 'neutral' },
                { letter: 'D', text: 'Temperature',   state: 'neutral' },
              ].map(opt => (
                <div key={opt.letter} style={{
                  display: 'flex', alignItems: 'center', gap: 10, borderRadius: 12, padding: '10px 12px',
                  background: opt.state === 'correct' ? '#f0fdf4' : opt.state === 'wrong' ? '#fef2f2' : 'var(--off-white)',
                  border: `1.5px solid ${opt.state === 'correct' ? 'var(--correct)' : opt.state === 'wrong' ? '#dc2626' : 'rgba(10,61,31,0.08)'}`,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, flexShrink: 0,
                    background: opt.state === 'correct' ? 'var(--correct)' : opt.state === 'wrong' ? '#dc2626' : '#fff',
                    color: opt.state === 'neutral' ? 'var(--green-mid)' : '#fff',
                    border: opt.state === 'neutral' ? '1.5px solid rgba(10,61,31,0.12)' : 'none',
                  }}>{opt.letter}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: opt.state === 'correct' ? '#15803d' : opt.state === 'wrong' ? '#b91c1c' : 'var(--text-dark)' }}>
                    {opt.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Floating score */}
          <div style={{
            position: 'absolute', top: -16, right: -20, background: '#fff',
            border: '1px solid rgba(10,61,31,0.1)', borderRadius: 16, padding: '12px 18px',
            boxShadow: '0 8px 24px rgba(10,61,31,0.1)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 2, transform: 'rotate(-3deg)',
          }}>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: 'var(--correct)', lineHeight: 1 }}>78%</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Score</span>
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <div style={{ background: 'var(--green-deep)', padding: '32px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }} className="stats-grid">
          {[
            { num: '40+',  label: 'Questions per Subject' },
            { num: '4',    label: 'Core Subjects' },
            { num: '5000+', label: 'Active Students' },
            { num: '100%', label: 'Free to Use' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 16px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{s.num}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FEATURES ─── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }} id="features">
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div className="section-badge" style={{ marginBottom: 16 }}>✦ Why SCOT Free</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 14 }}>
            Everything You Need to Score High
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-mid)', fontWeight: 500, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            Built by tutors, designed for studentsevery feature is focused on getting you exam-ready.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="card feature-card-hover" style={{ padding: '28px 24px', position: 'relative', overflow: 'hidden', transition: 'all 0.25s' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--green-ghost)', border: '1.5px solid var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <f.Icon size={22} color="var(--green-mid)" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--green-deep)', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.65, fontWeight: 500 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SUBJECTS ─── */}
      <section style={{ background: 'var(--green-deep)', padding: '80px 0' }} id="subjects">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 14px', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>
              ✦ Subject Library
            </div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 700, color: '#fff', marginBottom: 14 }}>
              Pick Your Subject, Start Practising
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', fontWeight: 500, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
              Comprehensive question banks aligned to JAMB, WAEC, and NECO syllabi.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }} className="subjects-grid">
            {SUBJECTS.map(s => (
              <Link
                key={s.name}
                to={`/quiz?subject=${s.name}`}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 20, padding: '28px 20px 24px', textAlign: 'center', textDecoration: 'none',
                  transition: 'all 0.25s ease', display: 'block',
                }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.background='rgba(255,255,255,0.11)'; el.style.borderColor='rgba(0,230,118,0.3)'; el.style.transform='translateY(-4px)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.background='rgba(255,255,255,0.06)'; el.style.borderColor='rgba(255,255,255,0.1)'; el.style.transform='translateY(0)'; }}
              >
                <span style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}><s.Icon size={36} color="rgba(255,255,255,0.85)" /></span>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, lineHeight: 1.5, marginBottom: 16 }}>{s.desc}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                  {[{ num: s.questions, lbl: 'Questions' }, { num: s.topics, lbl: 'Topics' }].map(m => (
                    <div key={m.lbl} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{m.num}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{m.lbl}</span>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div className="section-badge" style={{ marginBottom: 16 }}>✦ How It Works</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 14 }}>
            Ready in Under 60 Seconds
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }} className="steps-grid">
          {[
            { num: '01', title: 'Create Your Account',  desc: 'Register with your name and email. Free foreverno payment required.' },
            { num: '02', title: 'Choose a Subject',     desc: 'Pick from Physics, Chemistry, Biology, or Englishthen pick a topic or go mixed.' },
            { num: '03', title: 'Answer & Learn',       desc: 'Answer each question, see the correct answer instantly, and read the explanation.' },
            { num: '04', title: 'Track Your Growth',    desc: 'Your scores are saved. Watch your accuracy climb as you practice every day.' },
          ].map((step, i, arr) => (
            <div key={step.num} className="card" style={{ padding: '28px 22px', position: 'relative' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 40, fontWeight: 700, color: 'var(--green-pale)', lineHeight: 1, marginBottom: 14 }}>{step.num}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--green-deep)', marginBottom: 8 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6, fontWeight: 500 }}>{step.desc}</div>
              {i < arr.length - 1 && (
                <div style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--green-pale)', fontWeight: 700, zIndex: 1 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── MEET THE FOUNDER ─── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div className="section-badge" style={{ marginBottom: 16 }}>✦ Meet the Founder</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 14 }}>
            The Person Behind SCOT Free
          </h2>
        </div>

        <div className="card founder-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: 6, background: 'linear-gradient(180deg, var(--green-bright), var(--green-mid))', flexShrink: 0 }} />
            <div className="founder-inner" style={{ padding: '36px 40px', display: 'flex', gap: 40, alignItems: 'flex-start', flex: 1 }}>

              {/* Photo + name */}
              <div className="founder-photo-block" style={{ flexShrink: 0, textAlign: 'center', minWidth: 140 }}>
                <div style={{
                  width: 130, height: 130, borderRadius: '50%', overflow: 'hidden',
                  border: '4px solid var(--green-pale)', boxShadow: '0 8px 32px rgba(10,61,31,0.14)',
                  background: 'var(--green-ghost)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <img
                    src="/owner.jpg"
                    alt="Raji Ahmed Ajani"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      const el = e.currentTarget;
                      el.style.display = 'none';
                      const parent = el.parentElement!;
                      parent.innerHTML = '<span style="font-size:54px;color:var(--green-mid)">?</span>';
                    }}
                  />
                </div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: 'var(--green-deep)' }}>Raji Ahmed Ajani</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginTop: 3, marginBottom: 12 }}>CEO, EduRaj Consult · SCOT Admin</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  {['Free Tutorial', 'Free Consultancy', 'Large Community'].map(b => (
                    <span key={b} style={{ background: 'var(--green-ghost)', border: '1px solid var(--green-pale)', borderRadius: 8, padding: '4px 9px', fontSize: 10, fontWeight: 800, color: 'var(--green-mid)' }}>{b}</span>
                  ))}
                </div>
              </div>

              {/* Bio + details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.8, fontWeight: 500, marginBottom: 20 }}>
                  Raji Ahmed Ajani is a medical student at the <strong style={{ color: 'var(--green-deep)' }}>University of Lagos</strong> and the founder of EduRaj Consult and SCOT Tutorial. Having personally navigated the Nigerian university entrance process, he built this platform to ensure every Nigerian student, regardless of financial background, has access to quality exam preparation completely free of charge.
                </p>

                <div className="founder-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--green-light)', marginBottom: 8 }}>Teaches</div>
                    {['Physics · UTME, WAEC, JUPEB', 'Mathematics · UTME, WAEC, JUPEB', 'Chemistry · UTME, WAEC, JUPEB'].map(s => (
                      <div key={s} style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', marginBottom: 6, paddingLeft: 10, borderLeft: '2px solid var(--green-pale)' }}>{s}</div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--green-light)', marginBottom: 8 }}>Leadership</div>
                    {['Pre-Med Governor, UNILAG', 'Founder, SCOT Online Tutorial', 'CEO, EduRaj Consult'].map(s => (
                      <div key={s} style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', marginBottom: 6, paddingLeft: 10, borderLeft: '2px solid var(--green-pale)' }}>{s}</div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a href="tel:08149425466"
                     style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--green-ghost)', border: '1.5px solid var(--green-pale)', borderRadius: 12, padding: '10px 16px', textDecoration: 'none', fontSize: 13, fontWeight: 700, color: 'var(--green-mid)', transition: 'all 0.18s' }}
                     onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'var(--green-pale)'; el.style.color = 'var(--green-deep)'; }}
                     onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'var(--green-ghost)'; el.style.color = 'var(--green-mid)'; }}>
                    <Phone size={14} /> 08149425466
                  </a>
                  <a href="https://wa.me/message/XDTHP6H2VPI6L1" target="_blank" rel="noopener noreferrer"
                     style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#dcfce7', border: '1.5px solid #86efac', borderRadius: 12, padding: '10px 16px', textDecoration: 'none', fontSize: 13, fontWeight: 700, color: '#15803d', transition: 'all 0.18s' }}
                     onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#bbf7d0'; el.style.color = '#14532d'; }}
                     onMouseLeave={e => { const el = e.currentTarget; el.style.background = '#dcfce7'; el.style.color = '#15803d'; }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                  <a href="mailto:rajiahmedajani@gmail.com"
                     style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--off-white)', border: '1.5px solid rgba(10,61,31,0.12)', borderRadius: 12, padding: '10px 16px', textDecoration: 'none', fontSize: 13, fontWeight: 700, color: 'var(--text-mid)', transition: 'all 0.18s' }}
                     onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'var(--green-ghost)'; el.style.color = 'var(--green-mid)'; }}
                     onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'var(--off-white)'; el.style.color = 'var(--text-mid)'; }}>
                    <Mail size={14} /> Email
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--green-deep), var(--green-mid))', borderRadius: 28, padding: '56px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 16, position: 'relative', zIndex: 1 }}>
            Your Exam Is Closer<br />Than You Think.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', fontWeight: 500, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7, position: 'relative', zIndex: 1 }}>
            Don't wait for the last minute. Start practising today and walk into your exam hall with confidence.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--green-deep)', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              Create Free Account →
            </Link>
            <Link to="/quiz" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Preview a Quiz
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: 'var(--green-deep)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40, paddingBottom: 36, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={20} color="#fff" strokeWidth={2} /></div>
                <div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 19, fontWeight: 700, color: '#fff' }}>SCOT COMPREHENSIVE CLASSES</div>
                  <div style={{ fontSize: 9, letterSpacing: 0, textTransform: 'none', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>by EduRaj Consult</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 14, maxWidth: 240, lineHeight: 1.6 }}>
                Empowering every Nigerian student with the tools to ace JAMB, WAEC & NECO.
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={13} /> 08149425466
              </p>
            </div>
            <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
              {[
                { title: 'Practice', links: [{ label: 'Physics Quiz', to: '/quiz?subject=Physics' }, { label: 'Chemistry Quiz', to: '/quiz?subject=Chemistry' }, { label: 'Biology Quiz', to: '/quiz?subject=Biology' }, { label: 'English Quiz', to: '/quiz?subject=English' }] },
                { title: 'Platform', links: [{ label: 'Browse Topics', to: '/topics' }, { label: 'Resources', to: '/resources' }, { label: 'Log In', to: '/login' }, { label: 'Register', to: '/register' }] },
              ].map(col => (
                <div key={col.title}>
                  <h4 style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>{col.title}</h4>
                  {col.links.map(l => (
                    <Link key={l.label} to={l.to} style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 10, transition: 'color 0.18s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, fontWeight: 600, textTransform: 'uppercase' }}>
              © 2026 <span style={{ color: 'rgba(255,255,255,0.5)' }}>SCOT Free by EduRaj Consult</span> · All rights reserved
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['JAMB', 'WAEC', 'NECO'].map(e => (
                <span key={e} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', fontSize: 10, fontWeight: 800, letterSpacing: 1, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{e}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-visual { display: none !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .subjects-grid { grid-template-columns: repeat(2,1fr) !important; }
          .steps-grid { grid-template-columns: repeat(2,1fr) !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        .feature-card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(10,61,31,0.1) !important; }
        @media (max-width: 600px) {
          .founder-inner { flex-direction: column !important; align-items: center !important; padding: 24px 20px !important; }
          .founder-photo-block { width: 100% !important; min-width: unset !important; }
          .founder-details-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
