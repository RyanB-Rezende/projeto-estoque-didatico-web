import React, { useEffect, useState } from 'react';
import { getProdutos } from '../../services/produtos/produtosService';
import { fetchAllNotificacoes } from '../../services/notificacoes/notificacoesService';
import BackHomeButton from '../common/BackHomeButton';
import SearchBar from '../common/SearchBar';

// Admin-only page: shows combined notifications for products
// Types:
// - falta (saldo === 0) -> bg-danger-subtle
// - acabando (0 < saldo < 5) -> bg-warning-subtle
// - solicitacao (from notificacoes table) -> bg-success-subtle
export default function NotifyPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [term, setTerm] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [produtos, notifs] = await Promise.all([
          getProdutos(),
          fetchAllNotificacoes(),
        ]);
        const falta = (produtos || []).filter(p => Number(p.saldo ?? 0) === 0).map(p => ({
          type: 'falta',
          title: p.nome,
          detail: `Saldo: ${Number(p.saldo ?? 0)}`,
        }));
        const acab = (produtos || []).filter(p => {
          const s = Number(p.saldo ?? 0);
          return s > 0 && s < 5;
        }).map(p => ({ type: 'acabando', title: p.nome, detail: `Saldo: ${Number(p.saldo ?? 0)}` }));
        const solic = (notifs || []).map(n => ({
          type: 'solicitacao',
          title: n.produto_nome,
          detail: `Solicitado por ${n.solicitante_nome} - Quantidade: ${n.quantidade}`,
        }));
        setItems([...falta, ...acab, ...solic]);
      } catch (e) {
        setError('Não foi possível carregar notificações.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter(i => (i.title || '').toLowerCase().includes(term.toLowerCase()));

  const colorClass = (t) => t === 'falta' ? 'bg-danger-subtle' : t === 'acabando' ? 'bg-warning-subtle' : 'bg-success-subtle';
  const iconClass = (t) => t === 'falta' ? 'bi-exclamation-circle-fill text-danger' : t === 'acabando' ? 'bi-exclamation-triangle-fill text-warning' : 'bi-check2-circle text-success';

  if (loading) return <div className="text-center py-4">Carregando...</div>;
  if (error) return <div className="alert alert-danger" role="alert">{error}</div>;

  return (
    <div className="container mt-3">
      <div className="mb-3 shadow-sm bg-primary text-white px-3 py-2 rounded-bottom d-flex align-items-center gap-3">
        <div className="me-2"><BackHomeButton /></div>
        <h2 className="h6 mb-0 flex-grow-1">Notificações</h2>
      </div>

      <SearchBar placeholder="Pesquisar notificações..." onSearch={setTerm} showAddButton={false} />

      {filtered.length === 0 && (
        <div className="alert alert-info">Nenhuma notificação encontrada.</div>
      )}

      <div className="list-group">
        {filtered.map((i, idx) => (
          <div key={idx} className={`list-group-item d-flex align-items-center justify-content-between ${colorClass(i.type)}`}>
            <div>
              <div className="fw-semibold">{i.title}</div>
              <div className="small text-body-secondary">{i.detail}</div>
            </div>
            <i className={`bi ${iconClass(i.type)} fs-5`}></i>
          </div>
        ))}
      </div>
    </div>
  );
}
