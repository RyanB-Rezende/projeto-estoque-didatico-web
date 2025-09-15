import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav style={{
      backgroundColor: '#2c3e50',
      padding: '1rem',
      marginBottom: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>

          <Link 
            to="/cadastro" 
            style={{
              color: location.pathname === '/cadastro' ? '#3498db' : 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              backgroundColor: location.pathname === '/cadastro' ? 'white' : 'transparent',
              transition: 'all 0.3s ease'
            }}
          >
            Cadastrar Usuário
          </Link>

        <Link to="/cadastro" style={{ color: 'white', textDecoration: 'none' }}>
          <h1 style={{ margin: 0 }}>Sistema de Usuários</h1>
        </Link>
        


        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link 
            to="/" 
            style={{
              color: location.pathname === '/' ? '#3498db' : 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              backgroundColor: location.pathname === '/' ? 'white' : 'transparent',
              transition: 'all 0.3s ease'
            }}
          >
            Lista de Usuários
          </Link>
          

        </div>
      </div>
    </nav>
  );
};

export default Navigation;