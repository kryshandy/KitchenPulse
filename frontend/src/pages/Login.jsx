import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

/* ─── Design tokens ─── */
const G = {
  bg: '#0A0C10',
  surface: '#11141C',
  card: '#181D28',
  border: '#252D3D',
  borderHover: '#3A4560',
  accent: '#F5A623',
  accentDeep: '#C47E0F',
  accentGlow: 'rgba(245,166,35,0.18)',
  green: '#22D3A0',
  red: '#F56565',
  text: '#EEF0F4',
  sub: '#8B93A8',
  muted: '#4A526A',
  font: "'Sora', 'DM Sans', system-ui, sans-serif",
  fontDisplay: "'Bricolage Grotesque', 'Playfair Display', Georgia, serif",
};

const ROLES = [
  { id: 'CLIENT',     label: 'Client',      icon: '🍽️',  desc: 'Commander & déguster' },
  { id: 'SERVEUR',    label: 'Serveur',      icon: '🤵',  desc: 'Service en salle' },
  { id: 'CUISINIER',  label: 'Cuisinier',    icon: '👨‍🍳', desc: 'Gestion cuisine' },
  { id: 'ADMIN',      label: 'Administrateur', icon: '⚙️', desc: 'Tableau de bord' },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Bricolage+Grotesque:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: ${G.bg}; }

  @keyframes kpWrite {
    from { width: 0; }
    to   { width: 100%; }
  }
  @keyframes kpFadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes kpPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: .5; transform: scale(.92); }
  }
  @keyframes kpGlow {
    0%, 100% { box-shadow: 0 0 18px ${G.accentGlow}; }
    50%       { box-shadow: 0 0 36px rgba(245,166,35,.32); }
  }
  @keyframes kpSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes kpSlideRight {
    from { opacity: 0; transform: translateX(-18px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes kpBounce {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-6px); }
  }

  .splash-logo-text {
    font-family: ${G.fontDisplay};
    font-size: clamp(40px, 10vw, 72px);
    font-weight: 800;
    color: ${G.text};
    white-space: nowrap;
    overflow: hidden;
    border-right: 3px solid ${G.accent};
    animation: kpWrite 1.4s cubic-bezier(.77,0,.18,1) forwards,
               kpPulse 1s ease 1.4s 1 forwards;
  }
  .splash-logo-text .accent { color: ${G.accent}; }

  .field-input {
    width: 100%;
    background: ${G.bg};
    border: 1.5px solid ${G.border};
    border-radius: 12px;
    color: ${G.text};
    font-family: ${G.font};
    font-size: 14px;
    padding: 13px 14px;
    transition: border-color .2s, box-shadow .2s;
    outline: none;
  }
  .field-input:focus {
    border-color: ${G.accent};
    box-shadow: 0 0 0 3px ${G.accentGlow};
  }
  .field-input::placeholder { color: ${G.muted}; }

  .btn-primary {
    width: 100%;
    padding: 14px;
    background: ${G.accent};
    color: #0A0C10;
    border: none;
    border-radius: 12px;
    font-family: ${G.font};
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s;
    animation: kpGlow 2.4s ease infinite;
  }
  .btn-primary:hover:not(:disabled) { background: ${G.accentDeep}; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: .55; cursor: not-allowed; animation: none; }

  .allergy-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 11px;
    border-radius: 20px;
    border: 1.5px solid ${G.border};
    cursor: pointer;
    font-size: 12px;
    font-family: ${G.font};
    color: ${G.sub};
    background: ${G.surface};
    transition: all .18s;
    user-select: none;
  }
  .allergy-chip:hover { border-color: ${G.accent}; color: ${G.text}; }
  .allergy-chip.selected { background: ${G.accentGlow}; border-color: ${G.accent}; color: ${G.accent}; }

  .role-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 10px;
    border-radius: 14px;
    border: 1.5px solid ${G.border};
    cursor: pointer;
    background: ${G.surface};
    transition: all .2s;
    user-select: none;
    text-align: center;
  }
  .role-card:hover { border-color: ${G.borderHover}; }
  .role-card.active { border-color: ${G.accent}; background: ${G.accentGlow}; }
  .role-card .role-icon { font-size: 26px; }
  .role-card .role-label { font-size: 12px; font-weight: 700; color: ${G.text}; font-family: ${G.font}; }
  .role-card .role-desc  { font-size: 10px; color: ${G.muted}; font-family: ${G.font}; line-height: 1.3; }

  .tab-btn {
    flex: 1;
    padding: 11px;
    border: none;
    border-radius: 10px;
    font-family: ${G.font};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${G.bg}; }
  ::-webkit-scrollbar-thumb { background: ${G.border}; border-radius: 2px; }
`;

/* ─── Spinner ─── */
const Spinner = () => (
  <span style={{
    display: 'inline-block', width: 18, height: 18,
    border: `2px solid rgba(10,12,16,.3)`, borderTopColor: '#0A0C10',
    borderRadius: '50%', animation: 'kpSpin .7s linear infinite'
  }} />
);

/* ─── Error toast ─── */
const Toast = ({ msg, type = 'error' }) => msg ? (
  <div style={{
    background: type === 'error' ? 'rgba(245,101,101,.12)' : 'rgba(34,211,160,.12)',
    border: `1px solid ${type === 'error' ? G.red : G.green}30`,
    color: type === 'error' ? G.red : G.green,
    borderRadius: 10, padding: '10px 14px', fontSize: 13,
    fontFamily: G.font, marginBottom: 14, animation: 'kpSlideRight .3s ease',
  }}>{msg}</div>
) : null;

/* ─── Splash Screen ─── */
const SplashScreen = ({ onDone }) => {
  const [step, setStep] = useState(0); // 0=logo, 1=tagline, 2=roles

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1600);
    const t2 = setTimeout(() => setStep(2), 2600);
    const t3 = setTimeout(() => onDone(), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div style={{
      minHeight: '100vh', background: G.bg, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 28, padding: 24,
    }}>
      {/* Logo animé */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16, animation: 'kpBounce 2s ease infinite' }}>🍴</div>
        <div className="splash-logo-text">
          Kitchen<span className="accent">Pulse</span>
        </div>
      </div>

      {/* Tagline */}
      {step >= 1 && (
        <p style={{
          color: G.sub, fontSize: 15, textAlign: 'center', maxWidth: 280,
          lineHeight: 1.6, fontFamily: G.font,
          animation: 'kpFadeUp .5s ease both',
        }}>
          La plateforme temps réel pour restaurants
        </p>
      )}

      {/* Rôles preview */}
      {step >= 2 && (
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
          animation: 'kpFadeUp .5s ease both',
        }}>
          {ROLES.map((r, i) => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: G.surface, border: `1px solid ${G.border}`,
              borderRadius: 28, padding: '7px 14px',
              animation: `kpFadeUp .4s ease ${i * 0.1}s both`,
            }}>
              <span style={{ fontSize: 18 }}>{r.icon}</span>
              <span style={{ fontSize: 13, color: G.text, fontFamily: G.font, fontWeight: 500 }}>{r.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Barre de chargement */}
      <div style={{
        width: 220, height: 3, background: G.border, borderRadius: 2, overflow: 'hidden',
        marginTop: 8,
      }}>
        <div style={{
          height: '100%', background: G.accent, borderRadius: 2,
          animation: 'kpWrite 3.2s ease forwards',
        }} />
      </div>
    </div>
  );
};

/* ─── Auth Form ─── */
const AuthForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');

  // Login state
  const [loginId, setLoginId]   = useState('');
  const [loginPwd, setLoginPwd] = useState('');

  // Register state
  const [firstName, setFirstName]     = useState('');
  const [lastName, setLastName]       = useState('');
  const [regEmail, setRegEmail]       = useState('');
  const [regPhone, setRegPhone]       = useState('');
  const [regPwd, setRegPwd]           = useState('');
  const [tableNum, setTableNum]       = useState('');
  const [selAllergies, setSelAllergies] = useState([]);
  const [allergiesList, setAllergiesList] = useState([]);

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  // Charger la liste des allergies
  useEffect(() => {
    api.get('/auth/allergies')
      .then(r => setAllergiesList(r.data))
      .catch(() => {});
  }, []);

  const toggleAllergy = (id) => {
    setSelAllergies(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const isEmail = loginId.includes('@');
      const payload = { password: loginPwd };
      if (isEmail) payload.email = loginId; else payload.phone = loginId;

      const { data } = await api.post('/auth/login', payload);
      login(data.token, data.user);

      if (data.user.role === 'CLIENT') navigate('/menu');
      else if (data.user.role === 'CUISINIER') navigate('/cuisine');
      else if (data.user.role === 'SERVEUR') navigate('/serveur');
      else navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (!firstName || !lastName || !regPwd) {
      setError('Prénom, nom et mot de passe requis');
      setLoading(false); return;
    }
    if (!regEmail && !regPhone) {
      setError('Email ou téléphone requis');
      setLoading(false); return;
    }
    try {
      const { data } = await api.post('/auth/register', {
        first_name: firstName, last_name: lastName,
        email: regEmail || undefined, phone: regPhone || undefined,
        password: regPwd,
        table_number: tableNum || undefined,
        allergies: selAllergies,
      });
      login(data.token, data.user);
      navigate('/menu');
    } catch (err) {
      setError(err.response?.data?.message || 'Inscription impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: G.bg, overflowY: 'auto',
      fontFamily: G.font,
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, #161008 0%, ${G.bg} 65%)`,
        padding: '36px 24px 28px', textAlign: 'center',
        borderBottom: `1px solid ${G.border}`,
      }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>🍴</div>
        <h1 style={{ fontFamily: G.fontDisplay, fontSize: 32, fontWeight: 800, color: G.text, lineHeight: 1 }}>
          Kitchen<span style={{ color: G.accent }}>Pulse</span>
        </h1>
        <p style={{ color: G.sub, fontSize: 13, marginTop: 8 }}>
          La plateforme temps réel pour restaurants
        </p>

        {/* Sélecteur de rôle — visuellement informatif, non fonctionnel (login déduit du JWT) */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
          marginTop: 20, maxWidth: 360, margin: '20px auto 0',
        }}>
          {ROLES.map(r => (
            <div key={r.id} className="role-card" style={{ opacity: r.id === 'CLIENT' ? 1 : 0.45 }}>
              <span className="role-icon">{r.icon}</span>
              <span className="role-label">{r.label}</span>
              <span className="role-desc">{r.id === 'CLIENT' ? 'Actif' : 'Autre app'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formulaire */}
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '24px 20px 48px' }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', background: G.surface, borderRadius: 12,
          padding: 4, gap: 4, marginBottom: 24, border: `1px solid ${G.border}`,
        }}>
          {[['login', 'Connexion'], ['register', 'Inscription']].map(([m, label]) => (
            <button key={m} className="tab-btn" onClick={() => { setMode(m); setError(''); }}
              style={{
                background: mode === m ? G.accent : 'transparent',
                color: mode === m ? '#0A0C10' : G.sub,
              }}>
              {label}
            </button>
          ))}
        </div>

        <Toast msg={error} type="error" />
        <Toast msg={success} type="success" />

        {/* ── LOGIN ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ animation: 'kpFadeUp .35s ease' }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: G.sub, marginBottom: 5, fontWeight: 600, letterSpacing: .7, textTransform: 'uppercase' }}>
                Email ou téléphone
              </label>
              <input className="field-input" type="text"
                value={loginId} onChange={e => setLoginId(e.target.value)}
                placeholder="marie@gmail.com ou +237..."
                required />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, color: G.sub, marginBottom: 5, fontWeight: 600, letterSpacing: .7, textTransform: 'uppercase' }}>
                Mot de passe
              </label>
              <input className="field-input" type="password"
                value={loginPwd} onChange={e => setLoginPwd(e.target.value)}
                placeholder="••••••••"
                required />
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? <Spinner /> : 'Se connecter'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 16, color: G.muted, fontSize: 13 }}>
              Pas encore de compte ?{' '}
              <span style={{ color: G.accent, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setMode('register')}>
                S'inscrire
              </span>
            </p>
          </form>
        )}

        {/* ── REGISTER ── */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} style={{ animation: 'kpFadeUp .35s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: G.sub, marginBottom: 5, fontWeight: 600, letterSpacing: .7, textTransform: 'uppercase' }}>Prénom *</label>
                <input className="field-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Marie" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: G.sub, marginBottom: 5, fontWeight: 600, letterSpacing: .7, textTransform: 'uppercase' }}>Nom *</label>
                <input className="field-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Kamga" required />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: G.sub, marginBottom: 5, fontWeight: 600, letterSpacing: .7, textTransform: 'uppercase' }}>Email</label>
              <input className="field-input" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="marie@gmail.com" />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: G.sub, marginBottom: 5, fontWeight: 600, letterSpacing: .7, textTransform: 'uppercase' }}>Téléphone</label>
              <input className="field-input" type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="+237 6XX XXX XXX" />
              <p style={{ fontSize: 11, color: G.muted, marginTop: 4 }}>Email ou téléphone (au moins un requis)</p>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: G.sub, marginBottom: 5, fontWeight: 600, letterSpacing: .7, textTransform: 'uppercase' }}>Mot de passe *</label>
              <input className="field-input" type="password" value={regPwd} onChange={e => setRegPwd(e.target.value)} placeholder="Min. 6 caractères" required minLength={6} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11, color: G.sub, marginBottom: 5, fontWeight: 600, letterSpacing: .7, textTransform: 'uppercase' }}>
                Numéro de table <span style={{ color: G.muted }}>(facultatif)</span>
              </label>
              <input className="field-input" type="number" value={tableNum} onChange={e => setTableNum(e.target.value)} placeholder="Ex: 5" min={1} />
            </div>

            {/* Allergies */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, color: G.sub, marginBottom: 10, fontWeight: 600, letterSpacing: .7, textTransform: 'uppercase' }}>
                Mes allergies <span style={{ color: G.muted }}>(facultatif)</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {allergiesList.map(a => (
                  <span key={a.id} className={`allergy-chip ${selAllergies.includes(a.id) ? 'selected' : ''}`}
                    onClick={() => toggleAllergy(a.id)}>
                    {a.icon} {a.label}
                  </span>
                ))}
                {!allergiesList.length && (
                  <span style={{ color: G.muted, fontSize: 12, fontFamily: G.font }}>Chargement…</span>
                )}
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? <Spinner /> : 'Créer mon compte'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 16, color: G.muted, fontSize: 13 }}>
              Déjà un compte ?{' '}
              <span style={{ color: G.accent, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setMode('login')}>
                Se connecter
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

/* ─── Main export ─── */
export default function LoginPage() {
  const [splashDone, setSplashDone] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Si déjà connecté, redirige
  useEffect(() => {
    if (user && splashDone) {
      if (user.role === 'CLIENT') navigate('/menu');
    }
  }, [user, splashDone, navigate]);

  return (
    <>
      <style>{css}</style>
      {!splashDone
        ? <SplashScreen onDone={() => setSplashDone(true)} />
        : <AuthForm />
      }
    </>
  );
}