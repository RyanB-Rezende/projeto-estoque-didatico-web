import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// RED: criamos expectativa de um componente que ainda não existe
jest.mock('../../services/cursos/cursosService', () => ({
  getCursos: jest.fn(),
  deleteCurso: jest.fn(),
}));
import { getCursos, deleteCurso } from '../../services/cursos/cursosService';

// Mock SearchBar para evitar debounce e facilitar o teste de busca
jest.mock('../../components/common/SearchBar', () => (props) => (
  <div>
    <input
      placeholder={props.placeholder || 'Procurar...'}
      aria-label={props.placeholder || 'Procurar...'}
      onChange={(e) => props.onSearch && props.onSearch(e.target.value)}
    />
    {props.showAddButton && (
      <button onClick={props.onAdd} aria-label={props.addLabel || 'Adicionar'}>Adicionar</button>
    )}
  </div>
));

// Mock ConfirmDialog para acionar confirma/cancela diretamente
jest.mock('../../components/common/ConfirmDialog', () => (props) => (
  <div data-testid="confirm-dialog">
    <button onClick={props.onConfirm}>confirm</button>
    <button onClick={props.onCancel}>cancel</button>
  </div>
));

// Mock EditarCurso para simular sucesso na edição
jest.mock('../../components/cursos/EditarCurso', () => (props) => (
  <div data-testid="editar-curso-mock">
    <button onClick={() => props.onSuccess && props.onSuccess({ id_cursos: props.id, nome: 'Atualizado' })}>salvar</button>
    <button onClick={() => props.onCancel && props.onCancel()}>cancelar</button>
  </div>
));

// Mock CadastroCurso para simular criação e fechar modal
jest.mock('../../components/cursos/CadastroCurso', () => (props) => (
  <div data-testid="cadastro-curso-mock">
    <button onClick={() => props.onSubmit && props.onSubmit({ id_cursos: 999, nome: 'Novo Curso' })}>salvar</button>
    <button onClick={() => props.onCancel && props.onCancel()}>cancelar</button>
  </div>
));
import CursoList from '../../components/cursos/CursoList';

test('exibe lista de cursos retornados pelo serviço', async () => {
  getCursos.mockResolvedValueOnce([
    { id_cursos: 1, nome: 'Informática' },
    { id_cursos: 2, nome: 'Administração' }
  ]);
  render(<CursoList />);
  await waitFor(() => expect(getCursos).toHaveBeenCalledTimes(1));
  expect(await screen.findByText('Informática')).toBeInTheDocument();
  expect(screen.getByText('Administração')).toBeInTheDocument();
});

test('adiciona novo curso e atualiza a lista (refresh)', async () => {
  getCursos
    .mockResolvedValueOnce([
      { id_cursos: 1, nome: 'Informática' },
    ])
    .mockResolvedValueOnce([
      { id_cursos: 1, nome: 'Informática' },
      { id_cursos: 999, nome: 'Novo Curso' },
    ]);

  render(<CursoList />);
  await screen.findByText('Informática');
  // Abre modal de adicionar
  fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));
  // No mock, clicar em "salvar" dispara onSubmit e refresh
  const salvar = await screen.findByText('salvar');
  fireEvent.click(salvar);
  // Espera novo curso na lista após refresh
  await waitFor(() => expect(getCursos).toHaveBeenCalledTimes(2));
  expect(await screen.findByText('Novo Curso')).toBeInTheDocument();
});

test('mostra mensagem quando não há cursos', async () => {
  getCursos.mockResolvedValueOnce([]);
  render(<CursoList />);
  expect(await screen.findByRole('alert')).toHaveTextContent(/nenhum curso cadastrado/i);
});

test('mostra erro quando serviço falha', async () => {
  getCursos.mockRejectedValueOnce(new Error('Falha'));
  render(<CursoList />);
  expect(await screen.findByRole('alert')).toHaveTextContent(/erro ao carregar cursos/i);
});

test('filtra pelos resultados da busca', async () => {
  getCursos.mockResolvedValueOnce([
    { id_cursos: 1, nome: 'Informática' },
    { id_cursos: 2, nome: 'Administração' }
  ]);
  render(<CursoList />);
  await screen.findByText('Informática');
  const input = screen.getByLabelText(/procurar cursos/i);
  fireEvent.change(input, { target: { value: 'xpto' } });
  expect(await screen.findByRole('status')).toHaveTextContent(/nenhum curso encontrado/i);
});

test('paginação mostra próxima página', async () => {
  const lista = Array.from({ length: 30 }).map((_, i) => ({ id_cursos: i + 1, nome: `Curso ${i + 1}` }));
  getCursos.mockResolvedValueOnce(lista);
  render(<CursoList />);
  // Página 1
  expect(await screen.findByText('Curso 1')).toBeInTheDocument();
  expect(screen.queryByText('Curso 26')).not.toBeInTheDocument();
  // Avança
  const proxima = screen.getByRole('button', { name: /próxima página/i });
  fireEvent.click(proxima);
  await waitFor(() => expect(screen.getByText('Curso 26')).toBeInTheDocument());
  expect(screen.queryByText('Curso 1')).not.toBeInTheDocument();
});

test('editar curso aciona recarregamento', async () => {
  getCursos
    .mockResolvedValueOnce([
      { id_cursos: 1, nome: 'Antigo' },
    ])
    .mockResolvedValueOnce([
      { id_cursos: 1, nome: 'Atualizado' },
    ]);
  render(<CursoList />);
  await screen.findByText('Antigo');
  const editarBtn = screen.getAllByTitle('Editar')[0] || screen.getAllByRole('button', { name: /editar/i })[0];
  fireEvent.click(editarBtn);
  // Clica no salvar do mock para disparar onSuccess
  const salvarMock = await screen.findByText('salvar');
  fireEvent.click(salvarMock);
  await waitFor(() => expect(getCursos).toHaveBeenCalledTimes(2));
  expect(await screen.findByText('Atualizado')).toBeInTheDocument();
});

test('excluir curso chama serviço e recarrega', async () => {
  getCursos
    .mockResolvedValueOnce([
      { id_cursos: 1, nome: 'Curso X' },
      { id_cursos: 2, nome: 'Curso Y' },
    ])
    .mockResolvedValueOnce([
      { id_cursos: 2, nome: 'Curso Y' },
    ]);
  deleteCurso.mockResolvedValueOnce({});
  render(<CursoList />);
  await screen.findByText('Curso X');
  const removerBtn = screen.getAllByTitle('Remover')[0] || screen.getAllByRole('button', { name: /remover/i })[0];
  fireEvent.click(removerBtn);
  // ConfirmDialog mock
  const confirmBtn = await screen.findByText('confirm');
  fireEvent.click(confirmBtn);
  await waitFor(() => expect(deleteCurso).toHaveBeenCalledWith(1));
  await waitFor(() => expect(getCursos).toHaveBeenCalledTimes(2));
  expect(screen.queryByText('Curso X')).not.toBeInTheDocument();
});
