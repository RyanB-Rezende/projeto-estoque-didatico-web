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
// Movimentações
import MovimentacaoPage from '../components/movimentacao/MovimentacaoPage.jsx';
// Instrutor pages
import Progresso from '../components/instrutor/Progresso.jsx';
import Solicitacoes from '../components/instrutor/Solicitacoes.jsx';
import { getSession } from '../services/login/authService';

const LegacyEditRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/usuarios/editar/${id}`} replace />;
};

const RequireAdmin = ({ children }) => {
  const session = getSession();
  const role = (session?.user?.status || '').toString().toLowerCase();
  const isAdmin = role.includes('admin');
  if (!isAdmin) return <Navigate to="/home" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Home / Dashboard */}
    <Route path="/" element={<Home />} />
    <Route path="/home" element={<Home />} />
    {/* Usuários (admin) */}
    <Route path="/cadastro" element={<RequireAdmin><CadastroUsuarios /></RequireAdmin>} />
    <Route path="/usuarios" element={<RequireAdmin><UsuarioList /></RequireAdmin>} />
    <Route path="/usuarios/editar/:id" element={<RequireAdmin><EditUsuario /></RequireAdmin>} />
  {/* Compat: manter antigo /editar/:id redirecionando com preservação do ID */}
  <Route path="/editar/:id" element={<LegacyEditRedirect />} />

    {/* Cursos (admin) */}
    <Route path="/cursos" element={<RequireAdmin><CursoList /></RequireAdmin>} />
    <Route path="/cursos/novo" element={<RequireAdmin><CadastroCurso /></RequireAdmin>} />
    <Route path="/cursos/editar/:id" element={<RequireAdmin><EditarCurso /></RequireAdmin>} />

    {/* Produtos (admin) */}
    <Route path="/produtos" element={<RequireAdmin><ProdutoList /></RequireAdmin>} />
    <Route path="/produtos/novo" element={<RequireAdmin><CadastroProduto /></RequireAdmin>} />
    <Route path="/produtos/editar/:id" element={<RequireAdmin><EditarProduto /></RequireAdmin>} />
    {/* Movimentações de produto (admin) */}
    <Route path="/movimentacoes/:id" element={<RequireAdmin><MovimentacaoPage /></RequireAdmin>} />

    {/* Páginas do instrutor (e admin) */}
    <Route path="/progresso" element={<Progresso />} />
    <Route path="/solicitacoes" element={<Solicitacoes />} />

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