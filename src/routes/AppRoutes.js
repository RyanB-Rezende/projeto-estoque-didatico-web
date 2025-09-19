import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
// Usuários
import CadastroUsuarios from '../components/usuario/CadastroUsuarios';
import UsuarioList from '../components/usuario/UsuarioList';
import EditUsuario from '../components/usuario/EditUsuario';
// Cursos
import CursoList from '../components/cursos/CursoList';
import CadastroCurso from '../components/cursos/CadastroCurso';
import EditarCurso from '../components/cursos/EditarCurso';
// Produtos
import ProdutoList from '../components/produtos/ProdutoList';
import CadastroProduto from '../components/produtos/CadastroProduto';
import EditarProduto from '../components/produtos/EditarProduto';
import Home from '../components/home/Home';

const LegacyEditRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/usuarios/editar/${id}`} replace />;
};

const AppRoutes = () => (
  <Routes>
    {/* Home / Dashboard */}
    <Route path="/" element={<Home />} />
    <Route path="/home" element={<Home />} />
    {/* Usuários */}
    <Route path="/cadastro" element={<CadastroUsuarios />} />
    <Route path="/usuarios" element={<UsuarioList />} />
    <Route path="/usuarios/editar/:id" element={<EditUsuario />} />
  {/* Compat: manter antigo /editar/:id redirecionando com preservação do ID */}
  <Route path="/editar/:id" element={<LegacyEditRedirect />} />

    {/* Cursos */}
    <Route path="/cursos" element={<CursoList />} />
    <Route path="/cursos/novo" element={<CadastroCurso />} />
    <Route path="/cursos/editar/:id" element={<EditarCurso />} />

    {/* Produtos */}
    <Route path="/produtos" element={<ProdutoList />} />
    <Route path="/produtos/novo" element={<CadastroProduto />} />
    <Route path="/produtos/editar/:id" element={<EditarProduto />} />

    {/* Página não encontrada */}
    <Route
      path="*"
      element={
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Página não encontrada</h2>
          <p>A página que você está procurando não existe.</p>
        </div>
      }
    />
  </Routes>
);

export default AppRoutes;