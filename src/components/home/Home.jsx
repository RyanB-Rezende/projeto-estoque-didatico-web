import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession } from '../../services/login/authService';
import { getProdutos } from '../../services/produtos/produtosService';
import SearchBar from '../common/SearchBar';

// Home com atalhos para todas as listas e uma seção de progresso simples.
export default function Home() {
  const session = getSession();
  const role = (session?.user?.status || '').toString().toLowerCase();

  const isInstrutor = role.includes('instrutor');
  const isAdmin = role.includes('admin');
  const navigate = useNavigate();

  // Produtos para "Visão Geral"
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFalta, setShowFalta] = useState(false);
  const [showAcabando, setShowAcabando] = useState(false);
  const [termFalta, setTermFalta] = useState('');
  const [termAcab, setTermAcab] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getProdutos();
        setProdutos(data || []);
      } catch (e) {
        setError('Não foi possível carregar produtos.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const shortcuts = useMemo(() => {
    const base = [];
    if (isInstrutor && !isAdmin) {
      base.push(
        { to: '/progresso', label: 'Progresso', icon: 'bi-graph-up' },
        { to: '/solicitacoes', label: 'Solicitações', icon: 'bi-inbox' }
      );
    } else {
      base.push(
        // Acesso do admin inclui atalhos de instrutor
        { to: '/progresso', label: 'Progresso', icon: 'bi-graph-up' },
        { to: '/solicitacoes', label: 'Solicitações', icon: 'bi-inbox' },
        { to: '/turmas', label: 'Lista de Turmas', icon: 'bi-collection' },
        { to: '/produtos', label: 'Lista de Produtos', icon: 'bi-box' },
        { to: '/usuarios', label: 'Lista de Usuários', icon: 'bi-people' },
        { to: '/cursos', label: 'Lista de Cursos', icon: 'bi-journal-bookmark' },
      );
    }
    return base;
  }, [isInstrutor, isAdmin]);

  // Derivados
  const totalProdutos = produtos.length;
  const produtosEmFalta = produtos.filter(p => Number(p.saldo ?? 0) === 0);
  const produtosAcabando = produtos.filter(p => {
    const s = Number(p.saldo ?? 0);
    return s > 0 && s < 5;
  });
  const faltaFiltrados = produtosEmFalta.filter(p => (p.nome || '').toLowerCase().includes(termFalta.toLowerCase()));
  const acabandoFiltrados = produtosAcabando.filter(p => (p.nome || '').toLowerCase().includes(termAcab.toLowerCase()));

  const Card = ({ title, value, gradient, onClick, accent }) => (
    <button type="button" onClick={onClick} className="w-100 text-start btn p-0 border-0 bg-transparent" aria-label={title}>
      <div className="rounded-4 shadow-sm p-4" style={{ background: gradient, minHeight: 120 }}>
        <div className="fw-semibold text-body-tertiary">{title}</div>
        <div className="display-6 fw-bold" style={{ color: accent }}>{value}</div>
      </div>
    </button>
  );

  return (
    <div>
      <header style={{ backgroundColor: '#0a84ff', color: 'white', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Painel de Controle</h1>
      </header>

      <main className="py-4" style={{ minHeight: 'calc(100vh - 40px)' }}>
        {/* Visão Geral */}
        <h2 className="h5 mb-3">Visão Geral</h2>
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-4">
            <Card title="Total de Produtos" value={loading ? '—' : totalProdutos} gradient="linear-gradient(135deg, #fff2d8, #ffffff)" accent="#f6a400" onClick={() => navigate('/produtos')} />
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <Card title="Produtos em Falta" value={loading ? '—' : produtosEmFalta.length} gradient="linear-gradient(135deg, #ffe1e1, #ffffff)" accent="#ff4b4b" onClick={() => { setShowFalta(v => !v); setShowAcabando(false); }} />
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <Card title="Produtos Acabando" value={loading ? '—' : produtosAcabando.length} gradient="linear-gradient(135deg, #fff8d6, #ffffff)" accent="#c9b400" onClick={() => { setShowAcabando(v => !v); setShowFalta(false); }} />
          </div>
        </div>

        {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

        {/* Ações Rápidas em grade Bootstrap, 3 por linha */}
        <h2 className="h5 mb-3">Ações Rápidas</h2>
        <div className="row g-3 mb-4">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="col-12 col-sm-6 col-lg-4">
              <Link to={s.to} className="text-decoration-none">
                <button type="button" className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 py-3">
                  <i className={`bi ${s.icon}`} aria-hidden="true" />
                  <span>{s.label}</span>
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Painéis Expansíveis abaixo das ações rápidas */}
        {showFalta && (
          <section className="mb-4 rounded-4 p-3 shadow-sm bg-light" aria-label="Produtos em Falta">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="h6 mb-0">Produtos em Falta</h3>
              <button className="btn btn-sm btn-link" onClick={() => setShowFalta(false)} aria-label="Fechar lista"><i className="bi bi-x-lg"></i></button>
            </div>
            <SearchBar placeholder="Pesquisar produtos..." onSearch={setTermFalta} showAddButton={false} />
            <div className="list-group list-group-flush">
              {faltaFiltrados.map(p => (
                <div key={p.id_produtos} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">{p.nome}</div>
                    <div className="small text-body-secondary">Saldo: {Number(p.saldo ?? 0)}</div>
                  </div>
                  <span className="text-danger" title="Em falta"><i className="bi bi-exclamation-circle-fill"></i></span>
                </div>
              ))}
              {faltaFiltrados.length === 0 && <div className="text-center text-body-secondary py-3">Nenhum item encontrado.</div>}
            </div>
          </section>
        )}

        {showAcabando && (
          <section className="mb-4 rounded-4 p-3 shadow-sm bg-light" aria-label="Produtos Acabando">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="h6 mb-0">Produtos Acabando</h3>
              <button className="btn btn-sm btn-link" onClick={() => setShowAcabando(false)} aria-label="Fechar lista"><i className="bi bi-x-lg"></i></button>
            </div>
            <SearchBar placeholder="Pesquisar produtos..." onSearch={setTermAcab} showAddButton={false} />
            <div className="list-group list-group-flush">
              {acabandoFiltrados.map(p => (
                <div key={p.id_produtos} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">{p.nome}</div>
                    <div className="small text-body-secondary">Saldo: {Number(p.saldo ?? 0)}</div>
                  </div>
                  <span className="text-warning" title="Atenção"><i className="bi bi-exclamation-triangle-fill"></i></span>
                </div>
              ))}
              {acabandoFiltrados.length === 0 && <div className="text-center text-body-secondary py-3">Nenhum item encontrado.</div>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
