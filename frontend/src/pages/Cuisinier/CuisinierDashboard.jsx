import { useState, useEffect, useCallback } from "react";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";

// ======================= THEMES ========================
const LIGHT = {
  bg: "#F7F5F0",
  surface: "#FFFFFF",
  surfaceAlt: "#F0EDE8",
  border: "#E5E0D8",
  borderStrong: "#C8C0B4",
  text: "#1A1714",
  textMuted: "#6B6560",
  textHint: "#9E9890",
  accent: "#D4541A",
  accentBg: "#FEF1EB",
  accentLight: "#F5A87A",
  amber: "#C2850A",
  amberBg: "#FEF7E6",
  green: "#1A7A52",
  greenBg: "#E8F5EE",
  purple: "#5B3DB8",
  purpleBg: "#EEE9FD",
  danger: "#C0392B",
  dangerBg: "#FDECEA",
  shadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowMd: "0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)",
};

const DARK = {
  bg: "#0F0E0C",
  surface: "#1C1A17",
  surfaceAlt: "#242119",
  border: "#2E2B26",
  borderStrong: "#3D3930",
  text: "#F0EDE8",
  textMuted: "#8A847A",
  textHint: "#5A5650",
  accent: "#FF6B35",
  accentBg: "rgba(255,107,53,0.12)",
  accentLight: "#FF8A5E",
  amber: "#FFB800",
  amberBg: "rgba(255,184,0,0.12)",
  green: "#00C896",
  greenBg: "rgba(0,200,150,0.12)",
  purple: "#8B5CF6",
  purpleBg: "rgba(139,92,246,0.12)",
  danger: "#EF4444",
  dangerBg: "rgba(239,68,68,0.12)",
  shadow: "0 1px 4px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)",
  shadowMd: "0 2px 8px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)",
};

// ======================= STYLES GLOBAUX ========================
const getCSS = (T) => `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  html,body,#root{height:100%;background:${T.bg};color:${T.text};font-family:'DM Sans','Segoe UI',sans-serif;transition:background 0.3s,color 0.3s;}
  ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
  @keyframes tickIn{from{transform:scale(0.8);opacity:0;}to{transform:scale(1);opacity:1;}}
  @keyframes shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-3px);}75%{transform:translateX(3px);}}
  .fadeUp{animation:fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both;}
  .fadeIn{animation:fadeIn 0.25s ease both;}
  button,input,textarea,select{font-family:'DM Sans','Segoe UI',sans-serif;}
  input:focus,textarea:focus,select:focus{outline:none;}
  button{cursor:pointer;}
`;

// ======================= COMPOSANTS UI ========================
const LiveDot = ({ T }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: T.green, fontWeight: 600, letterSpacing: 0.5 }}>
    <span style={{ width: 6, height: 6, background: T.green, borderRadius: "50%", animation: "pulse 1.8s infinite" }} />
    LIVE
  </span>
);

const Tag = ({ children, color, bg, T }) => (
  <span style={{
    background: bg || T.accentBg, color: color || T.accent,
    border: `1px solid ${(color || T.accent)}30`,
    padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
  }}>{children}</span>
);

const Pill = ({ children, active, color, onClick, T }) => (
  <button onClick={onClick} style={{
    padding: "6px 14px", borderRadius: 20, border: `1px solid ${active ? color : T.border}`,
    background: active ? `${color}18` : "transparent",
    color: active ? color : T.textMuted, fontWeight: active ? 600 : 400,
    fontSize: 13, transition: "all 0.2s", whiteSpace: "nowrap",
  }}>{children}</button>
);

const Toggle = ({ value, onChange, T }) => (
  <div onClick={() => onChange(!value)} style={{
    width: 44, height: 24, borderRadius: 12,
    background: value ? T.green : T.border,
    cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0,
  }}>
    <div style={{
      position: "absolute", top: 3, width: 18, height: 18,
      borderRadius: "50%", background: value ? "#fff" : T.textHint,
      transition: "left 0.25s, background 0.25s",
      left: value ? 23 : 3, boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    }} />
  </div>
);

const IconBtn = ({ icon, onClick, variant = "ghost", T, style = {} }) => {
  const styles = {
    ghost: { bg: "transparent", color: T.textMuted, border: `1px solid ${T.border}` },
    danger: { bg: T.dangerBg, color: T.danger, border: `1px solid ${T.danger}30` },
    success: { bg: T.greenBg, color: T.green, border: `1px solid ${T.green}30` },
    accent: { bg: T.accentBg, color: T.accent, border: `1px solid ${T.accent}30` },
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} style={{
      width: 34, height: 34, borderRadius: 10,
      background: s.bg, border: s.border, color: s.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16, transition: "all 0.15s", flexShrink: 0, ...style,
    }}>{icon}</button>
  );
};

const Btn = ({ children, onClick, variant = "accent", size = "md", disabled, T, style = {} }) => {
  const variants = {
    accent: { bg: T.accent, color: "#fff", border: "none" },
    success: { bg: T.green, color: "#fff", border: "none" },
    amber: { bg: T.amber, color: "#fff", border: "none" },
    ghost: { bg: "transparent", color: T.textMuted, border: `1px solid ${T.border}` },
    danger: { bg: T.danger, color: "#fff", border: "none" },
    outline: { bg: "transparent", color: T.accent, border: `1px solid ${T.accent}` },
  };
  const sizes = {
    sm: { padding: "7px 14px", fontSize: 12, borderRadius: 9 },
    md: { padding: "10px 20px", fontSize: 14, borderRadius: 11 },
    lg: { padding: "13px 24px", fontSize: 15, borderRadius: 12 },
  };
  const v = variants[variant]; const s = sizes[size];
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      ...v, ...s, fontWeight: 600, display: "inline-flex", alignItems: "center",
      gap: 6, transition: "all 0.15s", opacity: disabled ? 0.5 : 1,
      cursor: disabled ? "not-allowed" : "pointer", ...style,
    }}>{children}</button>
  );
};

// ======================= TIMER HOOK ========================
function useTimer(startTime) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ======================= ORDER CARD ========================
const OrderCard = ({ order, onUpdate, T }) => {
  const timer = useTimer(order.startTime);
  const total = order.plats.reduce((s, p) => s + p.prix * p.qty, 0);
  const isUrgent = order.priorite === "haute";

  // Configuration des statuts connus
  const statusCfg = {
    nouveau: { label: "Nouvelle", color: T.accent, bg: T.accentBg, action: "Démarrer", next: "preparation", actionVariant: "amber" },
    preparation: { label: "En préparation", color: T.amber, bg: T.amberBg, action: "Marquer prête", next: "pret", actionVariant: "success" },
    pret: { label: "Prête ✓", color: T.green, bg: T.greenBg, action: null, next: null, actionVariant: null },
  };
  // Fallback pour statut inconnu
  const cfg = statusCfg[order.statut] || {
    label: order.statut || "Inconnu",
    color: T.textMuted,
    bg: T.surfaceAlt,
    action: null,
    next: null,
    actionVariant: null
  };

  return (
    <div className="fadeUp" style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: 14, padding: 16, marginBottom: 10,
      boxShadow: T.shadow, transition: "all 0.2s",
      animation: isUrgent && order.statut === "nouveau" ? "shake 0.4s ease" : undefined,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, color: cfg.color }}>
            #{order.id}
          </span>
          {isUrgent && <Tag T={T} color={T.danger} bg={T.dangerBg}>⚡ Urgent</Tag>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Tag T={T} color={cfg.color} bg={cfg.bg}>{cfg.label}</Tag>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>🪑 Table {order.table}</span>
        <span style={{ fontSize: 12, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>👤 {order.client}</span>
        <span style={{ fontSize: 12, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>🕐 {order.temps}</span>
        {order.statut === "preparation" && (
          <span style={{ fontSize: 12, color: T.amber, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
            ⏱ {timer}
          </span>
        )}
      </div>

      <div style={{ background: T.surfaceAlt, borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
        {order.plats.map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 12, color: T.accent, background: T.accentBg, width: 20, height: 20, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>{p.qty}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{p.nom}</span>
            </div>
            <span style={{ fontSize: 12, color: T.textMuted }}>{(p.prix * p.qty).toLocaleString()} F</span>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: T.textMuted }}>Total</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{total.toLocaleString()} FCFA</span>
        </div>
      </div>

      {order.note && (
        <div style={{ background: T.amberBg, borderRadius: 8, padding: "7px 10px", marginBottom: 10, fontSize: 12, color: T.amber, display: "flex", gap: 6 }}>
          <span>⚠️</span>
          <span>{order.note}</span>
        </div>
      )}

      {cfg.action && (
        <Btn T={T} variant={cfg.actionVariant} onClick={() => onUpdate(order.id, cfg.next)} style={{ width: "100%", justifyContent: "center" }}>
          {cfg.action === "Démarrer" ? "▶ " : "✓ "}{cfg.action}
        </Btn>
      )}
      {order.statut === "pret" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", color: T.green, fontWeight: 600, fontSize: 13 }}>
          <span style={{ fontSize: 18 }}>✅</span> En attente du serveur...
        </div>
      )}
    </div>
  );
};

// ======================= PAGE : FILE DES COMMANDES ========================
const CuisinierFile = ({ T }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/orders/cuisinier");
      // Transformation pour coller à la structure attendue par OrderCard
      const formatted = res.data.map(order => ({
        id: order.id,
        table: order.table || order.table_id || "?",
        statut: order.statut, // 'nouveau', 'preparation', 'pret', ou autre
        plats: order.items?.map(item => ({
          nom: item.dish?.nom || item.nom,
          qty: item.quantity,
          prix: item.price || item.dish?.prix || 0
        })) || [],
        client: order.client?.nom || `Client #${order.client_id}`,
        temps: new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        priorite: order.priorite || "normale",
        note: order.note || "",
        startTime: order.statut === "preparation" && order.started_at ? new Date(order.started_at).getTime() : null
      }));
      setOrders(formatted);
    } catch (err) {
      toast.error("Erreur chargement commandes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const update = async (id, newStatut) => {
    try {
      if (newStatut === "preparation") await api.patch(`/orders/${id}/take`);
      else if (newStatut === "pret") await api.patch(`/orders/${id}/ready`);
      toast.success(`Commande ${newStatut === "preparation" ? "prise en charge" : "prête"} !`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const totalActive = orders.filter(o => o.statut !== "livre").length;
  const counts = {
    tous: totalActive,
    nouveau: orders.filter(o => o.statut === "nouveau").length,
    preparation: orders.filter(o => o.statut === "preparation").length,
    pret: orders.filter(o => o.statut === "pret").length,
  };

  const displayed = filter === "tous"
    ? orders.filter(o => o.statut !== "livre")
    : orders.filter(o => o.statut === filter);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>⏳ Chargement des commandes...</div>;

  return (
    <div className="fadeUp" style={{ padding: "16px 16px 100px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: -0.3 }}>
              File des commandes
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <LiveDot T={T} />
              <span style={{ fontSize: 12, color: T.textMuted }}>{totalActive} commande{totalActive > 1 ? "s" : ""} active{totalActive > 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {[
            { key: "tous", label: "Toutes", count: counts.tous, color: T.text, bg: T.surfaceAlt },
            { key: "nouveau", label: "Nouvelles", count: counts.nouveau, color: T.accent, bg: T.accentBg },
            { key: "preparation", label: "En prép.", count: counts.preparation, color: T.amber, bg: T.amberBg },
            { key: "pret", label: "Prêtes", count: counts.pret, color: T.green, bg: T.greenBg },
          ].map(b => (
            <button key={b.key} onClick={() => setFilter(b.key)} style={{
              flex: 1, padding: "8px 6px", borderRadius: 12,
              border: `1px solid ${filter === b.key ? b.color : T.border}`,
              background: filter === b.key ? b.bg : T.surface,
              cursor: "pointer", transition: "all 0.2s",
            }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: b.color }}>{b.count}</div>
              <div style={{ fontSize: 10, color: filter === b.key ? b.color : T.textMuted, marginTop: 1 }}>{b.label}</div>
            </button>
          ))}
        </div>
      </div>

      {displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: T.textMuted }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
          <p style={{ fontWeight: 600 }}>Aucune commande ici</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Profitez de la pause !</p>
        </div>
      ) : (
        displayed.map(o => <OrderCard key={o.id} order={o} onUpdate={update} T={T} />)
      )}
    </div>
  );
};

// ======================= PAGE : GESTION DU MENU ========================
const CuisinierMenu = ({ T }) => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDish, setNewDish] = useState({ nom: "", prix: "", cat: "Plat", temps: "" });
  const [filter, setFilter] = useState("Tous");

  const fetchDishes = useCallback(async () => {
    try {
      const res = await api.get("/dishes");
      const formatted = res.data.map(dish => ({
        id: dish.id,
        nom: dish.nom,
        prix: dish.prix,
        cat: dish.categorie,
        img: dish.photo || "🍽️",
        disponible: dish.disponible,
        temps: dish.temps_preparation || 15
      }));
      setDishes(formatted);
    } catch (err) {
      toast.error("Erreur chargement plats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDishes(); }, [fetchDishes]);

  const toggle = async (id) => {
    const dish = dishes.find(d => d.id === id);
    if (!dish) return;
    try {
      await api.patch(`/dishes/${id}`, { disponible: !dish.disponible });
      toast.success(`Plat ${!dish.disponible ? "activé" : "désactivé"}`);
      fetchDishes();
    } catch (err) {
      toast.error("Erreur mise à jour");
    }
  };

  const addDish = async () => {
    if (!newDish.nom || !newDish.prix) return toast.warn("Nom et prix requis");
    try {
      await api.post("/dishes", {
        nom: newDish.nom,
        prix: parseInt(newDish.prix),
        categorie: newDish.cat,
        temps_preparation: parseInt(newDish.temps) || 15,
        disponible: true,
        description: "",
        calories: 0
      });
      toast.success("Plat ajouté");
      setShowAdd(false);
      setNewDish({ nom: "", prix: "", cat: "Plat", temps: "" });
      fetchDishes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur création");
    }
  };

  const deleteDish = async (id, nom) => {
    if (!window.confirm(`Supprimer "${nom}" définitivement ?`)) return;
    try {
      await api.delete(`/dishes/${id}`);
      toast.success("Plat supprimé");
      fetchDishes();
    } catch (err) {
      toast.error("Erreur suppression");
    }
  };

  const cats = ["Tous", "Plat", "Poisson", "Entrée", "Boisson"];
  const filtered = filter === "Tous" ? dishes : dishes.filter(d => d.cat === filter);
  const activeCount = dishes.filter(d => d.disponible).length;

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>⏳ Chargement du menu...</div>;

  return (
    <div className="fadeUp" style={{ padding: "16px 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: -0.3 }}>
            Gestion du Menu
          </h1>
          <p style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
            {activeCount} sur {dishes.length} disponibles
          </p>
        </div>
        <Btn T={T} variant="accent" size="sm" onClick={() => setShowAdd(s => !s)}>
          {showAdd ? "✕ Annuler" : "+ Nouveau"}
        </Btn>
      </div>

      {showAdd && (
        <div className="fadeUp" style={{
          background: T.surface, border: `1px solid ${T.accent}40`,
          borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: T.shadow,
        }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Nouveau plat</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>Nom du plat</label>
              <input type="text" value={newDish.nom} onChange={e => setNewDish(n => ({ ...n, nom: e.target.value }))} placeholder="Ex: Mbongo Tchobi" style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>Prix (FCFA)</label>
              <input type="number" value={newDish.prix} onChange={e => setNewDish(n => ({ ...n, prix: e.target.value }))} placeholder="Ex: 3500" style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>Temps (min)</label>
              <input type="number" value={newDish.temps} onChange={e => setNewDish(n => ({ ...n, temps: e.target.value }))} placeholder="Ex: 20" style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>Catégorie</label>
              <select value={newDish.cat} onChange={e => setNewDish(n => ({ ...n, cat: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.text, fontSize: 14 }}>
                {["Plat", "Poisson", "Entrée", "Boisson"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <Btn T={T} variant="success" size="sm" onClick={addDish} style={{ width: "100%", justifyContent: "center" }}>✓ Ajouter au menu</Btn>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 16, scrollbarWidth: "none" }}>
        {cats.map(c => <Pill key={c} T={T} active={filter === c} color={T.accent} onClick={() => setFilter(c)}>{c}</Pill>)}
      </div>

      {filtered.map(dish => (
        <div key={dish.id} className="fadeIn" style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: 14, marginBottom: 10,
          boxShadow: T.shadow, opacity: dish.disponible ? 1 : 0.55,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: T.surfaceAlt, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
              {dish.img}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{dish.nom}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 3 }}>
                <span style={{ fontSize: 11, color: T.textMuted }}>{dish.cat}</span>
                <span style={{ fontSize: 11, color: T.textHint }}>•</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>{dish.prix.toLocaleString()} FCFA</span>
                <span style={{ fontSize: 11, color: T.textHint }}>•</span>
                <span style={{ fontSize: 11, color: T.textMuted }}>⏱ {dish.temps} min</span>
              </div>
            </div>
            <Toggle T={T} value={dish.disponible} onChange={() => toggle(dish.id)} />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <Btn T={T} variant="ghost" size="sm" style={{ flex: 1, justifyContent: "center" }}>✏️ Modifier</Btn>
            <IconBtn T={T} icon="🗑" variant="danger" onClick={() => deleteDish(dish.id, dish.nom)} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ======================= STATS BAR ========================
const StatsBar = ({ T }) => {
  const stats = [
    { label: "Traitées", value: 12, color: T.green },
    { label: "En cours", value: 3, color: T.amber },
    { label: "Nouvelles", value: 2, color: T.accent },
  ];
  return (
    <div style={{
      display: "flex", gap: 8, padding: "12px 16px",
      background: T.surface, borderBottom: `1px solid ${T.border}`,
    }}>
      {stats.map(s => (
        <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 10, color: T.textMuted }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
};

// ======================= TOPBAR ========================
const Topbar = ({ page, T, darkMode, onToggleDark }) => {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      background: T.surface, borderBottom: `1px solid ${T.border}`,
      padding: "12px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>
          Kitchen<span style={{ color: T.accent }}>Pulse</span>
        </span>
        <span style={{
          background: T.amberBg, color: T.amber, border: `1px solid ${T.amber}40`,
          padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
        }}>CUISINIER</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <LiveDot T={T} />
        <button onClick={onToggleDark} style={{ width: 34, height: 34, borderRadius: 10, background: T.surfaceAlt, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
          {darkMode ? "☀️" : "🌙"}
        </button>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: T.amberBg, border: `1px solid ${T.amber}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👨‍🍳</div>
      </div>
    </div>
  );
};

// ======================= BOTTOM NAVIGATION ========================
const BottomNav = ({ page, setPage, T }) => {
  const items = [
    { id: "cuisine_file", icon: "🔥", label: "File" },
    { id: "cuisine_menu", icon: "📋", label: "Menu" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: T.surface, borderTop: `1px solid ${T.border}`,
      display: "flex", padding: "8px 0 16px",
    }}>
      {items.map(item => (
        <button key={item.id} onClick={() => setPage(item.id)} style={{
          flex: 1, background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0",
          color: page === item.id ? T.accent : T.textMuted,
        }}>
          <span style={{ fontSize: 22 }}>{item.icon}</span>
          <span style={{ fontSize: 11, fontWeight: page === item.id ? 700 : 400 }}>{item.label}</span>
          {page === item.id && <span style={{ width: 20, height: 3, borderRadius: 2, background: T.accent, animation: "tickIn 0.2s ease" }} />}
        </button>
      ))}
    </div>
  );
};

// ======================= COMPOSANT PRINCIPAL ========================
const CuisinierDashboard = () => {
  const [page, setPage] = useState("cuisine_file");
  const [darkMode, setDarkMode] = useState(true);
  const T = darkMode ? DARK : LIGHT;

  return (
    <>
      <style>{getCSS(T)}</style>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg }}>
        <Topbar page={page} T={T} darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
        <StatsBar T={T} />
        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          {page === "cuisine_file" && <CuisinierFile T={T} />}
          {page === "cuisine_menu" && <CuisinierMenu T={T} />}
        </div>
        <BottomNav page={page} setPage={setPage} T={T} />
      </div>
    </>
  );
};

export default CuisinierDashboard;