// frontend/src/pages/Cuisinier/CuisinierDashboard.jsx
// ─── v3 — Ingrédients libres + fix "Object Object" + Historique + Stats dynamiques ─
import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

// ─── Icônes SVG ───────────────────────────────────────────────
const Ic = {
  fire:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  utensils: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>,
  plus:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  img:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  close:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  logout:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  clock:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  table:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/></svg>,
  upload:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  refresh:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  warn:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  sun:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  stats:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  history:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  star:     <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  leaf:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 8C8 10 5.9 16.17 3.82 19.34a1 1 0 1 0 1.66 1.1C7.43 17.84 10.59 12.74 20 12c-1.5 5-6.23 7.18-11.08 8.31"/><path d="M17 8c1-4.38-2-6-2-6s-3.25 2-3 5"/></svg>,
};

// ─── Toast inline ──────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, success: m => add(m,"success"), error: m => add(m,"error"), warn: m => add(m,"warn") };
}

function ToastContainer({ toasts, T }) {
  const colors = { success:{ bg:T.green,text:"#0A0C10" }, error:{ bg:"#EF4444",text:"#fff" }, warn:{ bg:T.accent,text:"#0A0C10" } };
  return (
    <div style={{ position:"fixed",top:16,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:8 }}>
      {toasts.map(t => {
        const c = colors[t.type]||colors.success;
        return (
          <div key={t.id} style={{ background:c.bg,color:c.text,padding:"10px 16px",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,.3)",maxWidth:300 }}>
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}

// ─── Atoms ────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant="accent", size="md", disabled, full, style:sx={}, T }) => {
  const v = {
    accent:  { background:T.accent, color:"#0A0C10", border:"none" },
    success: { background:T.green,  color:"#0A0C10", border:"none" },
    ghost:   { background:"transparent", color:T.sub, border:`1px solid ${T.border}` },
    danger:  { background:"#EF4444", color:"#fff",   border:"none" },
    outline: { background:"transparent", color:T.accent, border:`1px solid ${T.accent}` },
  };
  const sizes = { sm:"7px 12px", md:"10px 18px", lg:"13px 24px" };
  return (
    <button onClick={disabled?undefined:onClick} style={{
      ...(v[variant]||v.accent), padding:sizes[size]||sizes.md, borderRadius:10,
      fontWeight:600, cursor:disabled?"not-allowed":"pointer",
      fontSize:size==="sm"?12:size==="lg"?15:13,
      display:"inline-flex", alignItems:"center", gap:6,
      opacity:disabled?0.5:1, transition:"opacity .15s",
      width:full?"100%":undefined, justifyContent:full?"center":undefined, ...sx,
    }}>{children}</button>
  );
};

const Toggle = ({ value, onChange, T }) => (
  <div onClick={()=>onChange(!value)} style={{ width:42,height:23,borderRadius:12,flexShrink:0,background:value?T.green:T.border,cursor:"pointer",position:"relative",transition:"background .25s" }}>
    <div style={{ position:"absolute",top:2.5,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .25s",left:value?21:3,boxShadow:"0 1px 3px rgba(0,0,0,.3)" }} />
  </div>
);

const Tag = ({ children, color, bg }) => (
  <span style={{ background:bg,color,border:`1px solid ${color}40`,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600 }}>
    {children}
  </span>
);

const Field = ({ label, required, T, textarea, ...props }) => {
  const [focused,setFocused] = useState(false);
  const base = { width:"100%",padding:"11px 12px",background:T.bg,border:`1.5px solid ${focused?T.accent:T.border}`,borderRadius:9,color:T.text,fontSize:13,transition:"border-color .2s",boxSizing:"border-box",resize:"none" };
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:"block",fontSize:10,color:T.muted,fontWeight:700,letterSpacing:.6,textTransform:"uppercase",marginBottom:6 }}>{label}{required&&<span style={{ color:T.accent,marginLeft:2 }}>*</span>}</label>}
      {textarea
        ? <textarea {...props} rows={3} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} style={base}/>
        : <input {...props} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} style={base}/>
      }
    </div>
  );
};

// ─── Timer ────────────────────────────────────────────────────
function useTimer(startTs) {
  const [elapsed,setElapsed] = useState(0);
  useEffect(()=>{
    if(!startTs)return;
    const tick=()=>setElapsed(Math.floor((Date.now()-startTs)/1000));
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id);
  },[startTs]);
  const m=Math.floor(elapsed/60), s=(elapsed%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

// ─── FILE DES COMMANDES ───────────────────────────────────────
const FileCommandes = ({ toast, T }) => {
  const [orders,setOrders]       = useState([]);
  const [loading,setLoading]     = useState(true);
  const [filter,setFilter]       = useState("TOUS");
  const [refreshing,setRefreshing] = useState(false);

  const load = useCallback(async(silent=false)=>{
    if(!silent)setLoading(true); else setRefreshing(true);
    try {
      const { data } = await api.get("/orders?status=RECUE,EN_PREPARATION,PRETE");
      const enriched = data.map(o=>({ ...o, _startTs: o.status==="EN_PREPARATION"&&o.updated_at ? new Date(o.updated_at).getTime():null }));
      setOrders(enriched);
    } catch { if(!silent)toast.error("Impossible de charger les commandes"); }
    finally { setLoading(false); setRefreshing(false); }
  },[]);

  useEffect(()=>{ load(); const id=setInterval(()=>load(true),10000); return()=>clearInterval(id); },[load]);

  const updateStatus = async(orderId,newStatus,msg)=>{
    try {
      await api.patch(`/orders/${orderId}/status`,{ status:newStatus });
      toast.success(msg); load(true);
    } catch(e){ toast.error(e?.response?.data?.message||"Erreur de mise à jour"); }
  };

  const counts = {
    TOUS:           orders.length,
    RECUE:          orders.filter(o=>o.status==="RECUE").length,
    EN_PREPARATION: orders.filter(o=>o.status==="EN_PREPARATION").length,
    PRETE:          orders.filter(o=>o.status==="PRETE").length,
  };
  const displayed = filter==="TOUS" ? orders : orders.filter(o=>o.status===filter);
  const SCFG = {
    RECUE:          { label:"Nouvelle",       color:T.accent,  bg:`${T.accent}20` },
    EN_PREPARATION: { label:"En préparation", color:"#F0A500", bg:"rgba(240,165,0,.15)" },
    PRETE:          { label:"Prête",          color:T.green,   bg:`${T.green}20` },
  };

  if(loading) return <Loader T={T} msg="Chargement des commandes…"/>;

  return (
    <div style={{ padding:"16px 16px 90px" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
        <div>
          <h2 style={{ fontSize:18,fontWeight:700,color:T.text }}>File des commandes</h2>
          <p style={{ fontSize:12,color:T.muted,marginTop:2 }}>
            {counts.TOUS} commande(s) active(s)
            {refreshing&&<span style={{ marginLeft:8,color:T.green }}>• Actualisation…</span>}
          </p>
        </div>
        <button onClick={()=>load(true)} style={{ background:T.surface,border:`1px solid ${T.border}`,color:T.sub,borderRadius:9,padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12 }}>
          {Ic.refresh} Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16 }}>
        {[
          { key:"TOUS",           label:"Toutes",   count:counts.TOUS,           color:T.accent  },
          { key:"RECUE",          label:"Nouvelles",count:counts.RECUE,          color:T.accent  },
          { key:"EN_PREPARATION", label:"En cours", count:counts.EN_PREPARATION, color:"#F0A500" },
          { key:"PRETE",          label:"Prêtes",   count:counts.PRETE,          color:T.green   },
        ].map(({ key,label,count,color })=>{
          const active=filter===key;
          return (
            <button key={key} onClick={()=>setFilter(key)} style={{ background:active?`${color}20`:T.surface,border:`1.5px solid ${active?color:T.border}`,borderRadius:10,padding:"10px 6px",cursor:"pointer",textAlign:"center" }}>
              <div style={{ fontSize:18,fontWeight:800,color:active?color:T.text }}>{count}</div>
              <div style={{ fontSize:10,color:active?color:T.muted,fontWeight:600,marginTop:2 }}>{label}</div>
            </button>
          );
        })}
      </div>

      {displayed.length===0 ? (
        <EmptyState T={T} msg={filter!=="TOUS"?`Aucune commande « ${SCFG[filter]?.label} »`:"Aucune commande active"} />
      ) : (
        displayed.map(o=><OrderCard key={o.id} order={o} T={T} updateStatus={updateStatus} SCFG={SCFG}/>)
      )}
    </div>
  );
};

const OrderCard = ({ order,T,updateStatus,SCFG }) => {
  const cfg = SCFG[order.status]||{ label:order.status,color:T.muted,bg:T.surface };
  const timer = useTimer(order._startTs);
  return (
    <div style={{ background:T.card,border:`1px solid ${T.border}`,borderLeft:`3px solid ${cfg.color}`,borderRadius:14,padding:16,marginBottom:10 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
        <span style={{ fontWeight:800,fontSize:16,color:cfg.color }}>#{order.order_number||order.id}</span>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <Tag color={cfg.color} bg={cfg.bg}>{cfg.label}</Tag>
          {order.status==="EN_PREPARATION"&&<span style={{ fontSize:11,color:"#F0A500",fontWeight:700 }}>⏱ {timer}</span>}
        </div>
      </div>
      <div style={{ display:"flex",gap:14,marginBottom:10,flexWrap:"wrap" }}>
        <span style={{ fontSize:12,color:T.sub,display:"flex",alignItems:"center",gap:4 }}>{Ic.table} Table {order.table_number??order.table_id}</span>
        <span style={{ fontSize:12,color:T.sub,display:"flex",alignItems:"center",gap:4 }}>{Ic.clock} {new Date(order.opened_at||order.created_at||Date.now()).toLocaleTimeString([],{ hour:"2-digit",minute:"2-digit" })}</span>
      </div>
      <div style={{ background:T.surface,borderRadius:10,padding:"10px 12px",marginBottom:10 }}>
        {(order.items||[]).map((item,i)=>(
          <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:i<order.items.length-1?`1px solid ${T.border}`:"none" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontWeight:700,fontSize:11,color:T.accent,background:`${T.accent}20`,minWidth:24,height:22,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center" }}>×{item.quantity}</span>
              <span style={{ fontSize:13,fontWeight:500,color:T.text }}>{item.plat_nom??item.name??item.nom??"-"}</span>
            </div>
            {item.prep_time_minutes&&<span style={{ fontSize:11,color:T.muted }}>{item.prep_time_minutes} min</span>}
          </div>
        ))}
      </div>
      {order.notes&&<div style={{ background:`${T.accent}15`,borderRadius:8,padding:"8px 10px",marginBottom:10,fontSize:12,color:T.accent,display:"flex",gap:6,alignItems:"flex-start" }}>{Ic.warn} {order.notes}</div>}
      {order.status==="RECUE"&&<Btn T={T} full variant="accent" onClick={()=>updateStatus(order.id,"EN_PREPARATION","Préparation démarrée !")}>{Ic.fire} Démarrer la préparation</Btn>}
      {order.status==="EN_PREPARATION"&&<Btn T={T} full variant="success" onClick={()=>updateStatus(order.id,"PRETE","Commande prête — serveur notifié !")}>{Ic.check} Marquer comme prête</Btn>}
      {order.status==="PRETE"&&<div style={{ textAlign:"center",padding:"6px 0",color:T.green,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>{Ic.check} En attente du serveur…</div>}
    </div>
  );
};

// ─── GESTION MENU ─────────────────────────────────────────────
const GestionMenu = ({ toast, T }) => {
  const [dishes,setDishes]         = useState([]);
  const [categories,setCategories] = useState([]);
  const [loading,setLoading]       = useState(true);
  const [filter,setFilter]         = useState("tous");
  const [search,setSearch]         = useState("");
  const [showModal,setShowModal]   = useState(false);
  const [editDish,setEditDish]     = useState(null);
  const [saving,setSaving]         = useState(false);
  const [imgFile,setImgFile]       = useState(null);
  const [imgPrev,setImgPrev]       = useState(null);
  const fileRef = useRef();

  // ─── Ingrédients libres ───────────────────────────────────
  const [ingredients,setIngredients] = useState([]);
  // { name, quantity, unit }

  const UNITS = ["g","kg","ml","l","tsp","tbsp","cup","pièce","botte","pincée"];

  const addIngredient = () =>
    setIngredients(p=>[...p,{ name:"",quantity:"",unit:"g" }]);

  const updateIngredient = (i,key,val) =>
    setIngredients(p=>p.map((ing,idx)=>idx===i?{ ...ing,[key]:val }:ing));

  const removeIngredient = (i) =>
    setIngredients(p=>p.filter((_,idx)=>idx!==i));

  const emptyForm = { name:"",description:"",price:"",prep_time_minutes:"15",category_id:"",is_featured:false,calories:"",proteins:"",lipids:"",glucids:"" };
  const [form,setForm] = useState(emptyForm);

  const loadAll = useCallback(async()=>{
    try {
      const [dishRes,catRes] = await Promise.all([
        api.get("/dishes?disponible=all"),
        api.get("/dishes/categories"),
      ]);
      setDishes(dishRes.data);
      setCategories(catRes.data);
    } catch { toast.error("Impossible de charger les données"); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ loadAll(); },[loadAll]);

  const openNew = () => {
    setEditDish(null); setForm(emptyForm);
    setImgFile(null); setImgPrev(null); setIngredients([]); setShowModal(true);
  };

  const openEdit = (dish) => {
    setEditDish(dish);
    setForm({
      name:              dish.name||"",
      description:       dish.description||"",
      price:             dish.price||"",
      prep_time_minutes: dish.prep_time_minutes||"15",
      category_id:       dish.category_id||"",
      is_featured:       !!dish.is_featured,
      calories:          dish.nutrition?.calories||dish.calories||"",
      proteins:          dish.nutrition?.proteins||dish.proteins||"",
      lipids:            dish.nutrition?.lipids||dish.lipids||"",
      glucids:           dish.nutrition?.glucids||dish.glucids||"",
    });
    // Charger les ingrédients existants du plat si présents
    const existingIngs = (dish.ingredients||[]).map(ing=>({
      name:     ing.name||ing.nom||"",
      quantity: String(ing.quantity||ing.quantite||""),
      unit:     ing.unit||ing.unite||"g",
    }));
    setIngredients(existingIngs);
    setImgFile(null);
    setImgPrev(dish.image_url || null);
    setShowModal(true);
  };

  const handleImg = (e) => {
    const file=e.target.files[0]; if(!file)return;
    setImgFile(file); setImgPrev(URL.createObjectURL(file));
  };

  const f = (k) => (e) => setForm(p=>({ ...p,[k]:e.target.type==="checkbox"?e.target.checked:e.target.value }));

  // ─── SAVE — fix "Object Object" ──────────────────────────
  // On n'envoie PAS les ingrédients dans FormData (qui ne sait pas sérialiser les tableaux d'objets).
  // On fait deux requêtes : 1) POST/PATCH du plat, 2) POST des ingrédients
  const save = async () => {
    if(!form.name.trim()||!form.price||!form.category_id){
      toast.warn("Nom, prix et catégorie sont obligatoires"); return;
    }
    // Valider les ingrédients saisis
    const validIngs = ingredients.filter(ing=>ing.name.trim()&&ing.quantity);
    setSaving(true);
    try {
      // 1) Données du plat via FormData
      const fd = new FormData();
      fd.append("name",             form.name.trim());
      fd.append("description",      form.description);
      fd.append("price",            form.price);
      fd.append("prep_time_minutes",form.prep_time_minutes||15);
      fd.append("category_id",      form.category_id);
      fd.append("is_featured",      form.is_featured?1:0);
      fd.append("calories",         form.calories||0);
      fd.append("proteins",         form.proteins||0);
      fd.append("lipids",           form.lipids||0);
      fd.append("glucids",          form.glucids||0);
      if(imgFile) fd.append("image",imgFile);

      let dishId = editDish?.id;
      if(editDish){
        await api.patch(`/dishes/${editDish.id}`,fd,{ headers:{ "Content-Type":"multipart/form-data" } });
        toast.success("Plat modifié !");
      } else {
        const { data } = await api.post("/dishes",fd,{ headers:{ "Content-Type":"multipart/form-data" } });
        dishId = data?.id||data?.dishId||data?.insertId;
        toast.success("Plat ajouté au menu !");
      }

      // 2) Ingrédients via JSON (pas de FormData)
      if(dishId && validIngs.length>0){
        try {
          await api.post(`/dishes/${dishId}/ingredients`, { ingredients: validIngs });
        } catch {
          // Non bloquant : on informe mais le plat est déjà sauvé
          toast.warn("Plat sauvé, mais erreur lors de l'enregistrement des ingrédients");
        }
      }

      setShowModal(false); loadAll();
    } catch(e){
      toast.error(e?.response?.data?.message||"Erreur lors de la sauvegarde");
    } finally { setSaving(false); }
  };

  const toggleActive = async (dish) => {
    try {
      await api.patch(`/dishes/${dish.id}`,{ is_active:dish.is_active?0:1 });
      toast.success(dish.is_active?"Plat masqué du menu":"Plat réactivé");
      loadAll();
    } catch { toast.error("Erreur lors du changement de statut"); }
  };

  const deleteDish = async (dish) => {
    if(!window.confirm(`Supprimer définitivement "${dish.name}" ?`))return;
    try {
      await api.delete(`/dishes/${dish.id}`);
      toast.success("Plat supprimé"); loadAll();
    } catch(e){ toast.error(e?.response?.data?.message||"Erreur suppression"); }
  };

  const filtered = dishes
    .filter(d=>filter==="tous"||String(d.category_id)===String(categories.find(c=>c.slug===filter)?.id))
    .filter(d=>!search||(d.name||"").toLowerCase().includes(search.toLowerCase()));

  if(loading)return <Loader T={T} msg="Chargement des plats…"/>;

  return (
    <div style={{ padding:"16px 16px 90px" }}>
      {/* Stats mini */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16 }}>
        {[
          { label:"Total",      v:dishes.length,                         color:T.text  },
          { label:"Disponibles",v:dishes.filter(d=>d.is_active).length,  color:T.green },
          { label:"Masqués",    v:dishes.filter(d=>!d.is_active).length, color:T.muted },
        ].map(s=>(
          <div key={s.label} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 10px",textAlign:"center" }}>
            <div style={{ fontSize:22,fontWeight:800,color:s.color }}>{s.v}</div>
            <div style={{ fontSize:10,color:T.muted,marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recherche */}
      <div style={{ position:"relative",marginBottom:12 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un plat…"
          style={{ width:"100%",padding:"10px 14px 10px 34px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,outline:"none",boxSizing:"border-box" }}
          onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}
        />
      </div>

      {/* Filtres catégories */}
      <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:10,marginBottom:14,scrollbarWidth:"none" }}>
        {["tous",...categories.map(c=>c.slug)].map(slug=>{
          const cat=categories.find(c=>c.slug===slug);
          const active=filter===slug;
          return (
            <button key={slug} onClick={()=>setFilter(slug)} style={{ flexShrink:0,padding:"6px 14px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:active?600:400,border:`1.5px solid ${active?T.accent:T.border}`,background:active?`${T.accent}20`:"transparent",color:active?T.accent:T.muted }}>
              {cat?`${cat.icon||""} ${cat.name}`:"Tous"}
            </button>
          );
        })}
      </div>

      <Btn T={T} onClick={openNew} variant="accent" full style={{ marginBottom:16 }}>
        {Ic.plus} Ajouter un plat
      </Btn>

      {filtered.length===0 ? (
        <EmptyState T={T} msg={search?`Aucun résultat pour « ${search} »`:"Aucun plat dans cette catégorie"}/>
      ) : (
        filtered.map(dish=>(
          <div key={dish.id} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:14,marginBottom:10,opacity:dish.is_active?1:0.5,transition:"opacity .2s" }}>
            <div style={{ display:"flex",gap:12,alignItems:"center" }}>
              <div style={{ width:56,height:56,borderRadius:12,overflow:"hidden",flexShrink:0,background:T.surface,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:T.muted }}>
                {dish.image_url
                  ? <img src={dish.image_url} alt={dish.name} style={{ width:"100%",height:"100%",objectFit:"cover" }} onError={e=>{ e.target.style.display="none"; }}/>
                  : Ic.img
                }
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:700,fontSize:14,color:T.text,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                  {dish.name}
                  {dish.is_featured?<Tag color={T.accent} bg={`${T.accent}20`}>&nbsp;Vedette</Tag>:null}
                </div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:8,alignItems:"center" }}>
                  <span style={{ fontSize:11,color:T.sub }}>{dish.category_name}</span>
                  <span style={{ fontSize:13,fontWeight:700,color:T.accent }}>{Number(dish.price).toLocaleString()} FCFA</span>
                  {dish.prep_time_minutes&&<span style={{ fontSize:11,color:T.muted,display:"flex",alignItems:"center",gap:3 }}>{Ic.clock} {dish.prep_time_minutes} min</span>}
                </div>
                {/* Badge ingrédients */}
                {dish.ingredients_count>0&&(
                  <span style={{ fontSize:10,color:T.muted,marginTop:3,display:"inline-block" }}>{Ic.leaf} {dish.ingredients_count} ingrédient(s)</span>
                )}
              </div>
              <Toggle T={T} value={!!dish.is_active} onChange={()=>toggleActive(dish)}/>
            </div>
            <div style={{ display:"flex",gap:8,marginTop:10 }}>
              <Btn T={T} variant="ghost" size="sm" style={{ flex:1,justifyContent:"center" }} onClick={()=>openEdit(dish)}>
                {Ic.edit} Modifier
              </Btn>
              <Btn T={T} variant="danger" size="sm" onClick={()=>deleteDish(dish)}>
                {Ic.trash}
              </Btn>
            </div>
          </div>
        ))
      )}

      {/* ─── Modal ──────────────────────────────────────────── */}
      {showModal&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:200,display:"flex",alignItems:"flex-end",backdropFilter:"blur(4px)" }}
          onClick={e=>{ if(e.target===e.currentTarget)setShowModal(false); }}>
          <div style={{ background:T.card,borderRadius:"20px 20px 0 0",width:"100%",maxHeight:"94vh",overflowY:"auto",padding:"20px 20px 50px" }}>
            <div style={{ width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 16px" }}/>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <h2 style={{ fontSize:18,fontWeight:800,color:T.text }}>{editDish?"Modifier le plat":"Nouveau plat"}</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:T.surface,border:"none",color:T.muted,width:32,height:32,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>{Ic.close}</button>
            </div>

            {/* Image */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block",fontSize:10,color:T.muted,fontWeight:700,letterSpacing:.6,textTransform:"uppercase",marginBottom:8 }}>Photo du plat</label>
              <div onClick={()=>fileRef.current?.click()} style={{ border:`2px dashed ${imgPrev?T.accent:T.border}`,borderRadius:12,minHeight:90,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden" }}>
                {imgPrev
                  ? <img src={imgPrev} alt="" style={{ width:"100%",maxHeight:180,objectFit:"cover" }}/>
                  : <><span style={{ color:T.muted,marginBottom:6 }}>{Ic.upload}</span><span style={{ fontSize:12,color:T.muted }}>Cliquer pour choisir une image</span></>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display:"none" }}/>
              {imgPrev&&<button onClick={()=>{ setImgFile(null); setImgPrev(null); }} style={{ marginTop:6,fontSize:11,color:T.muted,background:"none",border:"none",cursor:"pointer" }}>✕ Supprimer l'image</button>}
            </div>

            <Field T={T} label="Nom du plat" required placeholder="Ex : Ndolé Royal" value={form.name} onChange={f("name")}/>
            <Field T={T} label="Description" textarea placeholder="Description courte…" value={form.description} onChange={f("description")}/>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              <Field T={T} label="Prix (FCFA)" required type="number" placeholder="3500" value={form.price} onChange={f("price")}/>
              <Field T={T} label="Temps prép. (min)" type="number" placeholder="15" value={form.prep_time_minutes} onChange={f("prep_time_minutes")}/>
            </div>

            {/* Catégorie */}
            <div style={{ marginBottom:12 }}>
              <label style={{ display:"block",fontSize:10,color:T.muted,fontWeight:700,letterSpacing:.6,textTransform:"uppercase",marginBottom:6 }}>Catégorie<span style={{ color:T.accent,marginLeft:2 }}>*</span></label>
              <select value={form.category_id} onChange={f("category_id")} style={{ width:"100%",padding:"11px 12px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:9,color:form.category_id?T.text:T.muted,fontSize:13 }}>
                <option value="">Choisir une catégorie…</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.icon||""} {c.name}</option>)}
              </select>
            </div>

            {/* Vedette */}
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:T.surface,borderRadius:10,padding:"12px 14px",marginBottom:14 }}>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:T.text }}>Plat vedette</div>
                <div style={{ fontSize:11,color:T.muted }}>Affiché en priorité dans le menu</div>
              </div>
              <Toggle T={T} value={form.is_featured} onChange={v=>setForm(p=>({ ...p,is_featured:v }))}/>
            </div>

            {/* Valeurs nutritionnelles */}
            <div style={{ background:T.surface,borderRadius:12,padding:14,marginBottom:16 }}>
              <p style={{ fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.6,marginBottom:12 }}>
                Valeurs nutritionnelles <span style={{ fontWeight:400,opacity:.6 }}>(optionnel)</span>
              </p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                <Field T={T} label="Calories (kcal)" type="number" placeholder="0" value={form.calories} onChange={f("calories")}/>
                <Field T={T} label="Protéines (g)"   type="number" placeholder="0" value={form.proteins} onChange={f("proteins")}/>
                <Field T={T} label="Lipides (g)"     type="number" placeholder="0" value={form.lipids}   onChange={f("lipids")}/>
                <Field T={T} label="Glucides (g)"    type="number" placeholder="0" value={form.glucids}  onChange={f("glucids")}/>
              </div>
            </div>

            {/* ─── INGRÉDIENTS LIBRES ─────────────────────── */}
            <div style={{ background:T.surface,borderRadius:12,padding:14,marginBottom:20 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                <p style={{ fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.6 }}>
                  Ingrédients <span style={{ fontWeight:400,opacity:.6 }}>(optionnel)</span>
                </p>
                <Btn T={T} variant="outline" size="sm" onClick={addIngredient}>{Ic.plus} Ajouter</Btn>
              </div>

              {ingredients.length===0&&(
                <p style={{ fontSize:12,color:T.muted,textAlign:"center",padding:"10px 0" }}>Aucun ingrédient — cliquez sur Ajouter</p>
              )}

              {ingredients.map((ing,i)=>(
                <div key={i} style={{ display:"grid",gridTemplateColumns:"1fr 80px 90px 30px",gap:6,marginBottom:8,alignItems:"center" }}>
                  <input
                    value={ing.name} onChange={e=>updateIngredient(i,"name",e.target.value)}
                    placeholder="Ex : Tomate"
                    style={{ padding:"9px 10px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:12,outline:"none" }}
                    onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}
                  />
                  <input
                    value={ing.quantity} onChange={e=>updateIngredient(i,"quantity",e.target.value)}
                    placeholder="Qté" type="number" min="0"
                    style={{ padding:"9px 10px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:12,outline:"none" }}
                    onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}
                  />
                  <select value={ing.unit} onChange={e=>updateIngredient(i,"unit",e.target.value)}
                    style={{ padding:"9px 8px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:12 }}>
                    {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                  </select>
                  <button onClick={()=>removeIngredient(i)} style={{ background:"#EF444420",border:"none",color:"#EF4444",borderRadius:8,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    {Ic.close}
                  </button>
                </div>
              ))}

              {ingredients.length>0&&(
                <p style={{ fontSize:10,color:T.muted,marginTop:8 }}>
                  Ces ingrédients seront comparés aux allergies des clients pour les alerter.
                </p>
              )}
            </div>

            <Btn T={T} onClick={save} disabled={saving} variant="accent" full size="lg">
              {saving ? "Enregistrement…" : editDish ? "Enregistrer les modifications" : "Ajouter au menu"}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── HISTORIQUE ───────────────────────────────────────────────
const Historique = ({ toast, T }) => {
  const [orders,setOrders]   = useState([]);
  const [loading,setLoading] = useState(true);
  const [avis,setAvis]       = useState([]);
  const [tab,setTab]         = useState("commandes");

  useEffect(()=>{
    const loadHistory = async()=>{
      try {
        const [ordRes,avisRes] = await Promise.all([
          api.get("/orders?status=SERVIE,CLOTUREE&limit=50"),
          api.get("/dishes/my-reviews"),
        ]);
        setOrders(ordRes.data||[]);
        setAvis(avisRes.data||[]);
      } catch { toast.error("Impossible de charger l'historique"); }
      finally { setLoading(false); }
    };
    loadHistory();
  },[]);

  const Stars = ({ note }) => (
    <div style={{ display:"flex",gap:2 }}>
      {[1,2,3,4,5].map(s=>(
        <span key={s} style={{ color:s<=note?"#F0A500":T.border,fontSize:13 }}>{Ic.star}</span>
      ))}
    </div>
  );

  if(loading)return <Loader T={T} msg="Chargement de l'historique…"/>;

  return (
    <div style={{ padding:"16px 16px 90px" }}>
      <h2 style={{ fontSize:18,fontWeight:700,color:T.text,marginBottom:4 }}>Historique</h2>
      <p style={{ fontSize:12,color:T.muted,marginBottom:16 }}>Commandes servies & avis clients</p>

      {/* Tabs */}
      <div style={{ display:"flex",background:T.surface,borderRadius:12,padding:4,marginBottom:20,border:`1px solid ${T.border}` }}>
        {[{ id:"commandes",label:`Commandes (${orders.length})` },{ id:"avis",label:`Avis (${avis.length})` }].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,padding:"9px",borderRadius:9,border:"none",cursor:"pointer",fontWeight:600,fontSize:13,background:tab===t.id?T.accent:"transparent",color:tab===t.id?"#0A0C10":T.muted }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==="commandes"&&(
        orders.length===0 ? <EmptyState T={T} msg="Aucune commande servie pour le moment"/> :
        orders.map(o=>(
          <div key={o.id} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:14,marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
              <span style={{ fontWeight:700,color:T.accent }}>#{o.order_number||o.id}</span>
              <Tag color={T.green} bg={`${T.green}20`}>{o.status==="CLOTUREE"?"Clôturée":"Servie"}</Tag>
            </div>
            <div style={{ display:"flex",gap:12,marginBottom:8,flexWrap:"wrap" }}>
              <span style={{ fontSize:12,color:T.sub,display:"flex",alignItems:"center",gap:4 }}>{Ic.table} Table {o.table_number??o.table_id}</span>
              <span style={{ fontSize:12,color:T.sub,display:"flex",alignItems:"center",gap:4 }}>{Ic.clock} {new Date(o.closed_at||o.updated_at||o.created_at).toLocaleDateString("fr-FR",{ day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit" })}</span>
              <span style={{ fontSize:12,color:T.accent,fontWeight:600 }}>{Number(o.total_amount||0).toLocaleString()} FCFA</span>
            </div>
            <div style={{ background:T.surface,borderRadius:8,padding:"8px 10px" }}>
              {(o.items||[]).map((item,i)=>(
                <div key={i} style={{ fontSize:12,color:T.muted,padding:"3px 0" }}>× {item.quantity} {item.plat_nom??item.name??"-"}</div>
              ))}
              {(!o.items||o.items.length===0)&&<span style={{ fontSize:12,color:T.muted }}>Détail non disponible</span>}
            </div>
          </div>
        ))
      )}

      {tab==="avis"&&(
        avis.length===0 ? <EmptyState T={T} msg="Aucun avis reçu pour le moment"/> :
        avis.map(a=>(
          <div key={a.id} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:14,marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
              <span style={{ fontWeight:600,color:T.text,fontSize:14 }}>{a.plat_name||a.dish_name||"Plat"}</span>
              <Stars note={a.note}/>
            </div>
            {a.commentaire&&<p style={{ fontSize:13,color:T.sub,marginBottom:8,fontStyle:"italic" }}>« {a.commentaire} »</p>}
            <div style={{ fontSize:11,color:T.muted }}>{new Date(a.created_at).toLocaleDateString("fr-FR",{ day:"2-digit",month:"short",year:"numeric" })}</div>
          </div>
        ))
      )}
    </div>
  );
};

// ─── STATISTIQUES ─────────────────────────────────────────────
const Statistiques = ({ toast, T }) => {
  const [stats,setStats]   = useState(null);
  const [loading,setLoading] = useState(true);
  const [period,setPeriod]   = useState("today");

  useEffect(()=>{
    const load = async()=>{
      setLoading(true);
      try {
        const { data } = await api.get(`/dishes/stats?period=${period}`);
        setStats(data);
      } catch {
        // Fallback données locales si l'endpoint n'existe pas encore
        setStats({
          commandes_servies: 0,
          plats_prepares:    0,
          note_moyenne:      0,
          top_plats:         [],
          par_heure:         [],
        });
        toast.warn("Endpoint stats non disponible — affichage vide");
      } finally { setLoading(false); }
    };
    load();
  },[period]);

  if(loading)return <Loader T={T} msg="Calcul des statistiques…"/>;
  if(!stats)  return <EmptyState T={T} msg="Aucune donnée disponible"/>;

  const max = stats.top_plats?.length>0 ? Math.max(...stats.top_plats.map(p=>p.ventes||0)) : 1;

  return (
    <div style={{ padding:"16px 16px 90px" }}>
      <h2 style={{ fontSize:18,fontWeight:700,color:T.text,marginBottom:4 }}>Statistiques</h2>

      {/* Sélecteur période */}
      <div style={{ display:"flex",gap:6,marginBottom:20 }}>
        {[{ k:"today",l:"Aujourd'hui" },{ k:"week",l:"7 jours" },{ k:"month",l:"Mois" }].map(p=>(
          <button key={p.k} onClick={()=>setPeriod(p.k)} style={{ padding:"7px 14px",borderRadius:20,border:`1.5px solid ${period===p.k?T.accent:T.border}`,background:period===p.k?`${T.accent}20`:"transparent",color:period===p.k?T.accent:T.muted,cursor:"pointer",fontSize:12,fontWeight:600 }}>
            {p.l}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16 }}>
        {[
          { label:"Commandes servies", value:stats.commandes_servies??0, color:T.accent  },
          { label:"Plats préparés",    value:stats.plats_prepares??0,    color:T.green   },
          { label:"Note moyenne",      value:stats.note_moyenne!=null?`${Number(stats.note_moyenne).toFixed(1)} ★`:"—", color:"#F0A500" },
          { label:"Plats actifs",      value:stats.plats_actifs??0,      color:T.text    },
        ].map(k=>(
          <div key={k.label} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 14px" }}>
            <div style={{ fontSize:26,fontWeight:800,color:k.color,marginBottom:4 }}>{k.value}</div>
            <div style={{ fontSize:11,color:T.muted }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Top plats */}
      {stats.top_plats?.length>0&&(
        <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:16,marginBottom:14 }}>
          <p style={{ fontSize:12,fontWeight:700,color:T.text,marginBottom:14 }}>Top plats préparés</p>
          {stats.top_plats.map((p,i)=>(
            <div key={p.nom||i} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
              <span style={{ fontSize:11,color:T.muted,width:18,fontWeight:700 }}>#{i+1}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:500,color:T.text,marginBottom:4 }}>{p.nom||p.name}</div>
                <div style={{ height:4,background:T.border,borderRadius:2 }}>
                  <div style={{ height:"100%",borderRadius:2,width:`${((p.ventes||0)/max)*100}%`,background:i===0?T.accent:`${T.accent}60`,transition:"width .5s" }}/>
                </div>
              </div>
              <span style={{ fontSize:11,color:T.muted,minWidth:24,textAlign:"right" }}>{p.ventes||0}</span>
            </div>
          ))}
        </div>
      )}

      {/* Note par plat si dispo */}
      {stats.notes_par_plat?.length>0&&(
        <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:16 }}>
          <p style={{ fontSize:12,fontWeight:700,color:T.text,marginBottom:14 }}>Notes reçues par plat</p>
          {stats.notes_par_plat.map((p,i)=>(
            <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<stats.notes_par_plat.length-1?`1px solid ${T.border}`:"none" }}>
              <span style={{ fontSize:13,color:T.text }}>{p.nom||p.name}</span>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                <span style={{ fontSize:12,color:"#F0A500",fontWeight:700 }}>★ {Number(p.note_moyenne).toFixed(1)}</span>
                <span style={{ fontSize:11,color:T.muted }}>({p.nb_avis} avis)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {stats.top_plats?.length===0&&(
        <EmptyState T={T} msg="Aucune donnée pour cette période"/>
      )}
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────
const Loader = ({ T, msg }) => (
  <div style={{ padding:60,textAlign:"center",color:T.muted }}>
    <div style={{ width:28,height:28,border:`3px solid ${T.border}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 14px" }}/>
    {msg}
  </div>
);

const EmptyState = ({ T, msg }) => (
  <div style={{ textAlign:"center",padding:"60px 0",color:T.muted }}>
    <div style={{ marginBottom:12,color:T.border,display:"flex",justifyContent:"center" }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
    </div>
    {msg}
  </div>
);

// ─── TOPBAR ───────────────────────────────────────────────────
const Topbar = ({ T,toggle,isDark }) => {
  const { logout,user } = useAuth();
  const navigate = useNavigate();
  return (
    <div style={{ position:"sticky",top:0,zIndex:50,background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
        <span style={{ fontSize:18,fontWeight:800,color:T.text }}>Kitchen<span style={{ color:T.accent }}>Pulse</span></span>
        <span style={{ background:`${T.accent}20`,color:T.accent,border:`1px solid ${T.accent}30`,padding:"2px 8px",borderRadius:6,fontSize:10,fontWeight:700,letterSpacing:.5 }}>CUISINE</span>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        <span style={{ display:"flex",alignItems:"center",gap:4,fontSize:11,color:T.green,fontWeight:600 }}>
          <span style={{ width:6,height:6,background:T.green,borderRadius:"50%",animation:"pulse 1.8s infinite",display:"inline-block" }}/>LIVE
        </span>
        <span style={{ fontSize:12,color:T.muted }}>{user?.first_name||user?.nom}</span>
        <button onClick={toggle} style={{ background:T.surface,border:`1px solid ${T.border}`,color:T.sub,width:32,height:32,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
          {isDark?Ic.sun:Ic.moon}
        </button>
        <button onClick={()=>{ logout(); navigate("/login"); }} style={{ background:"#EF444420",border:"1px solid #EF444430",color:"#EF4444",width:32,height:32,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
          {Ic.logout}
        </button>
      </div>
    </div>
  );
};

// ─── BOTTOM NAV ───────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"file",    label:"File",    icon:Ic.fire     },
  { id:"menu",    label:"Menu",    icon:Ic.utensils },
  { id:"stats",   label:"Stats",   icon:Ic.stats    },
  { id:"history", label:"Historique", icon:Ic.history },
];

const BottomNav = ({ page,setPage,T }) => (
  <div style={{ position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:T.surface,borderTop:`1px solid ${T.border}`,display:"flex",padding:"8px 0 14px" }}>
    {NAV_ITEMS.map(item=>{
      const active=page===item.id;
      return (
        <button key={item.id} onClick={()=>setPage(item.id)} style={{ flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,color:active?T.accent:T.muted,padding:"4px 0" }}>
          <span style={{ color:active?T.accent:T.muted }}>{item.icon}</span>
          <span style={{ fontSize:10,fontWeight:active?700:400 }}>{item.label}</span>
          {active&&<span style={{ width:20,height:3,borderRadius:2,background:T.accent }}/>}
        </button>
      );
    })}
  </div>
);

// ─── ROOT ─────────────────────────────────────────────────────
export default function CuisinierDashboard() {
  const { T,toggle,isDark } = useTheme();
  const toast = useToast();
  const [page,setPage] = useState("file");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{height:100%;font-family:'Outfit','Segoe UI',sans-serif;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        button,input,select,textarea{font-family:'Outfit','Segoe UI',sans-serif;}
        input:focus,select:focus,textarea:focus{outline:none;}
      `}</style>
      <ToastContainer toasts={toast.toasts} T={T}/>
      <div style={{ display:"flex",flexDirection:"column",height:"100%",background:T.bg }}>
        <Topbar T={T} toggle={toggle} isDark={isDark}/>
        <div style={{ flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch" }}>
          {page==="file"    && <FileCommandes toast={toast} T={T}/>}
          {page==="menu"    && <GestionMenu   toast={toast} T={T}/>}
          {page==="stats"   && <Statistiques  toast={toast} T={T}/>}
          {page==="history" && <Historique    toast={toast} T={T}/>}
        </div>
        <BottomNav page={page} setPage={setPage} T={T}/>
      </div>
    </>
  );
}