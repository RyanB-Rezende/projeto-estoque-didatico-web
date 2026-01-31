import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BackHomeButton from '../common/BackHomeButton';
import { getSession } from '../../services/login/authService';
import { getProdutoById } from '../../services/produtos/produtosService';
import { insertMovimentacao, getMovimentacoesAll, getMovimentacoesByUsuario, applyMovimentacaoToProduto, clearAllMovimentacoes } from '../../services/movimentacao/movimentacaoService';

export default function MovimentacaoPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // id do produto
  const session = getSession();
  const isAdmin = (session?.user?.status || '').toLowerCase().includes('admin');
  const userId = session?.user?.id;

  const [produto, setProduto] = useState(null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tipo, setTipo] = useState('saida');
  const [quantidade, setQuantidade] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const p = await getProdutoById(id);
      setProduto(p);
      let movs = [];
      if (isAdmin) {
        movs = await getMovimentacoesAll();
      } else if (userId) {
        movs = await getMovimentacoesByUsuario(userId);
      }
      setMovimentacoes(movs);
      setError(null);
    } catch (e) {
      setError('Erro ao carregar movimentações');
    } finally {
      setLoading(false);
    }
  }, [id, isAdmin, userId]);

  useEffect(() => { load(); }, [load]);

  const registrar = async () => {
    if (!quantidade) { alert('Informe a quantidade'); return; }
    const q = Number(quantidade);
    if (isNaN(q) || q <= 0) { alert('Quantidade inválida'); return; }
    if (!userId) { alert('Sessão inválida'); return; }
    try {
      setSaving(true);
      await insertMovimentacao({
        id_produtos: Number(id),
        id_turma: null,
        id_usuarios: userId,
        quantidade: q,
        tipo,
        observacao: 'Registrado manualmente'
      });
      await applyMovimentacaoToProduto(Number(id), q, tipo);
      setQuantidade('');
      await load();
      alert('Movimentação registrada!');
    } catch (e) {
      alert('Erro ao registrar movimentação: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const limparTudo = async () => {
    if (!isAdmin) return;
    if (window.confirm('Limpar TODAS as movimentações?')) {
      try {
        await clearAllMovimentacoes();
        await load();
        alert('Movimentações limpas');
      } catch (e) {
        alert('Erro ao limpar: ' + e.message);
      }
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(to bottom,#0a6ad9,#0d8afc)', fontFamily:'Arial,sans-serif' }}>
      <div className="container py-3">
        {/* Header */}
        <div className="d-flex align-items-center mb-3" style={{background:'#0d6efd', color:'#fff', borderRadius:'0 0 16px 16px', padding:'10px 16px'}}>
          <div className="me-2"><BackHomeButton /></div>
          <h2 className="h5 mb-0 flex-grow-1 text-center">Movimentações</h2>
          {isAdmin && (
            <button type="button" className="btn btn-outline-light btn-sm" onClick={limparTudo} title="Limpar todas">
              <i className="bi bi-trash2"></i>
            </button>
          )}
        </div>

        {/* Form Nova Movimentação */}
        <div className="bg-white shadow-sm p-3 rounded-4 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-semibold mb-0">Nova Movimentação</h6>
            {produto && (
              <small className="text-muted">Produto: <strong>{produto.nome}</strong></small>
            )}
          </div>

          {/* Toggle tipo (Entrada/Saída) - compacto e divertido */}
          <div className="mb-3">
            <div className="btn-group w-100 rounded-pill overflow-hidden" role="group" aria-label="Tipo de movimentação">
              <input
                type="radio"
                className="btn-check"
                name="tipo"
                id="tipoEntrada"
                autoComplete="off"
                checked={tipo === 'entrada'}
                onChange={() => setTipo('entrada')}
              />
              <label
                className={`btn py-2 ${tipo === 'entrada' ? 'btn-success text-white' : 'btn-outline-success bg-white'}`}
                htmlFor="tipoEntrada"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                title="Entrada"
              >
                <i className={`bi ${tipo==='entrada' ? 'bi-arrow-down-circle' : 'bi-arrow-down-circle'} ${tipo==='entrada' ? 'wiggle' : ''}`}></i>
                Entrada
              </label>

              <input
                type="radio"
                className="btn-check"
                name="tipo"
                id="tipoSaida"
                autoComplete="off"
                checked={tipo === 'saida'}
                onChange={() => setTipo('saida')}
              />
              <label
                className={`btn py-2 ${tipo === 'saida' ? 'btn-danger text-white' : 'btn-outline-danger bg-white'}`}
                htmlFor="tipoSaida"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                title="Saída"
              >
                <i className={`bi ${tipo==='saida' ? 'bi-arrow-up-circle' : 'bi-arrow-up-circle'} ${tipo==='saida' ? 'wiggle' : ''}`}></i>
                Saída
              </label>
            </div>
            <style>{`
              @keyframes wiggle { 0% { transform: translateY(0); } 50% { transform: translateY(-2px); } 100% { transform: translateY(0); } }
              .wiggle { animation: wiggle .6s ease-in-out; }
            `}</style>
          </div>
          <input
            type="number"
            className="form-control mb-3"
            placeholder="Quantidade"
            value={quantidade}
            onChange={e=> setQuantidade(e.target.value)}
            min={1}
          />
          <button type="button" disabled={saving} onClick={registrar} className="btn btn-primary w-100">
            {saving ? 'Registrando...' : 'Registrar Movimentação'}
          </button>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-4 shadow-sm p-4" style={{minHeight:'300px'}}>
          {loading && <div className="text-center py-4">Carregando...</div>}
          {!loading && error && <div className="alert alert-danger" role="alert">{error}</div>}
          {!loading && !error && movimentacoes.length === 0 && (
            <div className="text-center text-muted" style={{padding:'40px 0'}}>
              <i className="bi bi-inbox-fill" style={{fontSize:'52px', opacity:0.35}}></i>
              <p className="mt-3 mb-0">Nenhuma movimentação encontrada</p>
            </div>
          )}
          {!loading && !error && movimentacoes.length > 0 && (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Qtd</th>
                    <th>Usuário</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentacoes.map(m => (
                    <tr key={m.id_movimentacao}>
                      <td>{m.id_movimentacao}</td>
                      <td>{new Date(m.data_saida).toLocaleString('pt-BR')}</td>
                      <td>
                        <span className={`badge rounded-pill ${m.tipo==='entrada'?'text-bg-success':'text-bg-danger'}`}>{m.tipo}</span>
                      </td>
                      <td>{m.quantidade}</td>
                      <td>{m.id_usuarios}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Voltar produto - destaque */}
        <div className="text-center mt-4 mb-2">
          <button
            type="button"
            className="btn btn-light btn-lg fw-semibold shadow rounded-pill px-4"
            style={{ display:'inline-flex', alignItems:'center', gap:8, border:'0', color:'#0d6efd' }}
            onClick={()=> navigate('/produtos')}
            aria-label="Voltar aos Produtos"
          >
            <i className="bi bi-arrow-left-circle"></i>
            Voltar aos Produtos
          </button>
        </div>
      </div>
    </div>
  );
}
