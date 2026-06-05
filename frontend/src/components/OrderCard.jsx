import { G } from '../theme';

/**
 * Carte d'une commande — deux variantes :
 *
 * variant="client"  (défaut)
 *   Thème sombre G, devise FCFA, bouton générique onAction/actionLabel
 *
 * variant="staff"
 *   Thème Tailwind clair, minuterie, boutons onTake/onReady/onDelete
 */

const STATUS_CONFIG = {
  // minuscules — standard projet
  nouveau:        { label: 'Nouveau',         color: '#FF6B35', bg: 'rgba(255,107,53,0.15)'  },
  en_preparation: { label: 'En préparation',  color: '#FFB800', bg: 'rgba(255,184,0,0.15)'   },
  pret:           { label: 'Prête ✓',         color: '#00C896', bg: 'rgba(0,200,150,0.15)'   },
  livre:          { label: 'Livré',           color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)'  },
  livree:         { label: 'Livrée',          color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)'  },
  annule:         { label: 'Annulé',          color: '#EF4444', bg: 'rgba(239,68,68,0.15)'   },
  cloturee:       { label: 'Clôturée',        color: '#6B7280', bg: 'rgba(107,114,128,0.15)' },
};

const TAILWIND_STATUS = {
  nouveau:        { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', dot: 'bg-yellow-400', border: 'border-l-yellow-400' },
  en_preparation: { color: 'bg-blue-100 text-blue-700 border-blue-300',       dot: 'bg-blue-500',   border: 'border-l-blue-500'   },
  pret:           { color: 'bg-green-100 text-green-700 border-green-300',    dot: 'bg-green-500',  border: 'border-l-green-500'  },
  annule:         { color: 'bg-red-100 text-red-700 border-red-300',          dot: 'bg-red-500',    border: 'border-l-gray-300'   },
};

const formatTime = (d) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const getElapsed = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 60_000);
  if (diff < 1) return "À l'instant";
  if (diff === 1) return '1 min';
  return `${diff} min`;
};

export default function OrderCard({
  order,
  variant = 'client',
  // client
  onAction, actionLabel,
  // staff
  onTake, onReady, onDelete,
  role = 'cuisinier',
}) {
  const status = order.status || order.statut || 'nouveau';

  /* ── Variante STAFF (Tailwind) ──────────────────────────── */
  if (variant === 'staff') {
    const tw = TAILWIND_STATUS[status] || TAILWIND_STATUS['nouveau'];

    return (
      <div className={`bg-white rounded-xl shadow-md border-l-4 p-5 transition-all duration-200 hover:shadow-lg ${tw.border}`}>
        {/* En-tête */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="font-bold text-gray-800 text-lg">
              #{order.order_number || order.id}
            </span>
            <p className="text-gray-500 text-sm mt-0.5">
              👤 {order.client_nom || order.first_name || 'Client'}
              {order.table_number && ` · Table ${order.table_number}`}
            </p>
          </div>
          <div className="text-right">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${tw.color} flex items-center gap-1.5`}>
              <span className={`w-2 h-2 rounded-full ${tw.dot}`}></span>
              {STATUS_CONFIG[status]?.label || status}
            </span>
            {order.opened_at || order.created_at ? (
              <p className="text-gray-400 text-xs mt-1">
                ⏰ {formatTime(order.opened_at || order.created_at)}
                &nbsp;• {getElapsed(order.opened_at || order.created_at)}
              </p>
            ) : null}
          </div>
        </div>

        {/* Items */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          {order.items?.length > 0 ? (
            <ul className="space-y-1.5">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 font-medium">
                    {item.quantity ?? item.quantite ?? item.qty}×{' '}
                    {item.plat_nom ?? item.dish_nom ?? item.nom}
                  </span>
                  {item.calories && (
                    <span className="text-gray-400 text-xs">{item.calories} kcal</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm text-center">Aucun item</p>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center mb-4 text-sm font-semibold text-gray-700">
          <span>Total</span>
          <span className="text-orange-600 font-bold">
            {Number(order.total_amount || order.total || 0).toLocaleString()} FCFA
          </span>
        </div>

        {/* Actions cuisinier */}
        {role === 'cuisinier' && (
          <div className="flex gap-2">
            {status === 'nouveau' && onTake && (
              <button onClick={() => onTake(order.id)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                👨‍🍳 Prendre en charge
              </button>
            )}
            {status === 'en_preparation' && onReady && (
              <button onClick={() => onReady(order.id)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                ✅ Marquer prête
              </button>
            )}
            {(status === 'nouveau' || status === 'en_preparation') && onDelete && (
              <button onClick={() => onDelete(order.id)}
                className="bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
                🗑️ Annuler
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ── Variante CLIENT (thème G sombre) ───────────────────── */
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['nouveau'];

  return (
    <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <span style={{ fontWeight: 700, color: G.accent, fontSize: 15 }}>#{order.order_number || order.id}</span>
          {order.table_number && <span style={{ fontSize: 12, color: G.muted, marginLeft: 8 }}>Table {order.table_number}</span>}
          {order.client_nom   && <span style={{ fontSize: 12, color: G.muted, marginLeft: 8 }}>· {order.client_nom}</span>}
        </div>
        <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`, padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
          {cfg.label}
        </span>
      </div>

      {/* Items */}
      {order.items?.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: G.muted, marginBottom: 5 }}>
          <span>{item.quantity ?? item.qty}× {item.plat_nom ?? item.nom}</span>
          <span style={{ color: G.text }}>
            {Number(item.subtotal ?? (item.unit_price * (item.quantity ?? item.qty))).toLocaleString()} FCFA
          </span>
        </div>
      ))}

      {/* Total */}
      <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 10, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: G.muted }}>Total</span>
        <span style={{ fontWeight: 700, color: G.accent }}>{Number(order.total_amount || 0).toLocaleString()} FCFA</span>
      </div>

      {/* Bouton générique */}
      {onAction && actionLabel && (
        <button onClick={onAction} style={{ width: '100%', marginTop: 12, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: G.accent, color: '#fff' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}