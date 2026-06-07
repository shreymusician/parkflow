import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, Zap, QrCode, Bell, CheckCircle2, ArrowRight, Star, Shield, Clock, ChevronDown, Sparkles } from 'lucide-react';

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.0)',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(226,232,240,0.8)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                <span style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PARK</span>
                <span className="text-slate-800">FLOW</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  boxShadow: '0 4px 15px rgba(37,99,235,0.35)',
                }}
              >
                Get Started <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{
        background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%)'
      }}>
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb orb-blue" style={{ width: 500, height: 500, top: '-10%', left: '-5%', opacity: 0.3 }} />
          <div className="orb orb-purple" style={{ width: 400, height: 400, bottom: '-10%', right: '5%', opacity: 0.25 }} />
          <div className="orb orb-cyan" style={{ width: 300, height: 300, top: '30%', right: '20%', opacity: 0.2 }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#a5b4fc',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Smart Parking Platform — Now Available
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
            style={{ animation: 'fadeIn 0.8s ease-out both' }}>
            <span className="text-white">The Future of</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Smart Parking
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base md:text-xl text-slate-300 mb-10 leading-relaxed"
            style={{ animation: 'fadeIn 0.8s 0.2s ease-out both', opacity: 0, animationFillMode: 'both' }}>
            ParkFlow eliminates the frustration of finding a parking spot. Our intelligent allocation engine
            finds, reserves, and guides you to the perfect space in real-time.
          </p>

          <div className="flex justify-center gap-4 flex-col sm:flex-row"
            style={{ animation: 'fadeIn 0.8s 0.4s ease-out both', animationFillMode: 'both', opacity: 0 }}>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-2xl text-white transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                boxShadow: '0 8px 30px rgba(37,99,235,0.5)',
              }}
            >
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)',
              }}
            >
              View Live Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 md:mt-20 grid grid-cols-3 gap-3 max-w-2xl mx-auto"
            style={{ animation: 'fadeIn 0.8s 0.6s ease-out both', animationFillMode: 'both', opacity: 0 }}>
            {[
              { label: 'Parking Spots', value: '10K+' },
              { label: 'Happy Drivers', value: '50K+' },
              { label: 'Cities', value: '25+' },
            ].map(stat => (
              <div key={stat.label} className="p-4 rounded-2xl text-center"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-2xl md:text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-500">
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown size={16} className="animate-bounce" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#f8fafc' }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
              style={{ background: 'linear-gradient(135deg, #dbeafe, #ede9fe)', color: '#4338ca' }}>
              Features
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
              Everything for seamless parking
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Powerful features designed to save you time, reduce stress, and eliminate congestion.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              iconBg="linear-gradient(135deg, #f59e0b, #ef4444)"
              title="Smart Allocation"
              description="Our AI algorithms instantly match your vehicle to the most optimal available slot."
            />
            <FeatureCard
              icon={<Map className="w-6 h-6" />}
              iconBg="linear-gradient(135deg, #10b981, #06b6d4)"
              title="Real-Time Availability"
              description="View live capacity across multiple parking hubs on our interactive map."
            />
            <FeatureCard
              icon={<QrCode className="w-6 h-6" />}
              iconBg="linear-gradient(135deg, #2563eb, #7c3aed)"
              title="Digital QR Passes"
              description="Skip the ticket machine. Generate a digital QR pass for instant, frictionless entry."
            />
            <FeatureCard
              icon={<Bell className="w-6 h-6" />}
              iconBg="linear-gradient(135deg, #ec4899, #f43f5e)"
              title="Smart Notifications"
              description="Get real-time alerts for expiring sessions, waitlist promotions, and billing updates."
            />
          </div>
        </div>
      </section>

      {/* Benefits / CTA Section */}
      <section className="py-24 overflow-hidden" style={{ background: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden shadow-2xl" style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          }}>
            <div className="grid lg:grid-cols-2">
              {/* Left content */}
              <div className="p-6 md:p-12 lg:p-16 flex flex-col justify-center">
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">
                  Why ParkFlow
                </span>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-8 leading-tight">
                  Designed for the<br />
                  <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    modern driver
                  </span>
                </h2>
                <ul className="space-y-5 mb-10">
                  {[
                    'Reduced congestion and circling in parking lots',
                    'Faster parking experience from entry to exit',
                    'Better space utilization for facility managers',
                    'Automated waitlist management for busy hours',
                  ].map(text => (
                    <BenefitItem key={text} text={text} />
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-900 bg-white hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5 self-start"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                >
                  Join ParkFlow Today <ArrowRight size={16} />
                </Link>
              </div>

              {/* Right: Mock card */}
              <div className="p-6 md:p-12 lg:p-16 flex items-center justify-center relative"
                style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                {/* Decorative orb */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <div style={{
                    width: 300, height: 300, borderRadius: '50%',
                    background: 'radial-gradient(circle, #7c3aed, transparent)',
                    filter: 'blur(40px)',
                  }} />
                </div>

                <div className="relative w-full max-w-sm hover:rotate-0 transition-all duration-500"
                  style={{ transform: 'rotate(2deg)' }}>
                  {/* Mock parking pass */}
                  <div className="bg-white rounded-2xl p-6 shadow-2xl" style={{
                    boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)'
                  }}>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Digital Pass</p>
                        <p className="text-lg font-bold text-slate-900 mt-0.5">Downtown Hub</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #dbeafe, #ede9fe)' }}>
                        <QrCode className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>

                    {/* QR placeholder */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-4 flex items-center justify-center">
                      <div className="grid grid-cols-5 gap-1">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div key={i} className="w-4 h-4 rounded-sm"
                            style={{ background: Math.random() > 0.5 ? '#1e40af' : 'transparent' }} />
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-700"
                        style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                        ● ACTIVE
                      </span>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Slot</p>
                        <p className="text-sm font-bold text-blue-600">A-14</p>
                      </div>
                    </div>
                  </div>

                  {/* Second card behind */}
                  <div className="absolute inset-x-4 -bottom-3 -z-10 bg-white/30 rounded-2xl h-full backdrop-blur-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Social proof */}
      <section className="py-20" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Loved by thousands of drivers</h2>
            <div className="flex justify-center items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-slate-500">4.9/5 from 2,000+ reviews</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { name: 'Rohan M.', role: 'Daily Commuter', text: 'ParkFlow saved me 30 minutes every morning. Incredible experience!', avatar: 'R' },
              { name: 'Priya S.', role: 'Business Traveler', text: 'The QR pass feature is a game changer. No more fumbling with paper tickets.', avatar: 'P' },
              { name: 'Amit K.', role: 'Facility Manager', text: 'Our parking revenue increased by 40% after switching to ParkFlow.', avatar: 'A' },
            ].map(testimonial => (
              <div key={testimonial.name} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl font-bold text-white flex items-center justify-center text-sm"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'linear-gradient(180deg, #0f172a, #020617)' }} className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PARK</span>
                <span className="text-white">FLOW</span>
              </span>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-sm">Login</Link>
              <Link to="/register" className="text-slate-400 hover:text-white transition-colors text-sm">Register</Link>
              <Link to="/demo" className="text-slate-400 hover:text-white transition-colors text-sm">Demo</Link>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} ParkFlow Management System. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Shield size={14} className="text-emerald-500" />
              Secure & Encrypted
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, iconBg, title, description }) => (
  <div className="group p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-default">
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-white transition-transform duration-300 group-hover:scale-110"
      style={{ background: iconBg }}
    >
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
  </div>
);

const BenefitItem = ({ text }) => (
  <li className="flex items-start gap-3">
    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: 'rgba(99,102,241,0.2)' }}>
      <CheckCircle2 className="w-4 h-4 text-violet-400" />
    </div>
    <span className="text-slate-300 leading-relaxed">{text}</span>
  </li>
);

export default Landing;
