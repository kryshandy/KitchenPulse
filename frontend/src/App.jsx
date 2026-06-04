// ─────────────────────────────────────────────────────
//  KitchenPulse — App.jsx
//  Branche : feat/client-ui
//
//  Routage interne par état (pas de react-router ici,
//  feat/setup-auth ajoutera <BrowserRouter> + PrivateRoute).
//
//  TODO (après merge feat/setup-auth) :
//    - Importer AuthContext et protéger les routes privées
//    - Remplacer le mock handleLogin par l'appel API réel
//    - Passer orderId réel à Paiement + SuiviCommande
// ─────────────────────────────────────────────────────

import React, { useState } from "react";

// ── Design tokens & atomes partagés ──────────────────
import { G, globalCss, LiveDot } from "./theme.jsx";

// ── Pages client ─────────────────────────────────────
// Remplace les 3 lignes d'import dans App.jsx
import Menu          from "./pages/Client/Menu";
import Panier        from "./pages/Client/Panier";
import Paiement      from "./pages/Client/Paiement";
import SuiviCommande from "./pages/Client/SuiviCommande";

// ── Placeholders pages non encore développées ────────
// (seront remplacés par les vrais composants lors des merges suivants)
const PlaceholderPage = ({ title, icon }) => (
  <div style={{ padding: "60px 24px", textAlign: "center" }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
    <h2 style={{ fontFamily: G.fontDisplay, fontSize: 22, color: G.muted }}>{title}</h2>
    <p style={{ color: G.muted, fontSize: 13, marginTop: 8 }}>À venir…</p>
  </div>
);

// ── Navigation bottom par rôle ────────────────────────
const NAVS = {
  client: [
    { id: "menu",    icon: "🍽️", label: "Menu"   },
    { id: "panier",  icon: "🛒", label: "Panier" },
    { id: "suivi",   icon: "📍", label: "Suivi"  },
    { id: "avis",    icon: "⭐", label: "Avis"   },
  ],
  cuisinier: [
    { id: "cuisine_file", icon: "🔥", label: "File"  },
    { id: "cuisine_menu", icon: "📋", label: "Menu"  },
  ],
  serveur: [
    { id: "serveur_notifs",  icon: "🔔", label: "Notifs"   },
    { id: "serveur_assign",  icon: "✅", label: "Assignées" },
    { id: "serveur_history", icon: "📜", label: "Historique" },
  ],
  admin: [
    { id: "admin_dash",    icon: "📊", label: "Dashboard" },
    { id: "admin_users",   icon: "👥", label: "Users"     },
    { id: "admin_menu",    icon: "🍴", label: "Menu"      },
    { id: "admin_reports", icon: "📈", label: "Rapports"  },
  ],
};

const ROLE_COLOR = {
  client:    G.accent,
  cuisinier: G.accent2,
  serveur:   G.purple,
  admin:     G.green,
};

// ── Topbar ────────────────────────────────────────────
const Topbar = ({ role, setRole, setPage, cartCount }) => {
  const [showRoles, setShowRoles] = useState(false);
  const color = ROLE_COLOR[role];

  return (
    <div
      style={{
        position: "sticky", top: 0, zIndex: 50,
        background: G.card, borderBottom: `1px solid ${G.border}`,
        padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}
    >
      <span style={{ fontFamily: G.fontDisplay, fontSize: 18, fontWeight: 800 }}>
        Kitchen<span style={{ color: G.accent }}>Pulse</span>
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <LiveDot />

        {/* Panier badge (client seulement) */}
        {role === "client" && cartCount > 0 && (
          <button
            onClick={() => setPage("panier")}
            style={{
              background: `${G.accent}20`, border: `1px solid ${G.accent}40`,
              borderRadius: 20, padding: "5px 12px",
              color: G.accent, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            🛒 {cartCount}
          </button>
        )}

        {/* Switcher de rôle (démo) */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowRoles((s) => !s)}
            style={{
              background: `${color}20`, border: `1px solid ${color}40`,
              borderRadius: 20, padding: "5px 12px",
              color, fontSize: 12, fontWeight: 600, cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {role} ▾
          </button>

          {showRoles && (
            <div
              style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: G.card, border: `1px solid ${G.border}`,
                borderRadius: 12, padding: 8, zIndex: 200, minWidth: 160,
                boxShadow: "0 8px 32px rgba(0,0,0,.4)",
              }}
            >
              {Object.keys(NAVS).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setPage(NAVS[r][0].id);
                    setShowRoles(false);
                  }}
                  style={{
                    display: "block", width: "100%", padding: "10px 14px",
                    textAlign: "left",
                    background: role === r ? `${ROLE_COLOR[r]}20` : "transparent",
                    border: "none", borderRadius: 8,
                    color: role === r ? ROLE_COLOR[r] : G.muted,
                    cursor: "pointer", fontSize: 13, fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                >
                  {r === "client" ? "👤" : r === "cuisinier" ? "👨‍🍳" : r === "serveur" ? "🛎️" : "⚙️"}{" "}
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── BottomNav ─────────────────────────────────────────
const BottomNav = ({ role, activePage, setPage }) => {
  const items = NAVS[role] || [];
  const color = ROLE_COLOR[role];
  return (
    <div
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: G.card, borderTop: `1px solid ${G.border}`,
        display: "flex", padding: "8px 0 12px",
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setPage(item.id)}
          style={{
            flex: 1, background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, padding: "4px 0",
            color: activePage === item.id ? color : G.muted,
          }}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span style={{ fontSize: 10, fontWeight: activePage === item.id ? 700 : 400 }}>
            {item.label}
          </span>
          {activePage === item.id && (
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: color }} />
          )}
        </button>
      ))}
    </div>
  );
};

// ── Page d'authentification (stub — sera remplacée par Login.jsx) ─
const AuthPage = ({ onLogin }) => {
  const [role, setRole] = useState("client");
  return (
    <div
      style={{
        minHeight: "100%", background: G.bg,
        overflowY: "auto", WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Branding */}
      <div
        style={{
          background: `linear-gradient(160deg, #1a0d08 0%, ${G.bg} 60%)`,
          padding: "48px 24px 36px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 12 }}>🍴</div>
        <h1
          style={{
            fontFamily: G.fontDisplay, fontSize: 38,
            fontWeight: 800, lineHeight: 1.1,
          }}
        >
          Kitchen<span style={{ color: G.accent }}>Pulse</span>
        </h1>
        <p style={{ color: G.muted, fontSize: 14, marginTop: 12, lineHeight: 1.6 }}>
          La plateforme temps réel pour restaurants
        </p>
      </div>

      {/* Accès rapide démo */}
      <div style={{ padding: "0 20px 40px" }}>
        <p
          style={{
            fontSize: 11, color: G.muted, textAlign: "center",
            marginBottom: 14, letterSpacing: 0.6, textTransform: "uppercase",
          }}
        >
          Accès rapide démo
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            ["👤 Client",     "client",    G.accent],
            ["👨‍🍳 Cuisinier", "cuisinier", G.accent2],
            ["🛎️ Serveur",   "serveur",   G.purple],
            ["⚙️ Admin",     "admin",     G.green],
          ].map(([label, r, c]) => (
            <button
              key={r}
              onClick={() => onLogin(r)}
              style={{
                padding: "16px 8px", borderRadius: 12,
                border: `1px solid ${c}40`,
                background: `${c}15`, color: c,
                cursor: "pointer", fontSize: 14, fontWeight: 700,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <p style={{ textAlign: "center", color: G.muted, fontSize: 12, marginTop: 20 }}>
          La page de connexion réelle sera fournie par{" "}
          <span style={{ color: G.accent2 }}>feat/setup-auth</span>
        </p>
      </div>
    </div>
  );
};

// ── Rendu de page ─────────────────────────────────────
const renderPage = (page, props) => {
  const { panier, setPanier, setPage } = props;
  const pages = {
    // ── Client ──────────────────────────────────────
    menu:    <Menu    panier={panier} setPanier={setPanier} setPage={setPage} />,
    panier:  <Panier  panier={panier} setPanier={setPanier} setPage={setPage} />,
    paiement:<Paiement total={5565}  orderId={1042}        setPage={setPage} />,
    suivi:   <SuiviCommande          orderId={1042}        setPage={setPage} />,
    avis:    <PlaceholderPage title="Laisser un avis" icon="⭐" />,
    // ── Cuisinier ───────────────────────────────────
    cuisine_file: <PlaceholderPage title="File Commandes (feat/cuisinier)" icon="🔥" />,
    cuisine_menu: <PlaceholderPage title="Gestion Menu (feat/cuisinier)"   icon="📋" />,
    // ── Serveur ─────────────────────────────────────
    serveur_notifs:  <PlaceholderPage title="Notifications (feat/serveur-admin)"  icon="🔔" />,
    serveur_assign:  <PlaceholderPage title="Mes Assignations (feat/serveur-admin)" icon="✅" />,
    serveur_history: <PlaceholderPage title="Historique (feat/serveur-admin)"     icon="📜" />,
    // ── Admin ───────────────────────────────────────
    admin_dash:    <PlaceholderPage title="Dashboard (feat/serveur-admin)"  icon="📊" />,
    admin_users:   <PlaceholderPage title="Utilisateurs (feat/serveur-admin)" icon="👥" />,
    admin_menu:    <PlaceholderPage title="Menu Global (feat/serveur-admin)"  icon="🍴" />,
    admin_reports: <PlaceholderPage title="Rapports (feat/serveur-admin)"   icon="📈" />,
  };
  return pages[page] ?? null;
};

// ── Root ──────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [role,   setRole]   = useState("client");
  const [page,   setPage]   = useState("menu");
  const [panier, setPanier] = useState([]);

  const handleLogin = (r) => {
    setRole(r);
    setPage(NAVS[r][0].id);
    setAuthed(true);
  };

  const handleSetRole = (r) => {
    setRole(r);
    setPage(NAVS[r][0].id);
  };

  const cartCount = panier.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <style>{globalCss}</style>

      {!authed ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <div
          style={{
            display: "flex", flexDirection: "column",
            height: "100%", background: G.bg,
          }}
        >
          <Topbar
            role={role}
            setRole={handleSetRole}
            setPage={setPage}
            cartCount={cartCount}
          />

          <div
            style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}
          >
            {renderPage(page, { panier, setPanier, setPage })}
          </div>

          <BottomNav role={role} activePage={page} setPage={setPage} />
        </div>
      )}
    </>
  );
}