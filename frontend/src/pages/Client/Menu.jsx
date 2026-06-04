// ─────────────────────────────────────────────────────
//  KitchenPulse — pages/client/Menu.jsx
//  Branche : feat/client-ui
//
//  Props :
//    panier    {Array}    état global du panier
//    setPanier {Function} mise à jour du panier
//    setPage   {Function} navigation vers une autre page
//
//  TODO (après merge feat/setup-auth) :
//    - Remplacer DISHES par : useEffect(() => api.get('/api/dishes'), [])
//    - Afficher un spinner pendant le chargement
// ─────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import { G, Card, Btn } from "../../theme.jsx";
import { DISHES } from "../../mockData.jsx";

// ── Sous-composant : contrôleur quantité inline ───────
const QtyControl = ({ qty, onAdd, onRemove }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <button
      onClick={onRemove}
      style={{
        width: 30, height: 30, borderRadius: 8,
        border: `1px solid ${G.border}`, background: G.bg,
        color: G.text, cursor: "pointer", fontSize: 18,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >−</button>
    <span style={{ fontWeight: 700, color: G.accent, minWidth: 18, textAlign: "center" }}>
      {qty}
    </span>
    <button
      onClick={onAdd}
      style={{
        width: 30, height: 30, borderRadius: 8,
        border: "none", background: G.accent,
        color: "#fff", cursor: "pointer", fontSize: 18,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >+</button>
  </div>
);

// ── Composant principal ───────────────────────────────
export default function Menu({ panier, setPanier, setPage }) {
  const [cat, setCat]       = useState("Tous");
  const [search, setSearch] = useState("");

  const cats = useMemo(
    () => ["Tous", ...new Set(DISHES.map((d) => d.cat))],
    []
  );

  const filtered = useMemo(() => {
    let list = cat === "Tous" ? DISHES : DISHES.filter((d) => d.cat === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.nom.toLowerCase().includes(q) ||
          d.cat.toLowerCase().includes(q)
      );
    }
    return list;
  }, [cat, search]);

  const getQty = (id) => panier.find((i) => i.id === id)?.qty || 0;

  const addToCart = (dish) =>
    setPanier((p) => {
      const ex = p.find((i) => i.id === dish.id);
      return ex
        ? p.map((i) => (i.id === dish.id ? { ...i, qty: i.qty + 1 } : i))
        : [...p, { ...dish, qty: 1 }];
    });

  const removeFromCart = (id) =>
    setPanier((p) =>
      p.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0)
    );

  const cartCount = panier.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="fadeUp" style={{ padding: "16px 16px 100px" }}>
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <h1 style={{ fontFamily: G.fontDisplay, fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
            Notre Menu 🍴
          </h1>
          <p style={{ color: G.muted, fontSize: 13, marginTop: 4 }}>
            {filtered.length} plat{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
        {cartCount > 0 && (
          <button
            onClick={() => setPage("panier")}
            style={{
              background: G.accent, border: "none", borderRadius: 20,
              padding: "8px 14px", color: "#fff", fontWeight: 700,
              fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            🛒 {cartCount}
          </button>
        )}
      </div>

      {/* Barre de recherche */}
      <div style={{ position: "relative", margin: "16px 0 14px" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>
          🔍
        </span>
        <input
          type="search"
          placeholder="Rechercher un plat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "11px 14px 11px 38px",
            background: G.card, border: `1px solid ${G.border}`,
            borderRadius: 10, color: G.text, fontSize: 14,
          }}
          onFocus={(e) => (e.target.style.borderColor = G.accent)}
          onBlur={(e) => (e.target.style.borderColor = G.border)}
        />
      </div>

      {/* Filtres catégories */}
      <div
        style={{
          display: "flex", gap: 8, overflowX: "auto",
          paddingBottom: 12, marginBottom: 16, scrollbarWidth: "none",
        }}
      >
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{
              padding: "7px 16px", borderRadius: 20,
              border: `1px solid ${cat === c ? G.accent : G.border}`,
              background: cat === c ? `${G.accent}20` : "transparent",
              color: cat === c ? G.accent : G.muted,
              cursor: "pointer", fontSize: 13, fontWeight: 500,
              whiteSpace: "nowrap", flexShrink: 0,
              transition: "all .2s",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Liste des plats */}
      {filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
          <p style={{ color: G.muted }}>Aucun plat trouvé pour « {search} »</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((dish, i) => {
            const qty = getQty(dish.id);
            return (
              <Card
                key={dish.id}
                className="fadeUp"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  opacity: dish.disponible ? 1 : 0.55,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Emoji plat */}
                  <div style={{ fontSize: 42, flexShrink: 0 }}>{dish.img}</div>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>
                        {dish.nom}
                      </span>
                      <span
                        style={{
                          fontSize: 10, color: G.accent2,
                          background: `${G.accent2}15`, padding: "2px 7px",
                          borderRadius: 6, flexShrink: 0, fontWeight: 600,
                        }}
                      >
                        {dish.cat}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: G.muted, margin: "4px 0 8px" }}>
                      ⭐ {dish.note}&nbsp;•&nbsp;🔥 {dish.cal} kcal
                      {dish.allergenes?.length > 0 && (
                        <span style={{ color: "#FFB800" }}>
                          &nbsp;•&nbsp;⚠️ {dish.allergenes.join(", ")}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 17, fontWeight: 700, color: G.accent }}>
                        {dish.prix.toLocaleString("fr-FR")}{" "}
                        <span style={{ fontSize: 11, color: G.muted, fontWeight: 400 }}>
                          FCFA
                        </span>
                      </span>

                      {!dish.disponible ? (
                        <span style={{ fontSize: 11, color: G.muted, fontStyle: "italic" }}>
                          Indisponible
                        </span>
                      ) : qty > 0 ? (
                        <QtyControl
                          qty={qty}
                          onAdd={() => addToCart(dish)}
                          onRemove={() => removeFromCart(dish.id)}
                        />
                      ) : (
                        <Btn
                          onClick={() => addToCart(dish)}
                          style={{ padding: "7px 14px", fontSize: 13 }}
                        >
                          + Ajouter
                        </Btn>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bouton flottant panier (si articles) */}
      {cartCount > 0 && (
        <div
          style={{
            position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
            zIndex: 50,
          }}
        >
          <Btn
            onClick={() => setPage("panier")}
            style={{
              padding: "14px 28px", borderRadius: 30, fontSize: 15,
              boxShadow: `0 8px 32px ${G.accent}50`,
            }}
          >
            🛒 Voir le panier ({cartCount})
          </Btn>
        </div>
      )}
    </div>
  );
}