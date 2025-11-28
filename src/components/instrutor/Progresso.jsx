import React, { useEffect, useMemo, useState } from 'react';
import BackHomeButton from '../common/BackHomeButton';
import { getSession } from '../../services/login/authService';
import { fetchNotificacoesByUser, fetchAllNotificacoes, updateNotificacaoStatus } from '../../services/notificacoes/notificacoesService';
import { getProdutos } from '../../services/produtos/produtosService';
import FilterPanel from '../common/filters/FilterPanel';
import { filterByTerm } from '../common/filters/searchUtils';
import { sortItems, cmpString, cmpDateOrId } from '../common/filters/sortUtils';

const STATUS_LABEL = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  parcial: 'Parcial',
  recusado: 'Recusado',
};

const STATUS_BADGE = {
  pendente: 'warning',
  aprovado: 'success',
  parcial: 'info',
  recusado: 'danger',
};

export default function Progresso() {
  const session = getSession();
  const solicitanteNome = session?.user?.nome || 'Usuário';
  const role = (session?.user?.status || '').toString().toLowerCase();
  const isAdmin = role.includes('admin');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [produtosMap, setProdutosMap] = useState({}); // nome -> saldo
  const [search, setSearch] = useState('');
  // Filtros no painel (mesmo padrão de outras telas)
  const [sort, setSort] = useState({ key: 'recent', dir: 'desc' });
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = isAdmin ? await fetchAllNotificacoes() : await fetchNotificacoesByUser(solicitanteNome);
        setItems(Array.isArray(data) ? data : []);
        if (isAdmin) {
          const produtos = await getProdutos();
            const map = {};
            produtos.forEach(p=>{ map[p.nome] = p.saldo; });
            setProdutosMap(map);
        }
      } catch (e) {
        setError('Erro ao carregar solicitações');
      } finally {
        setLoading(false);
      }
    })();
  }, [solicitanteNome, isAdmin]);

  // status facet options to reuse FilterPanel's UI
  const statusOptions = useMemo(() => ([
    { value: 'pendente', label: 'Pendentes' },
    { value: 'aprovado', label: 'Aprovadas' },
    { value: 'parcial', label: 'Parciais' },
    { value: 'recusado', label: 'Recusadas' },
  ]), []);

  const list = useMemo(() => {
    // busca por produto_nome
    const bySearch = filterByTerm(items, search, [n => n?.produto_nome]);
    // facet status (se nada marcado, mantém todos)
    const byStatus = (selectedStatus && selectedStatus.size > 0)
      ? bySearch.filter(n => selectedStatus.has(n.status))
      : bySearch;
    // ordenação: recent/alpha
    const comparator = (
      sort.key === 'alpha' ? cmpString(n=>n.produto_nome, sort.dir==='asc'?1:-1)
      : cmpDateOrId(n=> n.data_solicitacao ?? n.id_notificacao, sort.dir==='asc'?1:-1)
    );
    return sortItems(byStatus, comparator);
  }, [items, search, selectedStatus, sort]);

  // Modal para aprovação administrativa
  const [modal, setModal] = useState({ open:false, item:null, status:'aprovado', quantidadeAprovada:'', observacao:'', saving:false });
  const abrirModal = (item) => {
    if (!isAdmin) return;
    setModal({
      open:true,
      item,
      status: item.status === 'pendente' ? 'aprovado' : item.status,
      quantidadeAprovada: item.quantidade_aprovada ?? '',
      observacao: item.observacao ?? '',
      saving:false
    });
  };
  const fecharModal = () => setModal({ open:false, item:null, status:'aprovado', quantidadeAprovada:'', observacao:'', saving:false });

  const salvarAprovacao = async () => {
    if (!modal.item) return;
    let { status, quantidadeAprovada, observacao } = modal;
    const solicitada = Number(modal.item.quantidade) || 0;
    let qtdAprovada = null;
    if (status === 'aprovado') {
      qtdAprovada = solicitada;
    } else if (status === 'parcial') {
      const v = Number(quantidadeAprovada);
      if (!v || v <= 0 || v > solicitada) {
        alert('Quantidade aprovada parcial inválida.');
        return;
      }
      qtdAprovada = v;
    } else if (status === 'recusado') {
      qtdAprovada = null;
    }
    try {
      setModal(m=>({...m, saving:true}));
      await updateNotificacaoStatus(modal.item.id_notificacao, { status, observacao, quantidadeAprovada: qtdAprovada });
      fecharModal();
      // refresh list
      setLoading(true);
      const data = isAdmin ? await fetchAllNotificacoes() : await fetchNotificacoesByUser(solicitanteNome);
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (e) {
      alert('Erro ao atualizar solicitação');
      setModal(m=>({...m, saving:false}));
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0a6ad9,#0d8afc)' }}>
      <div className="container py-3">
        <div className="d-flex align-items-center mb-3" style={{background:'#0d6efd', color:'#fff', borderRadius:'0 0 16px 16px', padding:'10px 16px'}}>
          <div className="me-2"><BackHomeButton /></div>
          <h2 className="h5 mb-0 flex-grow-1 text-center">Progresso</h2>
        </div>

        {/* Barra de busca + botão de filtros (caixas brancas) */}
        <div className="mb-3" style={{background:'#ffffff', borderRadius:'30px', padding:'10px 14px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', display:'flex', alignItems:'center', gap:'10px'}}>
          <i className="bi bi-search text-primary"></i>
          <input
            type="text"
            className="form-control border-0 bg-transparent"
            placeholder="Procurar solicitações por produto..."
            value={search}
            onChange={(e)=> setSearch(e.target.value)}
            style={{boxShadow:'none'}}
          />
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={()=> setFilterOpen(true)}>Filtros</button>
        </div>

        <div className="bg-white rounded-4 shadow-sm p-0">
          {loading && (
            <div className="text-center py-5">Carregando...</div>
          )}
          {(!loading && error) && (
            <div className="alert alert-danger m-3" role="alert">{error}</div>
          )}
          {(!loading && !error && list.length === 0) && (
            <div className="text-center text-muted py-5">Nenhuma solicitação encontrada.</div>
          )}
          {(!loading && !error && list.length > 0) && (
            <div className="list-group list-group-flush">
              {list.map(n => (
                <div
                  key={n.id_notificacao || `${n.produto_nome}-${n.data_solicitacao}`}
                  className="list-group-item py-3"
                  style={{border:'none', cursor: isAdmin ? 'pointer' : 'default'}}
                  onClick={()=> abrirModal(n)}
                  title={isAdmin ? 'Avaliar solicitação' : undefined}
                >
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="d-flex align-items-start gap-3">
                      <div className="rounded-3" style={{background:'rgba(13,110,253,0.10)', padding:12}}>
                        <i className="bi bi-bell text-primary"></i>
                      </div>
                      <div>
                        <div className="fw-semibold">{n.produto_nome}</div>
                        <div className="text-muted small">
                          Solicitado: <strong>{n.quantidade}</strong>
                          {typeof n.quantidade_aprovada === 'number' && (
                            <>
                              {' '}| Aprovado: <strong>{n.quantidade_aprovada}</strong>
                            </>
                          )}
                          {' '}| {new Date(n.data_solicitacao).toLocaleString()}
                        </div>
                        {isAdmin && (
                          <div className="small">Solicitante: {n.solicitante_nome} ({n.solicitante_cargo})</div>
                        )}
                        {n.observacao && <div className="small mt-1"><em>Obs:</em> {n.observacao}</div>}
                      </div>
                    </div>
                    <span className={`badge text-bg-${STATUS_BADGE[n.status] || 'secondary'}`}>{STATUS_LABEL[n.status] || n.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Painel de filtros reutilizando o componente padrão */}
        <FilterPanel
          open={filterOpen}
          onClose={()=> setFilterOpen(false)}
          sort={sort}
          onChangeSort={setSort}
          medidaOptions={statusOptions}
          selectedMedidas={[...selectedStatus]}
          onToggleMedida={(val)=>{
            setSelectedStatus(prev => {
              const next = new Set(prev);
              if (next.has(val)) next.delete(val); else next.add(val);
              return next;
            });
          }}
          saldoRange={{ min:0, max:0 }}
          selectedSaldo={null}
          onChangeSaldo={undefined}
          facetLabel="Filtrar por Status"
          showSaldoSort={false}
        />
      </div>
      {modal.open && modal.item && isAdmin && (
        <div role="dialog" aria-modal="true" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:3100, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="bg-white rounded-4 shadow" style={{width:'min(440px, 92vw)', padding:0}}>
            <div className="p-4" style={{background:'#f5f2fa', borderRadius:'16px'}}>
              <h5 className="mb-3" style={{fontWeight:600}}>Atualizar Solicitação</h5>
              <div className="mb-3 small">
                <strong>Produto:</strong> {modal.item.produto_nome}<br />
                Quantidade solicitada: {modal.item.quantidade}<br />
                Saldo disponível: {produtosMap[modal.item.produto_nome] ?? '—'}
              </div>
              <div className="mb-3 small">Status:</div>
              <div className="d-flex flex-column gap-2 mb-3">
                {['aprovado','parcial','recusado'].map(s => (
                  <label key={s} className="d-flex align-items-center gap-2" style={{background: modal.status===s? '#ece8f3':'#f5f2fa', padding:'8px 10px', borderRadius:8}}>
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={modal.status===s}
                      onChange={()=> setModal(m=>({...m, status:s}))}
                    />
                    <span>{s==='aprovado' ? 'Aprovado' : s==='parcial' ? 'Aprovado Parcialmente' : 'Recusado'}</span>
                  </label>
                ))}
              </div>
              {modal.status==='parcial' && (
                <div className="mb-3">
                  <label className="form-label small">Quantidade Aprovada</label>
                  <input
                    type="number"
                    min={1}
                    max={modal.item.quantidade}
                    className="form-control"
                    value={modal.quantidadeAprovada}
                    onChange={(e)=> setModal(m=>({...m, quantidadeAprovada:e.target.value}))}
                  />
                  <div className="form-text">Máx: {modal.item.quantidade}</div>
                </div>
              )}
              <div className="mb-4">
                <label className="form-label small">Observação</label>
                <textarea
                  rows={3}
                  className="form-control"
                  value={modal.observacao}
                  onChange={(e)=> setModal(m=>({...m, observacao:e.target.value}))}
                  placeholder="Observação opcional"
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={fecharModal}>Cancelar</button>
                <button type="button" className="btn btn-primary" disabled={modal.saving} onClick={salvarAprovacao}>{modal.saving? 'Salvando...' : 'Salvar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
