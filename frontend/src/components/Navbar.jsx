import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export const font = "'Sora','DM Sans',system-ui,sans-serif";
export const fontD = "'Bricolage Grotesque','Playfair Display',Georgia,serif";

export default function Navbar({ cartCount = 0 }) {
  const { T, toggle, isDark } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const path      = location.pathname;

  const items = [
    { label: 'Menu',   icon: '🍽️', route: '/menu'   },
    { label: 'Panier', icon: '🛒', route: '/panier', badge: cartCount },
    { label: 'Suivi',  icon: '📍', route: '/suivi'  },
    { label: 'Avis',   icon: '⭐', route: '/avis'   },
  ];

  return (
    <>
      {/* Global base styles — importé une seule fois via Navbar */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Bricolage+Grotesque:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; background: ${T.bg}; color: ${T.text}; font-family: ${font}; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes ping     { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2);opacity:0} }
        @keyframes glow     { 0%,100%{box-shadow:0 0 16px rgba(245,166,35,.2)} 50%{box-shadow:0 0 32px rgba(245,166,35,.4)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:${T.bg}; }
        ::-webkit-scrollbar-thumb { background:${T.border}; border-radius:2px; }
      `}</style>

      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: '12px 18px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', boxShadow: T.shadow,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🍴</span>
          <span style={{ fontFamily: fontD, fontSize: 17, fontWeight: 800, color: T.text }}>
            Kitchen<span style={{ color: T.accent }}>Pulse</span>
          </span>
        </div>
        <button onClick={toggle} style={{
          background: T.surface, border: `1.5px solid ${T.border}`,
          borderRadius: 20, padding: '5px 13px', cursor: 'pointer',
          fontSize: 13, color: T.sub, fontFamily: font, transition: 'all .18s',
        }}>
          {isDark ? '☀️ Clair' : '🌙 Sombre'}
        </button>
      </header>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: T.navBg, borderTop: `1px solid ${T.border}`,
        display: 'flex', boxShadow: '0 -4px 20px rgba(0,0,0,.12)',
      }}>
        {items.map(item => {
          const active = path === item.route || (item.route === '/avis' && path.startsWith('/avis'));
          return (
            <button key={item.route}
              onClick={() => navigate(item.route)}
              style={{
                flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 3, padding: '10px 4px',
                color: active ? T.accent : T.muted,
                fontSize: 10, fontWeight: active ? 700 : 500,
                fontFamily: font, transition: 'color .18s', position: 'relative',
              }}>
              {/* Badge panier */}
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 'calc(50% - 16px)',
                  background: T.accent, color: '#0A0C10', borderRadius: 10,
                  fontSize: 10, fontWeight: 700, padding: '1px 5px', minWidth: 17,
                  textAlign: 'center', lineHeight: '15px',
                }}>{item.badge}</span>
              )}
              <span style={{ fontSize: 21 }}>{item.icon}</span>
              {item.label}
              {active && (
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: T.accent }} />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}