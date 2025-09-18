import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import EditarProduto from '../../components/produtos/EditarProduto';

// Silencia warnings de act específicos
const originalError = console.error;
beforeAll(()=>{ console.error = (...a)=>{ if(typeof a[0]==='string' && a[0].includes('not wrapped in act')) return; originalError(...a); }; });
afterAll(()=>{ console.error = originalError; });

// Mock supabase para medidas
jest.mock('../../services/supabase/supabase', () => ({
  supabase: { from: () => ({ select: () => ({ order: () => Promise.resolve({ data: [ { id_medida: 1, medida: 'Unidade' } ], error: null }) }) }) }
}));

// Mocks de serviço de produtos
jest.mock('../../services/produtos/produtosService', () => ({
  getProdutoById: jest.fn(),
  updateProduto: jest.fn(),
}));
import { getProdutoById, updateProduto } from '../../services/produtos/produtosService';

describe('EditarProduto (TDD)', () => {
  test('carrega e preenche campos com dados do produto', async () => {
    getProdutoById.mockResolvedValueOnce({ id_produtos: 10, nome: 'Caneta', medida: 1, local: 'Sala', codigo: 'ABC', data_entrada: '2025-09-01', entrada: 5 });
    await act(async () => { render(<EditarProduto id={10} />); });
    // Aguarda carregar
    await screen.findByDisplayValue('Caneta');
    expect(screen.getByLabelText(/nome/i)).toHaveValue('Caneta');
    expect(screen.getByLabelText(/medida/i)).toHaveValue('1');
    expect(screen.getByLabelText(/local/i)).toHaveValue('Sala');
    expect(screen.getByLabelText(/c[óo]digo/i)).toHaveValue('ABC');
    expect(screen.getByLabelText(/data de entrada/i)).toHaveValue('2025-09-01');
    expect(screen.getByLabelText(/quantidade/i)).toHaveValue(5);
  });

  test('submete alterações e chama updateProduto com dados corretos', async () => {
    getProdutoById.mockResolvedValueOnce({ id_produtos: 10, nome: 'Caneta', medida: 1, local: 'Sala', codigo: 'ABC', data_entrada: '2025-09-01', entrada: 5 });
    updateProduto.mockResolvedValueOnce({ id_produtos: 10, nome: 'Caneta Azul', medida: 1, local: 'Sala', codigo: 'ABC', data_entrada: '2025-09-01', entrada: 20 });
    const onSuccess = jest.fn();
    await act(async () => { render(<EditarProduto id={10} onSuccess={onSuccess} />); });
    await screen.findByDisplayValue('Caneta');
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Caneta Azul' } });
    fireEvent.change(screen.getByLabelText(/quantidade/i), { target: { value: '20' } });
    fireEvent.submit(screen.getByRole('form'));
    await waitFor(()=>expect(updateProduto).toHaveBeenCalled());
    expect(updateProduto).toHaveBeenCalledWith(10, expect.objectContaining({ nome: 'Caneta Azul', medida: 1, entrada: 20 }));
    await waitFor(()=>expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ id_produtos: 10, nome: 'Caneta Azul' })));
  });

  test('valida campos obrigatórios ao tentar salvar vazios', async () => {
    getProdutoById.mockResolvedValueOnce({ id_produtos: 10, nome: 'Caneta', medida: 1, local: 'Sala', codigo: 'ABC', data_entrada: '2025-09-01', entrada: 5 });
    await act(async () => { render(<EditarProduto id={10} />); });
    await screen.findByDisplayValue('Caneta');
    // Limpa campos
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/medida/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/local/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/c[óo]digo/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/data de entrada/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/quantidade/i), { target: { value: '' } });
    fireEvent.submit(screen.getByRole('form'));
    expect(await screen.findByText(/nome é obrigatório/i)).toBeInTheDocument();
    expect(screen.getByText(/medida é obrigatória/i)).toBeInTheDocument();
    expect(screen.getByText(/local é obrigatório/i)).toBeInTheDocument();
    expect(screen.getByText(/código é obrigatório/i)).toBeInTheDocument();
    expect(screen.getByText(/data de entrada é obrigatória/i)).toBeInTheDocument();
    expect(screen.getByText(/quantidade é obrigatória/i)).toBeInTheDocument();
    expect(updateProduto).not.toHaveBeenCalled();
  });

  test('exibe mensagem de erro se falhar carregamento inicial', async () => {
    getProdutoById.mockRejectedValueOnce(new Error('Falha'));
    await act(async () => { render(<EditarProduto id={10} />); });
    expect(await screen.findByText(/erro ao carregar produto/i)).toBeInTheDocument();
  });
});
