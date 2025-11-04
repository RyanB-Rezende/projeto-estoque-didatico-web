import React, { useEffect, useMemo, useRef, useState } from 'react';

// Overlay panel to control sorting and facet filters
// Props:
// - open: boolean
// - onClose: fn
// - sort: { key: 'recent'|'alpha'|'saldo', dir: 'asc'|'desc' }
// - onChangeSort: ({key, dir}) => void
// - medidaOptions: [{ value, label }]
// - selectedMedidas: Set|Array of values
// - onToggleMedida: (value:boolean) => void
export default function FilterPanel({
  open,
  onClose,
  sort = { key: 'recent', dir: 'desc' },
  onChangeSort,
  medidaOptions = [],
  selectedMedidas = [],
  onToggleMedida,
  saldoRange = { min: 0, max: 0 },
  selectedSaldo = null,
  onChangeSaldo,
}) {
  if (!open) return null;

  const selectedSet = new Set(Array.isArray(selectedMedidas) ? selectedMedidas : Array.from(selectedMedidas || []));

  const valMin = selectedSaldo?.min ?? saldoRange.min ?? 0;
  const valMax = selectedSaldo?.max ?? saldoRange.max ?? 0;

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
                <SortButton k="saldo" label="Estoque" />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="mb-2 small text-muted">Filtrar por Medida</div>
              <div className="d-flex flex-wrap gap-2">
                {medidaOptions.map(opt => (
                  <div key={opt.value} className="form-check me-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`medida-${opt.value}`}
                      checked={selectedSet.has(opt.value)}
                      onChange={() => onToggleMedida?.(opt.value)}
                    />
                    <label className="form-check-label" htmlFor={`medida-${opt.value}`}>{opt.label}</label>
                  </div>
                ))}
                {medidaOptions.length === 0 && (
                  <span className="text-muted small">Nenhuma medida disponível</span>
                )}
              </div>
              {/* Dual range abaixo da medida */}
              <div className="mt-3">
                <div className="mb-2 small text-muted">Filtrar por Estoque (Saldo)</div>
                <DualRange
                  min={saldoRange.min ?? 0}
                  max={saldoRange.max ?? 0}
                  minValue={valMin}
                  maxValue={valMax}
                  onChange={(nextMin, nextMax) => onChangeSaldo?.({ min: nextMin, max: nextMax })}
                />
                {/* Inputs escondidos para acessibilidade/testes */}
                <input
                  aria-label="Estoque mínimo"
                  type="range"
                  min={saldoRange.min ?? 0}
                  max={saldoRange.max ?? 0}
                  value={valMin}
                  onChange={(e)=>{
                    const nextMin = Math.min(Number(e.target.value), valMax);
                    onChangeSaldo?.({ min: nextMin, max: valMax });
                  }}
                  style={{ position:'absolute', opacity:0, pointerEvents:'none', width:0, height:0 }}
                />
                <input
                  aria-label="Estoque máximo"
                  type="range"
                  min={saldoRange.min ?? 0}
                  max={saldoRange.max ?? 0}
                  value={valMax}
                  onChange={(e)=>{
                    const nextMax = Math.max(Number(e.target.value), valMin);
                    onChangeSaldo?.({ min: valMin, max: nextMax });
                  }}
                  style={{ position:'absolute', opacity:0, pointerEvents:'none', width:0, height:0 }}
                />
                <div className="d-flex justify-content-between small text-muted mt-2">
                  <span>{valMin}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={()=> onChangeSaldo?.({ min: saldoRange.min ?? 0, max: saldoRange.max ?? 0 })}
                  >
                    Limpar
                  </button>
                  <span>{valMax}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dual-handle slider: drag-only on the thumbs, no track click moves
function DualRange({ min = 0, max = 0, minValue, maxValue, onChange }) {
  const trackRef = useRef(null);
  const [drag, setDrag] = useState(null); // 'min' | 'max' | null

  const range = Math.max(0, max - min);
  const clamp = (v) => Math.min(max, Math.max(min, v));

  const percentFromValue = (v) => {
    if (range === 0) return 0;
    return ((v - min) / range) * 100;
  };

  const onPointerMove = (clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (clientX - rect.left) / rect.width;
    const raw = min + ratio * range;
    const value = clamp(Math.round(raw));
    if (drag === 'min') {
      const nextMin = Math.min(value, maxValue);
      if (nextMin !== minValue) onChange?.(nextMin, maxValue);
    } else if (drag === 'max') {
      const nextMax = Math.max(value, minValue);
      if (nextMax !== maxValue) onChange?.(minValue, nextMax);
    }
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!drag) return;
      e.preventDefault();
      onPointerMove(e.clientX);
    };
    const onMouseUp = () => setDrag(null);
    if (drag) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp, { once: true });
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [drag, min, max, minValue, maxValue]);

  // Touch support
  useEffect(() => {
    const onTouchMove = (e) => {
      if (!drag) return;
      const t = e.touches[0];
      if (!t) return;
      onPointerMove(t.clientX);
    };
    const onTouchEnd = () => setDrag(null);
    if (drag) {
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd, { once: true });
    }
    return () => window.removeEventListener('touchmove', onTouchMove);
  }, [drag, min, max, minValue, maxValue]);

  const leftPct = percentFromValue(minValue);
  const rightPct = percentFromValue(maxValue);
  const widthPct = Math.max(0, rightPct - leftPct);

  const sharedThumbProps = {
    type: 'button',
    className: 'btn p-0 border-0',
    style: {
      position: 'absolute',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: '#0d6efd',
      cursor: 'grab',
      boxShadow: '0 0 0 2px #fff',
    },
  };

  return (
    <div style={{ padding: '8px 6px' }}>
      <div
        ref={trackRef}
        className="dual-range-track"
        style={{ position:'relative', height: 24, userSelect:'none' }}
      >
        <div
          style={{ position:'absolute', left:0, right:0, top:'50%', height:6, transform:'translateY(-50%)', background:'#e9ecef', borderRadius:4 }}
        />
        <div
          style={{ position:'absolute', left:`${leftPct}%`, width:`${widthPct}%`, top:'50%', height:6, transform:'translateY(-50%)', background:'#0d6efd', borderRadius:4 }}
        />
        <button
          aria-label="Thumb mínimo"
          {...sharedThumbProps}
          style={{ ...sharedThumbProps.style, left: `${leftPct}%` }}
          onMouseDown={(e)=>{ e.preventDefault(); setDrag('min'); }}
          onTouchStart={(e)=>{ e.preventDefault(); setDrag('min'); }}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={maxValue}
          aria-valuenow={minValue}
        />
        <button
          aria-label="Thumb máximo"
          {...sharedThumbProps}
          style={{ ...sharedThumbProps.style, left: `${rightPct}%` }}
          onMouseDown={(e)=>{ e.preventDefault(); setDrag('max'); }}
          onTouchStart={(e)=>{ e.preventDefault(); setDrag('max'); }}
          role="slider"
          aria-valuemin={minValue}
          aria-valuemax={max}
          aria-valuenow={maxValue}
        />
      </div>
    </div>
  );
}
