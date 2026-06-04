// ─────────────────────────────────────────────────────
//  KitchenPulse — pages/client/Panier.jsx
//  Branche : feat/client-ui
//
//  Props :
//    panier    {Array}    articles dans le panier
//    setPanier {Function} mise à jour du panier
//    setPage   {Function} navigation
//
//  TODO (après merge feat/setup-auth) :
//    - Remplacer handleCommander par :
//        api.post('/api/orders', { items: panier, table_id })
//          .then(res => { setPanier([]); setPage('suivi', res.data.id); })
// ─────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import { G, Card, Btn } from "../../theme.jsx";

const SERVICE_RATE = 0.05; // 5 %

// ── Ligne article ─────────────────────────────────────
const CartItem = ({ item, onAdd, onRemove, onDelete }) => (
  <Card style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, marginBottom: 10 }}>
    <span style={{ fontSize: 32, flexShrink: 0 }}>{item.img}</span>

    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.nom}</div>
      <div style={{ fontSize: 12, color: G.muted }}>
        {item.prix.toLocaleString("fr-FR")} FCFA × {item.qty} ={" "}
        <span style={{ color: G.accent, fontWeight: 600 }}>
          {(item.prix * item.qty).toLocaleString("fr-FR")} FCFA
        </span>
      </div>
    </div>

    {/* Quantité */}
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
      <button
        onClick={onRemove}
        style={{
          width: 28, height: 28, borderRadius: 8,
          border: `1px solid ${G.border}`, background: "transparent",
          color: G.text, cursor: "pointer", fontSize: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >−</button>
      <span style={{ fontWeight: 700, minWidth: 16, textAlign: "center" }}>{item.qty}</span>
      <button
        onClick={onAdd}
        style={{
          width: 28, height: 28, borderRadius: 8,
          border: "none", background: G.accent,
          color: "#fff", cursor: "pointer", fontSize: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >+</button>
    </div>

    {/* Supprimer */}
    <button
      onClick={onDelete}
      style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 16 }}
    >✕</button>
  </Card>
);

// ── Composant principal ───────────────────────────────
export default function Panier({ panier, setPanier, setPage }) {
  const [tableNum, setTableNum] = useState("");
  const [tableError, setTableError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sous_total = useMemo(() => panier.reduce((s, i) => s + i.prix * i.qty, 0), [panier]);
  const service    = Math.round(sous_total * SERVICE_RATE);
  const total      = sous_total + service;

  const addItem = (id) =>
    setPanier((p) => p.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));

  const removeItem = (id) =>
    setPanier((p) =>
      p.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0)
    );

  const deleteItem = (id) => setPanier((p) => p.filter((i) => i.id !== id));

  const handleCommander = async () => {
    if (!tableNum.trim()) {
      setTableError(true);
      return;
    }
    setTableError(false);
    setIsLoading(true);

    // --- Simulation réseau (supprimer quand l'API est prête) ---
    await new Promise((r) => setTimeout(r, 900));
    // --- Fin simulation ---

    // TODO : api.post('/api/orders', { items: panier, table_id: tableNum })
    setPanier([]);
    setIsLoading(false);
    setPage("paiement");
  };

  // Panier vide
  if (panier.length === 0)
    return (
      <div className="fadeUp" style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
        <h2 style={{ fontFamily: G.fontDisplay, fontSize: 24, marginBottom: 8 }}>
          Panier vide
        </h2>
        <p style={{ color: G.muted, marginBottom: 24, fontSize: 14 }}>
          Ajoutez des plats depuis le menu
        </p>
        <Btn onClick={() => setPage("menu")} style={{ padding: "12px 28px" }}>
          Voir le menu
        </Btn>
      </div>
    );

  return (
    <div className="fadeUp" style={{ padding: "16px 16px 100px" }}>
      <h1 style={{ fontFamily: G.fontDisplay, fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
        Mon Panier 🛒
      </h1>
      <p style={{ color: G.muted, fontSize: 13, marginBottom: 20 }}>
        {panier.length} article{panier.length > 1 ? "s" : ""}
      </p>

      {/* Articles */}
      {panier.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onAdd={() => addItem(item.id)}
          onRemove={() => removeItem(item.id)}
          onDelete={() => deleteItem(item.id)}
        />
      ))}

      {/* Numéro de table */}
      <Card style={{ marginTop: 8, marginBottom: 12 }}>
        <label
          style={{
            fontSize: 11, color: G.muted, display: "block",
            marginBottom: 8, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase",
          }}
        >
          Numéro de table
        </label>
        <input
          type="number"
          min="1"
          max="30"
          placeholder="ex : 4"
          value={tableNum}
          onChange={(e) => { setTableNum(e.target.value); setTableError(false); }}
          style={{
            width: "100%", padding: "12px 14px",
            background: G.bg,
            border: `1px solid ${tableError ? "#EF4444" : G.border}`,
            borderRadius: 10, color: G.text, fontSize: 15,
          }}
          onFocus={(e) => (e.target.style.borderColor = tableError ? "#EF4444" : G.accent)}
          onBlur={(e) => (e.target.style.borderColor = tableError ? "#EF4444" : G.border)}
        />
        {tableError && (
          <p style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>
            ⚠️ Veuillez indiquer votre numéro de table
          </p>
        )}
      </Card>

      {/* Récapitulatif prix */}
      <Card style={{ background: "#0D0D0F" }}>
        {[
          ["Sous-total", `${sous_total.toLocaleString("fr-FR")} FCFA`],
          [`Service (${SERVICE_RATE * 100}%)`, `${service.toLocaleString("fr-FR")} FCFA`],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex", justifyContent: "space-between",
              marginBottom: 10, fontSize: 14, color: G.muted,
            }}
          >
            <span>{label}</span>
            <span style={{ color: G.text }}>{value}</span>
          </div>
        ))}

        <div
          style={{
            borderTop: `1px solid ${G.border}`, paddingTop: 12,
            display: "flex", justifyContent: "space-between", marginBottom: 18,
          }}
        >
          <span style={{ fontWeight: 700 }}>Total TTC</span>
          <span style={{ fontWeight: 700, fontSize: 20, color: G.accent }}>
            {total.toLocaleString("fr-FR")} FCFA
          </span>
        </div>

        <Btn
          onClick={handleCommander}
          disabled={isLoading}
          style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15 }}
        >
          {isLoading ? (
            <>
              <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
              Envoi en cours...
            </>
          ) : (
            "Commander maintenant →"
          )}
        </Btn>

        <button
          onClick={() => setPage("menu")}
          style={{
            width: "100%", marginTop: 10, padding: "10px",
            background: "transparent", border: "none",
            color: G.muted, cursor: "pointer", fontSize: 13,
          }}
        >
          ← Continuer mes achats
        </button>
      </Card>
    </div>
  );
}