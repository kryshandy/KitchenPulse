const G = {
  card: '#16161A', border: '#242428',
  accent: '#FF6B35', green: '#00C896', purple: '#8B5CF6', accent2: '#FFB800',
  text: '#F0EDE8', muted: '#7A7A82',
};

const STATUS_CONFIG = {
  RECUE:              { label: 'Reçue',           color: '#FF6B35', bg: 'rgba(255,107,53,0.15)' },
  EN_PREPARATION:     { label: 'En préparation',  color: '#FFB800', bg: 'rgba(255,184,0,0.15)' },
  PRETE:              { label: 'Prête ✓',         color: '#00C896', bg: 'rgba(0,200,150,0.15)' },
  EN_COURS_DE_SERVICE:{ label: 'En service',      color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  SERVIE:             { label: 'Servie',          color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  CLOTUREE:           { label: 'Clôturée',        color: '#6B7280', bg: 'rgba(107,114,128,0.15)' },
  ANNULEE:            { label: 'Annulée',         color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {};
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}40`,
      padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    }}>
      {cfg.label}
    </span>
  );
}

export default function OrderCard({ order }) {
  const cfg = STATUS_CONFIG[order.status] || {};
  return (
    <div style={{
      background: G.card, border: `1px solid ${G.border}`,
      borderLeft: `3px solid ${cfg.color || G.accent}`,
      borderRadius: 14, padding: 16, marginBottom: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <span style={{ fontWeight: 700, color: G.accent, fontSize: 15 }}>
            #{order.order_number || order.id}
          </span>
          <span style={{ fontSize: 12, color: G.muted, marginLeft: 8 }}>
            Table {order.table_number}
          </span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div style={{ fontSize: 13, color: G.muted, marginBottom: 10 }}>
        {order.items?.map(item => `${item.emoji || ''} ${item.plat_name} x${item.quantity}`).join(' • ')}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: G.accent }}>
          {order.total_amount?.toLocaleString()}
          <span style={{ fontSize: 11, color: G.muted, fontWeight: 400 }}> FCFA</span>
        </span>
        <span style={{ fontSize: 11, color: G.muted }}>
          {new Date(order.opened_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}