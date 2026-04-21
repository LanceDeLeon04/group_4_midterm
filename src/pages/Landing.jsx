import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Navigation, Bus, Zap, Users, Shield,
  ChevronRight, Map, Globe, BarChart3, AlertTriangle,
  ArrowRight, Star, TrendingUp, Clock, PhoneCall,
} from 'lucide-react';

const PROVINCES = [
  { name: 'Cavite',   color: '#6366f1', desc: 'Dasmariñas, Tagaytay, Bacoor, Imus', pop: '4.3M' },
  { name: 'Laguna',   color: '#10b981', desc: 'Calamba, Sta. Rosa, Cabuyao, Biñan',  pop: '3.4M' },
  { name: 'Batangas', color: '#f59e0b', desc: 'Batangas City, Lipa, Tanauan, Lemery', pop: '2.9M' },
  { name: 'Rizal',    color: '#ef4444', desc: 'Antipolo, Cainta, Taytay, Angono',     pop: '2.8M' },
  { name: 'Quezon',   color: '#8b5cf6', desc: 'Lucena, San Pablo, Sta. Cruz, Tayabas', pop: '2.3M' },
];

const FEATURES = [
  { icon: Navigation, title: 'Smart Route Planning', desc: 'Multi-option commute routes using real road data from OpenStreetMap + OpenRouteService API.', color: '#4f46e5' },
  { icon: Bus, title: 'Bus Company Database', desc: 'Routes from DLTB, JAC, JAM, ALPS, Ceres, Superlines and more — with pass-through detection.', color: '#10b981' },
  { icon: Zap, title: 'Grab & Angkas Estimates', desc: 'Real LTFRB fare formula with live surge pricing based on time of day, rush hour, and weekends.', color: '#f59e0b' },
  { icon: AlertTriangle, title: 'Transport Reports', desc: 'Community-sourced reports on overcharging, unsafe driving, strikes, and route disruptions.', color: '#ef4444' },
  { icon: MapPin, title: 'Interactive Mapping', desc: 'Pin locations on the map, view real road polylines, and see origin/destination markers live.', color: '#8b5cf6' },
  { icon: BarChart3, title: 'Fare Computation', desc: 'Per-segment fare breakdown for Jeepney, Bus, E-Jeep, Tricycle with discount support.', color: '#06b6d4' },
];

const STATS = [
  { value: '5', label: 'Provinces Covered', sub: 'CALABARZON Region' },
  { value: '80+', label: 'Known Routes', sub: 'Mapped & verified' },
  { value: '6', label: 'Transport Types', sub: 'Jeepney to TNVS' },
  { value: 'Free', label: 'Open Source', sub: 'SDG 11 aligned' },
];

// Animated counter
function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const num = parseInt(target) || 0;
        if (!num) { setVal(target); return; }
        let cur = 0;
        const step = Math.max(1, Math.floor(num / 40));
        const t = setInterval(() => {
          cur = Math.min(cur + step, num);
          setVal(cur);
          if (cur >= num) clearInterval(t);
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{typeof val === 'number' && parseInt(target) ? val + suffix : target}</span>;
}

export default function Landing() {
  const navigate = useNavigate();
  const [activeProvince, setActiveProvince] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onMouse = e => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', onScroll);
    window.addEventListener('mousemove', onMouse);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse); };
  }, []);

  const parallaxX = (mousePos.x / window.innerWidth - 0.5) * 20;
  const parallaxY = (mousePos.y / window.innerHeight - 0.5) * 20;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#fafafa', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #1e1b4b 40%, #0f172a 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '80px 20px 60px',
      }}>
        {/* Animated background orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', top: -100, left: -100, transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`, transition: 'transform 0.1s ease' }} />
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', bottom: -100, right: -50, transform: `translate(${-parallaxX * 0.3}px, ${-parallaxY * 0.3}px)`, transition: 'transform 0.1s ease' }} />
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', top: '50%', left: '60%', transform: `translate(${parallaxX * 0.8}px, ${parallaxY * 0.8}px)`, transition: 'transform 0.1s ease' }} />
          {/* Grid pattern */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* SDG Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(79,70,229,0.4)', borderRadius: 30, padding: '6px 16px', marginBottom: 28, backdropFilter: 'blur(8px)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.08em', textTransform: 'uppercase' }}>SDG 11 — Sustainable Cities & Communities</span>
        </div>

        {/* Main title */}
        <div style={{ textAlign: 'center', maxWidth: 780, marginBottom: 24, position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(48px, 8vw, 86px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.04em', marginBottom: 16 }}>
            <div style={{ color: '#fff' }}>Calabarz</div>
            <div style={{ background: 'linear-gradient(90deg, #818cf8, #a78bfa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ONE</div>
          </div>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontWeight: 400, margin: 0 }}>
            The Philippines' smartest commute intelligence platform for CALABARZON — real routes, real fares, real-time insights.
          </p>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 60, position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate('/home')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 28px', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: '0 8px 32px rgba(79,70,229,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(79,70,229,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(79,70,229,0.4)'; }}>
            <Navigation size={18} /> Plan Your Commute <ChevronRight size={16} />
          </button>
          <button onClick={() => navigate('/reports')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 14, padding: '14px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', backdropFilter: 'blur(8px)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
            <AlertTriangle size={18} /> View Reports
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, backdropFilter: 'blur(16px)', overflow: 'hidden', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ padding: '20px 32px', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none', textAlign: 'center', minWidth: 130 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                <Counter target={s.value} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: 'bounce 2s ease-in-out infinite' }}>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.4))' }} />
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>Scroll</div>
        </div>
      </section>

      {/* ── ABOUT / WHAT IS CALABARZON ── */}
      <section style={{ padding: '100px 20px', background: '#fff', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#4f46e5', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>About the System</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(32px, 4vw, 46px)', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20, margin: '0 0 20px' }}>
              Commute smarter across Southern Luzon
            </h2>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, marginBottom: 20 }}>
              CalabarzONE is a transport intelligence system built specifically for the CALABARZON region of the Philippines. It helps commuters find the best, cheapest, and most practical routes using real public transport options.
            </p>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, marginBottom: 28 }}>
              Using data from real bus companies like DLTB, JAC Liner, JAM Liner, ALPS, and Ceres, combined with live geocoding and routing APIs, the system provides a comprehensive commute planning experience unlike anything available for the region.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Nominatim API', 'OpenRouteService', 'LTFRB Formula', 'Open Weather'].map(t => (
                <span key={t} style={{ padding: '5px 12px', background: '#f0f2f7', color: '#475569', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {FEATURES.slice(0, 4).map((f, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: 16, padding: 20, border: '1.5px solid #f0f2f7', transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = `0 8px 32px ${f.color}18`; e.currentTarget.style.borderColor = f.color + '40'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#f0f2f7'; }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: f.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <f.icon size={18} color={f.color} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALABARZON PROVINCES ── */}
      <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#818cf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Coverage Area</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>The CALABARZON Region</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
              CALABARZON is Region IV-A of the Philippines — one of the most densely populated regions in the country, with over 16 million residents.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            {PROVINCES.map((p, i) => (
              <div key={i}
                onMouseEnter={() => setActiveProvince(i)}
                onMouseLeave={() => setActiveProvince(null)}
                style={{ background: activeProvince === i ? p.color : 'rgba(255,255,255,0.05)', border: `1.5px solid ${activeProvince === i ? p.color : 'rgba(255,255,255,0.1)'}`, borderRadius: 18, padding: '24px 28px', cursor: 'default', transition: 'all 0.25s', flex: '1 1 180px', maxWidth: 240, boxShadow: activeProvince === i ? `0 16px 48px ${p.color}40` : 'none', transform: activeProvince === i ? 'translateY(-4px)' : 'none' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: activeProvince === i ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Province</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: activeProvince === i ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 12 }}>{p.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={11} color={activeProvince === i ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)'} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: activeProvince === i ? '#fff' : 'rgba(255,255,255,0.5)' }}>Pop. ~{p.pop}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: '100px 20px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#4f46e5', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Platform Features</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Everything a CALABARZON commuter needs
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1.5px solid #f0f2f7', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.25s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${f.color}18`; e.currentTarget.style.borderColor = f.color + '30'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#f0f2f7'; }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${f.color}20, ${f.color}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: `0 4px 16px ${f.color}20` }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</div>
                <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 5, color: f.color, fontSize: 12, fontWeight: 700 }}>
                  Learn more <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '100px 20px', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#4f46e5', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>How It Works</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Plan a commute in 3 steps</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, position: 'relative' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', top: 40, left: '20%', right: '20%', height: 2, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', zIndex: 0, borderRadius: 1 }} />
            {[
              { step: '01', icon: MapPin, title: 'Set Origin & Destination', desc: 'Type or pin your start and end point anywhere in CALABARZON.', color: '#4f46e5' },
              { step: '02', icon: Navigation, title: 'Get Route Options', desc: 'The system computes multiple transport options with real fare data.', color: '#7c3aed' },
              { step: '03', icon: Bus, title: 'Ride Smart', desc: 'Compare routes, check surge prices, and board the best vehicle.', color: '#10b981' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: 20, padding: 28, textAlign: 'center', position: 'relative', zIndex: 1, border: '1.5px solid #f0f2f7' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: `0 8px 24px ${s.color}35`, border: '3px solid #fff' }}>
                  <s.icon size={22} color="#fff" />
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: 8 }}>STEP {s.step}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #0f0c29, #1e1b4b)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Ready to commute smarter?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 36, lineHeight: 1.7 }}>
            Join thousands of CALABARZON commuters who use CalabarzONE to find smarter, cheaper routes every day.
          </p>
          <button onClick={() => navigate('/home')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', borderRadius: 16, padding: '18px 40px', fontWeight: 800, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: '0 12px 40px rgba(79,70,229,0.45)', letterSpacing: '-0.01em' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(79,70,229,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(79,70,229,0.45)'; }}>
            <Navigation size={20} />
            Open Commute Planner
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '32px 20px', background: '#0f172a', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
          CalabarzONE · SDG 11 Transport Intelligence · CALABARZON Region, Philippines
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.3);opacity:0.7;} }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0);} 50%{transform:translateX(-50%) translateY(8px);} }
      `}</style>
    </div>
  );
}