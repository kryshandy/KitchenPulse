import { ALLERGEN_LABELS, NUTRI_SCORE_CONFIG } from '../api/mockData';

const G = {
  bg: '#0D0D0F', card: '#16161A', border: '#242428',
  accent: '#FF6B35', accent2: '#FFB800', green: '#00C896',
  text: '#F0EDE8', muted: '#7A7A82',
  font: "'DM Sans','Segoe UI',sans-serif",
};

// ─── Badges allergènes ────────────────────────────────────────────
function AllergenBadge({ code }) {
  const info = ALLERGEN_LABELS[code];
  if (!info) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: 'rgba(255,184,0,0.15)', color: G.accent2,
      border: '1px solid rgba(255,184,0,0.3)',
      padding: '2px 7px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    }}>
      {info.icon} {info.label}
    </span>
  );
}

// ─── Nutri score badge ────────────────────────────────────────────
function NutriScore({ score }) {
  if (!score) return null;
  const cfg = NUTRI_SCORE_CONFIG[score];
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
    }}>
      {score}
    </span>
  );
}

// ─── Contrôle quantité ───────────────────────────────────────────
function QtyControl({ qty, onAdd, onRemove }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={onRemove} style={{
        width: 30, height: 30, borderRadius: 8,
        border: `1px solid ${G.border}`, background: G.bg,
        color: G.text, cursor: 'pointer', fontSize: 18, lineHeight: 1,
      }}>−</button>
      <span style={{ fontWeight: 700, color: G.accent, minWidth: 18, textAlign: 'center' }}>
        {qty}
      </span>
      <button onClick={onAdd} style={{
        width: 30, height: 30, borderRadius: 8,
        border: 'none', background: G.accent,
        color: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1,
      }}>+</button>
    </div>
  );
}

// ─── DishCard principal ───────────────────────────────────────────
export default function DishCard({ dish, qty = 0, onAdd, onRemove }) {
  return (
    <div style={{
      background: G.card, border: `1px solid ${G.border}`,
      borderRadius: 14, padding: 16, marginBottom: 12,
      opacity: dish.is_active ? 1 : 0.5,
      borderLeft: dish.is_featured ? `3px solid ${G.accent}` : undefined,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Emoji / image */}
        <div style={{ fontSize: 44, flexShrink: 0 }}>{dish.emoji}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Ligne 1 : nom + catégorie */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: G.text }}>{dish.name}</span>
            <span style={{
              fontSize: 10, color: G.accent2,
              background: 'rgba(255,184,0,0.12)', padding: '2px 7px',
              borderRadius: 6, flexShrink: 0, fontWeight: 600,
            }}>
              {dish.category_name}
            </span>
          </div>

          {/* Description */}
          <p style={{
            fontSize: 12, color: G.muted, margin: '4px 0 6px',
            lineHeight: 1.5, overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {dish.description}
          </p>

          {/* Stats : note + calories + nutri score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: G.muted }}>
              ⭐ {dish.avg_rating} ({dish.review_count})
            </span>
            <span style={{ fontSize: 12, color: G.muted }}>•</span>
            <span style={{ fontSize: 12, color: G.muted }}>🔥 {dish.calories} kcal</span>
            <span style={{ fontSize: 12, color: G.muted }}>•</span>
            <span style={{ fontSize: 12, color: G.muted }}>⏱ {dish.prep_time_minutes} min</span>
            <NutriScore score={dish.nutri_score} />
          </div>

          {/* Allergènes */}
          {dish.allergens.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
              {dish.allergens.map(a => <AllergenBadge key={a} code={a} />)}
            </div>
          )}

          {/* Ligne bas : prix + bouton */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: G.accent }}>
              {dish.price.toLocaleString()}
              <span style={{ fontSize: 11, color: G.muted, fontWeight: 400 }}> FCFA</span>
            </span>

            {!dish.is_active ? (
              <span style={{ fontSize: 11, color: G.muted }}>Indisponible</span>
            ) : qty > 0 ? (
              <QtyControl qty={qty} onAdd={onAdd} onRemove={onRemove} />
            ) : (
              <button onClick={onAdd} style={{
                padding: '8px 16px', borderRadius: 10, border: 'none',
                background: G.accent, color: '#fff', cursor: 'pointer',
                fontWeight: 600, fontSize: 13,
              }}>
                + Ajouter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}