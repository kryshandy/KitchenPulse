// frontend/src/pages/Register.jsx
import { useState, useContext } from "react";
import api from "../api/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import { G } from "../theme";

/**
 * Page d'inscription — POST /auth/register
 * Props :
 *  - onSwitch : callback pour revenir sur Login
 */
export default function Register({ onSwitch }) {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    nom: "",
    email: "",
    phone: "",
    password: "",
    role: "CLIENT",
  });
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!form.nom.trim())      return "Le nom est obligatoire.";
    if (!form.email.trim())    return "L'email est obligatoire.";
    if (!form.password)        return "Le mot de passe est obligatoire.";
    if (form.password.length < 6) return "Le mot de passe doit faire au moins 6 caractères.";
    if (form.password !== confirmPwd) return "Les mots de passe ne correspondent pas.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const ROLES = [
    { id: "CLIENT",    label: "Client",    icon: "👤", color: G.accent },
    { id: "CUISINIER", label: "Cuisinier", icon: "👨‍🍳", color: G.accent2 },
    { id: "SERVEUR",   label: "Serveur",   icon: "🛎️", color: G.purple },
  ];

  const fields = [
    { label: "Nom complet *",  key: "nom",      type: "text",     icon: "👤", placeholder: "Ex : Marie Kamdem" },
    { label: "Email *",        key: "email",    type: "email",    icon: "📧", placeholder: "votre@email.com" },
    { label: "Téléphone",      key: "phone",    type: "tel",      icon: "📱", placeholder: "+237 6XX XXX XXX" },
    { label: "Mot de passe *", key: "password", type: "password", icon: "🔒", placeholder: "6 caractères minimum" },
  ];

  return (
    <div style={{ padding: "0 20px 40px" }}>
      {fields.map(({ label, key, type, icon, placeholder }) => (
        <div key={key} style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, color: G.muted, marginBottom: 5, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase" }}>
            {label}
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>{icon}</span>
            <input
              type={type}
              value={form[key]}
              onChange={set(key)}
              placeholder={placeholder}
              style={{ width: "100%", padding: "12px 14px 12px 38px", background: "#0D0D0F", border: `1px solid ${G.border}`, borderRadius: 10, color: G.text, fontSize: 14 }}
              onFocus={(e) => (e.target.style.borderColor = G.accent)}
              onBlur={(e)  => (e.target.style.borderColor = G.border)}
            />
          </div>
        </div>
      ))}

      {/* Confirmer le mot de passe */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 11, color: G.muted, marginBottom: 5, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase" }}>
          Confirmer le mot de passe *
        </label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>🔐</span>
          <input
            type="password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            placeholder="Répéter le mot de passe"
            style={{ width: "100%", padding: "12px 14px 12px 38px", background: "#0D0D0F", border: `1px solid ${G.border}`, borderRadius: 10, color: G.text, fontSize: 14 }}
            onFocus={(e) => (e.target.style.borderColor = G.accent)}
            onBlur={(e)  => (e.target.style.borderColor = G.border)}
          />
        </div>
      </div>

      {/* Sélection du rôle */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, color: G.muted, display: "block", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>
          Je suis…
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {ROLES.map(({ id, label, icon, color }) => (
            <button
              key={id}
              onClick={() => setForm((f) => ({ ...f, role: id }))}
              style={{
                flex: 1,
                padding: "10px 6px",
                borderRadius: 10,
                border: `1px solid ${form.role === id ? color : G.border}`,
                background: form.role === id ? `${color}20` : "transparent",
                color: form.role === id ? color : G.muted,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 12, textAlign: "center", background: "rgba(239,68,68,.1)", borderRadius: 8, padding: "8px 12px" }}>
          {error}
        </p>
      )}

      {/* Bouton principal */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 10,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600,
          fontSize: 15,
          background: G.accent,
          color: "#fff",
          opacity: loading ? 0.7 : 1,
          marginBottom: 14,
          transition: "opacity .2s",
        }}
      >
        {loading ? "Création du compte…" : "Créer mon compte →"}
      </button>

      <p style={{ textAlign: "center", color: G.muted, fontSize: 13 }}>
        Déjà un compte ?{" "}
        <button
          onClick={onSwitch}
          style={{ background: "none", border: "none", color: G.accent, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
        >
          Se connecter
        </button>
      </p>
    </div>
  );
}