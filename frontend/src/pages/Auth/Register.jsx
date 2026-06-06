/**
 * Register.jsx — KitchenPulse
 * Inscription en 3 steps pour les CLIENTS :
 *   Step 1 → Informations personnelles + rôle
 *   Step 2 → Profil nutritionnel (diet, santé, sport, table/livraison)  ← NOUVEAU
 *   Step 3 → Allergies
 * Pour SERVEUR / CUISINIER : step 1 seulement, puis soumission directe.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

/* ─── Design tokens ─────────────────────────────────────────────────── */
const C = {
  bg: '#0B0C0F', card: '#13141A', border: '#1E2028',
  borderFocus: '#E8601C', text: '#F2EFE9', muted: '#7C7E8A',
  accent: '#E8601C', accentDim: 'rgba(232,96,28,0.12)',
  accentBorder: 'rgba(232,96,28,0.35)',
  error: '#E05252', errorBg: 'rgba(224,82,82,0.1)',
  success: '#22C596', successBg: 'rgba(34,197,150,0.1)',
  info: '#60A5FA', infoBg: 'rgba(96,165,250,0.08)',
  font: "'Outfit', 'Segoe UI', sans-serif",
  fontBrand: "'Bricolage Grotesque', Georgia, serif",
};

/* ─── Allergènes officiels (IDs BD) ─────────────────────────────────── */
const ALLERGENES_LIST = [
  { id: 1,  code: 'GLUTEN',     label: 'Gluten',          svgPath: 'M12 2L8 8H2l5 4-2 7 7-4 7 4-2-7 5-4h-6z' },
  { id: 2,  code: 'CRUSTACES',  label: 'Crustacés',       svgPath: 'M12 4c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
  { id: 3,  code: 'OEUFS',      label: 'Œufs',            svgPath: 'M12 3C8 3 5 8 5 12c0 3.9 3.1 7 7 7s7-3.1 7-7c0-4-3-9-7-9z' },
  { id: 4,  code: 'POISSON',    label: 'Poisson',         svgPath: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
  { id: 5,  code: 'ARACHIDES',  label: 'Arachides',       svgPath: 'M12 2a7 7 0 0 1 7 7c0 2-1 4-2.5 5.5L12 22l-4.5-7.5A7 7 0 0 1 12 2zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
  { id: 6,  code: 'SOJA',       label: 'Soja',            svgPath: 'M12 3c4.97 0 9 2.69 9 6s-4.03 6-9 6-9-2.69-9-6 4.03-6 9-6zm0 9c3.31 0 6-1.34 6-3s-2.69-3-6-3-6 1.34-6 3 2.69 3 6 3z' },
  { id: 7,  code: 'LACTOSE',    label: 'Lactose',         svgPath: 'M8 2h8l1 4H7L8 2zm-3 5h14v2l-2 11H7L5 9V7zm7 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
  { id: 8,  code: 'NOIX',       label: 'Fruits à coque',  svgPath: 'M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z' },
  { id: 9,  code: 'CELERI',     label: 'Céleri',          svgPath: 'M12 2v20M7 5c0 3 2 5 5 5s5-2 5-5M7 19c0-3 2-5 5-5s5 2 5 5' },
  { id: 10, code: 'MOUTARDE',   label: 'Moutarde',        svgPath: 'M12 3l2.5 5H21l-5 4 2 6L12 15l-6 3 2-6-5-4h6.5z' },
  { id: 11, code: 'SESAME',     label: 'Sésame',          svgPath: 'M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-5 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm10 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 15a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm10 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-5 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z' },
  { id: 12, code: 'SULFITES',   label: 'Sulfites',        svgPath: 'M5 3h14l1 9H4L5 3zm2 9v10h10V12H7zm3 2h4v2h-4v-2zm0 4h4v2h-4v-2z' },
  { id: 13, code: 'LUPIN',      label: 'Lupin',           svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z' },
  { id: 14, code: 'MOLLUSQUES', label: 'Mollusques',      svgPath: 'M12 2C8 2 4 6 4 10c0 2.5 1.5 5 4 6.5V20h8v-3.5c2.5-1.5 4-4 4-6.5 0-4-4-8-8-8z' },
];

const ROLES = [
  { id: 'CLIENT',    label: 'Client',    desc: 'Commander et suivre mes plats' },
  { id: 'SERVEUR',   label: 'Serveur',   desc: 'Gérer les tables et le service' },
  { id: 'CUISINIER', label: 'Cuisinier', desc: 'Gérer la cuisine et les plats' },
];

/* ─── Données profil nutritionnel ────────────────────────────────────── */
const DIETS = [
  { id: 'omnivore',   label: 'Omnivore',    desc: 'Tout type d\'aliment' },
  { id: 'vegetarien', label: 'Végétarien',  desc: 'Sans viande ni poisson' },
  { id: 'vegan',      label: 'Vegan',       desc: 'Sans produits animaux' },
  { id: 'halal',      label: 'Halal',       desc: 'Conforme à la charia' },
  { id: 'casher',     label: 'Casher',      desc: 'Conforme aux lois juives' },
  { id: 'sans_porc',  label: 'Sans porc',   desc: 'Exclusion du porc' },
];

const GOALS = [
  { id: 'maintien',      label: 'Maintien du poids',   kcal: 2000 },
  { id: 'perte_poids',   label: 'Perte de poids',      kcal: 1600 },
  { id: 'prise_masse',   label: 'Prise de masse',      kcal: 2600 },
  { id: 'performance',   label: 'Performance sport',   kcal: 3000 },
  { id: 'sante',         label: 'Santé & bien-être',   kcal: 1900 },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentaire',   label: 'Sédentaire',    desc: 'Peu ou pas d\'exercice' },
  { id: 'leger',        label: 'Légère',        desc: '1–3 fois/semaine' },
  { id: 'modere',       label: 'Modérée',       desc: '3–5 fois/semaine' },
  { id: 'intense',      label: 'Intense',       desc: '6–7 fois/semaine' },
  { id: 'competition',  label: 'Compétition',   desc: 'Athlète de haut niveau' },
];

/* ─── Petit composant SVG mini icône allergie ───────────────────────── */
const AllergyIcon = ({ path }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

/* ─── Champ texte générique ──────────────────────────────────────────── */
const Field = ({ label, type = 'text', value, onChange, placeholder, icon, required, hint }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 7 }}>
        {label}{required && <span style={{ color: C.accent, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: focused ? C.accent : C.muted, transition: 'color .2s' }}>{icon}</span>}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: icon ? '12px 13px 12px 40px' : '12px 13px',
            background: C.bg, border: `1.5px solid ${focused ? C.borderFocus : C.border}`,
            borderRadius: 10, color: C.text, fontSize: 14,
            fontFamily: C.font, boxSizing: 'border-box', outline: 'none',
            transition: 'border-color .2s',
          }}
        />
      </div>
      {hint && <p style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{hint}</p>}
    </div>
  );
};

/* ─── Sélecteur de cases ─────────────────────────────────────────────── */
const ChipSelect = ({ options, value, onChange, multi = false }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {options.map(opt => {
      const selected = multi ? value.includes(opt.id) : value === opt.id;
      return (
        <button key={opt.id}
          onClick={() => {
            if (multi) {
              onChange(value.includes(opt.id) ? value.filter(v => v !== opt.id) : [...value, opt.id]);
            } else {
              onChange(opt.id);
            }
          }}
          style={{
            padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: C.font,
            border: `1.5px solid ${selected ? C.accent : C.border}`,
            background: selected ? C.accentDim : 'transparent',
            color: selected ? C.accent : C.muted,
            transition: 'all .18s',
          }}
        >
          {opt.label}
          {opt.desc && <span style={{ display: 'block', fontSize: 9.5, fontWeight: 400, opacity: 0.7, marginTop: 1 }}>{opt.desc}</span>}
        </button>
      );
    })}
  </div>
);

/* ─── Section label ──────────────────────────────────────────────────── */
const SLabel = ({ children }) => (
  <label style={{ display: 'block', color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10, marginTop: 18 }}>
    {children}
  </label>
);

/* ─── Toggle switch ──────────────────────────────────────────────────── */
const Toggle = ({ checked, onChange, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
    <span style={{ color: C.text, fontSize: 14 }}>{label}</span>
    <div onClick={() => onChange(!checked)} style={{
      width: 42, height: 24, borderRadius: 12, cursor: 'pointer',
      background: checked ? C.accent : C.border, position: 'relative', transition: 'background .2s',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: checked ? 20 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
      }} />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   Composant Register principal
═══════════════════════════════════════════════════════════════════════ */
export default function Register({ onSwitch }) {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  /* Step : 1 = infos, 2 = profil nutritionnel (client), 3 = allergies (client) */
  const [step, setStep] = useState(1);

  /* ── Formulaire info ── */
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    password: '', confirm: '', role: 'CLIENT',
  });
  const [showPwd, setShowPwd] = useState(false);

  /* ── Profil nutritionnel ── */
  const [nutrition, setNutrition] = useState({
    diet:            'omnivore',
    goal:            'maintien',
    activity_level:  'sedentaire',
    sport_type:      '',
    calories_target: '',
    proteins_target: '',
    lipids_target:   '',
    glucids_target:  '',
    // Santé
    diabetes_type:   'aucun',
    hypertension:    false,
    kidney_failure:  false,
    pregnancy:       false,
    pregnancy_weeks: '',
    notes:           '',
  });

  /* ── Table / Livraison ── */
  const [delivery, setDelivery] = useState({
    mode:         'table',  // 'table' | 'livraison'
    table_number: '',
  });

  /* ── Allergies ── */
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [severity, setSeverity] = useState('allergie');

  /* ── States UI ── */
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setN = (key) => (val) => setNutrition(n => ({ ...n, [key]: val }));

  /* ── Nombre de steps selon le rôle ── */
  const totalSteps = form.role === 'CLIENT' ? 3 : 1;

  /* ── Validation step 1 ── */
  const validate1 = () => {
    if (!form.first_name.trim()) return 'Le prénom est requis.';
    if (!form.last_name.trim())  return 'Le nom est requis.';
    if (!form.email.trim())      return "L'email est requis.";
    if (!form.password)          return 'Le mot de passe est requis.';
    if (form.password.length < 6) return 'Mot de passe : 6 caractères minimum.';
    if (form.password !== form.confirm) return 'Les mots de passe ne correspondent pas.';
    return null;
  };

  /* ── Avancer ── */
  const handleNext = () => {
    const err = validate1();
    if (err) { setError(err); return; }
    setError('');
    if (form.role === 'CLIENT') setStep(2);
    else handleSubmit();
  };

  /* ── Calcul automatique des kcal selon l'objectif ── */
  const applyGoalKcal = (goalId) => {
    const g = GOALS.find(g => g.id === goalId);
    if (g) setNutrition(n => ({ ...n, goal: goalId, calories_target: n.calories_target || g.kcal }));
    else   setNutrition(n => ({ ...n, goal: goalId }));
  };

  /* ── Soumission finale ── */
  const handleSubmit = async (allergiesArg = selectedAllergies) => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const payload = {
        first_name: form.first_name, last_name: form.last_name,
        email: form.email, phone: form.phone || undefined,
        password: form.password, role: form.role,
        allergies: allergiesArg,
        severity,
        /* Profil nutritionnel (uniquement si CLIENT) */
        nutrition: form.role === 'CLIENT' ? {
          diet:            nutrition.diet,
          goal:            nutrition.goal,
          activity_level:  nutrition.activity_level,
          sport_type:      nutrition.sport_type || null,
          calories_target: nutrition.calories_target ? Number(nutrition.calories_target) : null,
          proteins_target: nutrition.proteins_target ? Number(nutrition.proteins_target) : null,
          lipids_target:   nutrition.lipids_target   ? Number(nutrition.lipids_target)   : null,
          glucids_target:  nutrition.glucids_target   ? Number(nutrition.glucids_target)  : null,
          diabetes_type:   nutrition.diabetes_type,
          hypertension:    nutrition.hypertension,
          kidney_failure:  nutrition.kidney_failure,
          pregnancy:       nutrition.pregnancy,
          pregnancy_weeks: nutrition.pregnancy && nutrition.pregnancy_weeks ? Number(nutrition.pregnancy_weeks) : null,
          notes:           nutrition.notes || null,
        } : null,
        /* Table ou livraison */
        table_number: delivery.mode === 'table' && delivery.table_number
          ? Number(delivery.table_number)
          : null,
        delivery_mode: delivery.mode,
      };

      const { data } = await api.post('/auth/register', payload);
      if (data.token) {
        login(data.token, data.user);
      } else {
        setSuccess('Compte créé ! Redirection…');
        setTimeout(() => (onSwitch ? onSwitch() : navigate('/login')), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
      setStep(1);
    } finally { setLoading(false); }
  };

  /* ─── Stepper visuel ─────────────────────────────────────────────── */
  const STEP_LABELS = ['Informations', 'Profil & Table', 'Allergies'];

  const Stepper = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: step >= s ? C.accent : C.border,
            color: step >= s ? '#fff' : C.muted,
            fontSize: 12, fontWeight: 700, transition: 'all .3s', flexShrink: 0,
          }}>{s}</div>
          <span style={{ fontSize: 11, color: step >= s ? C.text : C.muted, fontWeight: step === s ? 600 : 400, whiteSpace: 'nowrap' }}>
            {STEP_LABELS[s - 1]}
          </span>
          {s < totalSteps && <div style={{ width: 20, height: 1.5, background: step > s ? C.accent : C.border, flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  );

  /* ─── EyeIcon ────────────────────────────────────────────────────── */
  const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {showPwd
        ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
      }
    </svg>
  );

  /* ─── Render ─────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: C.font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .reg-card { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
        .submit-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .submit-btn { transition: all .2s; }
        .chip-btn { transition: all .18s; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      <div className="reg-card" style={{ width: '100%', maxWidth: 480 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: C.fontBrand, fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>
            Kitchen<span style={{ color: C.accent }}>Pulse</span>
          </h1>
          <p style={{ color: C.muted, marginTop: 4, fontSize: 13 }}>Créer un compte</p>
        </div>

        {/* Stepper (client uniquement) */}
        {form.role === 'CLIENT' && <Stepper />}

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: '32px 28px' }}>

          {/* ══════════════════════════════════ STEP 1 ══════ */}
          {step === 1 && (
            <>
              {/* Rôle */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 }}>Je suis…</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {ROLES.map(r => (
                    <button key={r.id} onClick={() => setForm(f => ({ ...f, role: r.id }))}
                      style={{
                        flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                        border: `1.5px solid ${form.role === r.id ? C.accent : C.border}`,
                        background: form.role === r.id ? C.accentDim : 'transparent',
                        color: form.role === r.id ? C.accent : C.muted,
                        fontFamily: C.font, fontSize: 12, fontWeight: 600, transition: 'all .18s',
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 13 }}>{r.label}</div>
                      <div style={{ fontSize: 10, opacity: .75, lineHeight: 1.3 }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                <Field label="Prénom" value={form.first_name} onChange={set('first_name')} placeholder="Kryshandy" required
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
                <Field label="Nom" value={form.last_name} onChange={set('last_name')} placeholder="Tchuente" required
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
              </div>

              <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="votre@email.com" required
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} />
              <Field label="Téléphone" type="tel" value={form.phone} onChange={set('phone')} placeholder="+237 6XX XXX XXX"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} />

              {/* Mot de passe */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 7 }}>
                  Mot de passe<span style={{ color: C.accent, marginLeft: 3 }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.muted }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="6 caractères minimum"
                    style={{ width: '100%', padding: '12px 40px 12px 40px', background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, fontFamily: C.font, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = C.borderFocus}
                    onBlur={e  => e.target.style.borderColor = C.border}
                  />
                  <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex' }}>
                    <EyeIcon />
                  </button>
                </div>
              </div>

              <Field label="Confirmer le mot de passe" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Répéter le mot de passe" required
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>} />

              {error && <div style={{ background: C.errorBg, border: `1px solid ${C.error}40`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: C.error, fontSize: 13 }}>{error}</div>}

              <button onClick={handleNext} disabled={loading} className="submit-btn"
                style={{ width: '100%', padding: 14, background: C.accent, border: 'none', borderRadius: 11, color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: C.font, marginTop: 4 }}>
                {form.role === 'CLIENT' ? 'Suivant →' : (loading ? 'Création…' : 'Créer mon compte')}
              </button>
            </>
          )}

          {/* ══════════════════════════════════ STEP 2 : Profil nutritionnel + Table ══════ */}
          {step === 2 && (
            <>
              <h3 style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>Profil alimentaire & table</h3>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
                Ces infos personnalisent vos recommandations. Tout est facultatif.
              </p>

              {/* Régime alimentaire */}
              <SLabel>Mon régime alimentaire</SLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 4 }}>
                {DIETS.map(d => {
                  const sel = nutrition.diet === d.id;
                  return (
                    <button key={d.id} onClick={() => setN('diet')(d.id)}
                      style={{
                        padding: '10px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: C.font,
                        border: `1.5px solid ${sel ? C.accent : C.border}`,
                        background: sel ? C.accentDim : 'transparent',
                        color: sel ? C.accent : C.muted,
                        fontSize: 12, fontWeight: 700, transition: 'all .18s', textAlign: 'center',
                      }}
                    >
                      <div>{d.label}</div>
                      <div style={{ fontSize: 9.5, fontWeight: 400, marginTop: 2, opacity: .75, lineHeight: 1.3 }}>{d.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Objectif */}
              <SLabel>Mon objectif</SLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                {GOALS.map(g => {
                  const sel = nutrition.goal === g.id;
                  return (
                    <button key={g.id} onClick={() => applyGoalKcal(g.id)}
                      style={{
                        padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: C.font,
                        border: `1.5px solid ${sel ? C.accent : C.border}`,
                        background: sel ? C.accentDim : 'transparent',
                        color: sel ? C.accent : C.muted,
                        fontSize: 12, fontWeight: 600, transition: 'all .18s',
                      }}
                    >{g.label} <span style={{ fontSize: 10, opacity: .7 }}>~{g.kcal} kcal</span></button>
                  );
                })}
              </div>

              {/* Activité physique */}
              <SLabel>Niveau d'activité physique</SLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                {ACTIVITY_LEVELS.map(a => {
                  const sel = nutrition.activity_level === a.id;
                  return (
                    <button key={a.id} onClick={() => setN('activity_level')(a.id)}
                      style={{
                        padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: C.font,
                        border: `1.5px solid ${sel ? C.accent : C.border}`,
                        background: sel ? C.accentDim : 'transparent',
                        color: sel ? C.accent : C.muted,
                        fontSize: 12, fontWeight: 600, transition: 'all .18s',
                      }}
                    >{a.label}</button>
                  );
                })}
              </div>

              {/* Sport */}
              <Field label="Sport pratiqué (optionnel)" value={nutrition.sport_type}
                onChange={e => setN('sport_type')(e.target.value)} placeholder="Football, musculation, natation…" />

              {/* Macros cibles */}
              <SLabel>Objectifs nutritionnels (kcal / jour)</SLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                <Field label="Calories (kcal)" type="number" value={nutrition.calories_target}
                  onChange={e => setN('calories_target')(e.target.value)} placeholder="ex. 2000" />
                <Field label="Protéines (g)" type="number" value={nutrition.proteins_target}
                  onChange={e => setN('proteins_target')(e.target.value)} placeholder="ex. 120" />
                <Field label="Lipides (g)" type="number" value={nutrition.lipids_target}
                  onChange={e => setN('lipids_target')(e.target.value)} placeholder="ex. 65" />
                <Field label="Glucides (g)" type="number" value={nutrition.glucids_target}
                  onChange={e => setN('glucids_target')(e.target.value)} placeholder="ex. 250" />
              </div>

              {/* Conditions de santé */}
              <SLabel>Conditions de santé</SLabel>
              <div style={{ marginBottom: 8, borderTop: `1px solid ${C.border}` }}>
                <Toggle checked={nutrition.hypertension}  onChange={setN('hypertension')}  label="Hypertension artérielle" />
                <Toggle checked={nutrition.kidney_failure} onChange={setN('kidney_failure')} label="Insuffisance rénale" />
                <Toggle checked={nutrition.pregnancy}     onChange={v => { setN('pregnancy')(v); if (!v) setN('pregnancy_weeks')(''); }} label="Grossesse en cours" />
              </div>
              {nutrition.pregnancy && (
                <Field label="Semaines de grossesse" type="number" value={nutrition.pregnancy_weeks}
                  onChange={e => setN('pregnancy_weeks')(e.target.value)} placeholder="ex. 20"
                  hint="Entre 1 et 42 semaines" />
              )}

              {/* Diabète */}
              <SLabel>Diabète</SLabel>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[
                  { id: 'aucun', label: 'Aucun' },
                  { id: 'type1', label: 'Type 1' },
                  { id: 'type2', label: 'Type 2' },
                  { id: 'gestationnel', label: 'Gestationnel' },
                ].map(d => {
                  const sel = nutrition.diabetes_type === d.id;
                  return (
                    <button key={d.id} onClick={() => setN('diabetes_type')(d.id)}
                      style={{
                        flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer', fontFamily: C.font,
                        border: `1.5px solid ${sel ? C.accent : C.border}`,
                        background: sel ? C.accentDim : 'transparent',
                        color: sel ? C.accent : C.muted,
                        fontSize: 11, fontWeight: 600, transition: 'all .18s',
                      }}
                    >{d.label}</button>
                  );
                })}
              </div>

              {/* Notes libres */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 7 }}>Notes personnelles (optionnel)</label>
                <textarea value={nutrition.notes} onChange={e => setN('notes')(e.target.value)}
                  placeholder="Ex. : végétarien depuis 2019, sportif de haut niveau…"
                  rows={3}
                  style={{ width: '100%', padding: '12px 13px', background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, fontFamily: C.font, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = C.borderFocus}
                  onBlur={e  => e.target.style.borderColor = C.border}
                />
              </div>

              {/* Séparateur */}
              <div style={{ borderTop: `1px solid ${C.border}`, margin: '20px 0' }} />

              {/* Table ou livraison */}
              <h4 style={{ color: C.text, fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>
                Comment souhaitez-vous être servi(e) ?
              </h4>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {[
                  { id: 'table',    label: 'Sur place (table)',  desc: 'Je mange au restaurant' },
                  { id: 'livraison', label: 'Livraison à domicile', desc: 'Vous serez appelé(e) par téléphone' },
                ].map(m => {
                  const sel = delivery.mode === m.id;
                  return (
                    <button key={m.id} onClick={() => setDelivery(d => ({ ...d, mode: m.id, table_number: '' }))}
                      style={{
                        flex: 1, padding: '12px 10px', borderRadius: 10, cursor: 'pointer', fontFamily: C.font,
                        border: `1.5px solid ${sel ? C.accent : C.border}`,
                        background: sel ? C.accentDim : 'transparent',
                        color: sel ? C.accent : C.muted,
                        fontSize: 12, fontWeight: 700, textAlign: 'center', transition: 'all .18s',
                      }}
                    >
                      <div style={{ marginBottom: 3 }}>{m.label}</div>
                      <div style={{ fontSize: 10, fontWeight: 400, opacity: .75 }}>{m.desc}</div>
                    </button>
                  );
                })}
              </div>

              {delivery.mode === 'table' && (
                <Field label="Numéro de votre table (optionnel)" type="number" value={delivery.table_number}
                  onChange={e => setDelivery(d => ({ ...d, table_number: e.target.value }))}
                  placeholder="ex. 12"
                  hint="Laissez vide si vous ne connaissez pas encore votre table."
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5h18M3 12h18M3 19h18"/></svg>}
                />
              )}
              {delivery.mode === 'livraison' && (
                <div style={{ background: C.infoBg, border: `1px solid ${C.info}30`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: C.info }}>
                  Un numéro spécial vous sera attribué. Nous vous appellerons au <strong>{form.phone || 'numéro fourni'}</strong> à la fin de votre commande.
                </div>
              )}

              {error && <div style={{ background: C.errorBg, border: `1px solid ${C.error}40`, borderRadius: 10, padding: '10px 14px', marginTop: 12, color: C.error, fontSize: 13 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: 14, background: 'transparent', border: `1.5px solid ${C.border}`, borderRadius: 11, color: C.muted, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: C.font }}>
                  ← Retour
                </button>
                <button onClick={() => { setError(''); setStep(3); }} className="submit-btn"
                  style={{ flex: 2, padding: 14, background: C.accent, border: 'none', borderRadius: 11, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: C.font }}>
                  Suivant — Allergies →
                </button>
              </div>
            </>
          )}

          {/* ══════════════════════════════════ STEP 3 : Allergies ══════ */}
          {step === 3 && (
            <>
              <h3 style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>Vos allergies</h3>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
                Sélectionnez vos allergies pour être alerté(e) automatiquement sur les plats. Vous pouvez ignorer cette étape.
              </p>

              {/* Sévérité */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>Niveau de sévérité</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { id: 'intolerance',     label: 'Intolérance' },
                    { id: 'allergie',        label: 'Allergie' },
                    { id: 'allergie_severe', label: 'Sévère' },
                  ].map(s => (
                    <button key={s.id} onClick={() => setSeverity(s.id)}
                      style={{
                        flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: C.font,
                        border: `1.5px solid ${severity === s.id ? C.accent : C.border}`,
                        background: severity === s.id ? C.accentDim : 'transparent',
                        color: severity === s.id ? C.accent : C.muted, transition: 'all .18s',
                      }}
                    >{s.label}</button>
                  ))}
                </div>
              </div>

              {/* Grille des allergènes — SVG uniquement, pas d'emoji */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 20 }}>
                {ALLERGENES_LIST.map(a => {
                  const selected = selectedAllergies.includes(a.id);
                  return (
                    <div key={a.id} onClick={() => setSelectedAllergies(prev => prev.includes(a.id) ? prev.filter(i => i !== a.id) : [...prev, a.id])}
                      style={{
                        padding: '10px 12px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                        border: `1.5px solid ${selected ? C.accent : C.border}`,
                        background: selected ? C.accentDim : C.bg,
                        transition: 'all .18s', userSelect: 'none',
                      }}
                    >
                      <span style={{ color: selected ? C.accent : C.muted, flexShrink: 0 }}>
                        <AllergyIcon path={a.svgPath} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: selected ? C.accent : C.text, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.label}</div>
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{a.code}</div>
                      </div>
                      {selected && (
                        <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedAllergies.length > 0 && (
                <div style={{ background: C.accentDim, border: `1px solid ${C.accent}30`, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: C.accent }}>
                  {selectedAllergies.length} allergie{selectedAllergies.length > 1 ? 's' : ''} sélectionnée{selectedAllergies.length > 1 ? 's' : ''}
                </div>
              )}

              {error   && <div style={{ background: C.errorBg,   border: `1px solid ${C.error}40`,   borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: C.error,   fontSize: 13 }}>{error}</div>}
              {success && <div style={{ background: C.successBg, border: `1px solid ${C.success}40`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: C.success, fontSize: 13 }}>{success}</div>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: 14, background: 'transparent', border: `1.5px solid ${C.border}`, borderRadius: 11, color: C.muted, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: C.font }}>
                  ← Retour
                </button>
                <button onClick={() => handleSubmit(selectedAllergies)} disabled={loading} className="submit-btn"
                  style={{ flex: 2, padding: 14, background: C.accent, border: 'none', borderRadius: 11, color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: C.font }}>
                  {loading ? 'Création…' : selectedAllergies.length === 0 ? 'Ignorer et créer' : 'Créer mon compte'}
                </button>
              </div>
            </>
          )}

          <p style={{ textAlign: 'center', marginTop: 20, color: C.muted, fontSize: 13 }}>
            Déjà un compte ?{' '}
            {onSwitch
              ? <button onClick={onSwitch} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: C.font }}>Se connecter</button>
              : <Link to="/login" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
            }
          </p>
        </div>
      </div>
    </div>
  );
}