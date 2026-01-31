import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Usuários
import CadastroUsuarios from "../components/usuario/CadastroUsuarios";
import UsuarioList from "../components/usuario/UsuarioList";
import EditUsuario from "../components/usuario/EditUsuario";

// Cursos
import CursoList from "../components/cursos/CursoList";
import CadastroCurso from "../components/cursos/CadastroCurso";
import EditarCurso from "../components/cursos/EditarCurso";

// Produtos
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
