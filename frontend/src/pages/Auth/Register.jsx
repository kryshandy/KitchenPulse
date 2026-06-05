import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { G } from '../../theme';

/**
 * Page d'inscription — POST /auth/register
 * Props :
 *  - onSwitch (optionnel) : callback pour revenir sur Login (mode modal)
 *    Si absent, utilise react-router navigate('/login')
 */
export default function Register({ onSwitch }) {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email:      '',
    phone:      '',
    password:   '',
    role:       'client',
    allergenes: '',
    kcal_max:   '',
  });
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!form.first_name.trim())      return 'Le prénom est obligatoire.';
    if (!form.last_name.trim())       return 'Le nom est obligatoire.';
    if (!form.email.trim())           return "L'email est obligatoire.";
    if (!form.password)               return 'Le mot de passe est obligatoire.';
    if (form.password.length < 6)     return 'Le mot de passe doit faire au moins 6 caractères.';
    if (form.password !== confirmPwd) return 'Les mots de passe ne correspondent pas.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role.toUpperCase(), // Send role in uppercase
        allergenes: form.allergenes,
        kcal_max: form.kcal_max ? parseInt(form.kcal_max) : null,
      };
      
      const { data } = await api.post('/auth/register', payload);

      if (data.token) {
        // Connexion directe si le backend retourne un token
        login(data.token, data.user);
      } else {
        setSuccess('Compte créé ! Redirection…');
        setTimeout(() => (onSwitch ? onSwitch() : navigate('/login')), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const ROLES = [
    { id: 'client',    label: 'Client',    icon: '👤', color: G.accent  },
    { id: 'cuisinier', label: 'Cuisinier', icon: '👨‍🍳', color: G.accent2 },
    { id: 'serveur',   label: 'Serveur',   icon: '🛎️', color: G.purple  },
  ];

  const FIELDS = [
    { label: 'Prénom *',     key: 'first_name', type: 'text',     icon: '👤', placeholder: 'Ex : Kryshandy'     },
    { label: 'Nom *',        key: 'last_name',  type: 'text',     icon: '📝', placeholder: 'Ex : Tchuente'      },
    { label: 'Email *',      key: 'email',      type: 'email',    icon: '📧', placeholder: 'votre@email.com'    },
    { label: 'Téléphone',    key: 'phone',      type: 'tel',      icon: '📱', placeholder: '+237 6XX XXX XXX'   },
    { label: 'Mot de passe *', key: 'password', type: 'password', icon: '🔒', placeholder: '6 caractères minimum' },
    { label: 'Allergènes',   key: 'allergenes', type: 'text',     icon: '⚠️', placeholder: 'Ex : gluten, lactose' },
    { label: 'Calories max/jour', key: 'kcal_max', type: 'number', icon: '🔥', placeholder: 'Ex : 2000'        },
  ];

  const inputStyle = {
    width: '100%', padding: '12px 14px 12px 38px',
    background: '#0D0D0F', border: `1px solid ${G.border}`,
    borderRadius: 10, color: G.text, fontSize: 14, boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', fontSize: 11, color: G.muted,
    marginBottom: 5, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase',
  };

  return (
    <div style={{ padding: '0 20px 40px' }}>

      {/* Champs principaux */}
      {FIELDS.map(({ label, key, type, icon, placeholder }) => (
        <div key={key} style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{label}</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>{icon}</span>
            <input
              type={type}
              value={form[key]}
              onChange={set(key)}
              placeholder={placeholder}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = G.accent)}
              onBlur={(e)  => (e.target.style.borderColor = G.border)}
            />
          </div>
        </div>
      ))}

      {/* Confirmation mot de passe */}
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Confirmer le mot de passe *</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔐</span>
          <input
            type="password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            placeholder="Répéter le mot de passe"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = G.accent)}
            onBlur={(e)  => (e.target.style.borderColor = G.border)}
          />
        </div>
      </div>

      {/* Sélection du rôle */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Je suis…</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {ROLES.map(({ id, label, icon, color }) => (
            <button
              key={id}
              onClick={() => setForm((f) => ({ ...f, role: id }))}
              style={{
                flex: 1, padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
                border:      `1px solid ${form.role === id ? color : G.border}`,
                background:  form.role === id ? `${color}20` : 'transparent',
                color:       form.role === id ? color : G.muted,
                fontSize: 12, fontWeight: 600,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 12, textAlign: 'center', background: 'rgba(239,68,68,.1)', borderRadius: 8, padding: '8px 12px' }}>
          {error}
        </p>
      )}
      {success && (
        <p style={{ color: '#00C896', fontSize: 13, marginBottom: 12, textAlign: 'center', background: 'rgba(0,200,150,.1)', borderRadius: 8, padding: '8px 12px' }}>
          {success}
        </p>
      )}

      {/* Bouton principal */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%', padding: '14px', borderRadius: 10, border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 600, fontSize: 15,
          background: G.accent, color: '#fff',
          opacity: loading ? 0.7 : 1,
          marginBottom: 14, transition: 'opacity .2s',
        }}
      >
        {loading ? 'Création du compte…' : 'Créer mon compte →'}
      </button>

      <p style={{ textAlign: 'center', color: G.muted, fontSize: 13 }}>
        Déjà un compte ?{' '}
        <button
          onClick={() => (onSwitch ? onSwitch() : navigate('/login'))}
          style={{ background: 'none', border: 'none', color: G.accent, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
        >
          Se connecter
        </button>
      </p>
    </div>
  );
}