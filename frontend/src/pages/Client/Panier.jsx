import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useTheme } from '../../context/ThemeContext';
import Navbar, { font, fontD } from '../../components/Navbar';

export default function Panier() {
  const { T } = useTheme();
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kp_cart') || '[]'); } catch { return []; }
  });
  const [tables,  setTables]  = useState([]);
  const [tableId, setTableId] = useState('');
  const [notes,   setNotes]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => { api.get('/api/tables').then(r => setTables(r.data)).catch(() => {}); }, []);
  useEffect(() => { localStorage.setItem('kp_cart', JSON.stringify(cart)); }, [cart]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const updateQty = (platId, delta) =>
    setCart(prev => prev.map(i => i.plat_id === platId
      ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
    ).filter(i => i.quantity > 0));

  const remove = (platId) => setCart(prev => prev.filter(i => i.plat_id !== platId));

  const subtotal    = cart.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const taxAmount   = subtotal * 0.1925;
  const totalAmount = subtotal + taxAmount;

  const handleOrder = async () => {
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/api/orders', {
        items: cart.map(i => ({
          plat_id: i.plat_id,
          quantity: i.quantity,
          special_instructions: [...(i.mods || []), i.note || ''].filter(Boolean).join(', '),
        })),
        table_id: tableId || undefined,
        notes:    notes   || undefined,
      });
      localStorage.removeItem('kp_cart');
      navigate(`/suivi/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar cartCount={cartCount} />
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: font, paddingBottom: 90 }}>

        <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px' }}>

          {/* Panier vide */}
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
              <p style={{ color: T.muted, fontSize: 15, marginBottom: 24 }}>Ton panier est vide</p>
              <button onClick={() => navigate('/menu')} style={btnAccent(T)}>
                Voir le menu
              </button>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: fontD, fontSize: 22, color: T.text, marginBottom: 18 }}>
                Mon panier 🛒
              </h1>

              {/* Liste articles */}
              {cart.map((item, i) => (
                <div key={item.plat_id} style={{
                  background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 14,
                  padding: 14, marginBottom: 10,
                  animation: `fadeUp .3s ease ${i * .06}s both`,
                  boxShadow: T.shadow,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: T.text, fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                        {item.name}
                      </p>
                      <p style={{ color: T.accent, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                        {Number(item.price).toLocaleString('fr-FR')} FCFA / unité
                      </p>
                      {/* Modifs */}
                      {item.mods?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 3 }}>
                          {item.mods.map(m => (
                            <span key={m} style={{
                              background: T.surface, border: `1px solid ${T.border}`,
                              borderRadius: 10, padding: '1px 7px', fontSize: 10, color: T.sub,
                            }}>✓ {m}</span>
                          ))}
                        </div>
                      )}
                      {item.note && <p style={{ color: T.muted, fontSize: 11 }}>📝 {item.note}</p>}
                    </div>
                    <button onClick={() => remove(item.plat_id)} style={{
                      background: 'rgba(245,101,101,.1)', border: '1px solid rgba(245,101,101,.2)',
                      borderRadius: 8, color: T.red, width: 28, height: 28, cursor: 'pointer',
                      fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>✕</button>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginTop: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => updateQty(item.plat_id, -1)} style={qtyStyle(T)}>−</button>
                      <span style={{ color: T.text, fontWeight: 700, fontSize: 15, minWidth: 22, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQty(item.plat_id, +1)} style={qtyStyle(T)}>+</button>
                    </div>
                    <p style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>
                      {(Number(item.price) * item.quantity).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>
              ))}

              {/* Table */}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle(T)}>Numéro de table <span style={{ color: T.muted, fontWeight: 400 }}>(facultatif)</span></label>
                <select value={tableId} onChange={e => setTableId(e.target.value)} style={inputStyle(T)}>
                  <option value="">Choisir une table…</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id} disabled={t.status === 'OCCUPEE'}>
                      Table {t.table_number}{t.label ? ` — ${t.label}` : ''}
                      {t.status === 'OCCUPEE' ? ' (occupée)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle(T)}>Note générale <span style={{ color: T.muted, fontWeight: 400 }}>(facultatif)</span></label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Infos supplémentaires pour la cuisine…"
                  rows={2}
                  style={{ ...inputStyle(T), resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e  => e.target.style.borderColor = T.border}
                />
              </div>

              {/* Récapitulatif */}
              <div style={{
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: T.shadow,
              }}>
                {[['Sous-total', subtotal], ['TVA (19,25%)', taxAmount]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: T.sub, fontSize: 13 }}>{l}</span>
                    <span style={{ color: T.text, fontSize: 13 }}>{Math.round(v).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: T.text, fontWeight: 700, fontSize: 16 }}>Total</span>
                  <span style={{ color: T.accent, fontWeight: 700, fontSize: 20 }}>
                    {Math.round(totalAmount).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(245,101,101,.1)', border: '1px solid rgba(245,101,101,.25)',
                  borderRadius: 10, padding: '10px 14px', marginBottom: 12, color: T.red, fontSize: 13,
                }}>{error}</div>
              )}

              <button onClick={handleOrder} disabled={loading} style={{
                width: '100%', padding: 15, background: T.accent, color: '#0A0C10',
                border: 'none', borderRadius: 14, fontFamily: font, fontSize: 16,
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? .6 : 1, animation: !loading ? 'glow 2s ease infinite' : 'none',
                transition: 'all .2s',
              }}>
                {loading
                  ? '⏳ Envoi en cuisine…'
                  : `🍴 Commander · ${Math.round(totalAmount).toLocaleString('fr-FR')} FCFA`}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const qtyStyle  = T => ({
  width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${T.border}`,
  background: T.surface, color: T.text, fontSize: 16, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
});
const inputStyle = T => ({
  width: '100%', background: T.surface, border: `1.5px solid ${T.border}`,
  borderRadius: 10, color: T.text, fontFamily: font, fontSize: 14,
  padding: '11px 13px', outline: 'none',
});
const labelStyle = T => ({
  display: 'block', fontSize: 11, color: T.sub, marginBottom: 6,
  fontWeight: 600, letterSpacing: .7, textTransform: 'uppercase',
});
const btnAccent = T => ({
  background: T.accent, color: '#0A0C10', border: 'none', borderRadius: 12,
  padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font,
});