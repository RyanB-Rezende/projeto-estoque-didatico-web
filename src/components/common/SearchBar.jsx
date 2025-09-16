import React, { useState, useEffect } from 'react';

// SearchBar reutilizável
// Props:
//  - placeholder (string)
//  - onSearch(term) chamado em debounce (default 300ms)
//  - onAdd() callback do botão Adicionar
//  - initialValue valor inicial
//  - debounceMs tempo de debounce
export default function SearchBar({
	placeholder = 'Procurar produtos...',
	onSearch = () => {},
	onAdd = () => {},
	initialValue = '',
	debounceMs = 300,
	addLabel = 'Adicionar',
	showAddButton = true
}) {
	const [term, setTerm] = useState(initialValue);

	// Debounce da busca
	useEffect(() => {
		const h = setTimeout(() => {
			onSearch(term.trim());
		}, debounceMs);
		return () => clearTimeout(h);
	}, [term, debounceMs, onSearch]);

	return (
		<div className="searchbar-wrapper mb-3 d-flex align-items-center gap-3 bg-white rounded-pill shadow-sm px-4 py-3">
			{/* Área de input */}
			<div className="searchbar-inner d-flex align-items-center flex-grow-1 bg-primary bg-opacity-10 rounded-4 px-3 py-2">
				<span aria-hidden="true" className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-25 me-2" style={{width:38, height:38}}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e88e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
				</span>
				<input
					type="text"
					value={term}
					onChange={e => setTerm(e.target.value)}
					placeholder={placeholder}
					aria-label={placeholder}
					className="form-control border-0 bg-transparent shadow-none flex-grow-1 fw-medium ps-0"
					style={{fontSize:'0.95rem'}}
				/>
			</div>
			{showAddButton && (
				<div className="d-flex gap-2">
					<button
						type="button"
						onClick={onAdd}
						className="btn btn-warning btn-sm fw-semibold rounded-4 px-3 d-flex align-items-center"
						aria-label={addLabel}
						data-testid="add-button"
					>
						<span style={{fontSize:'0.85rem'}}>{addLabel}</span>
					</button>
				</div>
			)}
		</div>
	);
}

