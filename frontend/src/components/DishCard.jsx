import { G } from '../theme';

/**
 * Carte d'un plat — deux variantes :
 *
 * variant="client"  (défaut)
 *   Props : dish, qty, onAdd, onRemove
 *   Affiche contrôles quantité, thème sombre G, devise FCFA
 *
 * variant="staff"
 *   Props : dish, onEdit, onDelete, onToggle, showActions
 *   Affiche boutons gestion, thème Tailwind clair
 */
export default function DishCard({
  dish,
  variant = 'client',
  // client
  qty, onAdd, onRemove,
  // staff
  onEdit, onDelete, onToggle, showActions = true,
}) {
  const disponible = dish.is_available !== false
                  && dish.is_available !== 0
                  && dish.disponible   !== false;

  /* ── Variante STAFF (Tailwind) ──────────────────────────── */
  if (variant === 'staff') {
    const categoryColors = {
      'Entrée':  'bg-green-100 text-green-700',
      'Plat':    'bg-orange-100 text-orange-700',
      'Dessert': 'bg-pink-100 text-pink-700',
      'Boisson': 'bg-blue-100 text-blue-700',
    };
    const categoryStyle = categoryColors[dish.categorie || dish.category_name] || 'bg-gray-100 text-gray-700';

    return (
      <div className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all duration-200
        ${disponible ? 'border-transparent hover:border-orange-300' : 'border-red-200 opacity-70'}`}>

        {/* Image */}
        <div className="relative h-40 bg-gray-100">
          {dish.image_url || dish.photo ? (
            <img
              src={dish.image_url || dish.photo}
              alt={dish.nom}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/placeholder-dish.png'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-orange-50 to-red-50">
              🍽️
            </div>
          )}
          <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full
            ${disponible ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {disponible ? 'Disponible' : 'Indispo'}
          </span>
          <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${categoryStyle}`}>
            {dish.categorie || dish.category_name}
          </span>
        </div>

        {/* Contenu */}
        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-base truncate">{dish.nom}</h3>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2 h-10">
            {dish.description || 'Aucune description'}
          </p>
          <div className="flex justify-between items-center mt-3">
            <span className="text-orange-600 font-bold text-lg">
              {Number(dish.prix).toLocaleString()} FCFA
            </span>
            {dish.calories && (
              <span className="text-gray-400 text-xs">🔥 {dish.calories} kcal</span>
            )}
          </div>

          {showActions && (
            <div className="flex gap-2 mt-4">
              {onToggle && (
                <button onClick={() => onToggle(dish)}
                  className={`flex-1 text-xs py-2 rounded-lg font-semibold transition-colors
                    ${disponible
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                  {disponible ? '⛔ Désactiver' : '✅ Activer'}
                </button>
              )}
              {onEdit && (
                <button onClick={() => onEdit(dish)}
                  className="flex-1 text-xs py-2 rounded-lg font-semibold bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                  ✏️ Modifier
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(dish)}
                  className="text-xs py-2 px-3 rounded-lg font-semibold bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors">
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Variante CLIENT (thème G sombre) ───────────────────── */
  return (
    <div className="fadeUp" style={{
      background: G.card, border: `1px solid ${G.border}`,
      borderRadius: 14, padding: 16,
      opacity: disponible ? 1 : 0.5, marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Image */}
        <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 10, overflow: 'hidden', background: G.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {dish.image_url ? (
            <img src={dish.image_url} alt={dish.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 30 }}>🍽️</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Nom + catégorie */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{dish.nom}</span>
            {dish.category_name && (
              <span style={{ fontSize: 10, color: G.accent2, background: `${G.accent2}15`, padding: '2px 7px', borderRadius: 6, flexShrink: 0, fontWeight: 600 }}>
                {dish.category_name}
              </span>
            )}
          </div>

          {/* Méta */}
          <div style={{ fontSize: 12, color: G.muted, margin: '4px 0 8px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {dish.note_moyenne > 0 && <span>⭐ {Number(dish.note_moyenne).toFixed(1)}</span>}
            {dish.note_moyenne > 0 && dish.calories && <span>&nbsp;•&nbsp;</span>}
            {dish.calories && <span>🔥 {dish.calories} kcal</span>}
            {dish.allergenes?.length > 0 && (
              <span style={{ color: G.accent2 }}>&nbsp;•&nbsp; ⚠️ {dish.allergenes.join(', ')}</span>
            )}
          </div>

          {/* Prix + contrôles */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: G.accent }}>
              {Number(dish.prix).toLocaleString()}{' '}
              <span style={{ fontSize: 11, color: G.muted, fontWeight: 400 }}>FCFA</span>
            </span>

            {!disponible ? (
              <span style={{ fontSize: 11, color: G.muted }}>Indisponible</span>
            ) : qty > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={onRemove} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${G.border}`, background: G.bg, color: G.text, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontWeight: 700, color: G.accent, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                <button onClick={onAdd}    style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: G.accent, color: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            ) : (
              <button onClick={onAdd} style={{ padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: G.accent, color: '#fff' }}>
                + Ajouter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}