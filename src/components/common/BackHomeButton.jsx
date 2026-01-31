import React from 'react';
import { Link, useInRouterContext } from 'react-router-dom';

// Botão de voltar para Home, sem recarregar a página quando houver Router.
// - Usa Link para "/home" quando dentro do Router (preserva sessão)
// - Fallback para <button> com history.back() fora do Router (ex.: nos testes)
export default function BackHomeButton({ label = 'Voltar' }) {
  // Hook deve ser chamado incondicionalmente para obedecer às regras dos Hooks
  const inRouter = useInRouterContext();

  const className = 'btn btn-outline-light btn-sm d-inline-flex align-items-center';
  const content = (
    <>
      <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>
      <span>{label}</span>
    </>
  );

  if (inRouter) {
    return (
      <Link to="/home" className={className} aria-label="Ir para Home">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} aria-label="Ir para Home" onClick={() => window.history.back()}>
      {content}
    </button>
  );
}
