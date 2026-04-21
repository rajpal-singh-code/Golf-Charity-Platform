import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, ArrowRight, ExternalLink } from 'lucide-react';

const CATEGORIES = ['all', 'health', 'education', 'environment', 'sports', 'community', 'other'];
const CATEGORY_EMOJI = {
  health: '🏥', education: '📚', environment: '🌱',
  sports: '⚽', community: '🤝', other: '❤️',
};

export default function CharitiesPage() {
  const navigate = useNavigate();
  const [charities, setCharities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    api.get('/charities')
      .then(({ data }) => { setCharities(data.charities || []); setFiltered(data.charities || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = charities;
    if (category !== 'all') result = result.filter((c) => c.category === category);
    if (search.trim()) result = result.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, category, charities]);

  const featured = charities.filter((c) => c.isFeatured);

  return (
    <div style={{ minHeight: '100vh', padding: '60px 24px' }}>
      <div className="container">

        {/* Page header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            borderRadius: 99, background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)',
            fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 20,
          }}>
            ❤️ Supported Causes
          </div>
          <h1 style={{ marginBottom: 16 }}>Charities We Support</h1>
          <p style={{ fontSize: '1.05rem', maxWidth: 520, margin: '0 auto 32px' }}>
            A minimum of 10% of every subscription goes directly to your chosen charity.
            Browse and find your cause.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Join & Choose Your Charity <ArrowRight size={18} />
          </button>
        </div>

        {/* Featured charities */}
        {featured.length > 0 && (
          <div style={{ marginBottom: 56 }}>
            <div style={{
              fontSize: '0.7rem', color: 'var(--gold)', textTransform: 'uppercase',
              letterSpacing: '0.12em', marginBottom: 20, fontWeight: 700,
            }}>
              ⭐ Featured Charities
            </div>
            <div className="grid-2">
              {featured.map((c) => (
                <div key={c._id} className="card-elevated" style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 56, height: 56, minWidth: 56, borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
                    }}>
                      {CATEGORY_EMOJI[c.category] || '❤️'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <h3 style={{ fontSize: '1.1rem' }}>{c.name}</h3>
                        <span className="badge badge-yellow">Featured</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 16 }}>
                        {c.description?.slice(0, 150)}{c.description?.length > 150 ? '...' : ''}
                      </p>
                      {c.website && (
                        <a href={c.website} target="_blank" rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500 }}>
                          Visit Website <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search + filter bar */}
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
          marginBottom: 32, padding: '20px 24px',
          background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 38 }}
              placeholder="Search charities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="tabs" style={{ flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button key={cat} className={`tab-btn ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
                style={{ textTransform: 'capitalize' }}>
                {cat === 'all' ? 'All' : `${CATEGORY_EMOJI[cat]} ${cat}`}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          {loading ? 'Loading...' : `${filtered.length} ${filtered.length === 1 ? 'charity' : 'charities'} found`}
        </p>

        {/* Charity grid */}
        {loading ? (
          <div className="page-loader"><div className="loading-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h3>No charities found</h3>
            <p>Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map((c) => (
              <div key={c._id} className="card" style={{ padding: '28px' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', marginBottom: 16,
                }}>
                  {CATEGORY_EMOJI[c.category] || '❤️'}
                </div>

                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                  {c.isFeatured && <span className="badge badge-yellow">⭐ Featured</span>}
                  <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{c.category}</span>
                </div>

                <h3 style={{ marginBottom: 10, fontSize: '1rem' }}>{c.name}</h3>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 16 }}>
                  {c.description?.slice(0, 110)}{c.description?.length > 110 ? '...' : ''}
                </p>

                {/* Upcoming events */}
                {c.upcomingEvents?.length > 0 && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)', marginBottom: 16,
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      Upcoming Event
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{c.upcomingEvents[0].title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(c.upcomingEvents[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                      Website <ExternalLink size={12} />
                    </a>
                  )}
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
                    Support This →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{
          marginTop: 80, textAlign: 'center',
          padding: '60px 32px', borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)', border: '1px solid var(--border-accent)',
        }}>
          <h2 style={{ marginBottom: 12 }}>Make every round count</h2>
          <p style={{ maxWidth: 480, margin: '0 auto 28px' }}>
            Subscribe today, choose your charity, and start competing in monthly prize draws —
            all at the same time.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Start Your Subscription <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
