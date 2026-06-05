// frontend/src/components/OrderCard.jsx
import { G } from "../theme";

const STATUT_CONFIG = {
  RECUE:               { label: "Reçue",           color: "#FF6B35", bg: "rgba(255,107,53,0.15)" },
  EN_PREPARATION:      { label: "En préparation",  color: "#FFB800", bg: "rgba(255,184,0,0.15)" },
  PRETE:               { label: "Prête ✓",         color: "#00C896", bg: "rgba(0,200,150,0.15)" },
  EN_COURS_DE_SERVICE: { label: "En livraison",    color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  SERVIE:              { label: "Servie",           color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  CLOTUREE:            { label: "Clôturée",         color: "#6B7280", bg: "rgba(107,114,128,0.15)" },
  ANNULEE:             { label: "Annulée",          color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
};

/**
 * Carte récapitulative d'une commande.
 * Props :
 *  - order : { order_number, status, table_numero, items[], total_amount }
 *  - onAction (optionnel) : bouton contextuel selon le rôle
 *  - actionLabel / actionVariant (optionnel)
 */
export default function OrderCard({ order, onAction, actionLabel }) {
  const cfg = STATUT_CONFIG[order.status] || STATUT_CONFIG.RECUE;

  return (
    <div style={{
      background: G.card,
      border: `1px solid ${G.border}`,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <span style={{ fontWeight: 700, color: G.accent, fontSize: 15 }}>#{order.order_number || order.id}</span>
          {order.table_numero && (
            <span style={{ fontSize: 12, color: G.muted, marginLeft: 8 }}>Table {order.table_numero}</span>
          )}
          {order.client_nom && (
            <span style={{ fontSize: 12, color: G.muted, marginLeft: 8 }}>· {order.client_nom}</span>
          )}
        </div>
        <span style={{
          background: cfg.bg,
          color: cfg.color,
          border: `1px solid ${cfg.color}40`,
          padding: "3px 9px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
        }}>
          {cfg.label}
        </span>
      </div>

      {/* Lignes items */}
      {order.items?.map((item, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: G.muted, marginBottom: 5 }}>
          <span>{item.quantity ?? item.qty}× {item.plat_nom ?? item.nom}</span>
          <span style={{ color: G.text }}>
            {Number(item.subtotal ?? (item.unit_price * (item.quantity ?? item.qty))).toLocaleString()} FCFA
          </span>
        </div>
      ))}

      {/* Total */}
      <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 10, marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: G.muted }}>Total</span>
        <span style={{ fontWeight: 700, color: G.accent }}>{Number(order.total_amount).toLocaleString()} FCFA</span>
      </div>

      {/* Bouton d'action optionnel (cuisinier, serveur…) */}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          style={{ width: "100%", marginTop: 12, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: G.accent, color: "#fff" }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}