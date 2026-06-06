/**
 * SplashScreen.jsx — KitchenPulse
 * Écran d'intro style Netflix : logo révélé lettre par lettre + rôles SVG + tagline
 * Usage : <SplashScreen onDone={() => navigate('/login')} />
 */
import { useEffect, useState } from 'react';

// ─── Icônes SVG des rôles (aucun emoji) ─────────────────────────────────────
const RoleIcons = {
  client: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="42" height="42">
      <circle cx="24" cy="15" r="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M18 32l2 4 4-6 4 6 2-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  serveur: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="42" height="42">
      <rect x="8" y="28" width="32" height="4" rx="2" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M24 28V14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="24" cy="13" rx="12" ry="3" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M14 32v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="24" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  cuisinier: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="42" height="42">
      <path d="M14 22h20v14a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V22z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M12 22h24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M18 18c0-6 12-6 12 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M24 10v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 31v-5M24 31v-5M28 31v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="42" height="42">
      <path d="M24 6l4.5 9 9.5 1.5-7 6.5 1.5 9.5L24 28l-8.5 4.5 1.5-9.5-7-6.5 9.5-1.5z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M24 38v4M14 42h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
};

const ROLES_DATA = [
  { key: 'client',    label: 'Client',    desc: 'Commandes & suivi' },
  { key: 'serveur',   label: 'Serveur',   desc: 'Service en salle'  },
  { key: 'cuisinier', label: 'Cuisinier', desc: 'Gestion cuisine'   },
  { key: 'admin',     label: 'Admin',     desc: 'Tableau de bord'   },
];

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:      '#0B0C0F',
  accent:  '#E8601C',
  text:    '#F2EFE9',
  muted:   '#7C7E8A',
  card:    'rgba(255,255,255,0.04)',
  border:  'rgba(255,255,255,0.08)',
};

// ─── Logo SVG KitchenPulse ────────────────────────────────────────────────────
function LogoIcon({ size = 64, color = C.accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Assiette */}
      <circle cx="32" cy="34" r="20" stroke={color} strokeWidth="2.5"/>
      <circle cx="32" cy="34" r="13" stroke={color} strokeWidth="1.5" strokeDasharray="2 3"/>
      {/* Couverts */}
      <path d="M20 14v8M20 22c0 3 2 4 2 7v9" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 14h6v5a3 3 0 0 1-6 0V14z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M44 14v24" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M41 14c0 5 6 5 6 10s-6 5-6 10v8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Pulse / onde */}
      <path d="M24 34h3l2-5 4 10 2-5h3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0);
  // 0 = fondu logo
  // 1 = écriture titre
  // 2 = tagline
  // 3 = rôles SVG
  // 4 = bouton / fin

  const BRAND   = 'KitchenPulse';
  const [chars, setChars] = useState(0); // lettres révélées

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setPhase(1), 900));   // logo fondu → écriture
    timers.push(setTimeout(() => setPhase(2), 2400));  // tagline
    timers.push(setTimeout(() => setPhase(3), 3200));  // rôles
    timers.push(setTimeout(() => setPhase(4), 4400));  // bouton
    timers.push(setTimeout(() => onDone?.(), 6500));   // auto-avance
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  // Animation lettre par lettre
  useEffect(() => {
    if (phase < 1) return;
    if (chars >= BRAND.length) return;
    const t = setTimeout(() => setChars(c => c + 1), 80);
    return () => clearTimeout(t);
  }, [phase, chars]);

  const visibleBrand = BRAND.slice(0, chars);
  const splitAt = 7; // "Kitchen" / "Pulse"

  return (
    <div style={{
      position: 'fixed', inset: 0, background: C.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      overflow: 'hidden', zIndex: 9999,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes kp-fadein {
          from { opacity: 0; transform: scale(.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes kp-slideup {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes kp-role-in {
          from { opacity: 0; transform: translateY(20px) scale(.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes kp-glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(232,96,28,.5)); }
          50%       { filter: drop-shadow(0 0 28px rgba(232,96,28,.9)); }
        }
        @keyframes kp-cursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes kp-btn-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes kp-scan {
          0%   { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }

        .kp-logo-wrap {
          animation: kp-fadein .7s cubic-bezier(.22,1,.36,1) both, kp-glow 3s 1s ease-in-out infinite;
        }
        .kp-tagline {
          animation: kp-slideup .5s cubic-bezier(.22,1,.36,1) both;
        }
        .kp-role-card {
          animation: kp-role-in .45s cubic-bezier(.22,1,.36,1) both;
        }
        .kp-btn {
          animation: kp-btn-in .4s cubic-bezier(.22,1,.36,1) both;
          cursor: pointer;
          transition: transform .15s, filter .15s;
        }
        .kp-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.12);
        }
      `}</style>

      {/* Grain overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: .035, pointerEvents: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        backgroundSize: '200px 200px',
      }} />

      {/* Radial glow background */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,96,28,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Logo ── */}
      <div className="kp-logo-wrap" style={{ marginBottom: 28 }}>
        <LogoIcon size={76} />
      </div>

      {/* ── Titre animé ── */}
      <h1 style={{
        fontFamily: "'Bricolage Grotesque', Georgia, serif",
        fontSize: 'clamp(32px, 6vw, 52px)',
        fontWeight: 800,
        color: C.text,
        letterSpacing: '-1px',
        margin: 0,
        minHeight: '1.2em',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        {visibleBrand.slice(0, Math.min(chars, splitAt))}
        <span style={{ color: C.accent }}>
          {visibleBrand.slice(splitAt)}
        </span>
        {chars < BRAND.length && (
          <span style={{
            display: 'inline-block', width: 3, height: '0.85em',
            background: C.accent, marginLeft: 2, verticalAlign: 'text-bottom',
            animation: 'kp-cursor .6s step-end infinite',
          }} />
        )}
      </h1>

      {/* ── Tagline ── */}
      {phase >= 2 && (
        <p className="kp-tagline" style={{
          color: C.muted, fontSize: 15, fontWeight: 400,
          marginTop: 12, marginBottom: 0, letterSpacing: 0.3,
          textAlign: 'center',
        }}>
          Application de gestion d'un restaurant en temps réel
        </p>
      )}

      {/* ── Rôles SVG ── */}
      {phase >= 3 && (
        <div style={{
          display: 'flex', gap: 16, marginTop: 48,
          flexWrap: 'wrap', justifyContent: 'center',
          maxWidth: 560, padding: '0 20px',
        }}>
          {ROLES_DATA.map((role, i) => (
            <div
              key={role.key}
              className="kp-role-card"
              style={{
                animationDelay: `${i * 0.1}s`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 10, padding: '18px 20px',
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                width: 110,
                color: C.muted,
                transition: 'color .2s, border-color .2s',
              }}
            >
              <div style={{ color: C.accent, opacity: 0.85 }}>
                {RoleIcons[role.key]}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                  {role.label}
                </div>
                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.35 }}>
                  {role.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bouton Commencer ── */}
      {phase >= 4 && (
        <button
          className="kp-btn"
          onClick={() => onDone?.()}
          style={{
            marginTop: 44,
            padding: '14px 40px',
            background: C.accent,
            border: 'none',
            borderRadius: 50,
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: 0.3,
            animationDelay: '0s',
          }}
        >
          Commencer
        </button>
      )}

      {/* ── Mention bas de page ── */}
      <p style={{
        position: 'absolute', bottom: 20,
        color: C.muted, fontSize: 11, opacity: .5,
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: 0.5,
      }}>
        KitchenPulse · KEYCE Informatique · Groupe 8
      </p>
    </div>
  );
}