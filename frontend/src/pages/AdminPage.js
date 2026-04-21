import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, CreditCard, Trophy,
  Heart, Zap, LogOut, Play, CheckCircle, XCircle,
  DollarSign, TrendingUp, RefreshCw, Plus, Pencil, Trash2
} from 'lucide-react';

// ── Admin Stats Overview ──────────────────────────────────────────
function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data.stats)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="loading-spinner" /></div>;
  if (!stats) return null;

  return (
    <div className="fade-in">
      <div className="page-header"><h2>Admin Dashboard</h2><p>Platform overview and controls</p></div>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#60a5fa' },
          { label: 'Active Subs', value: stats.activeSubscriptions, icon: CreditCard, color: 'var(--accent)' },
          { label: 'Total Revenue', value: `£${stats.totalRevenue?.toFixed(2)}`, icon: DollarSign, color: 'var(--gold)' },
          { label: 'Pending Proofs', value: stats.pendingWinners, icon: Trophy, color: '#f87171' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value" style={{ color }}>{value}</div>
              </div>
              <div style={{ padding: 10, borderRadius: 'var(--radius-sm)', background: `${color}18` }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Prize Pool Breakdown</h3>
          {[
            { label: '5-Match Jackpot', pct: 40, color: 'var(--gold)' },
            { label: '4-Match Prize', pct: 35, color: '#60a5fa' },
            { label: '3-Match Prize', pct: 25, color: 'var(--accent)' },
          ].map(({ label, pct, color }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ color, fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Recent Users</h3>
          {stats.recentUsers?.map((u) => (
            <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{u.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Users Management ──────────────────────────────────────────────
function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users').then(({ data }) => setUsers(data.users)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleActive = async (user) => {
    try {
      const { data } = await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
      setUsers((prev) => prev.map((u) => u._id === user._id ? data.user : u));
      toast.success(`User ${data.user.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update user'); }
  };

  if (loading) return <div className="page-loader"><div className="loading-spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header"><h2>User Management</h2><p>{users.length} registered users</p></div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Charity %</th><th>Status</th><th>Joined</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.charityPercentage}%</td>
                <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`} onClick={() => toggleActive(u)}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Draw Management ───────────────────────────────────────────────
function AdminDraws() {
  const { user } = useAuth();
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [creating, setCreating] = useState(false);
  const [drawType, setDrawType] = useState('random');

  const fetch = async () => {
    try {
      const { data } = await api.get('/draws/admin');
      setDraws(data.draws);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const createDraw = async () => {
    setCreating(true);
    try {
      await api.post('/draws');
      toast.success('Draw created for this month!');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create draw');
    } finally { setCreating(false); }
  };

  const runDraw = async (drawId, simulate = false) => {
    if (!simulate && !window.confirm('This will publish results and notify winners. Continue?')) return;
    setRunning(drawId);
    try {
      const { data } = await api.post(`/draws/${drawId}/run`, { drawType, simulate });
      toast.success(data.message);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Draw failed');
    } finally { setRunning(null); }
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const statusBadge = {
    pending: <span className="badge badge-gray">Pending</span>,
    simulated: <span className="badge badge-yellow">Simulated</span>,
    published: <span className="badge badge-green">Published</span>,
  };

  if (loading) return <div className="page-loader"><div className="loading-spinner" /></div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>Draw Management</h2><p>Run and manage monthly draws</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="form-select" style={{ width: 'auto' }} value={drawType} onChange={(e) => setDrawType(e.target.value)}>
            <option value="random">🎲 Random Draw</option>
            <option value="algorithmic">📊 Algorithmic Draw</option>
          </select>
          <button className="btn btn-primary" disabled={creating} onClick={createDraw}>
            <Plus size={16} /> Create This Month's Draw
          </button>
        </div>
      </div>

      {draws.length === 0 ? (
        <div className="empty-state"><Zap size={48} /><h3>No draws yet</h3><p>Create this month's draw to get started.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {draws.map((draw) => (
            <div key={draw._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <h3>{months[draw.month]} {draw.year}</h3>
                    {statusBadge[draw.status]}
                  </div>
                  <div style={{ display: 'flex', gap: 20, fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>Pool: £{draw.totalPrizePool?.toFixed(2)}</span>
                    <span>Jackpot: £{draw.jackpotPool?.toFixed(2)}</span>
                    <span>Participants: {draw.participantCount}</span>
                    {draw.rolloverAmount > 0 && <span style={{ color: 'var(--gold)' }}>+£{draw.rolloverAmount} rollover</span>}
                  </div>
                  {draw.winningNumbers?.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      {draw.winningNumbers.map((n, i) => <div key={i} className="draw-ball" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>{n}</div>)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {draw.status !== 'published' && (
                    <>
                      <button className="btn btn-secondary btn-sm" disabled={running === draw._id}
                        onClick={() => runDraw(draw._id, true)}>
                        <RefreshCw size={14} /> Simulate
                      </button>
                      <button className="btn btn-primary btn-sm" disabled={running === draw._id}
                        onClick={() => runDraw(draw._id, false)}>
                        {running === draw._id ? <div className="loading-spinner" style={{ width: 14, height: 14 }} /> : <Play size={14} />}
                        Publish Draw
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Winners Management ────────────────────────────────────────────
function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetch = async () => {
    try {
      const url = filter ? `/winners?status=${filter}` : '/winners';
      const { data } = await api.get(url);
      setWinners(data.winners);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]);

  const verify = async (winnerId, action) => {
    try {
      await api.put(`/winners/${winnerId}/verify`, { action });
      toast.success(`Winner ${action}d`);
      fetch();
    } catch { toast.error('Failed to update winner'); }
  };

  const markPaid = async (winnerId) => {
    try {
      await api.put(`/winners/${winnerId}/pay`);
      toast.success('Marked as paid');
      fetch();
    } catch { toast.error('Failed to mark as paid'); }
  };

  const tierColor = { '5-match': 'var(--gold)', '4-match': '#60a5fa', '3-match': 'var(--accent)' };
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (loading) return <div className="page-loader"><div className="loading-spinner" /></div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div><h2 style={{ fontFamily: 'var(--font-display)' }}>Winners</h2><p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verify submissions and manage payouts</p></div>
        <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="proof_submitted">Proof Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {winners.length === 0 ? (
        <div className="empty-state"><Trophy size={48} /><h3>No winners found</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {winners.map((w) => (
            <div key={w._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, color: tierColor[w.matchType] }}>{w.matchType}</span>
                    <span className="badge badge-yellow">£{w.prizeAmount?.toFixed(2)}</span>
                    <span className={`badge ${w.paymentStatus === 'paid' ? 'badge-green' : 'badge-gray'}`}>
                      {w.paymentStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    {w.user?.name} ({w.user?.email})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Draw: {w.draw ? `${months[w.draw.month]} ${w.draw.year}` : 'N/A'} · Status: {w.verificationStatus}
                  </div>
                  {w.proofImageUrl && (
                    <a href={w.proofImageUrl} target="_blank" rel="noreferrer"
                      style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'block', marginTop: 4 }}>
                      View Proof →
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {w.verificationStatus === 'proof_submitted' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => verify(w._id, 'approve')}>
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => verify(w._id, 'reject')}>
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}
                  {w.verificationStatus === 'approved' && w.paymentStatus === 'pending' && (
                    <button className="btn btn-primary btn-sm" onClick={() => markPaid(w._id)}>
                      <DollarSign size={14} /> Mark Paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Charity Management ────────────────────────────────────────────
function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', category: 'other', website: '', imageUrl: '', isFeatured: false });
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try {
      const { data } = await api.get('/charities');
      setCharities(data.charities);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const startEdit = (c) => {
    setEditing(c._id);
    setForm({ name: c.name, description: c.description, category: c.category, website: c.website || '', imageUrl: c.imageUrl || '', isFeatured: c.isFeatured });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/charities/${editing}`, form);
        toast.success('Charity updated');
      } else {
        await api.post('/charities', form);
        toast.success('Charity created');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', description: '', category: 'other', website: '', imageUrl: '', isFeatured: false });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save charity');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this charity?')) return;
    try {
      await api.delete(`/charities/${id}`);
      toast.success('Charity deactivated');
      fetch();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="page-loader"><div className="loading-spinner" /></div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h2 style={{ fontFamily: 'var(--font-display)' }}>Charities</h2><p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{charities.length} active charities</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> Add Charity</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>{editing ? 'Edit Charity' : 'New Charity'}</h3>
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Charity name" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {['health','education','environment','sports','community','other'].map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Charity description..." />
          </div>
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Website URL</label>
              <input className="form-input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
            </div>
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input className="form-input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://image.jpg" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
            <input type="checkbox" id="featured" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            <label htmlFor="featured" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Feature on homepage</label>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
            <button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid-2">
        {charities.map((c) => (
          <div key={c._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: '1rem' }}>{c.name}</h3>
                  {c.isFeatured && <span className="badge badge-yellow">⭐ Featured</span>}
                </div>
                <span className="badge badge-gray" style={{ marginBottom: 8 }}>{c.category}</span>
                <p style={{ fontSize: '0.85rem', marginTop: 8, WebkitLineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                  {c.description}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => startEdit(c)}><Pencil size={14} /> Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Subscriptions Management ──────────────────────────────────────
function AdminSubscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/subscriptions').then(({ data }) => {
      setSubs(data.subscriptions);
      setStats({ total: data.totalRevenue, active: data.activeCount });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/subscriptions/${id}`, { status });
      setSubs((prev) => prev.map((s) => s._id === id ? { ...s, status } : s));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  if (loading) return <div className="page-loader"><div className="loading-spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header"><h2>Subscriptions</h2><p>Manage user subscriptions and billing</p></div>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">£{stats.total?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Subscribers</div>
          <div className="stat-value">{stats.active || 0}</div>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>User</th><th>Plan</th><th>Amount</th><th>Status</th><th>Renews</th><th>Action</th></tr></thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s._id}>
                <td>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.user?.email}</div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{s.plan}</td>
                <td>£{s.amount}</td>
                <td><span className={`badge ${s.status === 'active' ? 'badge-green' : s.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>{s.status}</span></td>
                <td style={{ fontSize: '0.85rem' }}>{new Date(s.endDate).toLocaleDateString()}</td>
                <td>
                  {s.status !== 'active' ? (
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(s._id, 'active')}>Activate</button>
                  ) : (
                    <button className="btn btn-danger btn-sm" onClick={() => updateStatus(s._id, 'cancelled')}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Admin Shell ───────────────────────────────────────────────────
const ADMIN_NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'draws', label: 'Draw Engine', icon: Zap },
  { id: 'winners', label: 'Winners', icon: Trophy },
  { id: 'charities', label: 'Charities', icon: Heart },
];

export default function AdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');

  const handleLogout = () => { logout(); navigate('/'); };

  const renderSection = () => {
    switch (active) {
      case 'users': return <AdminUsers />;
      case 'subscriptions': return <AdminSubscriptions />;
      case 'draws': return <AdminDraws />;
      case 'winners': return <AdminWinners />;
      case 'charities': return <AdminCharities />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div style={{ padding: '4px 14px 12px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Admin Panel
          </div>
        </div>
        {ADMIN_NAV.map(({ id, label, icon: Icon }) => (
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
