import React, { useState } from 'react';
import './App.css';
import Login from './components/login/Login';
import ProdutoList from './components/produtos/ProdutoList';
import { logout, isAuthenticated } from './services/login/authService';

function App() {
  const [session, setSession] = useState(null);

  const handleLoginSuccess = (sess) => {
    setSession(sess);
  };

  const handleLogout = async () => {
    await logout();
    setSession(null);
  };

  if (!session || !isAuthenticated()) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{fontFamily:'sans-serif'}}>
      <nav className="navbar navbar-light bg-light px-3 shadow-sm" style={{position:'sticky',top:0,zIndex:100}}>
        <span className="navbar-brand mb-0 h6">Estoque</span>
        <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Sair</button>
      </nav>
      <ProdutoList />
    </div>
  );
}

export default App;
