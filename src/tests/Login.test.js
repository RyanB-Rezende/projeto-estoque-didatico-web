/**
 * Suite reduzida de testes para Login.
 * Mantemos somente 3 casos realmente úteis (mínimo pedagógico):
 *  1. Renderização básica dos campos essenciais.
 *  2. Validação (não envia vazio, mostra erros, não chama service).
 *  3. Fluxo de sucesso (chama service e onSuccess com credenciais válidas).
 * Demais cenários (trim, duplo clique, enter, toggle senha, erro credencial, loading) foram
 * intencionalmente removidos conforme diretriz de simplificação.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../components/auth/Login';

jest.mock('../services/authService', () => ({
  login: jest.fn()
}));
import { login } from '../services/authService';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Login (mínimo útil)', () => {
  test('renderiza heading, email, senha e botão Entrar', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('mostra validações e não chama login quando vazio', async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByText(/email é obrigatório/i)).toBeInTheDocument();
    expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  test('submete com credenciais válidas e chama login + onSuccess', async () => {
    const onSuccess = jest.fn();
    const fakeSession = { user: { id: 'u1', email: 'user@test.com' }, token: 'abc123' };
    login.mockResolvedValueOnce(fakeSession);
    render(<Login onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'Secr3t!' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('user@test.com', 'Secr3t!');
      expect(onSuccess).toHaveBeenCalledWith(fakeSession);
    });
  });
});