// frontend/src/pages/client/Paiement.jsx
import { useState } from "react";
import api from "../../api/axiosConfig";
import { G } from "../../theme";

const METHODS = [
  { id: "MOBILE_MONEY", label: "Mobile Money",  icon: "📱", desc: "MTN MoMo, Orange Money…" },
  { id: "CASH",         label: "Espèces",        icon: "💵", desc: "Paiement au comptoir" },
  { id: "CARD",         label: "Carte bancaire", icon: "💳", desc: "Visa, Mastercard" },
];

/**
 * Page Paiement — POST /api/payments
 * Props :
 *  - orderId : id de la commande à payer
 *  - total   : montant TTC
 *  - setPage : navigation
 */
export default function Paiement({ orderId, total, setPage }) {
  const [method, setMethod] = useState("MOBILE_MONEY");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid]       = useState(false);
  const [error, setError]     = useState("");

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/api/payments", {
        commande_id: orderId,
        method,
        amount: Number(total),
      });
      setPaid(true);
    } catch (err) {
      setError(err.response?.data?.message || "Paiement échoué. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Confirmation ── */
  if (paid) {
    return (
      <div className="fadeUp" style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: G.fontDisplay, fontSize: 26, marginBottom: 8 }}>Paiement confirmé !</h2>
        <p style={{ color: G.muted, fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Merci pour votre commande.<br />Nous espérons vous revoir bientôt !
        </p>
        <button
          onClick={() => setPage("avis")}
          style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 15, background: G.accent, color: "#fff", marginBottom: 10 }}
        >
          Laisser un avis ⭐
        </button>
        <button
          onClick={() => setPage("menu")}
          style={{ width: "100%", padding: 14, borderRadius: 10, border: `1px solid ${G.border}`, cursor: "pointer", fontWeight: 600, fontSize: 15, background: "transparent", color: G.muted }}
        >
          Retour au menu
        </button>
      </div>
    );
  }

  return (
    <div className="fadeUp" style={{ padding: "16px 16px 100px" }}>
      <h1 style={{ fontFamily: G.fontDisplay, fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Paiement 💳</h1>
      <p style={{ color: G.muted, fontSize: 13, marginBottom: 24 }}>Commande #{orderId}</p>

      {/* Sélection du mode de paiement */}
      <p style={{ fontSize: 11, color: G.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12 }}>
        Mode de paiement
      </p>
      {METHODS.map((m) => (
        <div
          key={m.id}
          onClick={() => setMethod(m.id)}
          style={{
            background: method === m.id ? `${G.accent}15` : G.card,
            border: `1px solid ${method === m.id ? G.accent : G.border}`,
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 14,
            transition: "all .2s",
          }}
        >
          <span style={{ fontSize: 26 }}>{m.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: method === m.id ? G.accent : G.text }}>{m.label}</div>
            <div style={{ fontSize: 12, color: G.muted }}>{m.desc}</div>
          </div>
          <div style={{
            width: 20, height: 20, borderRadius: "50%",
            border: `2px solid ${method === m.id ? G.accent : G.border}`,
            background: method === m.id ? G.accent : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {method === m.id && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", display: "block" }} />}
          </div>
        </div>
      ))}

      {/* Montant */}
      <div style={{ background: "#0D0D0F", border: `1px solid ${G.border}`, borderRadius: 14, padding: "18px 20px", marginTop: 24, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: G.muted, fontSize: 14 }}>Montant total</span>
        <span style={{ fontWeight: 800, fontSize: 24, color: G.accent }}>{Number(total).toLocaleString()} <span style={{ fontSize: 13, fontWeight: 400, color: G.muted }}>FCFA</span></span>
      </div>

      {/* Erreur */}
      {error && (
        <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 14, textAlign: "center", background: "rgba(239,68,68,.1)", borderRadius: 8, padding: "8px 12px" }}>
          {error}
        </p>
      )}

      {/* Bouton payer */}
      <button
        onClick={handlePay}
        disabled={loading}
        style={{
          width: "100%", padding: 14, borderRadius: 10, border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600, fontSize: 15, background: G.green, color: "#0D0D0F",
          opacity: loading ? 0.7 : 1, transition: "opacity .2s",
        }}
      >
        {loading ? "Traitement en cours…" : `Payer ${Number(total).toLocaleString()} FCFA →`}
      </button>
    </div>
  );
}