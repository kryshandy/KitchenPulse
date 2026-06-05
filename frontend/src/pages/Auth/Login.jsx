import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axiosConfig';

const T = {
  bg:'#0f172a', surface:'#1e293b', border:'#334155',
  text:'#f1f5f9', muted:'#94a3b8', accent:'#f97316',
  accentBg:'rgba(249,115,22,0.12)', error:'#ef4444',
};

const Login = () => {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      // FIX: Changed 'mot_de_passe' to 'password' to match backend expectation
      const res = await API.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      const role = res.data.user.role?.toLowerCase();
      setTimeout(() => {
        if (role === 'admin')     navigate('/admin');
        else if (role === 'cuisinier') navigate('/cuisinier');
        else if (role === 'serveur')   navigate('/serveur');
        else navigate('/menu'); // Changed from '/login' to '/menu' for clients
      }, 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Segoe UI',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');`}</style>
      <div style={{ width:'100%', maxWidth:420 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🍽️</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, color:T.text, margin:0 }}>
            Kitchen<span style={{ color:T.accent }}>Pulse</span>
          </h1>
          <p style={{ color:T.muted, marginTop:6, fontSize:14 }}>Le cerveau vivant de la cuisine</p>
        </div>

        {/* Card */}
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:36 }}>
          <h2 style={{ color:T.text, fontSize:20, fontWeight:700, margin:'0 0 24px' }}>Connexion</h2>

          {error && (
            <div style={{ background:'rgba(239,68,68,0.12)', border:`1px solid ${T.error}40`, borderRadius:10, padding:'10px 14px', marginBottom:20, color:T.error, fontSize:14 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', color:T.muted, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="votre@email.com"
                style={{ width:'100%', padding:'12px 16px', background:'#0f172a', border:`1px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:15, boxSizing:'border-box' }}
              />
            </div>
            <div style={{ marginBottom:28 }}>
              <label style={{ display:'block', color:T.muted, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>Mot de passe</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{ width:'100%', padding:'12px 16px', background:'#0f172a', border:`1px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:15, boxSizing:'border-box' }}
              />
            </div>
            <button
              type="submit" disabled={loading}
              style={{ width:'100%', padding:'14px', background:loading?T.border:T.accent, border:'none', borderRadius:12, color:'#fff', fontSize:16, fontWeight:700, cursor:loading?'not-allowed':'pointer', transition:'all 0.2s' }}
            >
              {loading ? '⏳ Connexion...' : 'Se connecter →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, color:T.muted, fontSize:14 }}>
            Pas de compte ? <Link to="/register" style={{ color:T.accent, fontWeight:600 }}>S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;