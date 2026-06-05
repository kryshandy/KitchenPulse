import React from 'react';

const statusConfig = {
  nouveau:        { label: 'Nouveau',         color: 'bg-yellow-100 text-yellow-700 border-yellow-300',  dot: 'bg-yellow-400' },
  en_preparation: { label: 'En préparation',  color: 'bg-blue-100 text-blue-700 border-blue-300',        dot: 'bg-blue-500'   },
  pret:           { label: 'Prêt',            color: 'bg-green-100 text-green-700 border-green-300',     dot: 'bg-green-500'  },
  livre:          { label: 'Livré',           color: 'bg-purple-100 text-purple-700 border-purple-300',  dot: 'bg-purple-500' },
  paye:           { label: 'Payé',            color: 'bg-gray-100 text-gray-600 border-gray-300',        dot: 'bg-gray-400'   },
  annule:         { label: 'Annulé',          color: 'bg-red-100 text-red-700 border-red-300',           dot: 'bg-red-500'    },
};

const OrderCard = ({ order, onTake, onReady, onDelete, role = 'cuisinier' }) => {
  const status = statusConfig[order.statut] || statusConfig['nouveau'];

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getElapsed = (dateString) => {
    const diff = Math.floor((Date.now() - new Date(dateString)) / 60000);
    if (diff < 1) return 'À l\'instant';
    if (diff === 1) return '1 min';
    return `${diff} min`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-md border-l-4 p-5 transition-all duration-200 hover:shadow-lg
      ${order.statut === 'nouveau' ? 'border-l-yellow-400' :
        order.statut === 'en_preparation' ? 'border-l-blue-500' :
        order.statut === 'pret' ? 'border-l-green-500' : 'border-l-gray-300'}`}>

      {/* En-tête */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="font-bold text-gray-800 text-lg">Commande #{order.id}</span>
          <p className="text-gray-500 text-sm mt-0.5">
            👤 {order.client_nom || 'Client'}
          </p>
        </div>
        <div className="text-right">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${status.color} flex items-center gap-1.5`}>
            <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
            {status.label}
          </span>
          <p className="text-gray-400 text-xs mt-1">
            ⏰ {formatTime(order.created_at)} • {getElapsed(order.created_at)}
          </p>
        </div>
      </div>

      {/* Items de la commande */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        {order.items && order.items.length > 0 ? (
          <ul className="space-y-1.5">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 font-medium">
                  {item.quantite}× {item.dish_nom}
                </span>
                <span className="text-gray-400 text-xs">{item.kcal_total} kcal</span>
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
        <span className="text-orange-600 font-bold">{Number(order.total || 0).toFixed(2)} €</span>
      </div>

      {/* Actions (cuisinier uniquement) */}
      {role === 'cuisinier' && (
        <div className="flex gap-2">
          {order.statut === 'nouveau' && onTake && (
            <button
              onClick={() => onTake(order.id)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
            >
              👨‍🍳 Prendre en charge
            </button>
          )}
          {order.statut === 'en_preparation' && onReady && (
            <button
              onClick={() => onReady(order.id)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
            >
              ✅ Marquer prête
            </button>
          )}
          {(order.statut === 'nouveau' || order.statut === 'en_preparation') && onDelete && (
            <button
              onClick={() => onDelete(order.id)}
              className="bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              🗑️ Annuler
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;