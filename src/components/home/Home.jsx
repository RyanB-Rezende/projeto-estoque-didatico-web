import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getSession } from '../../services/login/authService';

// Home com atalhos para todas as listas e uma seção de progresso simples.
export default function Home() {
  const session = getSession();
  const role = (session?.user?.status || '').toString().toLowerCase();

  const isInstrutor = role.includes('instrutor');
  const isAdmin = role.includes('admin');

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
        { to: '/produtos', label: 'Lista de Produtos', icon: 'bi-box' },
        { to: '/usuarios', label: 'Lista de Usuários', icon: 'bi-people' },
        { to: '/cursos', label: 'Lista de Cursos', icon: 'bi-journal-bookmark' },
      );
    }
    return base;
  }, [isInstrutor, isAdmin]);

  return (
    <div>
      <header style={{ backgroundColor: '#0a84ff', color: 'white', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Painel de Controle</h1>
      </header>

      <main style={{ padding: '24px', backgroundColor: '#fbf2f7', minHeight: 'calc(100vh - 40px)' }}>
        <h2 style={{ marginBottom: 16 }}>Atalhos</h2>

        {/* Botões pequenos para cada lista */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, maxWidth: 900, margin: '0 auto' }}>
          {shortcuts.map((s, idx) => (
            <Link key={idx} to={s.to} style={{ textDecoration: 'none' }}>
              <button type="button" className="btn btn-outline-primary btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', justifyContent: 'center' }}>
                <i className={`bi ${s.icon}`} aria-hidden="true" />
                <span>{s.label}</span>
              </button>
            </Link>
          ))}
        </div>

        {/* Seção de Progresso removida conforme solicitação */}
      </main>
    </div>
  );
}
