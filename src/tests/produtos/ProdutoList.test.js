import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
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

// Mock de EditarProduto para acionar onSuccess automaticamente ao abrir modal de edição
jest.mock('../../components/produtos/EditarProduto', () => {
  const React = require('react');
  return function StubEditar(props) {
    React.useEffect(() => {
      // Simula edição bem-sucedida retornando produto atualizado
      props.onSuccess?.({ id_produtos: props.id, nome: 'Caneta Azul', medida: 1, entrada: 10, saida: 2, saldo: 8 });
    }, []);
    return <div data-testid="editar-stub" />;
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

// X. Erro ao carregar produtos (simulando supabase offline / chave inválida)
test('exibe mensagem de erro quando getProdutos falha (backend indisponível)', async () => {
  service.getProdutos.mockRejectedValueOnce(new Error('Network / Auth error'));
  renderPlain(<ProdutoList />);
  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent(/erro ao carregar produtos/i);
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
    { id_produtos: '1', nome: 'Caneta', codigo: 'COD-123', medida: 1, entrada: 10, saida: 2, saldo: 8 },
    { id_produtos: '2', nome: 'Lápis', codigo: 'XYZ-9', medida: 1, entrada: 5, saida: 0, saldo: 5 },
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

// 2.3. Ordenação por saldo crescente e decrescente
test('ordena produtos por quantidade em estoque (saldo) crescente e decrescente', async () => {
  const produtos = [
    { id_produtos: '1', nome: 'Caneta', codigo: 'A', medida: 1, saldo: 8 },
    { id_produtos: '2', nome: 'Lápis', codigo: 'B', medida: 1, saldo: 5 },
    { id_produtos: '3', nome: 'Borracha', codigo: 'C', medida: 1, saldo: 10 },
  ];
  service.getProdutos.mockResolvedValue(produtos);
  service.getMedidas.mockResolvedValue([]);

  renderPlain(<ProdutoList />);
  await screen.findByRole('table');

  // abre painel e ordena crescente
  fireEvent.click(screen.getByRole('button', { name: /filtrar e ordenar/i }));
  const estoqueBtn = await screen.findByRole('button', { name: /estoque/i });
  fireEvent.click(estoqueBtn); // asc
  // aguarda botão refletir estado crescente
  await screen.findByRole('button', { name: /estoque.*crescente/i });
  const rowsAsc = screen.getAllByRole('row');
  const firstDataRowAsc = rowsAsc[1];
  expect(firstDataRowAsc).toHaveTextContent('Lápis');

  // clica novamente para descer (garante que usamos o botão já atualizado)
  const estoqueBtnAsc = await screen.findByRole('button', { name: /estoque.*crescente/i });
  fireEvent.click(estoqueBtnAsc);
  await waitFor(() => {
    const rowsDesc = screen.getAllByRole('row');
    const firstDataRowDesc = rowsDesc[1];
    expect(firstDataRowDesc).toHaveTextContent('Borracha');
  });
});

// 2.2. Busca por código na SearchBar
test('filtra produtos ao buscar pelo código na barra de pesquisa', async () => {
  const produtos = [
    { id_produtos: '1', nome: 'Caneta', codigo: 'COD-123', medida: 1, entrada: 10, saida: 2, saldo: 8 },
    { id_produtos: '2', nome: 'Lápis', codigo: 'XYZ-9', medida: 1, entrada: 5, saida: 0, saldo: 5 },
    { id_produtos: '3', nome: 'Caderno', codigo: 'ABC-77', medida: 1, entrada: 5, saida: 0, saldo: 5 },
  ];
  service.getProdutos.mockResolvedValue(produtos);
  service.getMedidas.mockResolvedValue([]);

  renderPlain(<ProdutoList />);

  // Aguarda tabela e itens iniciais
  const table = await screen.findByRole('table');
  expect(table).toBeInTheDocument();
  expect(screen.getAllByText('Caneta').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Lápis').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Caderno').length).toBeGreaterThan(0);

  // Digita o código 'XYZ-9' e aguarda debounce da SearchBar (300ms default)
  const input = screen.getByPlaceholderText(/nome ou código/i);
  await waitFor(() => expect(input).toBeInTheDocument());
  // dispara evento de mudança da forma recomendada
  fireEvent.change(input, { target: { value: 'XYZ-9' } });

  // espera filtro aplicar (>=300ms) e confirma que apenas Lápis permanece visível
  await new Promise((r) => setTimeout(r, 400));
  expect(screen.getAllByText('Lápis').length).toBeGreaterThan(0);
  expect(screen.queryByText('Caneta')).toBeNull();
  expect(screen.queryByText('Caderno')).toBeNull();

  // e o valor do código aparece na tabela
  expect(screen.getByText('XYZ-9')).toBeInTheDocument();
});
// 2.1. Exibe coluna Código à esquerda de Medida e os valores de código
test('exibe coluna "Código" ao lado esquerdo de Medida e mostra os códigos dos produtos', async () => {
  service.getProdutos.mockResolvedValue([
    { id_produtos: '1', nome: 'Caneta', codigo: 'COD-123', medida: 1, entrada: 10, saida: 2, saldo: 8 },
    { id_produtos: '2', nome: 'Lápis', codigo: 'XYZ-9', medida: 1, entrada: 5, saida: 0, saldo: 5 },
  ]);

  renderPlain(<ProdutoList />);

  // Aguarda tabela
  const table = await screen.findByRole('table');
  expect(table).toBeInTheDocument();

  // Verifica ordem dos cabeçalhos
  const headers = screen.getAllByRole('columnheader').map(h => h.textContent.trim());
  expect(headers).toEqual(['Nome', 'Código', 'Medida', 'Saldo', 'Ações']);

  // Verifica valores dos códigos renderizados
  expect(screen.getByText('COD-123')).toBeInTheDocument();
  expect(screen.getByText('XYZ-9')).toBeInTheDocument();
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
  service.getMedidas.mockResolvedValue([]);

  renderPlain(<ProdutoList />);

  // Espera primeira página
  await waitFor(() => {
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  // Abre filtros e define ordenação por mais antigos (crescente)
  fireEvent.click(screen.getByRole('button', { name: /filtrar e ordenar/i }));
  const recentesBtn = await screen.findByRole('button', { name: /recentes/i });
  // Duas vezes para garantir asc (default asc, se já estiver em 'recent' desc)
  fireEvent.click(recentesBtn); // asc

  // Indicador de página inicial
  expect(screen.getByText(/1 \/ 2/i)).toBeInTheDocument();

  // Armazena primeiro item da tabela na página 1
  const tableBefore = screen.getByRole('table');
  const firstRowBefore = within(tableBefore).getAllByRole('row')[1];
  const firstTextBefore = firstRowBefore.textContent;

  // Avança
  const nextBtn = screen.getByRole('button', { name: /próxima página/i });
  fireEvent.click(nextBtn);

  // Aguarda a segunda página carregar e valida que o primeiro item mudou
  await waitFor(() => {
    expect(screen.getByText(/2 \/ 2/i)).toBeInTheDocument();
    const tableAfter = screen.getByRole('table');
    const firstRowAfter = within(tableAfter).getAllByRole('row')[1];
    expect(firstRowAfter.textContent).not.toEqual(firstTextBefore);
  });
});

// 6. Fluxo de edição: ao clicar em editar, produto é atualizado e lista faz refresh com nome novo
test('atualiza lista após edição de produto (refresh)', async () => {
  service.getProdutos
    .mockResolvedValueOnce([
      { id_produtos: '1', nome: 'Caneta', medida: 1, entrada: 10, saida: 2, saldo: 8 }
    ])
    .mockResolvedValueOnce([
      { id_produtos: '1', nome: 'Caneta Azul', medida: 1, entrada: 10, saida: 2, saldo: 8 }
    ]);

  renderPlain(<ProdutoList />);

  // Lista inicial carregada
  await screen.findByText(/lista de produtos/i);
  expect(screen.getAllByText('Caneta').length).toBeGreaterThan(0);
  expect(screen.queryByText('Caneta Azul')).toBeNull();

  // Clica botão editar (tabela ou card) - usa title="Editar"
  fireEvent.click(screen.getAllByTitle(/editar/i)[0]);

  // Aguarda toast de atualização
  const toast = await screen.findByTestId('toast');
  expect(toast).toHaveTextContent(/atualizado/i);

  // Lista deve refletir o nome atualizado após refresh
  await waitFor(() => {
    expect(screen.getAllByText('Caneta Azul').length).toBeGreaterThan(0);
  });

  // getProdutos chamado duas vezes (inicial + pós edição)
  expect(service.getProdutos).toHaveBeenCalledTimes(2);
});
