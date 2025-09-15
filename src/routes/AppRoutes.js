import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CadastroUsuarios from '../components/CadastroUsuarios';
import UsuarioList from '../components/UsuarioList';
import EditUsuario from '../components/EditUsuario';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/cadastro" element={<CadastroUsuarios />} />
      <Route path="/" element={<UsuarioList />} />
      <Route path="/editar/:id" element={<EditUsuario />} />
      
      {/* Rota para página não encontrada */}
      <Route path="*" element={
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Página não encontrada</h2>
          <p>A página que você está procurando não existe.</p>
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes;