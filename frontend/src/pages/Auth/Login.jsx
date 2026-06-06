import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axiosConfig';

const C = {
  bg: '#0B0C0F', card: '#13141A', border: '#1E2028',
  borderFocus: '#E8601C', text: '#F2EFE9', muted: '#7C7E8A',
  accent: '#E8601C', accentDim: 'rgba(232,96,28,0.12)',
  error: '#E05252', errorBg: 'rgba(224,82,82,0.1)',
  font: "'Outfit', 'Segoe UI', sans-serif",
  fontBrand: "'Bricolage Grotesque', Georgia, serif",
};

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      const role = res.data.user.role?.toLowerCase();
      if (role === 'admin')     navigate('/admin');
      else if (role === 'cuisinier') navigate('/cuisinier');
      else if (role === 'serveur')   navigate('/serveur');
      else navigate('/menu');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects.');
    } finally { setLoading(false); }
  };

  const inp = (focused) => ({
    width: '100%', padding: '13px 14px 13px 42px',
    background: C.bg, border: `1.5px solid ${focused ? C.borderFocus : C.border}`,
    borderRadius: 10, color: C.text, fontSize: 15,
    fontFamily: C.font, boxSizing: 'border-box', outline: 'none',
    transition: 'border-color .2s',
  });

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: C.font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .login-card { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
        .inp-wrap input:focus { border-color: ${C.borderFocus} !important; }
        .submit-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .submit-btn { transition: all .2s; }
      `}</style>

      <div className="login-card" style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: C.accentDim, borderRadius: 16, marginBottom: 18, border: `1.5px solid ${C.accent}30` }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: C.fontBrand, fontSize: 30, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.5px' }}>
            Kitchen<span style={{ color: C.accent }}>Pulse</span>
          </h1>
          <p style={{ color: C.muted, marginTop: 6, fontSize: 14, fontWeight: 400 }}>Le cerveau vivant de la cuisine</p>
        </div>

        {/* Card */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: '36px 32px' }}>
          <h2 style={{ color: C.text, fontSize: 19, fontWeight: 700, margin: '0 0 26px', letterSpacing: '-0.3px' }}>Connexion</h2>

          {error && (
            <div style={{ background: C.errorBg, border: `1px solid ${C.error}40`, borderRadius: 10, padding: '10px 14px', marginBottom: 20, color: C.error, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: C.muted, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>Email</label>
              <div className="inp-wrap" style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted }}><MailIcon /></span>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="votre@email.com"
                  style={inp(false)}
                  onFocus={e => e.target.style.borderColor = C.borderFocus}
                  onBlur={e  => e.target.style.borderColor = C.border}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', color: C.muted, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>Mot de passe</label>
              <div className="inp-wrap" style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted }}><LockIcon /></span>
                <input
                  type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  style={{ ...inp(false), paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = C.borderFocus}
                  onBlur={e  => e.target.style.borderColor = C.border}
                />
                <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <EyeIcon open={showPwd} />
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading} className="submit-btn"
              style={{ width: '100%', padding: 14, background: loading ? C.border : C.accent, border: 'none', borderRadius: 11, color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: C.font, letterSpacing: 0.2 }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: C.muted, fontSize: 14 }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>Créer un compte</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: C.muted, fontSize: 12, opacity: 0.6 }}>
          KitchenPulse · KEYCE Informatique · Groupe 7
        </p>
      </div>
    </div>
  );
}
