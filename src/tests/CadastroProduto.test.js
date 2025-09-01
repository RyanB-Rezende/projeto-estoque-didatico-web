/**
 * Testes unitários (GREEN) para o formulário de Cadastro de Produto.
 * Abrangência:
 *  - Renderização de campos obrigatórios.
 *  - Validações (nome & medida obrigatórios, entrada numérica >= 0).
 *  - Fluxo de submissão: chamada do service `addProduto`, callback onSubmit, limpeza do formulário.
 *  - Função de domínio `cadastrarProduto` (erro quando nome ausente).
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CadastroProduto, { cadastrarProduto } from '../components/CadastroProduto';

// Mock do módulo de serviços (Supabase & produtos) para isolar testes do backend real.
jest.mock('../services/supabase', () => ({
	supabase: {
		from: () => ({
			select: () => ({
				order: () => Promise.resolve({
					data: [ { id_medida: 1, medida: 'Unidade' }, { id_medida: 2, medida: 'Caixa' } ],
					error: null
				})
			})
		})
	}
}));

jest.mock('../services/produtosService', () => ({
	addProduto: jest.fn()
}));

import { addProduto } from '../services/produtosService';
const addProdutoMock = addProduto; // referência ao mock

beforeEach(() => {
	addProdutoMock.mockReset();
});

describe('Componente CadastroProduto', () => {
		test('renderiza heading e campos principais', async () => {
		render(<CadastroProduto />);
		expect(screen.getByRole('heading', { name: /cadastro de produto/i })).toBeInTheDocument();
		// Campos de texto
		expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/local/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/código/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/data de entrada/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument();
		// Select de medida (aguarda carregar opções)
		const medidaSelect = screen.getByLabelText(/medida/i);
		expect(medidaSelect).toBeInTheDocument();
		await screen.findByRole('option', { name: /unidade/i });
	});

		test('exibe mensagens de validação e NÃO envia quando campos obrigatórios faltam', async () => {
		const onSubmit = jest.fn();
		render(<CadastroProduto onSubmit={onSubmit} />);
			const form = screen.getByText(/salvar/i).closest('form');
			fireEvent.submit(form);
		expect(await screen.findByText(/nome é obrigatório/i)).toBeInTheDocument();
		expect(screen.getByText(/medida é obrigatória/i)).toBeInTheDocument();
		expect(addProdutoMock).not.toHaveBeenCalled();
		expect(onSubmit).not.toHaveBeenCalled();
	});

		test('envia dados válidos, chama addProduto e onSubmit, e limpa formulário', async () => {
		const onSubmit = jest.fn();
		// Mock resposta do service
		addProdutoMock.mockResolvedValue({
			id_produtos: 123,
			nome: 'Livro',
			medida: 1,
			entrada: 5,
			local: 'Sala',
			codigo: 'ABC',
			data_entrada: '2025-09-01',
			saldo: 5
		});

		render(<CadastroProduto onSubmit={onSubmit} />);

		// Preenche campos obrigatórios & alguns opcionais
		fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Livro' } });
		// Aguarda opções carregarem e seleciona medida 1
		await screen.findByRole('option', { name: /unidade/i });
		fireEvent.change(screen.getByLabelText(/medida/i), { target: { value: '1' } });
		fireEvent.change(screen.getByLabelText(/quantidade/i), { target: { value: '5' } });
		fireEvent.change(screen.getByLabelText(/local/i), { target: { value: 'Sala' } });
		fireEvent.change(screen.getByLabelText(/código/i), { target: { value: 'ABC' } });
		fireEvent.change(screen.getByLabelText(/data de entrada/i), { target: { value: '2025-09-01' } });

		const form = screen.getByText(/salvar/i).closest('form');
		fireEvent.submit(form);

		await waitFor(() => expect(addProdutoMock).toHaveBeenCalled());
		expect(addProdutoMock).toHaveBeenCalledWith({
			nome: 'Livro',
			medida: 1,
			local: 'Sala',
			codigo: 'ABC',
			data_entrada: '2025-09-01',
			entrada: 5
		});
		expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ id_produtos: 123 }));

		// Após sucesso formulário deve limpar nome (aguarda ciclo assíncrono)
		await waitFor(() => expect(screen.getByLabelText(/nome/i)).toHaveValue(''));
	});

		test('não limpa formulário nem chama onSubmit se addProduto falhar', async () => {
		const onSubmit = jest.fn();
		addProdutoMock.mockRejectedValue(new Error('Falha')); 
		render(<CadastroProduto onSubmit={onSubmit} />);
		fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Livro' } });
		await screen.findByRole('option', { name: /unidade/i });
		fireEvent.change(screen.getByLabelText(/medida/i), { target: { value: '1' } });
		const form = screen.getByText(/salvar/i).closest('form');
		fireEvent.submit(form);
		await waitFor(() => expect(addProdutoMock).toHaveBeenCalled());
		expect(onSubmit).not.toHaveBeenCalled();
		// Nome permanece preenchido
		expect(screen.getByLabelText(/nome/i)).toHaveValue('Livro');
		// Mensagem de erro renderizada (aguarda catch)
		await waitFor(() => expect(screen.getByText(/falha/i)).toBeInTheDocument());
	});
});

describe('Função cadastrarProduto (domínio isolado)', () => {
	test('lança erro quando nome vazio', async () => {
		await expect(cadastrarProduto({})).rejects.toThrow(/nome obrigatório/i);
	});

	test('retorna objeto com nome normalizado', async () => {
		const r = await cadastrarProduto({ nome: 'Lápis' });
		expect(r.nome).toBe('Lápis');
		expect(r.id).toBeDefined(); // id stub "temp-id"
	});
});


