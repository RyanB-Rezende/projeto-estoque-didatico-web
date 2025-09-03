import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Service de produtos a ser mockado
import * as service from '../services/produtosService';
// Componente (ainda não implementado) -> Testes RED
import ProdutoList from '../components/ProdutoList';

jest.mock('../services/produtosService');

// Helper opcional para envolver em router (preparado caso futuro use links)
const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

// 1. Mensagem quando lista vazia
test('exibe mensagem quando não há produtos cadastrados', async () => {
  service.getProdutos.mockResolvedValue([]);
  renderWithRouter(<ProdutoList />);
  const message = await screen.findByText(/nenhum produto cadastrado/i);
  expect(message).toBeInTheDocument();
});

// 2. Exibe lista de produtos
test('exibe lista de produtos', async () => {
  service.getProdutos.mockResolvedValue([
    { id_produtos: '1', nome: 'Caneta', medida: 1, entrada: 10, saida: 2, saldo: 8 },
    { id_produtos: '2', nome: 'Lápis', medida: 1, entrada: 5, saida: 0, saldo: 5 },
  ]);
  renderWithRouter(<ProdutoList />);
  await waitFor(() => {
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText(/lista de produtos/i)).toBeInTheDocument();
  });
  const canetaEls = screen.getAllByText('Caneta');
  const lapisEls = screen.getAllByText('Lápis');
  expect(canetaEls.length).toBeGreaterThan(0);
  expect(lapisEls.length).toBeGreaterThan(0);
});

// 3. Remoção de produto
test('deleta um produto ao clicar em "Remover"', async () => {
  service.getProdutos.mockResolvedValueOnce([
    { id_produtos: '1', nome: 'Caneta', medida: 1, entrada: 10, saida: 2, saldo: 8 },
  ]).mockResolvedValueOnce([]); // segunda chamada após remoção retorna vazio
  const deleteMock = service.deleteProduto.mockResolvedValue({});

  renderWithRouter(<ProdutoList />);
  await screen.findByText(/lista de produtos/i);
  expect(screen.getAllByText('Caneta').length).toBeGreaterThan(0);

  const removeButtons = screen.getAllByTitle(/remover/i);
  fireEvent.click(removeButtons[0]);

  await waitFor(() => {
    expect(deleteMock).toHaveBeenCalledWith('1');
  });

  // Aguarda recarregar vazio
  await waitFor(() => {
    expect(screen.queryAllByText('Caneta').length).toBe(0);
  });
});
