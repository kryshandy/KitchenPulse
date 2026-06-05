import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import OrderCard from '../../components/OrderCard';
import { toast } from 'react-toastify';

const TABS = [
  { key: 'all',            label: '📋 Toutes',          filter: null },
  { key: 'nouveau',        label: '🆕 Nouvelles',        filter: 'nouveau' },
  { key: 'en_preparation', label: '👨‍🍳 En préparation',  filter: 'en_preparation' },
];

const FileCommandes = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // ─── Chargement des commandes ──────────────────────────────────────────────
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get('/orders/cuisinier');
      setOrders(res.data);
    } catch (err) {
      if (!silent) toast.error('Impossible de charger les commandes');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ─── Actions ───────────────────────────────────────────────────────────────
  const handleTake = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/take`);
      toast.success('Commande prise en charge !');
      fetchOrders(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la prise en charge');
    }
  };

  const handleReady = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/ready`);
      toast.success('Commande marquée comme prête ! 🎉');
      fetchOrders(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Confirmer l\'annulation de cette commande ?')) return;
    try {
      await api.delete(`/orders/${orderId}`, { data: { motif: 'Annulé par la cuisine' } });
      toast.info('Commande annulée');
      fetchOrders(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  };

  // ─── Filtrage ──────────────────────────────────────────────────────────────
  const activeFilter = TABS.find(t => t.key === activeTab)?.filter;
  const displayed = activeFilter
    ? orders.filter(o => o.statut === activeFilter)
    : orders;

  const counts = {
    all:            orders.length,
    nouveau:        orders.filter(o => o.statut === 'nouveau').length,
    en_preparation: orders.filter(o => o.statut === 'en_preparation').length,
  };

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">👨‍🍳</div>
          <p className="text-gray-500 font-medium">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🍳 File des commandes</h1>
          <p className="text-gray-500 text-sm mt-1">
            {orders.length} commande(s) active(s)
            {refreshing && <span className="ml-2 text-blue-500 text-xs animate-pulse">• Actualisation...</span>}
          </p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors shadow-sm"
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl shadow-sm w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
              ${activeTab === tab.key
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
              ${activeTab === tab.key ? 'bg-white text-orange-500' : 'bg-gray-100 text-gray-600'}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Liste des commandes */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">
            {activeTab === 'nouveau' ? '🎉' : activeTab === 'en_preparation' ? '✨' : '🍽️'}
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {activeTab === 'nouveau' ? 'Aucune nouvelle commande'
             : activeTab === 'en_preparation' ? 'Rien en cours'
             : 'Aucune commande active'}
          </h3>
          <p className="text-gray-400 text-sm">
            {activeTab === 'nouveau'
              ? 'Toutes les nouvelles commandes apparaîtront ici.'
              : 'Les commandes en préparation apparaîtront ici.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onTake={handleTake}
              onReady={handleReady}
              onDelete={handleDelete}
              role="cuisinier"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileCommandes;