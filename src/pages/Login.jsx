import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    // Restore remembered preference
    return localStorage.getItem('rememberMe') === 'true';
  });

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Pre-fill email if user previously chose Remember Me
  useEffect(() => {
    if (localStorage.getItem('rememberMe') === 'true') {
      const savedEmail = localStorage.getItem('rememberedEmail') || '';
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError({ email: '', password: '' });
    setLoading(true);

    // Persist or clear the Remember Me preference
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberedEmail');
    }

    const result = await login(email, password, rememberMe);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      // Highlight the specific field if server told us which one
      if (result.field === 'email') {
        setFieldError(p => ({ ...p, email: result.error }));
      } else if (result.field === 'password') {
        setFieldError(p => ({ ...p, password: result.error }));
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' }}>
        {/* Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{ position: 'absolute', width: 350, height: 350, top: '-5%', left: '-10%', borderRadius: '50%', background: 'radial-gradient(circle, #3b82f6, #1d4ed8)', filter: 'blur(60px)', opacity: 0.35, animation: 'float 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 300, height: 300, bottom: '-10%', right: '-5%', borderRadius: '50%', background: 'radial-gradient(circle, #8b5cf6, #5b21b6)', filter: 'blur(60px)', opacity: 0.3, animation: 'float 8s ease-in-out infinite', animationDelay: '-4s' }} />
          <div style={{ position: 'absolute', width: 200, height: 200, top: '40%', right: '10%', borderRadius: '50%', background: 'radial-gradient(circle, #06b6d4, #0284c7)', filter: 'blur(50px)', opacity: 0.2, animation: 'float 8s ease-in-out infinite', animationDelay: '-2s' }} />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative flex flex-col justify-center px-16 py-20 z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">
              <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PARK</span>FLOW
            </span>
          </div>

          <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">
            Smart Parking<br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Made Simple
            </span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-12">
            Find, reserve, and pay for parking in seconds. Join thousands of happy drivers.
          </p>

          {/* Feature bullets */}
          <div className="space-y-4">
            {[
              'Real-time slot availability',
              'Digital QR-based entry',
              'Smart waitlist management',
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.3)' }}>
                  <svg viewBox="0 0 12 12" className="w-3 h-3 text-violet-300 fill-current">
                    <path d="M9.5 3L5 8 2.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  </svg>
                </div>
                <span className="text-slate-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12"
        style={{ background: '#f8fafc' }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">
              <span style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PARK</span>
              <span className="text-slate-800">FLOW</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500">Sign in to your account to continue</p>
          </div>

          {/* Global error — only when no field is specifically identified */}
          {error && (
            <div className="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm"
              style={{ background: 'linear-gradient(135deg, #ffe4e6, #fecdd3)', color: '#9f1239', border: '1px solid #fca5a5' }}>
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: fieldError.email ? '#f87171' : '#94a3b8' }}>
                  <Mail size={16} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldError(p => ({ ...p, email: '' })); }}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-900 transition-all outline-none"
                  style={{
                    border: `1.5px solid ${fieldError.email ? '#f87171' : '#e2e8f0'}`,
                    background: fieldError.email ? '#fff5f5' : 'white',
                    boxShadow: fieldError.email ? '0 0 0 3px rgba(248,113,113,0.15)' : 'inset 0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  onFocus={e => { e.target.style.borderColor = fieldError.email ? '#f87171' : '#3b82f6'; e.target.style.boxShadow = fieldError.email ? '0 0 0 3px rgba(248,113,113,0.2)' : '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={e  => { e.target.style.borderColor = fieldError.email ? '#f87171' : '#e2e8f0'; e.target.style.boxShadow = fieldError.email ? '0 0 0 3px rgba(248,113,113,0.15)' : 'inset 0 1px 3px rgba(0,0,0,0.04)'; }}
                />
              </div>
              {fieldError.email && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                  style={{ background: '#fff5f5', border: '1px solid #fca5a5', color: '#9f1239' }}>
                  <AlertCircle size={13} className="flex-shrink-0" />
                  <span>{fieldError.email}{' '}
                    <Link to="/register" className="font-bold underline">Create an account →</Link>
                  </span>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: fieldError.password ? '#f87171' : '#94a3b8' }}>
                  <Lock size={16} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldError(p => ({ ...p, password: '' })); }}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-slate-900 transition-all outline-none"
                  style={{
                    border: `1.5px solid ${fieldError.password ? '#f87171' : '#e2e8f0'}`,
                    background: fieldError.password ? '#fff5f5' : 'white',
                    boxShadow: fieldError.password ? '0 0 0 3px rgba(248,113,113,0.15)' : 'inset 0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  onFocus={e => { e.target.style.borderColor = fieldError.password ? '#f87171' : '#3b82f6'; e.target.style.boxShadow = fieldError.password ? '0 0 0 3px rgba(248,113,113,0.2)' : '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={e  => { e.target.style.borderColor = fieldError.password ? '#f87171' : '#e2e8f0'; e.target.style.boxShadow = fieldError.password ? '0 0 0 3px rgba(248,113,113,0.15)' : 'inset 0 1px 3px rgba(0,0,0,0.04)'; }}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldError.password && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-rose-500 mt-1">
                  <AlertCircle size={12} className="flex-shrink-0" /> {fieldError.password}
                </p>
              )}
            </div>

            {/* Remember Me + Forgot Password row */}
            <div className="flex items-center justify-between">
              <label
                id="remember-me-label"
                htmlFor="remember-me"
                className="flex items-center gap-2.5 cursor-pointer group select-none"
              >
                {/* Custom checkbox */}
                <div className="relative">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
                    style={{
                      background: rememberMe
                        ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                        : 'white',
                      borderColor: rememberMe ? '#2563eb' : '#d1d5db',
                      boxShadow: rememberMe ? '0 0 0 3px rgba(37,99,235,0.15)' : 'none',
                    }}
                  >
                    {rememberMe && (
                      <svg
                        viewBox="0 0 10 8"
                        className="w-3 h-3 text-white fill-none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 4l2.5 2.5L9 1" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                  Remember me
                </span>
              </label>

              <span className="text-xs text-slate-400"
                title="Session stays active across browser restarts when checked">
                {rememberMe ? '✓ Stays signed in' : 'Session only'}
              </span>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.4)',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(37,99,235,0.5)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.4)'; }}
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                <> Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold hover:underline"
              style={{ color: '#2563eb' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
