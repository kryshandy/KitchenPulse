// ─────────────────────────────────────────────────────
//  KitchenPulse — pages/client/Paiement.jsx
//  Branche : feat/client-ui
//
//  Props :
//    total   {number}   montant total de la commande (FCFA)
//    orderId {number}   identifiant commande (mock : 1042)
//    setPage {Function} navigation
//
//  TODO (après merge feat/setup-auth) :
//    - Remplacer handlePayer par :
//        api.post('/api/payments', { order_id: orderId, mode, montant: total })
//          .then(() => setPage('suivi'))
// ─────────────────────────────────────────────────────

import React, { useState } from "react";
import { G, Card, Btn } from "../../theme.jsx";;

const MODES = [
  { id: "mobile_money", label: "Mobile Money",  icon: "📱", desc: "MTN MoMo / Orange Money" },
  { id: "cash",         label: "Espèces",        icon: "💵", desc: "Paiement à la livraison" },
  { id: "card",         label: "Carte bancaire", icon: "💳", desc: "Visa / Mastercard" },
];

// ── Écran de succès ───────────────────────────────────
const SuccessScreen = ({ orderId, total, mode, setPage }) => (
  <div
    className="fadeUp"
    style={{ padding: "60px 24px", textAlign: "center", minHeight: "100%" }}
  >
    <div
      style={{
        width: 80, height: 80, borderRadius: "50%",
        background: `${G.green}20`, border: `3px solid ${G.green}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 38, margin: "0 auto 20px",
        animation: "checkPop .5s cubic-bezier(.22,1,.36,1) both",
      }}
    >
      ✓
    </div>

    <h2 style={{ fontFamily: G.fontDisplay, fontSize: 28, marginBottom: 8 }}>
      Paiement confirmé !
    </h2>
    <p style={{ color: G.muted, marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
      Commande <span style={{ color: G.accent, fontWeight: 700 }}>#{orderId}</span> — {total.toLocaleString("fr-FR")} FCFA
      <br />via {MODES.find((m) => m.id === mode)?.label}
    </p>

    <Card
      style={{
        background: `${G.green}10`, border: `1px solid ${G.green}30`,
        marginBottom: 20, textAlign: "left",
      }}
    >
      {[
        ["Reçu N°", `KP-${Date.now().toString().slice(-6)}`],
        ["Heure",   new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })],
        ["Statut",  "Paiement validé ✓"],
      ].map(([k, v]) => (
        <div
          key={k}
          style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 13, padding: "6px 0",
            borderBottom: `1px solid ${G.green}20`,
          }}
        >
          <span style={{ color: G.muted }}>{k}</span>
          <span style={{ color: G.green, fontWeight: 600 }}>{v}</span>
        </div>
      ))}
    </Card>

    <Btn
      onClick={() => setPage("suivi")}
      variant="success"
      style={{ width: "100%", justifyContent: "center", padding: 14, marginBottom: 10 }}
    >
      Suivre ma commande →
    </Btn>
    <Btn
      onClick={() => setPage("menu")}
      variant="ghost"
      style={{ width: "100%", justifyContent: "center" }}
    >
      Retour au menu
    </Btn>
  </div>
);

// ── Composant principal ───────────────────────────────
export default function Paiement({ total = 5565, orderId = 1042, setPage }) {
  const [mode, setMode]       = useState(null);
  const [paid, setPaid]       = useState(false);
  const [loading, setLoading] = useState(false);

  // Champs Mobile Money
  const [phone, setPhone] = useState("");
  // Champs carte
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry]   = useState("");
  const [cvv, setCvv]         = useState("");

  const canPay = () => {
    if (!mode) return false;
    if (mode === "mobile_money") return phone.replace(/\s/g, "").length >= 9;
    if (mode === "card") return cardNum.length >= 16 && expiry.length === 5 && cvv.length === 3;
    return true; // cash
  };

  const handlePay = async () => {
    if (!canPay()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    // TODO : api.post('/api/payments', { order_id: orderId, mode, montant: total })
    setLoading(false);
    setPaid(true);
  };

  if (paid) return <SuccessScreen orderId={orderId} total={total} mode={mode} setPage={setPage} />;

  return (
    <div className="fadeUp" style={{ padding: "16px 16px 100px" }}>
      <h1 style={{ fontFamily: G.fontDisplay, fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
        Paiement 💳
      </h1>
      <p style={{ color: G.muted, fontSize: 13, marginBottom: 20 }}>
        Commande <span style={{ color: G.accent, fontWeight: 600 }}>#{orderId}</span>
      </p>

      {/* Montant */}
      <Card
        style={{
          background: `linear-gradient(135deg, ${G.accent}15 0%, transparent 60%)`,
          border: `1px solid ${G.accent}30`,
          marginBottom: 20, textAlign: "center", padding: 24,
        }}
      >
        <p style={{ color: G.muted, fontSize: 12, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
          Montant à payer
        </p>
        <p style={{ fontSize: 36, fontWeight: 800, color: G.accent, fontFamily: G.fontDisplay }}>
          {total.toLocaleString("fr-FR")}
          <span style={{ fontSize: 16, color: G.muted, fontWeight: 400 }}> FCFA</span>
        </p>
      </Card>

      {/* Choix du mode */}
      <p
        style={{
          fontSize: 11, color: G.muted, marginBottom: 10,
          fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6,
        }}
      >
        Mode de paiement
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px", borderRadius: 12, cursor: "pointer",
              background: mode === m.id ? `${G.accent}15` : G.card,
              border: `1px solid ${mode === m.id ? G.accent : G.border}`,
              color: G.text, textAlign: "left", transition: "all .2s",
            }}
          >
            <span style={{ fontSize: 28 }}>{m.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: G.muted }}>{m.desc}</div>
            </div>
            {mode === m.id && (
              <span
                style={{
                  marginLeft: "auto", width: 20, height: 20,
                  borderRadius: "50%", background: G.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: "#fff", fontWeight: 700,
                }}
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Formulaire selon le mode */}
      {mode === "mobile_money" && (
        <Card style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: G.muted, display: "block", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>
            Numéro de téléphone
          </label>
          <input
            type="tel"
            placeholder="6XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px",
              background: G.bg, border: `1px solid ${G.border}`,
              borderRadius: 10, color: G.text, fontSize: 16, letterSpacing: 1,
            }}
            onFocus={(e) => (e.target.style.borderColor = G.accent)}
            onBlur={(e)  => (e.target.style.borderColor = G.border)}
          />
        </Card>
      )}

      {mode === "card" && (
        <Card style={{ marginBottom: 20 }}>
          {/* Numéro de carte */}
          <label style={{ fontSize: 11, color: G.muted, display: "block", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>
            Numéro de carte
          </label>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            maxLength={16}
            value={cardNum}
            onChange={(e) => setCardNum(e.target.value.replace(/\D/g, ""))}
            style={{
              width: "100%", padding: "12px 14px", marginBottom: 12,
              background: G.bg, border: `1px solid ${G.border}`,
              borderRadius: 10, color: G.text, fontSize: 15, letterSpacing: 2,
            }}
            onFocus={(e) => (e.target.style.borderColor = G.accent)}
            onBlur={(e)  => (e.target.style.borderColor = G.border)}
          />

          {/* Expiry + CVV */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: G.muted, display: "block", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>
                Expiration
              </label>
              <input
                type="text"
                placeholder="MM/AA"
                maxLength={5}
                value={expiry}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "");
                  if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                  setExpiry(v);
                }}
                style={{
                  width: "100%", padding: "12px 14px",
                  background: G.bg, border: `1px solid ${G.border}`,
                  borderRadius: 10, color: G.text, fontSize: 14,
                }}
                onFocus={(e) => (e.target.style.borderColor = G.accent)}
                onBlur={(e)  => (e.target.style.borderColor = G.border)}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: G.muted, display: "block", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>
                CVV
              </label>
              <input
                type="password"
                placeholder="•••"
                maxLength={3}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                style={{
                  width: "100%", padding: "12px 14px",
                  background: G.bg, border: `1px solid ${G.border}`,
                  borderRadius: 10, color: G.text, fontSize: 14,
                }}
                onFocus={(e) => (e.target.style.borderColor = G.accent)}
                onBlur={(e)  => (e.target.style.borderColor = G.border)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Bouton payer */}
      <Btn
        onClick={handlePay}
        disabled={!canPay() || loading}
        variant="success"
        style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15 }}
      >
        {loading ? (
          <>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>
              ⏳
            </span>
            Traitement en cours...
          </>
        ) : (
          `Payer ${total.toLocaleString("fr-FR")} FCFA →`
        )}
      </Btn>

      {/* Badges sécurité */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
        {["🔒 SSL", "✓ Sécurisé", "🛡️ Chiffré"].map((label) => (
          <span key={label} style={{ fontSize: 11, color: G.muted }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}