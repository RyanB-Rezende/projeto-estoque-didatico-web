import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CadastroProduto from '../../components/produtos/CadastroProduto';

// Filtra warnings de act específicos deste componente (remoção de ruído)
const originalError = console.error;
beforeAll(() => {
	console.error = (...args) => {
		if (typeof args[0] === 'string' && args[0].includes('not wrapped in act')) return; // silencia apenas esse aviso
		originalError(...args);
	};
});

afterAll(() => { console.error = originalError; });

// Mock mínimo para carregar medidas (sem foco em lógica interna)
jest.mock('../../services/supabase/supabase', () => ({
	supabase: { from: () => ({ select: () => ({ order: () => Promise.resolve({ data: [ { id_medida: 1, medida: 'Unidade' } ], error: null }) }) }) }
}));

jest.mock('../../services/produtos/produtosService', () => ({
	addProduto: jest.fn(async (dados) => ({ id_produtos: 1, ...dados }))
}));
import { addProduto } from '../../services/produtos/produtosService';

test('renderiza inputs de todos os campos (nome, medida, local, código, data de entrada, quantidade)', async () => {
	await act(async () => { render(<CadastroProduto />); });
	// Aguarda carregamento async das medidas para evitar warnings de act
	await screen.findByRole('option', { name: /unidade/i });
	expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
	expect(screen.getByLabelText(/medida/i)).toBeInTheDocument();
	expect(screen.getByLabelText(/local/i)).toBeInTheDocument();
	expect(screen.getByLabelText(/c[oó]digo/i)).toBeInTheDocument();
	expect(screen.getByLabelText(/data de entrada/i)).toBeInTheDocument();
	expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument();
});

test('chama onSubmit com dados corretos', async () => {
	const handleSubmit = jest.fn();
	await act(async () => { render(<CadastroProduto onSubmit={handleSubmit} />); });
	// Preenche
	fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Livro' } });
	await screen.findByRole('option', { name: /unidade/i });
	fireEvent.change(screen.getByLabelText(/medida/i), { target: { value: '1' } });
	fireEvent.change(screen.getByLabelText(/local/i), { target: { value: 'Sala' } });
	fireEvent.change(screen.getByLabelText(/código/i), { target: { value: 'ABC123' } });
	fireEvent.change(screen.getByLabelText(/data de entrada/i), { target: { value: '2025-09-03' } });
	fireEvent.change(screen.getByLabelText(/quantidade/i), { target: { value: '5' } });
	fireEvent.submit(screen.getByRole('form'));
	await waitFor(() => expect(addProduto).toHaveBeenCalled());
	expect(addProduto).toHaveBeenCalledWith(expect.objectContaining({ nome: 'Livro', medida: 1, local: 'Sala', codigo: 'ABC123', data_entrada: '2025-09-03', entrada: 5 }));
	await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
	expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({ id_produtos: 1, nome: 'Livro' }));
});

test('valida campos obrigatórios nome, medida, local, código, data e quantidade', async () => {
	const handleSubmit = jest.fn();
	await act(async () => { render(<CadastroProduto onSubmit={handleSubmit} />); });
	fireEvent.submit(screen.getByRole('form'));
	expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
	expect(screen.getByText(/medida é obrigatória/i)).toBeInTheDocument();
	expect(screen.getByText(/local é obrigatório/i)).toBeInTheDocument();
	expect(screen.getByText(/código é obrigatório/i)).toBeInTheDocument();
	expect(screen.getByText(/data de entrada é obrigatória/i)).toBeInTheDocument();
	expect(screen.getByText(/quantidade é obrigatória/i)).toBeInTheDocument();
	expect(handleSubmit).not.toHaveBeenCalled();
});


