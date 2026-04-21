import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Target, Trophy, Heart,
  CreditCard, Settings, LogOut, Plus, Pencil, Trash2,
  Calendar, CheckCircle, Clock, XCircle, TrendingUp
} from 'lucide-react';

// ── Score Section ─────────────────────────────────────────────────
function ScoreSection() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ value: '', date: '' });
  const [editMode, setEditMode] = useState(null); // entryId being edited
  const [saving, setSaving] = useState(false);

  const fetchScores = async () => {
    try {
      const { data } = await api.get('/scores/me');
      setEntries(data.entries || []);
    } catch (err) {
      if (err.response?.data?.code === 'NO_SUBSCRIPTION') {
        toast.error('You need an active subscription to manage scores.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScores(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.value || !form.date) { toast.error('Score and date are required'); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/scores', { value: parseInt(form.value), date: form.date });
      setEntries(data.entries);
      setForm({ value: '', date: '' });
      toast.success('Score added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add score');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (entryId) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/scores/${entryId}`, { value: parseInt(form.value), date: form.date });
      setEntries(data.entries);
      setEditMode(null);
      setForm({ value: '', date: '' });
      toast.success('Score updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update score');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Delete this score?')) return;
    try {
      const { data } = await api.delete(`/scores/${entryId}`);
      setEntries(data.entries);
      toast.success('Score deleted');
    } catch (err) {
      toast.error('Failed to delete score');
    }
  };

  const startEdit = (entry) => {
    setEditMode(entry._id);
    setForm({ value: entry.value, date: entry.date.split('T')[0] });
  };

  if (loading) return <div className="page-loader"><div className="loading-spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>My Golf Scores</h2>
        <p>Enter your Stableford scores (1–45). Only your latest 5 are kept.</p>
      </div>

      {/* Add/Edit Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>{editMode ? 'Edit Score' : 'Add New Score'}</h3>
        <form onSubmit={editMode ? (e) => { e.preventDefault(); handleEdit(editMode); } : handleAdd}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 120px' }}>
            <label className="form-label">Score (1–45)</label>
            <input className="form-input" type="number" min={1} max={45}
              value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="e.g. 34" />
          </div>
          <div className="form-group" style={{ flex: '2 1 180px' }}>
            <label className="form-label">Date Played</label>
            <input className="form-input" type="date" value={form.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <div className="loading-spinner" style={{ width: 16, height: 16 }} /> : editMode ? 'Update' : <><Plus size={16} /> Add</>}
            </button>
            {editMode && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditMode(null); setForm({ value: '', date: '' }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Score List */}
      {entries.length === 0 ? (
        <div className="empty-state">
          <Target size={48} />
          <h3>No scores yet</h3>
          <p>Add your first Stableford score above to start participating in draws.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{entries.length}/5 scores stored</p>
            <div style={{ display: 'flex', gap: 6 }}>
              {entries.map((e) => (
                <div key={e._id} className="score-ball">{e.value}</div>
              ))}
            </div>
          </div>

          {entries.map((entry, i) => (
            <div key={entry._id} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className={`score-ball ${i === 0 ? 'highlight' : ''}`}>{entry.value}</div>
                <div>
                  <div style={{ fontWeight: 500 }}>{new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  {i === 0 && <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Most recent</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => startEdit(entry)}><Pencil size={14} /></button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(entry._id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Subscription Section ──────────────────────────────────────────
function SubscriptionSection() {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState('monthly');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    api.get('/subscriptions/me')
      .then(({ data }) => setSub(data.subscription))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const { data } = await api.post('/subscriptions', { plan });
      setSub(data.subscription);
      toast.success('Subscribed successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your subscription? You will lose draw access.')) return;
    try {
      await api.put('/subscriptions/cancel');
      setSub((prev) => ({ ...prev, status: 'cancelled' }));
      toast.success('Subscription cancelled');
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  if (loading) return <div className="page-loader"><div className="loading-spinner" /></div>;

  const isActive = sub && sub.status === 'active' && new Date() < new Date(sub.endDate);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Subscription</h2>
        <p>Manage your plan and billing</p>
      </div>

      {isActive ? (
        <div>
          <div className="card-elevated" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <CheckCircle size={20} color="var(--accent)" />
                  <span className="badge badge-green">Active</span>
                </div>
                <h3 style={{ textTransform: 'capitalize', marginBottom: 6 }}>{sub.plan} Plan</h3>
                <p style={{ fontSize: '0.9rem' }}>
                  Renews on {new Date(sub.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                  £{sub.amount}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>per {sub.plan === 'monthly' ? 'month' : 'year'}</div>
              </div>
            </div>
          </div>

          <div className="grid-3" style={{ marginBottom: 20 }}>
            <div className="stat-card">
              <div className="stat-label">Prize Pool Share</div>
              <div className="stat-value">£{sub.prizePoolContribution?.toFixed(2)}</div>
              <div className="stat-sub">Goes to monthly draws</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Charity Share</div>
              <div className="stat-value">£{sub.charityContribution?.toFixed(2)}</div>
              <div className="stat-sub">To your selected charity</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Start Date</div>
              <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                {new Date(sub.startDate).toLocaleDateString('en-GB')}
              </div>
              <div className="stat-sub">Member since</div>
            </div>
          </div>

          <button className="btn btn-danger" onClick={handleCancel}>Cancel Subscription</button>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: 500 }}>
          <h3 style={{ marginBottom: 8 }}>No Active Subscription</h3>
          <p style={{ marginBottom: 24, fontSize: '0.9rem' }}>Subscribe to enter monthly draws and win prizes while supporting charity.</p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {[{ id: 'monthly', label: 'Monthly', price: '£10' }, { id: 'yearly', label: 'Yearly', price: '£100' }].map((p) => (
              <div key={p.id} onClick={() => setPlan(p.id)}
                style={{
                  flex: 1, padding: '16px', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${plan === p.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: plan === p.id ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                  cursor: 'pointer', textAlign: 'center',
                }}>
                <div style={{ fontWeight: 600 }}>{p.label}</div>
                <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: plan === p.id ? 'var(--accent)' : 'var(--text-primary)' }}>{p.price}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-full" disabled={subscribing} onClick={handleSubscribe}>
            {subscribing ? 'Processing...' : 'Subscribe Now'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Winnings Section ──────────────────────────────────────────────
function WinningsSection() {
  const { user } = useAuth();
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/winners/me').then(({ data }) => setWinners(data.winners || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const submitProof = async (winnerId) => {
    const url = prompt('Enter proof image URL (screenshot from your golf platform):');
    if (!url) return;
    try {
      await api.put(`/winners/${winnerId}/proof`, { proofImageUrl: url });
      toast.success('Proof submitted! Awaiting admin review.');
      setWinners((prev) => prev.map((w) => w._id === winnerId ? { ...w, verificationStatus: 'proof_submitted' } : w));
    } catch (err) {
      toast.error('Failed to submit proof');
    }
  };

  const tierColor = { '5-match': 'var(--gold)', '4-match': '#60a5fa', '3-match': 'var(--accent)' };
  const statusBadge = {
    pending: <span className="badge badge-yellow"><Clock size={10} /> Pending</span>,
    proof_submitted: <span className="badge badge-blue"><Clock size={10} /> Under Review</span>,
    approved: <span className="badge badge-green"><CheckCircle size={10} /> Approved</span>,
    rejected: <span className="badge badge-red"><XCircle size={10} /> Rejected</span>,
  };

  if (loading) return <div className="page-loader"><div className="loading-spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>My Winnings</h2>
        <p>Your draw history and prize status</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Total Won</div>
          <div className="stat-value">£{user?.totalWinnings?.toFixed(2) || '0.00'}</div>
          <div className="stat-sub">Lifetime earnings</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Draw Wins</div>
          <div className="stat-value">{winners.length}</div>
          <div className="stat-sub">Total prize events</div>
        </div>
      </div>

      {winners.length === 0 ? (
        <div className="empty-state">
          <Trophy size={48} />
          <h3>No wins yet</h3>
          <p>Keep entering scores and participating in monthly draws. Your win could be next!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {winners.map((win) => (
            <div key={win._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: tierColor[win.matchType] }}>
                      {win.matchType === '5-match' ? '🏆 Jackpot' : win.matchType === '4-match' ? '🥈 4-Match' : '🥉 3-Match'}
                    </span>
                    {statusBadge[win.verificationStatus]}
                  </div>
                  <p style={{ fontSize: '0.85rem', marginBottom: 4 }}>
                    Draw: {win.draw?.month != null ? `${win.draw.month + 1}/${win.draw.year}` : 'N/A'}
                  </p>
                  <p style={{ fontSize: '0.85rem' }}>Your scores: {win.userScores?.join(', ')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: tierColor[win.matchType] }}>
                    £{win.prizeAmount?.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem' }}>
                    <span className={`badge ${win.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'}`}>
                      {win.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending Payment'}
                    </span>
                  </div>
                </div>
              </div>
              {win.verificationStatus === 'pending' && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => submitProof(win._id)}>
                    Submit Proof
                  </button>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 10 }}>
                    Upload screenshot from your golf platform
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Overview Section ──────────────────────────────────────────────
function OverviewSection({ onNavigate }) {
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [scores, setScores] = useState([]);
  const [latestDraw, setLatestDraw] = useState(null);

  useEffect(() => {
    api.get('/subscriptions/me').then(({ data }) => setSub(data.subscription)).catch(() => {});
    api.get('/scores/me').then(({ data }) => setScores(data.entries || [])).catch(() => {});
    api.get('/draws/latest').then(({ data }) => setLatestDraw(data.draw)).catch(() => {});
  }, []);

  const isActive = sub && sub.status === 'active' && new Date() < new Date(sub.endDate);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
        <p>Here's your GolfGive snapshot</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Subscription</div>
          <div style={{ margin: '6px 0' }}><span className={`badge ${isActive ? 'badge-green' : 'badge-red'}`}>{isActive ? '✓ Active' : '✗ Inactive'}</span></div>
          <div className="stat-sub">{isActive ? `${sub.plan} plan` : 'Subscribe to participate'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Scores Stored</div>
          <div className="stat-value">{scores.length}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/5</span></div>
          <div className="stat-sub">Latest entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Winnings</div>
          <div className="stat-value">£{user?.totalWinnings?.toFixed(2) || '0.00'}</div>
          <div className="stat-sub">All-time prizes</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Charity %</div>
          <div className="stat-value">{user?.charityPercentage || 10}%</div>
          <div className="stat-sub">Of your subscription</div>
        </div>
      </div>

      {/* Score preview */}
      {scores.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>My Scores</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('scores')}>Manage →</button>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {scores.map((e, i) => (
              <div key={e._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div className={`score-ball ${i === 0 ? 'highlight' : ''}`}>{e.value}</div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest draw */}
      {latestDraw && (
        <div className="card-elevated">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                Latest Draw — {months[latestDraw.month]} {latestDraw.year}
              </div>
              <h3>Winning Numbers</h3>
            </div>
            <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gold)' }}>
              Jackpot: £{latestDraw.jackpotPool?.toFixed(2)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            {latestDraw.winningNumbers?.map((n, i) => (
              <div key={i} className="draw-ball">{n}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'scores', label: 'My Scores', icon: Target },
  { id: 'winnings', label: 'Winnings', icon: Trophy },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
];

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');

  const handleLogout = () => { logout(); navigate('/'); };

  const renderSection = () => {
    switch (active) {
      case 'scores': return <ScoreSection />;
      case 'subscription': return <SubscriptionSection />;
      case 'winnings': return <WinningsSection />;
      default: return <OverviewSection onNavigate={setActive} />;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div style={{ padding: '0 2px', marginBottom: 16 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Player
          </div>
        </div>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`sidebar-item ${active === id ? 'active' : ''}`} onClick={() => setActive(id)}>
            <Icon size={16} /> {label}
          </button>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <button className="sidebar-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>
      <main className="main-content">{renderSection()}</main>
    </div>
  );
}
