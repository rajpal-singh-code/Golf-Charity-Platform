import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

const PLANS = [
  { id: 'monthly', label: 'Monthly', price: '£10', period: '/month', desc: 'Pay monthly, cancel anytime' },
  { id: 'yearly', label: 'Yearly', price: '£100', period: '/year', desc: 'Save 2 months vs monthly' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: account, 2: charity, 3: plan
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    selectedCharity: '', charityPercentage: 10,
    plan: 'monthly',
  });

  useEffect(() => {
    api.get('/charities').then(({ data }) => setCharities(data.charities || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return false; }
    if (!form.email.trim()) { toast.error('Email is required'); return false; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const user = await register(form);

      // Subscribe immediately after registration
      if (form.plan) {
        await api.post('/subscriptions', { plan: form.plan });
      }

      toast.success('Account created! Welcome to GolfGive 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
          {['Account', 'Charity', 'Plan'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step > i + 1 ? 'var(--accent)' : step === i + 1 ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                border: `2px solid ${step >= i + 1 ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700,
                color: step > i + 1 ? '#0a0c0f' : step === i + 1 ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all 0.3s',
              }}>
                {step > i + 1 ? <Check size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: '0.8rem', color: step === i + 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {label}
              </span>
              {i < 2 && <div style={{ width: 32, height: 1, background: step > i + 1 ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '40px' }}>
          {/* STEP 1: Account */}
          {step === 1 && (
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ marginBottom: 6 }}>Create Account</h2>
                <p style={{ fontSize: '0.9rem' }}>Join GolfGive and start making an impact</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" name="name" placeholder="John Smith" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input" type={showPw ? 'text' : 'password'}
                      name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange}
                      style={{ paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }} onClick={() => { if (validateStep1()) setStep(2); }}>
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Charity */}
          {step === 2 && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ marginBottom: 6 }}>Choose Your Charity</h2>
                <p style={{ fontSize: '0.9rem' }}>A portion of your subscription goes directly to your chosen charity</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, maxHeight: 300, overflowY: 'auto' }}>
                {charities.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No charities available yet. You can select one later from your profile.</p>}
                {charities.map((c) => (
                  <div key={c._id} onClick={() => setForm((p) => ({ ...p, selectedCharity: c._id }))}
                    style={{
                      padding: '14px 16px', borderRadius: 'var(--radius-md)',
                      border: `2px solid ${form.selectedCharity === c._id ? 'var(--accent)' : 'var(--border)'}`,
                      background: form.selectedCharity === c._id ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{c.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.category}</div>
                    </div>
                    {form.selectedCharity === c._id && <Check size={18} color="var(--accent)" />}
                  </div>
                ))}
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Charity Contribution: {form.charityPercentage}% of subscription</label>
                <input type="range" min={10} max={50} step={5} name="charityPercentage"
                  value={form.charityPercentage} onChange={handleChange}
                  style={{ width: '100%', accentColor: 'var(--accent)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Min 10%</span><span>50%</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep(3)}>
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}

          {/* STEP 3: Plan */}
          {step === 3 && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ marginBottom: 6 }}>Choose Your Plan</h2>
                <p style={{ fontSize: '0.9rem' }}>Subscribe to enter monthly draws and win prizes</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {PLANS.map((plan) => (
                  <div key={plan.id} onClick={() => setForm((p) => ({ ...p, plan: plan.id }))}
                    style={{
                      padding: '20px', borderRadius: 'var(--radius-md)',
                      border: `2px solid ${form.plan === plan.id ? 'var(--accent)' : 'var(--border)'}`,
                      background: form.plan === plan.id ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{plan.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{plan.desc}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: form.plan === plan.id ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {plan.price}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{plan.period}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-primary" style={{ flex: 2 }} disabled={loading} onClick={handleSubmit}>
                  {loading ? <><div className="loading-spinner" style={{ width: 18, height: 18 }} /> Creating...</>
                    : 'Create Account & Subscribe'}
                </button>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
