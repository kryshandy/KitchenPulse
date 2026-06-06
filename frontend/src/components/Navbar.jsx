import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const font  = "'DM Sans','Segoe UI',sans-serif";
export const fontD = "'Playfair Display',Georgia,serif";

// Icônes SVG
const IcMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
);
const IcCart = ({ count, T }) => (
  <div style={{ position: 'relative', display: 'inline-flex' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
    {count > 0 && (
      <span style={{
        position: 'absolute', top: -6, right: -6,
        background: T.accent, color: '#0A0C10',
        borderRadius: '50%', width: 16, height: 16,
        fontSize: 9, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{count}</span>
    )}
  </div>
);
const IcTrack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IcStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IcMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const IcLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function Navbar({ cartCount = 0 }) {
  const { T, toggle, isDark } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const tabs = [
    { path: '/menu',  label: 'Menu',    Icon: IcMenu  },
    { path: '/panier',label: 'Panier',  Icon: (props) => <IcCart count={cartCount} T={T} {...props} /> },
    { path: '/suivi', label: 'Suivi',   Icon: IcTrack },
    { path: '/avis',  label: 'Avis',    Icon: IcStar  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100%{opacity:1;} 50%{opacity:.4;} }
      `}</style>

      {/* ── TOPBAR ─────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        fontFamily: font,
      }}>
        <div style={{
          padding: '13px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: T.text }}>
              Kitchen<span style={{ color: T.accent }}>Pulse</span>
            </span>
            <span style={{
              background: `${T.accent}20`, color: T.accent,
              border: `1px solid ${T.accent}30`,
              padding: '2px 8px', borderRadius: 6,
              fontSize: 10, fontWeight: 700, letterSpacing: .5,
            }}>CLIENT</span>
          </div>

          {/* Prénom + thème + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>
              {user?.first_name || user?.nom || ''}
            </span>
            <button onClick={toggle} title="Changer le thème" style={{
              background: T.surface, border: `1px solid ${T.border}`,
              color: T.sub, width: 32, height: 32, borderRadius: 8,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isDark ? <IcSun /> : <IcMoon />}
            </button>
            <button onClick={handleLogout} title="Se déconnecter" style={{
              background: `${T.red}20`, border: `1px solid ${T.red}30`,
              color: T.red, width: 32, height: 32, borderRadius: 8,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IcLogout />
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM NAV ─────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: T.surface, borderTop: `1px solid ${T.border}`,
        display: 'flex', padding: '8px 0 14px',
        fontFamily: font,
      }}>
        {tabs.map(({ path, label, Icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <button key={path} onClick={() => navigate(path)} style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, color: active ? T.accent : T.muted, padding: '4px 0',
            }}>
              <span style={{ color: active ? T.accent : T.muted }}>
                <Icon />
              </span>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 400 }}>{label}</span>
              {active && (
                <span style={{ width: 20, height: 3, borderRadius: 2, background: T.accent }} />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}