import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import './App.css';
import AppRoutes from './routes/AppRoutes';
import Login from './components/login/Login';
import { logout, isAuthenticated } from './services/login/authService';
import { getUnreadCountNotificacoes } from './services/notificacoes/notificacoesService';

function App() {
  const [session, setSession] = useState(null);

  const handleLoginSuccess = (sess) => {
    setSession(sess);
  };

  const handleLogout = async () => {
    await logout();
    setSession(null);
  };

  const [unread, setUnread] = useState(0);
  useEffect(() => {
    const refresh = async () => {
      try {
        const c = await getUnreadCountNotificacoes();
        setUnread(Number(c) || 0);
      } catch (_) {
        // silencioso
      }
    };
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, []);

  // Default: require login for the rest
  if (!session || !isAuthenticated()) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <div className="App" style={{fontFamily:'sans-serif'}}>
        <nav className="navbar navbar-light bg-light px-3 shadow-sm" style={{position:'sticky',top:0,zIndex:100}}>
          <span className="navbar-brand mb-0 h6">Estoque</span>
          <div className="d-flex align-items-center gap-2">
            <Link to="/notify" className="btn btn-outline-primary btn-sm position-relative" aria-label="Notificações">
              <i className="bi bi-bell"></i>
              {unread > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unread}
                </span>
              )}
            </Link>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Sair</button>
          </div>
        </nav>
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
