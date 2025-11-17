import React, { useEffect, useMemo, useState } from 'react';
import BackHomeButton from '../common/BackHomeButton';
import { getProdutos } from '../../services/produtos/produtosService';
import { getSession } from '../../services/login/authService';
import { insertNotificacao } from '../../services/notificacoes/notificacoesService';
import FilterPanel from '../common/filters/FilterPanel';
import { filterByTerm } from '../common/filters/searchUtils';
import { sortItems, cmpString, cmpNumber, cmpDateOrId } from '../common/filters/sortUtils';
import { getMedidas } from '../../services/produtos/produtosService';

export default function Solicitacoes() {
  const session = getSession();
  const solicitanteNome = session?.user?.nome || 'Usuário';
  const solicitanteCargo = (session?.user?.status || 'INSTRUTOR').toString();

  const [produtos, setProdutos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // {msg, variant}
  const [modal, setModal] = useState({ open: false, produto: null, qtd: '' , saving:false});

  // Filtros/ordenação (mesmos de Produtos)
  const [sort, setSort] = useState({ key: 'alpha', dir: 'asc' });
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedMedidas, setSelectedMedidas] = useState(new Set());
  const [saldoRange, setSaldoRange] = useState({ min: 0, max: 0 });
  const [selectedSaldo, setSelectedSaldo] = useState(null);
  const [saldoUserChanged, setSaldoUserChanged] = useState(false);
  const [medidasMap, setMedidasMap] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const items = await getProdutos();
        items.sort((a,b)=> String(a.nome).localeCompare(String(b.nome)));
        setProdutos(items);
      } catch (e) {
        setToast({ msg: 'Erro ao carregar produtos', variant: 'danger' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Carregar medidas para facet
  useEffect(() => {
    (async () => {
      try {
        const arr = await getMedidas();
        if (Array.isArray(arr)) {
          const map = {};
          arr.forEach(m => {
            const id = m.id_medida || m.id;
            const nome = m.medida || m.nome;
            if (id != null) map[id] = nome || String(id);
          });
          setMedidasMap(map);
        }
      } catch (_) {}
    })();
  }, []);

  // Faixa de saldo baseada na lista de produtos
  useEffect(() => {
    if (!produtos || produtos.length === 0) {
      setSaldoRange({ min: 0, max: 0 });
      setSelectedSaldo(null);
      return;
    }
    const saldos = produtos.map(p => Number(p.saldo) || 0);
    const min = Math.min(...saldos);
    const max = Math.max(...saldos);
    setSaldoRange({ min, max });
    setSelectedSaldo(prev => {
      if (!prev || !saldoUserChanged) return { min, max };
      return {
        min: Math.max(min, Math.min(prev.min, max)),
        max: Math.max(min, Math.min(prev.max, max)),
      };
    });
  }, [produtos]);

  // Lista visível após busca, facetas, faixa e ordenação
  const list = useMemo(() => {
    const filtered = filterByTerm(produtos, search, [p=>p?.nome, p=>p?.codigo]);
    const facetFiltered = (selectedMedidas && selectedMedidas.size>0)
      ? filtered.filter(p => selectedMedidas.has(p.medida))
      : filtered;
    const saldoFiltered = (selectedSaldo)
      ? facetFiltered.filter(p => {
        const s = Number(p.saldo) || 0;
        return s >= (selectedSaldo.min ?? saldoRange.min) && s <= (selectedSaldo.max ?? saldoRange.max);
      })
      : facetFiltered;
    const comparator = (
      sort.key === 'alpha' ? cmpString(p=>p.nome, sort.dir==='asc'?1:-1)
      : sort.key === 'saldo' ? cmpNumber(p=>p.saldo, sort.dir==='asc'?1:-1)
      : cmpDateOrId(p=> p.data_entrada ?? p.id_produtos, sort.dir==='asc'?1:-1)
    );
    return sortItems(saldoFiltered, comparator);
  }, [produtos, search, selectedMedidas, selectedSaldo, saldoRange, sort]);

  const abrirModal = (produto) => setModal({ open:true, produto, qtd:'', saving:false });
  const fecharModal = () => setModal({ open:false, produto:null, qtd:'', saving:false });

  const solicitar = async () => {
    if (!modal.produto) return;
    const qtd = Number(modal.qtd);
    if (!qtd || isNaN(qtd) || qtd <= 0) { setToast({msg:'Quantidade inválida', variant:'danger'}); return; }
    try {
      setModal(m=>({...m, saving:true}));
      await insertNotificacao({
        solicitante_nome: solicitanteNome,
        solicitante_cargo: solicitanteCargo,
        produto_nome: modal.produto.nome,
        quantidade: qtd,
        data_solicitacao: new Date(),
        lida: false,
        status: 'pendente',
      });
      setToast({ msg: `Solicitação de ${qtd} unidade(s) de ${modal.produto.nome} enviada.`, variant: 'success' });
      fecharModal();
    } catch (e) {
      setToast({ msg: 'Erro ao enviar solicitação', variant: 'danger' });
      setModal(m=>({...m, saving:false}));
    }
  };
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0a6ad9,#0d8afc)' }}>
      <div className="container py-3">
        <div className="d-flex align-items-center mb-3" style={{background:'#0d6efd', color:'#fff', borderRadius:'0 0 16px 16px', padding:'10px 16px'}}>
          <div className="me-2"><BackHomeButton /></div>
          <h2 className="h5 mb-0 flex-grow-1 text-center">Solicitações</h2>
        </div>

        {/* Busca */}
        <div className="mb-3">
          <div className="d-flex align-items-center rounded-4" style={{background:'#ffffff', padding:'10px 14px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
            <i className="bi bi-search text-primary me-2"></i>
            <input
              type="text"
              className="form-control border-0 bg-transparent"
              placeholder="Procurar produtos..."
              value={search}
              onChange={(e)=> setSearch(e.target.value)}
              style={{boxShadow:'none'}}
            />
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm ms-2"
              onClick={()=> setFilterOpen(true)}
              aria-label="Filtrar e Ordenar"
            >
              Filtros
            </button>
          </div>
        </div>

        <div className="bg-white rounded-4 shadow-sm p-2" style={{minHeight:300}}>
          {loading && <div className="text-center py-5">Carregando...</div>}
          {!loading && list.length===0 && <div className="text-center text-muted py-5">Nenhum produto encontrado</div>}
          {!loading && list.length>0 && (
            <div className="list-group list-group-flush">
              {list.map((p)=> (
                <div key={p.id_produtos} className="list-group-item py-3" style={{border:'none'}}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-3" style={{background:'rgba(13,110,253,0.10)', padding:12}}>
                        <i className="bi bi-box text-primary"></i>
                      </div>
                      <div>
                        <div className="fw-semibold" style={{fontSize:15}}>{p.nome}</div>
                        <div className="text-muted small">Saldo: {p.saldo ?? 0}</div>
                      </div>
                    </div>
                    <button type="button" className="btn btn-warning d-flex align-items-center gap-2" onClick={()=> abrirModal(p)}>
                      <i className="bi bi-cart-plus"></i>
                      Solicitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div
            role="status"
            aria-live="polite"
            style={{position:'fixed', top:10, left:'50%', transform:'translateX(-50%)', background: toast.variant==='success'?'#198754':'#dc3545', color:'#fff', padding:'8px 16px', borderRadius:8, zIndex:4000}}
          >
            {toast.msg}
          </div>
        )}

        {/* Modal Solicitação */}
        {modal.open && modal.produto && (
          <div role="dialog" aria-modal="true" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <div className="bg-white rounded-4 shadow" style={{width:'min(920px, 96vw)'}}>
              <div className="p-3" style={{background:'#f2f0f8', borderRadius:'16px 16px 0 0'}}>
                <h5 className="mb-0" style={{color:'#0d6efd', fontWeight:700}}>Solicitar {modal.produto.nome}</h5>
              </div>
              <div className="p-3 p-md-4">
                <div className="rounded-3 d-flex align-items-center justify-content-center mb-3" style={{background:'rgba(13,110,253,0.15)', padding:'14px'}}>
                  <i className="bi bi-box text-primary me-2"></i>
                  <span className="fw-medium">Saldo atual: {modal.produto.saldo ?? 0}</span>
                </div>
                <label className="form-label small text-muted">Quantidade a solicitar</label>
                <div className="input-group mb-3">
                  <span className="input-group-text bg-white"><i className="bi bi-cart"></i></span>
                  <input type="number" min={1} className="form-control" value={modal.qtd} onChange={(e)=> setModal(m=>({...m, qtd:e.target.value}))} />
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-outline-secondary" onClick={fecharModal}>Cancelar</button>
                  <button type="button" className="btn btn-warning" disabled={modal.saving} onClick={solicitar}>{modal.saving? 'Enviando...' : 'Solicitar'}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Painel de filtros */}
        <FilterPanel
          open={filterOpen}
          onClose={()=> setFilterOpen(false)}
          sort={sort}
          onChangeSort={setSort}
          medidaOptions={Object.entries(medidasMap).map(([id,label])=> ({ value: isNaN(Number(id))? id : Number(id), label }))}
          selectedMedidas={[...selectedMedidas]}
          onToggleMedida={(val)=>{
            setSelectedMedidas(prev => {
              const next = new Set(prev);
              if (next.has(val)) next.delete(val); else next.add(val);
              return next;
            });
          }}
          saldoRange={saldoRange}
          selectedSaldo={selectedSaldo}
          onChangeSaldo={(next)=>{ setSelectedSaldo(next); setSaldoUserChanged(true); }}
        />
      </div>
    </div>
  );
}
