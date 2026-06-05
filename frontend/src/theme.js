// ─────────────────────────────────────────────────────
//  KitchenPulse — Design Tokens partagés
//  Importer dans chaque page/composant via :
//    import { G, STATUT_CONFIG } from "../../theme";
// ─────────────────────────────────────────────────────

export const G = {
  bg:          "#0D0D0F",
  card:        "#16161A",
  border:      "#242428",
  accent:      "#FF6B35",
  accent2:     "#FFB800",
  green:       "#00C896",
  purple:      "#8B5CF6",
  red:         "#EF4444",
  text:        "#F0EDE8",
  muted:       "#7A7A82",
  font:        "'DM Sans','Segoe UI',sans-serif",
  fontDisplay: "'Playfair Display',Georgia,serif",
};

export const STATUT_CONFIG = {
  RECUE:          { label: "Nouvelle",        color: "#FF6B35", bg: "rgba(255,107,53,0.15)"  },
  EN_PREPARATION: { label: "En préparation",  color: "#FFB800", bg: "rgba(255,184,0,0.15)"   },
  PRETE:          { label: "Prête ✓",         color: "#00C896", bg: "rgba(0,200,150,0.15)"   },
  SERVIE:         { label: "Livrée",          color: "#8B5CF6", bg: "rgba(139,92,246,0.15)"  },
  CLOTUREE:       { label: "Clôturée",        color: "#6B7280", bg: "rgba(107,114,128,0.15)" },
};

// Atoms réutilisables (évite les duplications dans chaque page)
import React from "react";

export const Card = ({ children, style = {}, className = "" }) => (
  <div
    className={className}
    style={{
      background: G.card,
      border: `1px solid ${G.border}`,
      borderRadius: 14,
      padding: 16,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Btn = ({
  children,
  onClick,
  variant = "primary",
  style = {},
  disabled = false,
}) => {
  const variants = {
    primary:   { background: G.accent,  color: "#fff"     },
    secondary: { background: G.border,  color: G.text     },
    ghost:     { background: "transparent", color: G.muted, border: `1px solid ${G.border}` },
    success:   { background: G.green,   color: "#0D0D0F"  },
    danger:    { background: G.red,     color: "#fff"     },
    warning:   { background: G.accent2, color: "#0D0D0F"  },
    purple:    { background: G.purple,  color: "#fff"     },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        padding: "10px 18px",
        borderRadius: 10,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 600,
        fontSize: 14,
        transition: "all .2s",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        opacity: disabled ? 0.5 : 1,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
};

export const Badge = ({ statut }) => {
  const c = STATUT_CONFIG[statut] || {};
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.color}40`,
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.4,
      }}
    >
      {c.label}
    </span>
  );
};

export const LiveDot = () => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 11,
      color: G.green,
    }}
  >
    <span
      style={{
        width: 7,
        height: 7,
        background: G.green,
        borderRadius: "50%",
        animation: "pulse 1.5s infinite",
      }}
    />
    LIVE
  </span>
);

export const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Playfair+Display:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: ${G.bg}; color: ${G.text}; font-family: ${G.font}; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${G.bg}; }
  ::-webkit-scrollbar-thumb { background: ${G.border}; border-radius: 2px; }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes spin     { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
  @keyframes checkPop { 0% { transform:scale(0); } 70% { transform:scale(1.15); } 100% { transform:scale(1); } }
  .fadeUp { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
  input, textarea, select, button { font-family: ${G.font}; }
  input:focus, textarea:focus, select:focus { outline: none; }
`;