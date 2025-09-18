import React, { useEffect, useState } from 'react';
import { getCursos, deleteCurso } from '../../services/cursos/cursosService';
import CadastroCurso from './CadastroCurso';
import EditarCurso from './EditarCurso';
import ConfirmDialog from '../common/ConfirmDialog';
import SearchBar from '../common/SearchBar';

export default function CursoList() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null); // id do curso sendo editado
  const [confirming, setConfirming] = useState(null); // curso a excluir
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const loadCursos = async () => {
    try {
      const dados = await getCursos();
      setCursos(dados || []);
    } catch (e) {
      setError('Erro ao carregar cursos');
    }
  };

  useEffect(() => {
    (async () => {
      await loadCursos();
      setLoading(false);
    })();
  }, []);

  // Ajusta página quando a lista muda
  useEffect(() => {
    const filtered = searchTerm
      ? cursos.filter(c => (c.nome || '').toLowerCase().includes(searchTerm.toLowerCase()))
      : cursos;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > totalPages) setPage(totalPages);
  }, [cursos, searchTerm]);

  if (loading) return <div className="text-center py-4">Carregando...</div>;
  if (error) return <div className="alert alert-danger" role="alert">{error}</div>;

  return (
    <div className="container mt-3">
      <div className="mb-3 shadow-sm bg-primary text-white px-3 py-2 rounded-bottom d-flex align-items-center gap-3">
        <h2 className="h6 mb-0 flex-grow-1">Lista de Cursos</h2>
      </div>
      {/* Barra de busca com botão adicionar ao lado, como em ProdutoList */}
      <div className="mb-3 d-flex align-items-center gap-3">
        <div className="flex-grow-1">
          <SearchBar
            placeholder="Procurar cursos..."
            onSearch={setSearchTerm}
            showAddButton={false}
          />
        </div>
        <div>
          <button
            type="button"
            className="btn btn-warning fw-semibold rounded-4 px-4 py-2"
            onClick={() => setShowAdd(true)}
            aria-label="Adicionar curso"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Calcular filtro/paginação e renderizar tabela única */}
      {(() => {
        const filtered = searchTerm
          ? cursos.filter(c => (c.nome || '').toLowerCase().includes(searchTerm.toLowerCase()))
          : cursos;
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        const start = (page - 1) * PAGE_SIZE;
        const visible = filtered.slice(start, start + PAGE_SIZE);
        const noFilteredResults = filtered.length === 0 && cursos.length > 0;

        const goTo = (p) => {
          if (p >= 1 && p <= totalPages && p !== page) setPage(p);
        };

        return (
          <>
            {cursos.length === 0 && (
              <div className="alert alert-info my-3" role="alert">Nenhum curso cadastrado.</div>
            )}
            {noFilteredResults && (
              <div className="alert alert-warning py-2" role="status">Nenhum curso encontrado para "{searchTerm}"</div>
            )}
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Nome</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(c => (
                    <tr key={c.id_cursos}>
                      <td><strong>{c.nome}</strong></td>
                      <td className="text-end">
                        <div className="d-inline-flex justify-content-end gap-2">
                          <button type="button" className="btn btn-outline-primary btn-sm" title="Editar" onClick={()=>setEditing(c)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button type="button" className="btn btn-outline-danger btn-sm" title="Remover" onClick={()=>setConfirming(c)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação compacta */}
            {filtered.length > PAGE_SIZE && (
              <div className="mt-3 d-flex justify-content-center align-items-center gap-2" aria-label="Paginação de cursos">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={()=>goTo(page-1)}
                  disabled={page===1}
                  aria-label="Página anterior"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <span className="small fw-semibold" aria-live="polite">{page} / {totalPages}</span>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={()=>goTo(page+1)}
                  disabled={page===totalPages}
                  aria-label="Próxima página"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        );
      })()}
      {showAdd && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Cadastrar Curso</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowAdd(false)}></button>
                </div>
                <div className="modal-body">
                  <CadastroCurso asModal={false} onSubmit={async () => { setShowAdd(false); await loadCursos(); }} onCancel={() => setShowAdd(false)} />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {editing && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Editar Curso</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setEditing(null)}></button>
                </div>
                <div className="modal-body">
                  <EditarCurso id={editing.id_cursos} onSuccess={async ()=>{ setEditing(null); await loadCursos(); }} onCancel={()=>setEditing(null)} />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {confirming && (
        <ConfirmDialog
          title="Remover Curso"
          message={<span>Tem certeza que deseja remover <strong>{confirming.nome}</strong>?</span>}
          confirmLabel="Remover"
          cancelLabel="Cancelar"
          onCancel={()=>setConfirming(null)}
          onConfirm={async ()=>{ try { await deleteCurso(confirming.id_cursos); } finally { setConfirming(null); await loadCursos(); } }}
        />
      )}
    </div>
  );
}
