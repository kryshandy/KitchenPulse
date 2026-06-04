import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import DishCard from '../../components/DishCard';
import { toast } from 'react-toastify';

const CATEGORIES = ['Entrée', 'Plat', 'Dessert', 'Boisson'];

const emptyForm = {
  nom: '', description: '', prix: '',
  calories: '', categorie: 'Plat', photo: '', disponible: true,
};

const GestionPlats = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);       // plat en cours d'édition
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');

  // ─── Chargement ────────────────────────────────────────────────────────────
  const fetchDishes = useCallback(async () => {
    try {
      const res = await api.get('/dishes');
      setDishes(res.data);
    } catch (err) {
      toast.error('Impossible de charger les plats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDishes(); }, [fetchDishes]);

  // ─── Ouvrir modale création ─────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  // ─── Ouvrir modale édition ──────────────────────────────────────────────────
  const openEdit = (dish) => {
    setEditing(dish);
    setForm({
      nom:         dish.nom,
      description: dish.description || '',
      prix:        dish.prix,
      calories:    dish.calories,
      categorie:   dish.categorie,
      photo:       dish.photo || '',
      disponible:  Boolean(dish.disponible),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
  };

  // ─── Soumettre le formulaire ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.prix || !form.categorie) {
      toast.warn('Nom, prix et catégorie sont obligatoires');
      return;
    }
    if (isNaN(parseFloat(form.prix)) || parseFloat(form.prix) <= 0) {
      toast.warn('Le prix doit être un nombre positif');
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        await api.patch(`/dishes/${editing.id}`, form);
        toast.success('Plat modifié avec succès !');
      } else {
        await api.post('/dishes', form);
        toast.success('Plat créé avec succès !');
      }
      closeModal();
      fetchDishes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Basculer disponibilité ─────────────────────────────────────────────────
  const handleToggle = async (dish) => {
    try {
      await api.patch(`/dishes/${dish.id}`, { disponible: !dish.disponible });
      toast.success(`Plat ${!dish.disponible ? 'activé' : 'désactivé'}`);
      fetchDishes();
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // ─── Supprimer ──────────────────────────────────────────────────────────────
  const handleDelete = async (dish) => {
    if (!window.confirm(`Supprimer définitivement "${dish.nom}" ?`)) return;
    try {
      await api.delete(`/dishes/${dish.id}`);
      toast.success('Plat supprimé');
      fetchDishes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // ─── Filtrage ───────────────────────────────────────────────────────────────
  const displayed = dishes
    .filter(d => filterCat === 'all' || d.categorie === filterCat)
    .filter(d => d.nom.toLowerCase().includes(search.toLowerCase()));

  // ─── Rendu ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🍽️</div>
          <p className="text-gray-500">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🍽️ Gestion des plats</h1>
          <p className="text-gray-500 text-sm mt-1">{dishes.length} plat(s) au total</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          + Nouveau plat
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Recherche */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un plat..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Filtre catégorie */}
        <div className="flex gap-2 flex-wrap">
          {['all', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                ${filterCat === cat
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {cat === 'all' ? '🍴 Tous' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des plats */}
      {displayed.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🥗</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun plat trouvé</h3>
          <p className="text-gray-400 text-sm">Modifiez les filtres ou créez un nouveau plat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayed.map(dish => (
            <DishCard
              key={dish.id}
              dish={dish}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* ─── Modale Création / Édition ──────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header modale */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editing ? '✏️ Modifier le plat' : '➕ Nouveau plat'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors"
              >
                ×
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nom du plat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  placeholder="Ex: Poulet rôti aux herbes"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Décrivez le plat..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>

              {/* Prix et Calories */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Prix (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.prix}
                    onChange={e => setForm({ ...form, prix: e.target.value })}
                    placeholder="12.90"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.calories}
                    onChange={e => setForm({ ...form, calories: e.target.value })}
                    placeholder="450"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.categorie}
                  onChange={e => setForm({ ...form, categorie: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* URL photo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">URL de la photo</label>
                <input
                  type="url"
                  value={form.photo}
                  onChange={e => setForm({ ...form, photo: e.target.value })}
                  placeholder="https://exemple.com/photo.jpg"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                {form.photo && (
                  <img
                    src={form.photo}
                    alt="Aperçu"
                    className="mt-2 w-full h-24 object-cover rounded-lg"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>

              {/* Disponible */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.disponible}
                    onChange={e => setForm({ ...form, disponible: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">
                  {form.disponible ? '✅ Disponible au menu' : '⛔ Masqué du menu'}
                </span>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {submitting ? '⏳ Sauvegarde...' : editing ? '✅ Modifier' : '➕ Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPlats;