import React from 'react';
import { Link } from 'react-router-dom';

// Home com atalhos para todas as listas e uma seção de progresso simples.
export default function Home() {
  const shortcuts = [
    { to: '/produtos', label: 'Lista de Produtos', icon: 'bi-box' },
    { to: '/usuarios', label: 'Lista de Usuários', icon: 'bi-people' },
    { to: '/cursos', label: 'Lista de Cursos', icon: 'bi-journal-bookmark' },
  ];

  return (
    <div>
      <header style={{ backgroundColor: '#0a84ff', color: 'white', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Painel de Controle</h1>
      </header>

      <main style={{ padding: '24px', backgroundColor: '#fbf2f7', minHeight: 'calc(100vh - 40px)' }}>
        <h2 style={{ marginBottom: 16 }}>Atalhos para Listas</h2>

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

        {/* Seção de Progresso (não relacionada diretamente a Cursos) */}
        <section aria-label="Progresso" style={{ maxWidth: 900, margin: '24px auto 0' }}>
          <h3 style={{ marginBottom: 12, textAlign: 'center' }}>Progresso</h3>

          {/* Cursos */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>Cursos</span>
              <span aria-label="percentual de cursos">68%</span>
            </div>
            <div style={{ height: 8, background: '#eee', borderRadius: 9999 }}>
              <div style={{ width: '68%', height: '100%', background: '#0a84ff', borderRadius: 9999 }} />
            </div>
          </div>

          {/* Outros campos */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>Outros</span>
              <span aria-label="percentual de outros">40%</span>
            </div>
            <div style={{ height: 8, background: '#eee', borderRadius: 9999 }}>
              <div style={{ width: '40%', height: '100%', background: '#6f42c1', borderRadius: 9999 }} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
