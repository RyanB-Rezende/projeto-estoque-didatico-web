import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock do serviço ANTES de importar o componente
jest.mock('../../services/cursos/cursosService', () => ({
  addCurso: jest.fn()
}));
import { addCurso } from '../../services/cursos/cursosService';
import CadastroCurso from '../../components/cursos/CadastroCurso';

// Testes espelhando estilo de CadastroProduto.test.js

test('renderiza input Nome do Curso e botão Salvar', async () => {
  await act(async () => { render(<CadastroCurso />); });
  expect(screen.getByLabelText(/nome do curso/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
});

test('valida campo obrigatório nome do curso', async () => {
  let utils;
  await act(async () => { utils = render(<CadastroCurso />); });
  const form = utils.container.querySelector('form');
  fireEvent.submit(form);
  expect(screen.getByText(/nome do curso é obrigatório/i)).toBeInTheDocument();
  expect(addCurso).not.toHaveBeenCalled();
});

test('submete dados válidos chamando addCurso e onSubmit com retorno', async () => {
  addCurso.mockResolvedValueOnce({ id_cursos: 1, nome: 'Informática' });
  const handleSubmit = jest.fn();
  let utils;
  await act(async () => { utils = render(<CadastroCurso onSubmit={handleSubmit} />); });
  fireEvent.change(screen.getByLabelText(/nome do curso/i), { target: { value: '  Informática  ' } });
  const form = utils.container.querySelector('form');
  fireEvent.submit(form);
  await waitFor(() => expect(addCurso).toHaveBeenCalledTimes(1));
  expect(addCurso).toHaveBeenCalledWith({ nome: 'Informática' });
  await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
  expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({ id_cursos: 1, nome: 'Informática' }));
});
