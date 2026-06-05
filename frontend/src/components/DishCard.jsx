// frontend/src/components/DishCard.jsx
import { G } from "../theme";

/**
 * Carte d'un plat dans le menu.
 * Props :
 *  - dish    : objet plat venant de l'API  (id, nom, prix, is_available,
 *              category_name, note_moyenne, calories, allergenes[], image_url)
 *  - qty     : quantité actuellement dans le panier
 *  - onAdd   : callback pour ajouter une unité
 *  - onRemove: callback pour retirer une unité
 */
export default function DishCard({ dish, qty, onAdd, onRemove }) {
  const disponible = dish.is_available !== false && dish.is_available !== 0;

  return (
    <div
      className="fadeUp"
      style={{
        background: G.card,
        border: `1px solid ${G.border}`,
        borderRadius: 14,
        padding: 16,
        opacity: disponible ? 1 : 0.5,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Image ou emoji de fallback */}
        <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 10, overflow: "hidden", background: G.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {dish.image_url ? (
            <img src={dish.image_url} alt={dish.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 30 }}>🍽️</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Nom + catégorie */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{dish.nom}</span>
            {dish.category_name && (
              <span style={{
                fontSize: 10, color: G.accent2, background: `${G.accent2}15`,
                padding: "2px 7px", borderRadius: 6, flexShrink: 0, fontWeight: 600,
              }}>
                {dish.category_name}
              </span>
            )}
          </div>

          {/* Méta */}
          <div style={{ fontSize: 12, color: G.muted, margin: "4px 0 8px", display: "flex", flexWrap: "wrap", gap: 4 }}>
            {dish.note_moyenne > 0 && <span>⭐ {Number(dish.note_moyenne).toFixed(1)}</span>}
            {dish.note_moyenne > 0 && dish.calories && <span>&nbsp;•&nbsp;</span>}
            {dish.calories && <span>🔥 {dish.calories} kcal</span>}
            {dish.allergenes?.length > 0 && (
              <span style={{ color: G.accent2 }}>&nbsp;•&nbsp; ⚠️ {dish.allergenes.join(", ")}</span>
            )}
          </div>

          {/* Prix + contrôles */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: G.accent }}>
              {Number(dish.prix).toLocaleString()}{" "}
              <span style={{ fontSize: 11, color: G.muted, fontWeight: 400 }}>FCFA</span>
            </span>

            {!disponible ? (
              <span style={{ fontSize: 11, color: G.muted }}>Indisponible</span>
            ) : qty > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={onRemove}
                  style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${G.border}`, background: G.bg, color: G.text, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
                >−</button>
                <span style={{ fontWeight: 700, color: G.accent, minWidth: 20, textAlign: "center" }}>{qty}</span>
                <button
                  onClick={onAdd}
                  style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: G.accent, color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
                >+</button>
              </div>
            ) : (
              <button
                onClick={onAdd}
                style={{ padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: G.accent, color: "#fff" }}
              >
                + Ajouter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}