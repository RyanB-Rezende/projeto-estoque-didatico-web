import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import EditarCurso from '../../components/cursos/EditarCurso';

// Mock serviço de cursos
jest.mock('../../services/cursos/cursosService', () => ({
  getCursos: jest.fn(),
  updateCurso: jest.fn(),
}));
import { getCursos, updateCurso } from '../../services/cursos/cursosService';

// Silenciar warnings de act específicos
const originalError = console.error;
beforeAll(()=>{ console.error = (...a)=>{ if(typeof a[0]==='string' && a[0].includes('not wrapped in act')) return; originalError(...a); }; });
afterAll(()=>{ console.error = originalError; });

describe('EditarCurso', () => {
  test('carrega e preenche nome do curso', async () => {
    getCursos.mockResolvedValueOnce([{ id_cursos: 10, nome: 'Informática' }]);
    await act(async () => { render(<EditarCurso id={10} />); });
    expect(await screen.findByDisplayValue('Informática')).toBeInTheDocument();
  });

  test('valida nome obrigatório', async () => {
    getCursos.mockResolvedValueOnce([{ id_cursos: 10, nome: 'Informática' }]);
    await act(async () => { render(<EditarCurso id={10} />); });
    await screen.findByDisplayValue('Informática');
    fireEvent.change(screen.getByLabelText(/nome do curso/i), { target: { value: '' } });
    fireEvent.submit(screen.getByRole('form'));
    expect(await screen.findByText(/nome do curso é obrigatório/i)).toBeInTheDocument();
    expect(updateCurso).not.toHaveBeenCalled();
  });

  test('salva alterações com sucesso', async () => {
    getCursos.mockResolvedValueOnce([{ id_cursos: 10, nome: 'Informática' }]);
    updateCurso.mockResolvedValueOnce({ id_cursos: 10, nome: 'Administração' });
    const onSuccess = jest.fn();
    await act(async () => { render(<EditarCurso id={10} onSuccess={onSuccess} />); });
    await screen.findByDisplayValue('Informática');
    fireEvent.change(screen.getByLabelText(/nome do curso/i), { target: { value: 'Administração' } });
    fireEvent.submit(screen.getByRole('form'));
    await waitFor(() => expect(updateCurso).toHaveBeenCalledWith(10, { nome: 'Administração' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  test('mostra erro quando falha ao carregar', async () => {
    getCursos.mockRejectedValueOnce(new Error('Falha'));
    await act(async () => { render(<EditarCurso id={10} />); });
    expect(await screen.findByRole('alert')).toHaveTextContent(/erro ao carregar curso/i);
  });
});
