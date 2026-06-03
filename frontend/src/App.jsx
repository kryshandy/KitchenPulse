import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Menu from './pages/Client/Menu';
import Panier from './pages/Client/Panier';
import Paiement from './pages/Client/Paiement';

function App() {
  const [cartItems, setCartItems] = useState([]);

  // Modification ici : on accepte un paramètre "chosenQuantity" envoyé par la DishCard
  const handleAddToCart = (dishWithCustom, chosenQuantity) => {
    setCartItems((prevItems) => {
      // On vérifie si le même plat AVEC les mêmes personnalisations existe déjà
      const existing = prevItems.find(item => 
        item.id === dishWithCustom.id && 
        item.noteClient === dishWithCustom.noteClient &&
        item.caloriesSouhaitees === dishWithCustom.caloriesSouhaitees
      );

      if (existing) {
        return prevItems.map(item =>
          (item.id === dishWithCustom.id && item.noteClient === dishWithCustom.noteClient && item.caloriesSouhaitees === dishWithCustom.caloriesSouhaitees)
            ? { ...item, quantity: item.quantity + chosenQuantity }
            : item
        );
      }
      
      // Sinon on crée une nouvelle ligne distincte dans le panier
      return [...prevItems, { ...dishWithCustom, quantity: chosenQuantity }];
    });
  };

  const handleUpdateQuantity = (id, quantity, noteClient) => {
    if (quantity <= 0) {
      setCartItems(prevItems => prevItems.filter(item => !(item.id === id && item.noteClient === noteClient)));
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item => (item.id === id && item.noteClient === noteClient) ? { ...item, quantity } : item)
    );
  };

  const handleRemoveItem = (id, noteClient) => {
    setCartItems(prevItems => prevItems.filter(item => !(item.id === id && item.noteClient === noteClient)));
  };

  const handleClearCart = () => setCartItems([]);

  return (
    <Router>
      <div style={{ fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#007bff', padding: '15px', color: 'white', borderRadius: '5px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>🍴 KitchenPulse</Link>
          <div>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', marginRight: '15px' }}>Menu</Link>
            <Link to="/panier" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
              Panier ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
            </Link>
          </div>
        </nav>

        <main style={{ marginTop: '20px' }}>
          <Routes>
            <Route path="/" element={<Menu onAddToCart={handleAddToCart} />} />
            <Route path="/panier" element={
              <Panier 
                cartItems={cartItems} 
                onUpdateQuantity={handleUpdateQuantity} 
                onRemoveItem={handleRemoveItem} 
                onClearCart={handleClearCart} 
              />
            } />
            <Route path="/client/paiement" element={<Paiement onClearCart={handleClearCart} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;