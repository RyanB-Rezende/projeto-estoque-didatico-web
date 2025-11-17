import React from 'react';
import BackHomeButton from '../common/BackHomeButton';

export default function Progresso() {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0a6ad9,#0d8afc)' }}>
      <div className="container py-3">
        <div className="d-flex align-items-center mb-3" style={{background:'#0d6efd', color:'#fff', borderRadius:'0 0 16px 16px', padding:'10px 16px'}}>
          <div className="me-2"><BackHomeButton /></div>
          <h2 className="h5 mb-0 flex-grow-1 text-center">Progresso</h2>
        </div>
        <div className="bg-white rounded-4 shadow-sm p-4">
          <p className="mb-0 text-muted">Tela de Progresso (placeholder). Personalize métricas e gráficos aqui.</p>
        </div>
      </div>
    </div>
  );
}
