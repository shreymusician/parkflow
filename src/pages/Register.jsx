import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

/* ── shared style helpers ── */
const makeInputStyle = (hasError) => ({
  paddingLeft: '40px',
  paddingRight: '14px',
  paddingTop: '11px',
  paddingBottom: '11px',
  border: `1.5px solid ${hasError ? '#f87171' : '#e2e8f0'}`,
  borderRadius: '12px',
  fontSize: '14px',
  fontFamily: 'Inter, sans-serif',
  color: '#0f172a',
  outline: 'none',
  width: '100%',
  background: hasError ? '#fff5f5' : 'white',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxShadow: hasError ? '0 0 0 3px rgba(248,113,113,0.15)' : 'none',
});
const focusNormal = { borderColor: '#3b82f6', boxShadow: '0 0 0 3px rgba(59,130,246,0.15)', background: 'white' };
const blurNormal  = { borderColor: '#e2e8f0', boxShadow: 'none', background: 'white' };
const focusError  = { borderColor: '#f87171', boxShadow: '0 0 0 3px rgba(248,113,113,0.2)', background: '#fff5f5' };

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-xs font-medium text-rose-500 mt-1.5">
    <AlertCircle size={11} className="flex-shrink-0" /> {msg}
  </p>
) : null;

const Register = () => {
  const [form, setForm]               = useState({ name: '', email: '', mobileNumber: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});   // { email: 'msg', mobileNumber: 'msg', ... }
  const [globalError, setGlobalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const { register } = useContext(AuthContext);
  const navigate     = useNavigate();

  const set = (key) => (e) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    // Clear the per-field error as the user starts correcting
    if (fieldErrors[key]) setFieldErrors(p => ({ ...p, [key]: '' }));
    if (globalError)      setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError('');

    // Client-side pre-validation
    const errs = {};
    if (!form.name.trim())                         errs.name         = 'Full name is required.';
    if (!/^\d{10}$/.test(form.mobileNumber))       errs.mobileNumber = 'Must be exactly 10 digits.';
    if (form.password.length < 6)                  errs.password     = 'Password must be at least 6 characters.';
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    const result = await register(form.name, form.email, form.mobileNumber, form.password);
    if (result.success) {
      navigate('/complete-profile');
    } else {
      // Server returned a specific field — highlight it
      if (result.field) {
        setFieldErrors({ [result.field]: result.error });
      } else {
        setGlobalError(result.error);
      }
      setLoading(false);
    }
  };

  const pwStrength = () => {
    const p = form.password;
    if (!p) return 0;
    if (p.length < 6) return 1;
    if (p.length < 8) return 2;
    if (/[A-Z]/.test(p) && /\d/.test(p)) return 4;
    return 3;
  };
  const strength   = pwStrength();
  const strengthLabel = ['', 'Too short', 'Weak', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'][strength];

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #064e3b 0%, #065f46 40%, #047857 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{ position:'absolute', width:350, height:350, top:'-10%', left:'-10%', borderRadius:'50%', background:'radial-gradient(circle,#10b981,#059669)', filter:'blur(60px)', opacity:0.4, animation:'float 8s ease-in-out infinite' }} />
          <div style={{ position:'absolute', width:280, height:280, bottom:'-5%', right:'-5%', borderRadius:'50%', background:'radial-gradient(circle,#06b6d4,#0284c7)', filter:'blur(60px)', opacity:0.3, animation:'float 8s ease-in-out infinite', animationDelay:'-3s' }} />
        </div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)', backgroundSize:'40px 40px' }} />

        <div className="relative flex flex-col justify-center px-16 py-20 z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'rgba(255,255,255,0.2)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">PARKFLOW</span>
          </div>

          <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">
            Join the<br />
            <span style={{ background:'linear-gradient(135deg,#6ee7b7,#34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              ParkFlow Community
            </span>
          </h2>
          <p className="text-emerald-200 text-lg leading-relaxed mb-12">
            Create your free account and start finding perfect parking spots in seconds.
          </p>

          <div className="space-y-4">
            {['No credit card required to start', 'Instant account setup in 2 minutes', 'Access to 30+ Bangalore hubs'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12" style={{ background:'#f8fafc' }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#059669,#06b6d4)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800">PARKFLOW</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create your account</h1>
            <p className="text-slate-500">Start your smart parking journey today</p>
          </div>

          {/* Global error (when no specific field is identified) */}
          {globalError && (
            <div className="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm"
              style={{ background:'linear-gradient(135deg,#ffe4e6,#fecdd3)', color:'#9f1239', border:'1px solid #fca5a5' }}>
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{globalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"><User size={16} /></div>
                <input id="register-name" type="text" placeholder="John Doe" value={form.name}
                  onChange={set('name')} required
                  style={makeInputStyle(!!fieldErrors.name)}
                  onFocus={e => Object.assign(e.target.style, fieldErrors.name ? focusError : focusNormal)}
                  onBlur={e  => Object.assign(e.target.style, fieldErrors.name ? { ...makeInputStyle(true), ...focusError } : blurNormal)}
                />
              </div>
              <FieldError msg={fieldErrors.name} />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"><Mail size={16} /></div>
                <input id="register-email" type="email" placeholder="you@example.com" value={form.email}
                  onChange={set('email')} required
                  style={makeInputStyle(!!fieldErrors.email)}
                  onFocus={e => Object.assign(e.target.style, fieldErrors.email ? focusError : focusNormal)}
                  onBlur={e  => Object.assign(e.target.style, fieldErrors.email ? { ...makeInputStyle(true), ...focusError } : blurNormal)}
                />
              </div>
              {/* Specific helper for duplicate email */}
              {fieldErrors.email && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                  style={{ background:'#fff5f5', border:'1px solid #fca5a5', color:'#9f1239' }}>
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>
                    {fieldErrors.email}{' '}
                    <Link to="/login" className="font-bold underline">Sign in instead →</Link>
                  </span>
                </div>
              )}
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Mobile Number</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"><Phone size={16} /></div>
                <input id="register-mobile" type="tel" placeholder="10-digit number" value={form.mobileNumber}
                  onChange={set('mobileNumber')} required maxLength={10}
                  style={makeInputStyle(!!fieldErrors.mobileNumber)}
                  onFocus={e => Object.assign(e.target.style, fieldErrors.mobileNumber ? focusError : focusNormal)}
                  onBlur={e  => Object.assign(e.target.style, fieldErrors.mobileNumber ? { ...makeInputStyle(true), ...focusError } : blurNormal)}
                />
              </div>
              <FieldError msg={fieldErrors.mobileNumber} />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"><Lock size={16} /></div>
                <input id="register-password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={set('password')} required minLength="6"
                  style={{ ...makeInputStyle(!!fieldErrors.password), paddingRight: '40px' }}
                  onFocus={e => Object.assign(e.target.style, fieldErrors.password ? focusError : focusNormal)}
                  onBlur={e  => Object.assign(e.target.style, fieldErrors.password ? { ...makeInputStyle(true), ...focusError } : blurNormal)}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError msg={fieldErrors.password} />
              {/* Strength meter */}
              {form.password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: strength >= i ? strengthColor : '#e2e8f0' }} />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}
            </div>

            <button id="register-submit" type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60 mt-2"
              style={{
                background: loading ? '#94a3b8' : 'linear-gradient(135deg,#059669,#0284c7)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(5,150,105,0.4)',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 30px rgba(5,150,105,0.5)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(5,150,105,0.4)'; }}
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
                : <>Continue Registration <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color:'#059669' }}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
