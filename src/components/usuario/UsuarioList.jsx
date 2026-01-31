import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BackHomeButton from "../common/BackHomeButton";
import SearchBar from "../common/SearchBar";
import FilterPanel from "../common/filters/FilterPanel";
import { filterByTerm } from "../common/filters/searchUtils";
import { sortItems, cmpString, cmpDateOrId } from "../common/filters/sortUtils";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCargos, setSelectedCargos] = useState(new Set());
  const [sort, setSort] = useState({ key: 'recent', dir: 'desc' });
  const [filterOpen, setFilterOpen] = useState(false);

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

  // Classe do status (case-insensitive)
  const getStatusClass = (status) => {
    if (!status) return 'status-active';
    const s = status.toString().toLowerCase();
    if (s.includes('admin')) return 'status-admin';
    if (s.includes('instrutor')) return 'status-instructor';
    return 'status-active';
  };

  // Texto do status (ADMIN -> ADMINISTRAÇÃO; INSTRUTOR variants -> INSTRUTOR; demais uppercase)
  const formatStatus = (status) => {
    if (!status) return 'ATIVO';
    const s = status.toString().toLowerCase();
    if (s.includes('admin')) return 'ADMINISTRAÇÃO';
    if (s.includes('instrutor')) return 'INSTRUTOR';
    return status.toString().toUpperCase();
  };

  // (Status removido dos filtros conforme solicitação)

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
    <>
      <div className="container mt-3">
        {/* Header no mesmo padrão das outras telas */}
        <div
          className="mb-3 shadow-sm d-flex align-items-center"
          style={{
            background: 'linear-gradient(90deg,#0d6efd,#0a58ca)',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: '0 0 12px 12px',
            gap: '14px'
          }}
        >
          <div className="me-2"><BackHomeButton /></div>
          <h2 className="h6 mb-0 flex-grow-1" style={{letterSpacing:'0.4px'}}>Lista de Usuários</h2>
          <button
            type="button"
            className={masked ? 'btn btn-success btn-sm' : 'btn btn-warning btn-sm'}
            onClick={toggleMask}
            aria-pressed={!masked}
          >
            {masked ? 'Mostrar Dados' : 'Ocultar Dados'}
          </button>
        </div>

        {/* Barra de busca + ações alinhadas (igual ProdutoList) */}
        <div
          className="mb-3 d-flex align-items-center"
          style={{
            background:'#ffffff',
            borderRadius:'30px',
            padding:'10px 18px',
            boxShadow:'0 1px 3px rgba(0,0,0,0.08)',
            gap:'12px'
          }}
        >
          <div className="flex-grow-1">
            <SearchBar
              placeholder="Procurar por nome, email, CPF, telefone..."
              onSearch={setSearchTerm}
              showAddButton={false}
            />
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={()=> setFilterOpen(true)}
            aria-label="Filtrar e Ordenar"
          >
            Filtros
          </button>
          <Link
            to="/cadastro"
            className="btn btn-warning fw-semibold rounded-4 px-4"
            style={{height:'38px'}}
          >
            Adicionar
          </Link>
        </div>

          {(() => {
            // Opções dinâmicas de cargo
            const cargoSet = new Set(usuarios.map(u => (getNomeCargo(u) || '').trim()).filter(Boolean));
            const cargoOptions = [...cargoSet].sort().map(label => ({ value: label, label }));

            // Pipeline de filtro alinhado ao Produtos: search -> facets (cargo) -> sort
            const filteredTerm = filterByTerm(usuarios, searchTerm, [
              u => u?.nome,
              u => u?.email,
              u => u?.cpf,
              u => u?.telefone,
              u => getNomeCargo(u),
            ]);

            const facetByCargo = selectedCargos.size>0
              ? filteredTerm.filter(u => selectedCargos.has((getNomeCargo(u) || '').trim()))
              : filteredTerm;

            const comparator = (
              sort.key === 'alpha'
                ? cmpString(u=>u.nome, sort.dir==='asc'?1:-1)
                : cmpDateOrId(u=>u.id_usuarios, sort.dir==='asc'?1:-1)
            );
            const filteredUsuarios = sortItems(facetByCargo, comparator);
            const totalAfter = filteredUsuarios.length;
            const totalBefore = usuarios.length;

            // Painel de filtros: reutiliza o mesmo FilterPanel dos Produtos
            const panel = (
              <FilterPanel
                open={filterOpen}
                onClose={()=> setFilterOpen(false)}
                sort={sort}
                onChangeSort={setSort}
                medidaOptions={cargoOptions}
                selectedMedidas={[...selectedCargos]}
                onToggleMedida={(val)=> setSelectedCargos(prev=>{ const n=new Set(prev); if(n.has(val)) n.delete(val); else n.add(val); return n; })}
                facetLabel="Filtrar por Cargo"
                showSaldoSort={false}
              />
            );

            return (
              <>
                {panel}
        {/* Tabela */}
        {totalBefore === 0 ? (
          <div className="alert alert-info" role="alert">Nenhum usuário cadastrado.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>CPF</th>
                  <th>Cargo</th>
                  <th>Status</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id_usuarios}>
                    <td className="fw-semibold">{usuario.nome}</td>
                    <td>{masked ? maskEmail(usuario.email) : usuario.email}</td>
                    <td>{masked ? maskTelefone(usuario.telefone) : formatTelefone(usuario.telefone)}</td>
                    <td>{masked ? maskCPF(usuario.cpf) : formatCPF(usuario.cpf)}</td>
                    <td>{getNomeCargo(usuario)}</td>
                    <td>
                      <span
                        className="badge rounded-pill"
                        style={{
                          backgroundColor:
                            getStatusClass(usuario.status) === 'status-admin' ? '#cce7ff'
                              : getStatusClass(usuario.status) === 'status-instructor' ? '#fff3cd' : '#d4edda',
                          color:
                            getStatusClass(usuario.status) === 'status-admin' ? '#004085'
                              : getStatusClass(usuario.status) === 'status-instructor' ? '#856404' : '#153f57ff'
                        }}
                      >
                        {formatStatus(usuario.status)}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Link
                          to={`/usuarios/editar/${usuario.id_usuarios}`}
                          className="btn btn-outline-primary btn-sm"
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          title="Excluir"
                          onClick={() => handleDelete(usuario.id_usuarios, usuario.nome)}
                        >
                          <i className="bi bi-trash"></i>
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
          <p>Total de usuários: {totalAfter}</p>
          <p style={{ fontSize: "12px", marginTop: "5px" }}>
            {masked
              ? "Dados sensíveis estão mascarados para proteção de privacidade"
              : "Dados sensíveis estão visíveis - use com cautela"}
          </p>
        </div>
            </>
          );
        })()}

      </div>
    </>
  );
};

export default UsuarioList;