import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Landing from './pages/Landing';
import Home from './pages/Home';
import RouteDetail from './pages/RouteDetail';
import Reports from './pages/Reports';
import { Map, FileWarning, Home as HomeIcon } from 'lucide-react';

function Navbar() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const link = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '7px 13px', borderRadius: 9, textDecoration: 'none',
    fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em',
    fontFamily: 'inherit', transition: 'all 0.15s',
    color: isActive ? '#4f46e5' : (isLanding ? 'rgba(255,255,255,0.7)' : '#64748b'),
    background: isActive ? (isLanding ? 'rgba(255,255,255,0.12)' : '#eef2ff') : 'transparent',
  });

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: isLanding ? 'rgba(15,12,41,0.85)' : 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${isLanding ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)'}`,
      padding: '0 28px', display: 'flex', alignItems: 'center', gap: 4, height: 58,
      boxShadow: isLanding ? 'none' : '0 1px 12px rgba(0,0,0,0.05)',
      transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 22 }}>
        <div style={{ width: 33, height: 33, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(79,70,229,0.35)' }}>
          <Map size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: isLanding ? '#fff' : '#0f172a', lineHeight: 1, letterSpacing: '-0.03em' }}>CalabarzONE</div>
          <div style={{ fontSize: 9, color: isLanding ? 'rgba(255,255,255,0.35)' : '#94a3b8', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase' }}>SDG 11 · Transport Intelligence</div>
        </div>
      </div>

      <NavLink to="/home" end style={link}><Map size={14} /> Planner</NavLink>
      <NavLink to="/reports" style={link}><FileWarning size={14} /> Reports</NavLink>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: isLanding ? 'rgba(255,255,255,0.4)' : '#64748b' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 2px #d1fae5', animation: 'navpulse 2s ease-in-out infinite' }} />
        CALABARZON Region
      </div>

      <style>{`@keyframes navpulse{0%,100%{opacity:1;}50%{opacity:0.5;}}`}</style>
    </nav>
  );
}

function AppShell() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f7', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />
      <div style={{ paddingTop: isLanding ? 0 : 58 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/item/:id" element={<RouteDetail />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </Provider>
  );
}