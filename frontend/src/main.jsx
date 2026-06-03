import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './client-ui-test' // Appelle ton script de test autonome

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)