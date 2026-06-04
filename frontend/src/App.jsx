import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import GestionUsers from './pages/GestionUsers';
import GestionMenu from './pages/GestionMenu'; // Import bien présent
import GestionOrders from './pages/GestionOrders';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        return <Dashboard />;
      case 'users': 
        return <GestionUsers />;
      case 'menu': // LE VOICI ! L'aiguillage pour la gestion du menu
        return <GestionMenu />;
      default: 
        return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#fdf8f5', minHeight: '100vh', overflowX: 'hidden' }}>
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        style={{
          position: 'fixed', top: '25px', zIndex: 200, width: '45px', height: '45px',
          borderRadius: '14px', border: '1px solid #fed7aa', backgroundColor: '#ffffff',
          color: '#f97316', fontSize: '16px', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(249, 115, 22, 0.15)',
          transition: 'all 0.3s ease', left: isSidebarOpen ? '285px' : '20px'
        }}
      >
        {isSidebarOpen ? '◀' : '▶'}
      </button>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} />
      
      <main style={{
        flexGrow: 1, minHeight: '100vh', paddingRight: '40px', paddingTop: '40px', paddingBottom: '40px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        marginLeft: isSidebarOpen ? '260px' : '0px',
        paddingLeft: isSidebarOpen ? '50px' : '90px'
      }}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;