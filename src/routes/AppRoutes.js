<<<<<<< HEAD
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

=======
import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
>>>>>>> e691240521bc3ae537d30a9dbb37cb8ae5bac306
// Usuários
import CadastroUsuarios from "../components/usuario/CadastroUsuarios";
import UsuarioList from "../components/usuario/UsuarioList";
import EditUsuario from "../components/usuario/EditUsuario";

// Cursos
import CursoList from "../components/cursos/CursoList";
import CadastroCurso from "../components/cursos/CadastroCurso";
import EditarCurso from "../components/cursos/EditarCurso";

// Produtos
<<<<<<< HEAD
import ProdutoList from "../components/produtos/ProdutoList";
import CadastroProduto from "../components/produtos/CadastroProduto";
import EditarProduto from "../components/produtos/EditarProduto";

// Home
import Home from "../components/home/Home";

// ✅ NOVAS PÁGINAS
import Movimentacao from "../components/movimentação/movimentacao";
import Solicitacao from "../components/solicitação/solicitacao";

/**
 * Se o Home/Movimentacao/Solicitacao precisam do currentUser:
 * - você pode passar props aqui
 * - ou usar Context dentro das páginas
 *
 * Exemplo de pegar do localStorage (se você salva o usuário lá):
 * const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
 */
=======
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
// Turmas
import TurmaList from '../components/turma/TurmaList.jsx';
import NotifyPage from '../components/notify/NotifyPage.jsx';

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
    {/* Turmas (admin) */}
    <Route path="/turmas" element={<RequireAdmin><TurmaList /></RequireAdmin>} />
    {/* Notify (admin) */}
    <Route path="/notify" element={<RequireAdmin><NotifyPage /></RequireAdmin>} />

    {/* Páginas do instrutor (e admin) */}
    <Route path="/progresso" element={<Progresso />} />
    <Route path="/solicitacoes" element={<Solicitacoes />} />
>>>>>>> e691240521bc3ae537d30a9dbb37cb8ae5bac306

const AppRoutes = () => {
  // ✅ (OPCIONAL) se você guarda user no localStorage
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null;
    }
  })();

  return (
    <Routes>
      {/* Home / Dashboard */}
      <Route path="/" element={<Home currentUser={currentUser} />} />
      <Route path="/home" element={<Home currentUser={currentUser} />} />

      {/* ✅ Movimentação (página separada) */}
      <Route
        path="/movimentacao"
        element={<Movimentacao currentUser={currentUser} />}
      />

      {/* ✅ Solicitação (página separada) */}
      <Route
        path="/solicitacao"
        element={<Solicitacao currentUser={currentUser} />}
      />

      {/* Usuários */}
      <Route path="/cadastro" element={<CadastroUsuarios />} />
      <Route path="/usuarios" element={<UsuarioList />} />
      <Route path="/usuarios/editar/:id" element={<EditUsuario />} />

      {/* Compat: manter antigo /editar/:id redirecionando */}
      <Route
        path="/editar/:id"
        element={<Navigate to="/usuarios/editar/:id" replace />}
      />

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
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h2>Página não encontrada</h2>
            <p>A página que você está procurando não existe.</p>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
