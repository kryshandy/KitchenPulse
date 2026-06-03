import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import DishCard from '../../components/DishCard';

const MOCK_DISHES = [
  { id: 1, nom: "Choukouya de Poulet", description: "Poulet braisé aux épices locales, oignons et piments.", prix: 3500, calories: 650, categorie: "Plat" },
  { id: 2, nom: "Garba Royal", description: "Attiéké, thon frit, piment frais et oignons émincés.", prix: 2000, calories: 750, categorie: "Plat" },
  { id: 3, nom: "Alloco Soft", description: "Bananes plantains frites, servies avec une sauce tomate maison.", prix: 1500, calories: 400, categorie: "Accompagnement" },
  { id: 4, nom: "Jus de Bissap Maison", description: "Infusion de fleurs d'hibiscus parfumée à la menthe.", prix: 1000, calories: 120, categorie: "Boisson" }
];

const Menu = ({ onAddToCart }) => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await API.get('/dishes');
        setDishes(response.data);
      } catch (error) {
        console.warn("Backend déconnecté. Affichage du menu local en FCFA.");
        setDishes(MOCK_DISHES);
      } finally {
        setLoading(false);
      }
    };
    fetchDishes();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Chargement de la carte...</div>;

  return (
    <div>
      <h2 style={{ color: '#333', textTransform: 'uppercase', letterSpacing: '1px' }}>🍽️ Composez votre Menu</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>Sélectionnez vos plats et ajustez vos quantités dans le panier.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
};

export default Menu;