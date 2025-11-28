import React, { useEffect, useState } from 'react';
import { getTurmas, deleteTurma } from '../../services/turma/turmaService';
import CadastroTurma from './CadastroTurma';
import EditarTurma from './EditarTurma';
import ConfirmDialog from '../common/ConfirmDialog';
import SearchBar from '../common/SearchBar';
import BackHomeButton from '../common/BackHomeButton';
import FilterPanel from '../common/filters/FilterPanel';
import { sortItems, cmpString, cmpDateOrId } from '../common/filters/sortUtils';

export default function TurmaList() {
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: 'recent', dir: 'asc' });
  const [filterOpen, setFilterOpen] = useState(false);
  const PAGE_SIZE = 25;

  const loadTurmas = async () => {
    try {
      const dados = await getTurmas();
      setTurmas(dados || []);
    } catch (e) {
      setError('Erro ao carregar turmas');
    }
  };

  useEffect(() => {
    (async () => {
      await loadTurmas();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const filteredBase = searchTerm
      ? turmas.filter(t => (t.turma || t.nome || '').toLowerCase().includes(searchTerm.toLowerCase()))
      : turmas;
    const comparator = (
      sort.key === 'alpha'
        ? cmpString(t=> (t.turma || t.nome || ''), sort.dir==='asc'?1:-1)
        : cmpDateOrId(t=> t.id_turma, sort.dir==='asc'?1:-1)
    );
    const filtered = sortItems(filteredBase, comparator);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > totalPages) setPage(totalPages);
  }, [turmas, searchTerm, page]);

  if (loading) return <div className="text-center py-4">Carregando...</div>;
  if (error) return <div className="alert alert-danger" role="alert">{error}</div>;

  return (
    <div className="container mt-3">
      <div className="mb-3 shadow-sm bg-primary text-white px-3 py-2 rounded-bottom d-flex align-items-center gap-3">
        <div className="me-2"><BackHomeButton /></div>
        <h2 className="h6 mb-0 flex-grow-1">Lista de Turmas</h2>
      </div>
      <div className="mb-3 d-flex align-items-center gap-3">
        <div className="flex-grow-1">
          <SearchBar
            placeholder="Procurar turmas..."
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
        <div>
          <button
            type="button"
            className="btn btn-warning fw-semibold rounded-4 px-4 py-2"
            onClick={() => setShowAdd(true)}
            aria-label="Adicionar turma"
          >
            Adicionar
          </button>
        </div>
      </div>

      {(() => {
        const filteredBase = searchTerm
          ? turmas.filter(t => (t.turma || t.nome || '').toLowerCase().includes(searchTerm.toLowerCase()))
          : turmas;
        const comparator = (
          sort.key === 'alpha'
            ? cmpString(t=> (t.turma || t.nome || ''), sort.dir==='asc'?1:-1)
            : cmpDateOrId(t=> t.id_turma, sort.dir==='asc'?1:-1)
        );
        const filtered = sortItems(filteredBase, comparator);
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        const start = (page - 1) * PAGE_SIZE;
        const visible = filtered.slice(start, start + PAGE_SIZE);
        const noFilteredResults = filtered.length === 0 && turmas.length > 0;

        const goTo = (p) => { if (p >=1 && p <= totalPages && p !== page) setPage(p); };

        return (
          <>
            {turmas.length === 0 && (
              <div className="alert alert-info my-3" role="alert">Nenhuma turma cadastrada.</div>
            )}
            {noFilteredResults && (
              <div className="alert alert-warning py-2" role="status">Nenhuma turma encontrada para "{searchTerm}"</div>
            )}

            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Turma</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(t => (
                    <tr key={t.id_turma}>
                      <td><strong>{t.turma || t.nome}</strong></td>
                      <td className="text-end">
                        <div className="d-inline-flex justify-content-end gap-2">
                          <button type="button" className="btn btn-outline-primary btn-sm" title="Editar" onClick={()=>setEditing(t)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button type="button" className="btn btn-outline-danger btn-sm" title="Remover" onClick={()=>setConfirming(t)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length > PAGE_SIZE && (
              <div className="mt-3 d-flex justify-content-center align-items-center gap-2" aria-label="Paginação de turmas">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={()=>goTo(page-1)} disabled={page===1} aria-label="Página anterior">
                  <i className="bi bi-chevron-left"></i>
                </button>
                <span className="small fw-semibold" aria-live="polite">{page} / {totalPages}</span>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={()=>goTo(page+1)} disabled={page===totalPages} aria-label="Próxima página">
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        );
      })()}

      {showAdd && (
        <CadastroTurma asModal={true} onSubmit={async () => { setShowAdd(false); await loadTurmas(); }} onCancel={()=> setShowAdd(false)} />
      )}

      {confirming && (
        <ConfirmDialog
          title="Remover Turma"
          message={<span>Tem certeza que deseja remover <strong>{confirming.turma || confirming.nome}</strong>?</span>}
          confirmLabel="Remover"
          cancelLabel="Cancelar"
          onCancel={()=>setConfirming(null)}
          onConfirm={async ()=>{ try { await deleteTurma(confirming.id_turma); } finally { setConfirming(null); await loadTurmas(); } }}
        />
      )}

      {editing && (
        <EditarTurma
          turma={editing}
          onSuccess={async () => { setEditing(null); await loadTurmas(); }}
          onCancel={()=> setEditing(null)}
        />
      )}

      <FilterPanel
        open={filterOpen}
        onClose={()=> setFilterOpen(false)}
        sort={sort}
        onChangeSort={setSort}
        medidaOptions={[]}
        selectedMedidas={[]}
        onToggleMedida={()=>{}}
        facetLabel=""
        showSaldoSort={false}
      />
    </div>
  );
}
