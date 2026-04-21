import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowRight, Heart, Trophy, Target, Zap, ChevronDown } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [latestDraw, setLatestDraw] = useState(null);
  const [charities, setCharities] = useState([]);
  const [stats, setStats] = useState({ members: 142, donated: 8640, winners: 31 });

  useEffect(() => {
    api.get('/draws/latest').then(({ data }) => setLatestDraw(data.draw)).catch(() => {});
    api.get('/charities').then(({ data }) => setCharities((data.charities || []).slice(0, 3))).catch(() => {});
  }, []);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '80px 24px',
        position: 'relative',
      }}>
        {/* Background radial glows */}
        <div style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div className="fade-in" style={{ position: 'relative', zIndex: 1, maxWidth: 780 }}>
          {/* Tag line */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 99,
            background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)',
            fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600,
            letterSpacing: '0.04em', marginBottom: 32,
          }}>
            <Heart size={13} fill="currentColor" /> Play with Purpose
          </div>

          <h1 style={{ marginBottom: 24, lineHeight: 1.1 }}>
            Your golf scores.<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), #86efac)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Someone's lifeline.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: 560, margin: '0 auto 40px',
            lineHeight: 1.7,
          }}>
            Enter your Stableford scores each month. Win prizes from the prize pool.
            Every subscription automatically supports a charity you believe in.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}
              style={{ fontSize: '1.05rem', padding: '14px 32px' }}>
              Start for £10/month <ArrowRight size={20} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/charities')}>
              Explore Charities
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          color: 'var(--text-muted)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 6, animation: 'fadeIn 1.5s ease 0.8s both',
        }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
              The Process
            </div>
            <h2>Simple as 1, 2, 3</h2>
          </div>

          <div className="grid-3">
            {[
              {
                step: '01', icon: CreditCard2, title: 'Subscribe',
                desc: 'Choose monthly (£10) or yearly (£100). A portion of every subscription funds the prize pool, the rest goes to charity.',
                color: 'var(--accent)',
              },
              {
                step: '02', icon: TargetIcon, title: 'Enter Scores',
                desc: 'Log your latest Stableford scores (1–45) throughout the month. We keep your 5 most recent entries.',
                color: '#60a5fa',
              },
              {
                step: '03', icon: TrophyIcon, title: 'Win Prizes',
                desc: 'Each month, 5 numbers are drawn. Match 3, 4, or all 5 of your scores to win your share of the prize pool.',
                color: 'var(--gold)',
              },
            ].map(({ step, title, desc, color, icon: Icon }) => (
              <div key={step} className="card" style={{ textAlign: 'center', padding: '36px 28px' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: `${color}15`, border: `2px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <Icon color={color} size={24} />
                </div>
                <div style={{ fontSize: '0.7rem', color, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 8 }}>
                  STEP {step}
                </div>
                <h3 style={{ marginBottom: 12 }}>{title}</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div className="container">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2, borderRadius: 'var(--radius-xl)',
            overflow: 'hidden', border: '1px solid var(--border)',
          }}>
            {[
              { value: `${stats.members}+`, label: 'Active Members', suffix: '' },
              { value: `£${stats.donated.toLocaleString()}`, label: 'Donated to Charity', suffix: '' },
              { value: `${stats.winners}`, label: 'Prize Winners', suffix: '' },
            ].map(({ value, label }) => (
              <div key={label} style={{
                padding: '48px 32px', textAlign: 'center',
                background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8,
                  background: 'linear-gradient(135deg, var(--accent), #86efac)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {value}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE POOL ───────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
                Prize Structure
              </div>
              <h2 style={{ marginBottom: 16 }}>Real prizes. Real impact.</h2>
              <p style={{ marginBottom: 32, lineHeight: 1.8 }}>
                Every subscription contributes to a growing prize pool, split across three tiers.
                The jackpot rolls over each month it goes unclaimed — growing until someone wins it all.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>
                Join & Compete <ArrowRight size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: '5-Number Match', sub: 'Jackpot (rolls over)', pct: 40, color: 'var(--gold)', emoji: '🏆' },
                { label: '4-Number Match', sub: 'Monthly prize', pct: 35, color: '#60a5fa', emoji: '🥈' },
                { label: '3-Number Match', sub: 'Entry prize', pct: 25, color: 'var(--accent)', emoji: '🥉' },
              ].map(({ label, sub, pct, color, emoji }) => (
                <div key={label} style={{
                  background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                  border: `1px solid ${color}25`, padding: '18px 20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{emoji} {label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color }}>{pct}%</div>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LATEST DRAW ──────────────────────────────────────── */}
      {latestDraw && (
        <section style={{ padding: '80px 24px' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
                Most Recent Draw
              </div>
              <h2>{months[latestDraw.month]} {latestDraw.year} Winning Numbers</h2>
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
              {latestDraw.winningNumbers?.map((n, i) => (
                <div key={i} className="draw-ball" style={{ width: 72, height: 72, fontSize: '1.6rem' }}>{n}</div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                Prize pool: £{latestDraw.totalPrizePool?.toFixed(2)} · {latestDraw.participantCount} participants
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>
                Enter Next Draw <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── CHARITIES ────────────────────────────────────────── */}
      {charities.length > 0 && (
        <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
                Making a Difference
              </div>
              <h2>Charities We Support</h2>
              <p style={{ marginTop: 12 }}>Choose one at signup. Change anytime.</p>
            </div>
            <div className="grid-3" style={{ marginBottom: 32 }}>
              {charities.map((c) => (
                <div key={c._id} className="card" style={{ padding: '28px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', marginBottom: 16,
                  }}>
                    {c.category === 'health' ? '🏥' : c.category === 'education' ? '📚' : c.category === 'environment' ? '🌱' : c.category === 'sports' ? '⚽' : '❤️'}
                  </div>
                  {c.isFeatured && <span className="badge badge-yellow" style={{ marginBottom: 10 }}>⭐ Featured</span>}
                  <h3 style={{ marginBottom: 8 }}>{c.name}</h3>
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
                    {c.description?.slice(0, 100)}{c.description?.length > 100 ? '...' : ''}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/charities')}>
                View All Charities <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA FOOTER ───────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 700, height: 400,
          background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ marginBottom: 16 }}>Ready to play with purpose?</h2>
          <p style={{ fontSize: '1.05rem', marginBottom: 36, lineHeight: 1.7 }}>
            Join hundreds of golfers turning their Stableford scores into prizes
            and charity donations every single month.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}
            style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
            Get Started — £10/month <ArrowRight size={20} />
          </button>
          <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Cancel anytime · No hidden fees · 10% minimum to charity
          </p>
        </div>
      </section>

      {/* ── SITE FOOTER ──────────────────────────────────────── */}
      <footer style={{
        padding: '28px 24px',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
          GolfGive
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} GolfGive. Play with purpose.
        </p>
      </footer>
    </div>
  );
}

// Inline icon shims to avoid extra imports
const CreditCard2 = ({ color, size }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth={1.8} viewBox="0 0 24 24">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const TargetIcon = ({ color, size }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth={1.8} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const TrophyIcon = ({ color, size }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth={1.8} viewBox="0 0 24 24">
    <polyline points="8 21 12 17 16 21" /><line x1="12" y1="17" x2="12" y2="11" />
    <path d="M7 4H2v6a5 5 0 0 0 10 0V4" /><path d="M17 4h5v6a5 5 0 0 1-10 0V4" />
  </svg>
);
