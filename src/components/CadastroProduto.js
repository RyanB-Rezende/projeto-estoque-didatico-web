import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { addProduto } from '../services/produtos';

// Função de domínio (será expandida com persistência Supabase em testes futuros)
// Regras atuais (dirigidas por testes):
//  - Deve lançar erro "Nome obrigatório" quando nome ausente ou vazio
export async function cadastrarProduto(dados) {
	const nome = dados?.nome;
	if (!nome || typeof nome !== 'string' || !nome.trim()) {
		throw new Error('Nome obrigatório');
	}
	// (Futuro) validação de medida, etc.
	return {
		id: 'temp-id',
		nome: nome.trim(),
		...dados,
	};
}

// Formulário simples de cadastro de produto (sem estilização por enquanto)
// Campos segundo a tabela: nome (obrigatório), medida (obrigatório), local (opcional), codigo (opcional), data_entrada (opcional), entrada (opcional - default 0)
// Campos saida e saldo serão tratados em fluxos futuros (lista/movimentação)
export default function CadastroProduto({ onSubmit }) {
	const [formData, setFormData] = useState({
		nome: '',
		medida: '', // número (id da medida)
		local: '',
		codigo: '',
		data_entrada: '', // string (pode ser data no formato YYYY-MM-DD)
		entrada: '0',
	});

	const [errors, setErrors] = useState({});
	const [medidas, setMedidas] = useState([]); // [{id: number, nome: string}]
	const [loadingMedidas, setLoadingMedidas] = useState(true);
	const [erroMedidas, setErroMedidas] = useState(null);
	const [status, setStatus] = useState({ tipo: null, mensagem: '' });
	const [salvando, setSalvando] = useState(false);

	// Busca medidas ao montar
	useEffect(() => {
		let ativo = true;
		(async () => {
			try {
				setLoadingMedidas(true);
				// Assumindo nomes das colunas: id_medida, medida
				const { data, error } = await supabase
					.from('medida')
					.select('id_medida, medida')
					.order('id_medida', { ascending: true });
				if (error) throw error;
				if (ativo) {
					setMedidas(
						(data || []).map(r => ({ id: r.id_medida, nome: r.medida }))
					);
					setErroMedidas(null);
				}
			} catch (e) {
				if (ativo) setErroMedidas(e.message || 'Erro ao carregar medidas');
			} finally {
				if (ativo) setLoadingMedidas(false);
			}
		})();
		return () => { ativo = false; };
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const validar = () => {
		const novo = {};
		if (!formData.nome.trim()) novo.nome = 'Nome é obrigatório';
		if (!formData.medida.toString().trim()) {
			novo.medida = 'Medida é obrigatória';
		} else if (!medidas.some(m => String(m.id) === String(formData.medida))) {
			novo.medida = 'Medida inválida';
		}
		// entrada opcional, mas se fornecida deve ser número >= 0
		if (formData.entrada && isNaN(Number(formData.entrada))) {
			novo.entrada = 'Entrada deve ser numérica';
		} else if (Number(formData.entrada) < 0) {
			novo.entrada = 'Entrada não pode ser negativa';
		}
		return novo;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setStatus({ tipo: null, mensagem: '' });
		const novo = validar();
		setErrors(novo);
		if (Object.keys(novo).length === 0) {
			const payload = {
				...formData,
				medida: Number(formData.medida),
				entrada: Number(formData.entrada || 0),
			};
			try {
				setSalvando(true);
				const salvo = await addProduto(payload);
				setStatus({ tipo: 'sucesso', mensagem: 'Produto salvo (id ' + salvo.id_produtos + ')'});
				// limpa form
				setFormData({ nome: '', medida: '', local: '', codigo: '', data_entrada: '', entrada: '0' });
				onSubmit && onSubmit(salvo);
			} catch (err) {
				setStatus({ tipo: 'erro', mensagem: err.message || 'Erro ao salvar' });
			} finally {
				setSalvando(false);
			}
		}
	};

	return (
		<div>
			<h1>Cadastro de Produto</h1>
			<form role="form" onSubmit={handleSubmit}>
				<div>
					<label htmlFor="nome">Nome</label>
					<input
						id="nome"
						name="nome"
						type="text"
						value={formData.nome}
						onChange={handleChange}
						aria-invalid={!!errors.nome}
					/>
					{errors.nome && <span role="alert">{errors.nome}</span>}
				</div>
				<div>
					<label htmlFor="medida">Medida</label>
					<select
						id="medida"
						name="medida"
						value={formData.medida}
						onChange={handleChange}
						disabled={loadingMedidas || !!erroMedidas}
						aria-invalid={!!errors.medida}
					>
						<option value="">{loadingMedidas ? 'Carregando...' : 'Selecione'}</option>
						{medidas.map(m => (
							<option key={m.id} value={m.id}>{m.nome}</option>
						))}
					</select>
					{erroMedidas && <span role="alert">{erroMedidas}</span>}
					{errors.medida && <span role="alert">{errors.medida}</span>}
				</div>
				<div>
					<label htmlFor="local">Local</label>
					<input
						id="local"
						name="local"
						type="text"
						value={formData.local}
						onChange={handleChange}
					/>
				</div>
				<div>
					<label htmlFor="codigo">Código</label>
					<input
						id="codigo"
						name="codigo"
						type="text"
						value={formData.codigo}
						onChange={handleChange}
					/>
				</div>
				<div>
					<label htmlFor="data_entrada">Data de Entrada</label>
					<input
						id="data_entrada"
						name="data_entrada"
						type="date"
						value={formData.data_entrada}
						onChange={handleChange}
					/>
				</div>
				<div>
					<label htmlFor="entrada">Quantidade de Entrada</label>
					<input
						id="entrada"
						name="entrada"
						type="number"
						value={formData.entrada}
						onChange={handleChange}
						aria-invalid={!!errors.entrada}
						min="0"
					/>
					{errors.entrada && <span role="alert">{errors.entrada}</span>}
				</div>
				<button type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
			</form>
				{status.mensagem && (
					<p style={{ color: status.tipo === 'erro' ? 'red' : 'green' }}>{status.mensagem}</p>
				)}
		</div>
	);
}

