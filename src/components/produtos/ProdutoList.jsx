import { useEffect, useState } from 'react';
import { getProdutos, deleteProduto, getMedidas } from '../../services/produtos/produtosService';
import ConfirmDialog from '../common/ConfirmDialog';
import CadastroProduto from './CadastroProduto';
import EditarProduto from './EditarProduto';
import SearchBar from '../common/SearchBar';
import { filterByTerm } from '../common/filters/searchUtils';
import FilterPanel from '../common/filters/FilterPanel';
import BackHomeButton from '../common/BackHomeButton';
import { sortItems, cmpString, cmpNumber, cmpDateOrId } from '../common/filters/sortUtils';
import { getSession } from '../../services/login/authService';

// Componente de listagem simples de produtos (versão mínima para atender testes RED -> GREEN)
// Requisitos cobertos pelos testes:
//  - Mostrar mensagem "Nenhum produto cadastrado" quando lista vazia.
//  - Mostrar heading "Lista de Produtos" e uma tabela com produtos quando houver itens.
//  - Permitir remover produto ao clicar no botão com title="Remover" (atualiza lista).
// Campos básicos exibidos: nome, medida, saldo (demais simplificados ou placeholders).

export default function ProdutoList() {
	const session = getSession();
	const isAdmin = (session?.user?.status || '').toLowerCase().includes('admin');
	const [produtos, setProdutos] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showAdd, setShowAdd] = useState(false);
	const [page, setPage] = useState(1);
	const [toast, setToast] = useState(null); // {msg, variant}
	const [medidasMap, setMedidasMap] = useState({}); // { id: nome }
	const [confirming, setConfirming] = useState(null); // produto sendo confirmado para remoção
	const [editing, setEditing] = useState(null); // produto sendo editado
	const [sort, setSort] = useState({ key: 'recent', dir: 'desc' });
	const [filterOpen, setFilterOpen] = useState(false);
	const [selectedMedidas, setSelectedMedidas] = useState(new Set());
	const [saldoRange, setSaldoRange] = useState({ min: 0, max: 0 });
	const [selectedSaldo, setSelectedSaldo] = useState(null); // {min,max}
	const [saldoUserChanged, setSaldoUserChanged] = useState(false);
	const PAGE_SIZE = 25; // quantidade de produtos por página (ajuste conforme necessidade)

	// Carrega produtos (pode ser chamado para refresh silencioso)
	const loadProdutos = async () => {
		try {
			const data = await getProdutos();
			setProdutos(data || []);
		} catch (e) {
			setError('Erro ao carregar produtos');
		}
	};

	useEffect(() => {
		(async () => {
			await loadProdutos();
			setLoading(false);
		})();
	}, []);

	// Carrega nomes de medidas para exibir em vez do id
	useEffect(() => {
		(async () => {
			try {
				if (typeof getMedidas === 'function') {
					const arr = await getMedidas();
					if (Array.isArray(arr)) {
						const map = {};
						arr.forEach(m => {
							const id = m.id_medida || m.id;
							const nome = m.medida || m.nome;
							if (id != null) map[id] = nome || String(id);
						});
						setMedidasMap(map);
					}
				}
			} catch (e) {
				// silencioso
			}
		})();
	}, []);

	// Calcula faixa global de saldo ao carregar/atualizar produtos
	useEffect(() => {
		if (!produtos || produtos.length === 0) {
			setSaldoRange({ min: 0, max: 0 });
			setSelectedSaldo(null);
			return;
		}
		const saldos = produtos.map(p => Number(p.saldo) || 0);
		const min = Math.min(...saldos);
		const max = Math.max(...saldos);
		setSaldoRange({ min, max });
		setSelectedSaldo(prev => {
			if (!prev || !saldoUserChanged) return { min, max };
			return {
				min: Math.max(min, Math.min(prev.min, max)),
				max: Math.max(min, Math.min(prev.max, max)),
			};
		});
	}, [produtos]);

	// Garante que página atual sempre válida ao alterar lista
	useEffect(() => {
		const totalPages = Math.max(1, Math.ceil(produtos.length / PAGE_SIZE));
		if (page > totalPages) setPage(totalPages);
	}, [produtos, page]);

	const performDelete = async (p) => {
		try {
			await deleteProduto(p.id_produtos);
			// Refresh para garantir consistência (ex: remoção em backend com triggers)
			await loadProdutos();
			showToast(`Produto "${p.nome}" removido`, 'danger');
		} catch (e) {
			// Erro silencioso mínimo
		}
	};

	const requestDelete = (p) => setConfirming(p);
	const cancelDelete = () => setConfirming(null);
	const confirmDelete = async () => {
		if (confirming) {
			const target = confirming;
			setConfirming(null);
			await performDelete(target);
		}
	};

	const showToast = (msg, variant = 'success') => {
		setToast({ msg, variant });
		setTimeout(() => setToast(null), 3200);
	};

	// --- PDF ---
	const loadScript = (src) => new Promise((resolve, reject) => {
		const s = document.createElement('script');
		s.src = src;
		s.async = true;
		s.onload = resolve;
		s.onerror = () => reject(new Error('Falha ao carregar ' + src));
		document.head.appendChild(s);
	});

	const ensureJsPDF = async () => {
		if (!window.jspdf || !window.jspdf.jsPDF) {
			await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
		}
		if (!window.jspdf_AutoTable && !window.jspdf?.jsPDF?.API?.autoTable) {
			await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js');
		}
	};

	const handleExportPDF = async () => {
		try {
			await ensureJsPDF();
			const { jsPDF } = window.jspdf;
			const doc = new jsPDF({ unit: 'pt', format: 'a4' });
			const now = new Date();
			const pad2 = n => String(n).padStart(2, '0');
			const ts = `${pad2(now.getDate())}/${pad2(now.getMonth()+1)}/${now.getFullYear()} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

			// Header
			doc.setFontSize(12);
			doc.setFont(undefined, 'bold');
			doc.text('Relatório de Produtos', 40, 40);
			doc.setFont(undefined, 'normal');
			doc.setFontSize(10);
			doc.text(ts, doc.internal.pageSize.getWidth() - 40, 40, { align: 'right' });

			// Table data
			const headers = ['Código','Produto','Medida','Local','Entrada','Saída','Saldo'];
			const body = produtos.map(p => [
				p.codigo ?? '-',
				p.nome ?? '-',
				medidasMap[p.medida] || p.medida || '-',
				p.local ?? '-',
				String(p.entrada ?? 0),
				String(p.saida ?? 0),
				String(p.saldo ?? 0),
			]);

			const startY = 60;
			doc.autoTable({
				head: [headers],
				body,
				startY,
				styles: { fontSize: 9 },
				headStyles: { fillColor: [224,224,224], textColor: 20, fontStyle: 'bold' },
				columnStyles: {
					0: { cellWidth: 70 },
					1: { cellWidth: 'auto' },
					2: { cellWidth: 50 },
					3: { cellWidth: 'auto' },
					4: { cellWidth: 50, halign: 'right' },
					5: { cellWidth: 50, halign: 'right' },
					6: { cellWidth: 50, halign: 'right' },
				},
				margin: { left: 40, right: 40 },
			});

			doc.save('relatorio_produtos.pdf');
		} catch (e) {
			showToast('Falha ao gerar PDF', 'danger');
		}
	};

	const handleAddSuccess = async (novo) => {
		setShowAdd(false);
		showToast(`Produto "${novo?.nome || 'Novo'}" cadastrado`, 'success');
		// Recarrega mantendo a página atual; se nova página final surgir o user pode navegar manualmente
		await loadProdutos();
	};

	const handleEditSuccess = async (atualizado) => {
		setEditing(null);
		showToast(`Produto "${atualizado?.nome || 'Atualizado'}" atualizado`, 'success');
		await loadProdutos();
	};

	const headerStyles = {
		background: 'linear-gradient(90deg,#0d6efd,#0a58ca)',
		color: '#fff',
		padding: '10px 18px',
		borderRadius: '0 0 12px 12px',
		display: 'flex',
		alignItems: 'center',
		gap: '14px'
	};

	if (loading) {
		return <div className="text-center py-4">Carregando...</div>;
	}

	if (error) {
		return <div className="alert alert-danger" role="alert">{error}</div>;
	}

	if (!produtos.length) {
		return <>
			<div className="container alert alert-info my-3" role="alert">Nenhum produto cadastrado.</div>
			{toast && (
				<div
					role="status"
					aria-live="polite"
					data-testid="toast" data-variant={toast.variant}
					style={{
						position: 'fixed',
						top: '10px',
						left: '50%',
						transform: 'translate(-50%, 0)',
						background: toast.variant === 'success' ? '#198754' : toast.variant === 'danger' ? '#dc3545' : '#6c757d',
						color: '#fff',
						padding: '8px 16px',
						borderRadius: '8px',
						boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
						fontSize: '0.85rem',
						zIndex: 4000,
						animation: 'fadeSlide .45s ease'
					}}
				>
					{toast.msg}
					<style>{`@keyframes fadeSlide { from { opacity:0; transform:translate(-50%,-8px);} to { opacity:1; transform:translate(-50%,0);} }`}</style>
				</div>
			)}
		</>;
	}

		// Aplica filtro de busca (case-insensitive) antes da paginação usando util compartilhada
		const filtered = filterByTerm(produtos, searchTerm, [
			p => p?.nome,
			p => p?.codigo,
		]);

		// Paginação simples: determina fatia e total com base na lista filtrada
		// Aplica ordenação escolhida
		const comparator = (
			sort.key === 'alpha' ? cmpString(p=>p.nome, sort.dir==='asc'?1:-1)
			: sort.key === 'saldo' ? cmpNumber(p=>p.saldo, sort.dir==='asc'?1:-1)
			: cmpDateOrId(p=> p.data_entrada ?? p.id_produtos, sort.dir==='asc'?1:-1)
		);
		const facetFiltered = (selectedMedidas && selectedMedidas.size>0)
			? filtered.filter(p => selectedMedidas.has(p.medida))
			: filtered;

		// Aplica filtro por faixa de saldo, se configurado
		const saldoFiltered = (selectedSaldo)
			? facetFiltered.filter(p => {
				const s = Number(p.saldo) || 0;
				return s >= (selectedSaldo.min ?? saldoRange.min) && s <= (selectedSaldo.max ?? saldoRange.max);
			})
			: facetFiltered;
		const sorted = sortItems(saldoFiltered, comparator);
		const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
		const start = (page - 1) * PAGE_SIZE;
		const visible = sorted.slice(start, start + PAGE_SIZE);

		const noFilteredResults = filtered.length === 0 && produtos.length > 0;
		const goTo = async (p) => {
			if (p >= 1 && p <= totalPages && p !== page) {
				setPage(p);
				// Refresh ao trocar de página para dados sempre atualizados
				await loadProdutos();
			}
		};

		return (
		<>
		<div className="container mt-3">
			{/* Header estilizado */}
			<div style={headerStyles} className="mb-3 shadow-sm d-flex align-items-center">
				<div className="me-2"><BackHomeButton /></div>
				<h2 className="h6 mb-0 flex-grow-1" style={{letterSpacing:'0.4px'}}>Lista de Produtos</h2>
			</div>
			{isAdmin && (
				<div className="alert alert-primary py-2" role="note" style={{fontSize:'0.75rem'}}>
					Clique em uma linha de produto para registrar ou visualizar movimentações.
				</div>
			)}

			{/* Barra de busca com botão adicionar alinhado à direita (estilo card arredondado) */}
				<div className="mb-3" style={{background:'#ffffff', borderRadius:'30px', padding:'10px 18px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', display:'flex', alignItems:'center', gap:'12px'}}>
				<div className="flex-grow-1">
					<SearchBar
							placeholder="Procurar por nome ou código..."
						onSearch={setSearchTerm}
						showAddButton={false}
					/>
				</div>
					<button
						type="button"
						className="btn btn-outline-secondary btn-sm"
						onClick={()=> setFilterOpen(true)}
						aria-label="Filtrar e Ordenar"
					>
						Filtros
					</button>
					<button
						type="button"
						className="btn btn-outline-primary btn-sm"
						onClick={handleExportPDF}
						aria-label="Exportar PDF"
					>
						PDF
					</button>
				<button
					type="button"
					className="btn btn-warning fw-semibold rounded-4 px-4 d-flex align-items-center"
					style={{height:'48px'}}
					onClick={() => setShowAdd(true)}
					aria-label="Adicionar produto"
				>
					<span style={{fontSize:'0.85rem'}}>Adicionar</span>
				</button>
			</div>

			{noFilteredResults && (
				<div className="alert alert-warning py-2" role="status">Nenhum produto encontrado para "{searchTerm}"</div>
			)}

			<div className="table-responsive d-none d-md-block">
				<table className="table table-sm table-hover align-middle">
					<thead className="table-light">
						<tr>
							<th>Nome</th>
							<th style={{ width: '120px' }}>Código</th>
							<th style={{ width: '90px' }}>Medida</th>
							<th style={{ width: '100px' }}>Saldo</th>
							<th style={{ width: '90px' }} className="text-end">Ações</th>
						</tr>
					</thead>
						<tbody>
							{visible.map(p => (
								<tr
									key={p.id_produtos}
									onClick={() => { if (isAdmin) { try { window.location.assign(`/movimentacoes/${p.id_produtos}`); } catch(_) {} } }}
									style={isAdmin ? { cursor:'pointer' } : undefined}
									title={isAdmin ? 'Ver Movimentações' : undefined}
								>
									<td><strong>{p.nome}</strong></td>
									<td>{p.codigo ?? ''}</td>
									<td>{medidasMap[p.medida] || p.medida}</td>
									<td>{p.saldo}</td>
									<td className="text-end d-flex justify-content-end gap-2" onClick={e=> e.stopPropagation()}>
										<button
											type="button"
											className="btn btn-outline-primary btn-sm"
											title="Editar"
											onClick={(e) => { e.stopPropagation(); setEditing(p); }}
										>
											<i className="bi bi-pencil"></i>
										</button>
										<button
											type="button"
											className="btn btn-outline-danger btn-sm"
											title="Remover"
											onClick={(e) => { e.stopPropagation(); requestDelete(p); }}
										>
											<i className="bi bi-trash"></i>
										</button>
									</td>
								</tr>
							))}
						</tbody>
				</table>
			</div>
			{/* versão simplificada mobile (cards) */}
			<div className="d-md-none">
				<div className="row g-3">
					{visible.map(p => (
						<div key={p.id_produtos} className="col-12">
							<div className="card shadow-sm">
								<div className="card-body py-2">
									<div className="d-flex justify-content-between align-items-start">
										<div>
											<div className="fw-semibold small mb-1">{p.nome}</div>
											<div className="text-muted small">Saldo: {p.saldo}</div>
										</div>
										<div className="d-flex gap-2">
											<button
												className="btn btn-outline-primary btn-sm"
												aria-label={`Editar ${p.nome}`}
												onClick={() => setEditing(p)}
											>
												<i className="bi bi-pencil"></i>
											</button>
											<button
												className="btn btn-outline-danger btn-sm"
												aria-label={`Remover ${p.nome}`}
												onClick={() => requestDelete(p)}
											>
												<i className="bi bi-trash"></i>
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Modal sobreposto para adicionar produto */}
					{showAdd && (
						<div
							role="dialog"
							aria-modal="true"
							style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center'}}
						>
							<CadastroProduto asModal={false} onSubmit={handleAddSuccess} onCancel={()=>setShowAdd(false)} />
						</div>
					)}

					{editing && (
						<div
							role="dialog"
							aria-modal="true"
							style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:2100, display:'flex', alignItems:'center', justifyContent:'center'}}
						>
							<EditarProduto id={editing.id_produtos} asModal={false} onSuccess={handleEditSuccess} onCancel={()=>setEditing(null)} />
						</div>
					)}

							{/* Paginação compacta: seta esquerda, indicador e seta direita */}
							{produtos.length > PAGE_SIZE && (
								<div className="mt-3 d-flex justify-content-center align-items-center gap-2" aria-label="Paginação de produtos">
									<button
										type="button"
										className="btn btn-outline-secondary btn-sm"
										onClick={()=>goTo(page-1)}
										disabled={page===1}
										aria-label="Página anterior"
									>
										<i className="bi bi-chevron-left"></i>
									</button>
									<span className="small fw-semibold" aria-live="polite">{page} / {totalPages}</span>
									<button
										type="button"
										className="btn btn-outline-secondary btn-sm"
										onClick={()=>goTo(page+1)}
										disabled={page===totalPages}
										aria-label="Próxima página"
									>
										<i className="bi bi-chevron-right"></i>
									</button>
								</div>
							)}

							{/* Toast de feedback de cadastro */}
							{toast && (
								<div
									role="status"
									aria-live="polite"
									style={{
										position: 'fixed',
										top: '10px',
										left: '50%',
										transform: 'translate(-50%, 0)',
										background: toast.variant === 'success' ? '#198754' : toast.variant === 'danger' ? '#dc3545' : '#6c757d',
										color: '#fff',
										padding: '8px 16px',
										borderRadius: '8px',
										boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
										fontSize: '0.85rem',
										zIndex: 4000,
										animation: 'fadeSlide .45s ease'
									}}
								data-testid="toast" data-variant={toast.variant}>
									{toast.msg}
									<style>{`@keyframes fadeSlide { from { opacity:0; transform:translate(-50%,-8px);} to { opacity:1; transform:translate(-50%,0);} }`}</style>
								</div>
							)}
		</div>
		<FilterPanel
			open={filterOpen}
			onClose={()=> setFilterOpen(false)}
			sort={sort}
			onChangeSort={setSort}
			medidaOptions={Object.entries(medidasMap).map(([id,label])=> ({ value: isNaN(Number(id))? id : Number(id), label }))}
			selectedMedidas={[...selectedMedidas]}
			onToggleMedida={(val)=>{
				setSelectedMedidas(prev => {
					const next = new Set(prev);
					if (next.has(val)) next.delete(val); else next.add(val);
					return next;
				});
			}}
			saldoRange={saldoRange}
			selectedSaldo={selectedSaldo}
			onChangeSaldo={(next)=>{ setSelectedSaldo(next); setSaldoUserChanged(true); }}
		/>
		{confirming && (
			<ConfirmDialog
				title="Remover Produto"
				message={<span>Tem certeza que deseja remover <strong>{confirming.nome}</strong>? Essa ação não pode ser desfeita.</span>}
				confirmLabel="Remover"
				cancelLabel="Cancelar"
				onCancel={cancelDelete}
				onConfirm={confirmDelete}
			/>
		)}
	</>
	);
}

