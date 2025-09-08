import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Service de produtos a ser mockado
import * as service from '../../services/produtos/produtosService';
import ProdutoList from '../../components/produtos/ProdutoList';

jest.mock('../../services/produtos/produtosService');

// Mock de CadastroProduto para acionar onSubmit automaticamente ao abrir modal
jest.mock('../../components/produtos/CadastroProduto', () => {
  const React = require('react');
  return function StubCadastro(props) {
    React.useEffect(() => {
      // Simula cadastro bem-sucedido retornando novo produto
      props.onSubmit?.({ id_produtos: '99', nome: 'Borracha', medida: 1, entrada: 5, saida: 0, saldo: 5 });
    }, []);
    return <div data-testid="cadastro-stub" />;
  };
});

// Render simples (sem router pois componente atual não usa rotas)
const renderPlain = (ui) => render(ui);

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
  renderPlain(<ProdutoList />);
  const message = await screen.findByText(/nenhum produto cadastrado/i);
  expect(message).toBeInTheDocument();
});

// 2. Exibe lista de produtos
test('exibe lista de produtos', async () => {
  service.getProdutos.mockResolvedValue([
    { id_produtos: '1', nome: 'Caneta', medida: 1, entrada: 10, saida: 2, saldo: 8 },
    { id_produtos: '2', nome: 'Lápis', medida: 1, entrada: 5, saida: 0, saldo: 5 },
  ]);
  renderPlain(<ProdutoList />);
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
test('confirmação antes de deletar: cancelar não remove, confirmar remove e mostra toast', async () => {
  service.getProdutos
    .mockResolvedValueOnce([
      { id_produtos: '1', nome: 'Caneta', medida: 1, entrada: 10, saida: 2, saldo: 8 },
    ])
    .mockResolvedValueOnce([]); // Após confirmar remoção, retorna vazio

  const deleteMock = service.deleteProduto.mockResolvedValue({});

  renderPlain(<ProdutoList />);
  await screen.findByText(/lista de produtos/i);
  expect(screen.getAllByText('Caneta').length).toBeGreaterThan(0);

  // Clica remover -> abre dialog
  fireEvent.click(screen.getAllByTitle(/remover/i)[0]);
  const dialog = await screen.findByTestId('confirm-dialog');
  expect(dialog).toBeInTheDocument();

  // Cancela
  fireEvent.click(screen.getByRole('button', { name: /cancelar remoção/i }));
  await waitFor(() => {
    expect(screen.queryByTestId('confirm-dialog')).toBeNull();
  });
  // Não deletou ainda
  expect(deleteMock).not.toHaveBeenCalled();

  // Clica remover novamente e confirma
  fireEvent.click(screen.getAllByTitle(/remover/i)[0]);
  await screen.findByTestId('confirm-dialog');
  fireEvent.click(screen.getByRole('button', { name: /confirmar remoção/i }));

  await waitFor(() => {
    expect(deleteMock).toHaveBeenCalledWith('1');
  });

  await waitFor(() => {
    expect(screen.queryAllByText('Caneta').length).toBe(0);
  });

  const toast = await screen.findByTestId('toast');
  expect(toast).toHaveTextContent(/removido/i);
  expect(toast.getAttribute('data-variant')).toBe('danger');
});

// 5. Refresh após criação de produto (fluxo adicionar -> lista atualiza)
test('atualiza lista após cadastro de novo produto (refresh)', async () => {
  // Primeiro carregamento (sem novo produto), depois com novo produto
  service.getProdutos
    .mockResolvedValueOnce([
      { id_produtos: '1', nome: 'Caneta', medida: 1, entrada: 10, saida: 2, saldo: 8 },
    ])
    .mockResolvedValueOnce([
      { id_produtos: '1', nome: 'Caneta', medida: 1, entrada: 10, saida: 2, saldo: 8 },
      { id_produtos: '99', nome: 'Borracha', medida: 1, entrada: 5, saida: 0, saldo: 5 },
    ]);

  // addProduto retorna o objeto criado
  service.addProduto = jest.fn().mockResolvedValue({ id_produtos: '99', nome: 'Borracha', medida: 1, entrada: 5, saida: 0, saldo: 5 });

  renderPlain(<ProdutoList />);

  // Lista inicial
  await screen.findByText(/lista de produtos/i);
  expect(screen.getAllByText('Caneta').length).toBeGreaterThan(0);
  expect(screen.queryByText('Borracha')).toBeNull();

  // Abre modal (stub chama onSubmit automaticamente)
  fireEvent.click(screen.getByRole('button', { name: /adicionar produto/i }));

  // Aguarda toast de sucesso e novo item na lista
  const toast = await screen.findByTestId('toast');
  expect(toast).toHaveTextContent(/cadastrado/i);

  await waitFor(() => {
    expect(screen.getAllByText('Borracha').length).toBeGreaterThan(0);
  });

  // Verifica que getProdutos foi chamado duas vezes (inicial + refresh após cadastro)
  expect(service.getProdutos).toHaveBeenCalledTimes(2);
});

// 4. Paginação: navega para próxima página e exibe itens corretos
test('navega para a próxima página ao clicar no botão de avançar', async () => {
  // Cria 30 itens (PAGE_SIZE = 25, então 2 páginas)
  const produtos = Array.from({ length: 30 }, (_, i) => ({
    id_produtos: String(i + 1),
    nome: `Item-${i + 1}`,
    medida: 1,
    entrada: 10,
    saida: 0,
    saldo: 10
  }));

  // Primeira carga + recarga ao trocar de página
  service.getProdutos
    .mockResolvedValueOnce(produtos)
    .mockResolvedValueOnce(produtos);

  renderPlain(<ProdutoList />);

  // Espera primeira página
  await waitFor(() => {
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  // Indicador de página inicial
  expect(screen.getByText(/1 \/ 2/i)).toBeInTheDocument();

  // Item da primeira página presente (pode aparecer em tabela e card mobile)
  expect(screen.getAllByText('Item-1').length).toBeGreaterThan(0);
  expect(screen.queryByText('Item-30')).toBeNull();

  // Avança
  const nextBtn = screen.getByRole('button', { name: /próxima página/i });
  fireEvent.click(nextBtn);

  // Aguarda a segunda página carregar
  await waitFor(() => {
    expect(screen.getByText(/2 \/ 2/i)).toBeInTheDocument();
    expect(screen.getAllByText('Item-30').length).toBeGreaterThan(0);
  });

  // Item da primeira página não deve estar (nem em tabela nem em cards)
  expect(screen.queryByText('Item-1')).toBeNull();
});
