import React from 'react';

// Generic sort filter control
// Props:
// - options: [{ value, label }]
// - value: current value
// - onChange: (value) => void
export default function SortFilter({ options = [], value, onChange }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <label htmlFor="sort-select" className="form-label me-2 mb-0 small">Ordenar por</label>
      <select
        id="sort-select"
        aria-label="Ordenar por"
        className="form-select form-select-sm w-auto"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        data-testid="sort-select"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
