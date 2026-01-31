import React from 'react';

// Painel de filtros para Usuários
// Props:
// - open: boolean
// - onClose(): void
// - sort: { key: 'recent'|'alpha'|'status', dir: 'asc'|'desc' }
// - onChangeSort(next)
// - statusOptions: [{ value: 'ADMIN'|'INSTRUTOR'|'ATIVO', label: string }]
// - selectedStatuses: string[]
// - onToggleStatus(val)
// - cargoOptions: [{ value: string, label: string }]
// - selectedCargos: string[]
// - onToggleCargo(val)
export default function UserFilterPanel({
  open,
  onClose,
  sort,
  onChangeSort,
  statusOptions = [],
  selectedStatuses = [],
  onToggleStatus,
  cargoOptions = [],
  selectedCargos = [],
  onToggleCargo,
}) {
  if (!open) return null;

  const selectedCargoSet = new Set(Array.isArray(selectedCargos) ? selectedCargos : Array.from(selectedCargos || []));

  const SortButton = ({ k, label }) => (
    <button
      type="button"
      className={`btn btn-outline-primary btn-sm d-flex align-items-center justify-content-between w-100 ${sort.key===k ? 'active' : ''}`}
      aria-pressed={sort.key === k}
      onClick={() => {
        const nextDir = sort.key === k && sort.dir === 'asc' ? 'desc' : (sort.key === k && sort.dir === 'desc' ? 'asc' : 'asc');
        onChangeSort?.({ key: k, dir: nextDir });
      }}
      aria-label={`${label}${sort.key===k ? (sort.dir==='asc' ? ' (crescente)' : ' (decrescente)') : ''}`}
    >
      <span>{label}</span>
      {sort.key === k && <span className="ms-2">{sort.dir === 'asc' ? '↑' : '↓'}</span>}
    </button>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Painel de filtros"
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:2500, display:'flex', alignItems:'center', justifyContent:'center' }}
    >
      <div className="card shadow-lg" style={{ width:'min(720px, 92vw)' }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>Filtros e Ordenação</strong>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose} aria-label="Fechar filtros">Fechar</button>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="mb-2 small text-muted">Ordenar</div>
              <div className="d-grid gap-2">
                <SortButton k="recent" label="Recentes" />
                <SortButton k="alpha" label="Ordem alfabética" />
              </div>
            </div>
            <div className="col-12 col-md-6">
              {/* Status (opcional) */}
              {statusOptions && statusOptions.length > 0 && (
                <div className="mb-3">
                  <div className="mb-2 small text-muted">Filtrar por Status</div>
                  <div className="d-flex flex-wrap gap-2">
                    {statusOptions.map(opt => (
                      <div key={opt.value} className="form-check me-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`status-${opt.value}`}
                          checked={selectedStatuses.includes(opt.value)}
                          onChange={() => onToggleStatus?.(opt.value)}
                        />
                        <label className="form-check-label" htmlFor={`status-${opt.value}`}>{opt.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cargo */}
              <div>
                <div className="mb-2 small text-muted">Filtrar por Cargo</div>
                <div className="d-flex flex-wrap gap-2">
                  {cargoOptions.map(opt => (
                    <div key={opt.value} className="form-check me-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`cargo-${opt.value}`}
                        checked={selectedCargoSet.has(opt.value)}
                        onChange={() => onToggleCargo?.(opt.value)}
                      />
                      <label className="form-check-label" htmlFor={`cargo-${opt.value}`}>{opt.label}</label>
                    </div>
                  ))}
                  {cargoOptions.length === 0 && (
                    <span className="text-muted small">Nenhum cargo disponível</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
