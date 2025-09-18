import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUsuarios, deleteUsuario } from "../../services/usuario/usuarioService";

// Funções utilitárias para formatação
const formatTelefone = (telefone) => {
  if (!telefone) return "Não informado";
  const tel = telefone.replace(/\D/g, "");
  if (tel.length === 11) {
    return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
  } else if (tel.length === 10) {
    return `(${tel.slice(0, 2)}) ${tel.slice(2, 6)}-${tel.slice(6)}`;
  }
  return telefone;
};

const formatCPF = (cpf) => {
  if (!cpf) return "Não informado";
  const c = cpf.replace(/\D/g, "");
  if (c.length === 11) {
    return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
  }
  return cpf;
};

// Funções de mascaramento
const maskTelefone = (telefone) => {
  if (!telefone) return "";
  const formatted = formatTelefone(telefone);
  return formatted.replace(/\d(?=\d{4})/g, "*");
};

const maskCPF = (cpf) => {
  if (!cpf) return "";
  const formatted = formatCPF(cpf);
  return formatted.replace(/\d(?=\d{2}-\d{2}$)/g, "*");
};

const maskEmail = (email) => {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  return user[0] + "***@" + domain;
};

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [masked, setMasked] = useState(true);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError("Erro ao carregar usuários: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleDelete = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${nome}?`)) {
      try {
        await deleteUsuario(id);
        alert("Usuário excluído com sucesso!");
        carregarUsuarios();
      } catch (err) {
        alert("Erro ao excluir usuário: " + err.message);
      }
    }
  };

  const toggleMask = () => {
    setMasked(!masked);
  };

  // Função para obter o nome do cargo
  const getNomeCargo = (usuario) => {
    // Verifica se há um objeto cargo com nome
    if (usuario.cargo && typeof usuario.cargo === 'object' && usuario.cargo.nome) {
      return usuario.cargo.nome;
    }
    // Verifica se há uma propriedade cargo direta
    if (usuario.cargo && typeof usuario.cargo === 'string') {
      return usuario.cargo;
    }
    // Verifica se há um objeto cargos
    if (usuario.cargos && usuario.cargos.cargo) {
      return usuario.cargos.cargo;
    }
    // Fallback para N/A se nenhum cargo for encontrado
    return "N/A";
  };

  // Função para determinar a classe do status
  const getStatusClass = (status) => {
    if (status === "ADMIN" || status === "Admin") return "status-admin";
    if (status === "Instrutor(a)" || status === "INSTRUTOR" || status === "Instrutor") return "status-instructor";
    return "status-active";
  };

  // Função para formatar o texto do status
  const formatStatus = (status) => {
    if (status === "ADMIN" || status === "Admin") return "ADMIN";
    if (status === "Instrutor(a)" || status === "INSTRUTOR" || status === "Instrutor") return "INSTRUTOR";
    return status || "ATIVO";
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "white" }}>
        Carregando usuários...
      </div>
    );
  if (error)
    return (
      <div style={{ color: "red", textAlign: "center", padding: "2rem" }}>
        {error}
      </div>
    );

  return (
    <div
      style={{
        background: "linear-gradient(to bottom, #0a84ff, #0077e6)",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h2 style={{ margin: 0 }}>📋 Lista de Usuários</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={toggleMask}
              style={{
                backgroundColor: masked ? "#27ae60" : "#e67e22",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {masked ? "👁️ Mostrar Dados" : "🔒 Ocultar Dados"}
            </button>
            <Link
              to="/"
              style={{
                backgroundColor: "#27ae60",
                color: "white",
                padding: "10px 20px",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              + Novo Usuário
            </Link>
          </div>
        </div>

        {/* Tabela */}
        {usuarios.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              border: "2px dashed #ddd",
            }}
          >
            <h3>Nenhum usuário cadastrado</h3>
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              Você ainda não possui usuários cadastrados no sistema.
            </p>
            <Link
              to="/cadastro"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "10px 20px",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              Cadastrar Primeiro Usuário
            </Link>
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#2c3e50", color: "white" }}>
                  <th style={thStyle}>Nome</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Telefone</th>
                  <th style={thStyle}>CPF</th>
                  <th style={thStyle}>Cargo</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyleCenter}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr
                    key={usuario.id_usuarios}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td style={tdStyle}>{usuario.nome}</td>
                    <td style={tdStyle}>
                      {masked ? maskEmail(usuario.email) : usuario.email}
                    </td>
                    <td style={tdStyle}>
                      {masked
                        ? maskTelefone(usuario.telefone)
                        : formatTelefone(usuario.telefone)}
                    </td>
                    <td style={tdStyle}>
                      {masked ? maskCPF(usuario.cpf) : formatCPF(usuario.cpf)}
                    </td>
                    {/* Cargo - usando a função getNomeCargo */}
                    <td style={tdStyle}>{getNomeCargo(usuario)}</td>
                    {/* Status - usando as funções de formatação */}
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "5px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor:
                            getStatusClass(usuario.status) === "status-admin" 
                              ? "#cce7ff" 
                              : getStatusClass(usuario.status) === "status-instructor"
                              ? "#fff3cd"
                              : "#d4edda",
                          color:
                            getStatusClass(usuario.status) === "status-admin" 
                              ? "#004085" 
                              : getStatusClass(usuario.status) === "status-instructor"
                              ? "#856404"
                              : "#153f57ff",
                          textTransform: "uppercase",
                        }}
                      >
                        {formatStatus(usuario.status)}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          justifyContent: "center",
                        }}
                      >
                        <Link
                          to={`/editar/${usuario.id_usuarios}`}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#3498db",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "5px",
                            fontSize: "14px",
                          }}
                        >
                          ✏️ Editar
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(usuario.id_usuarios, usuario.nome)
                          }
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#e74c3c",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#666",
            fontSize: "14px",
          }}
        >
          <p>Total de usuários: {usuarios.length}</p>
          <p style={{ fontSize: "12px", marginTop: "5px" }}>
            {masked
              ? "Dados sensíveis estão mascarados para proteção de privacidade"
              : "Dados sensíveis estão visíveis - use com cautela"}
          </p>
        </div>
      </div>
    </div>
  );
};

// estilos reutilizáveis
const thStyle = {
  padding: "15px",
  textAlign: "left",
  fontWeight: "bold",
};
const thStyleCenter = {
  ...thStyle,
  textAlign: "center",
};
const tdStyle = {
  padding: "12px",
  fontSize: "14px",
};

export default UsuarioList;