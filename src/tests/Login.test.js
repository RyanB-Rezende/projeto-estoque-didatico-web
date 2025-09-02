/**
 * Testes (fase RED) para o componente de autenticação (Login).
 * Objetivos iniciais TDD:
 *  1. Renderização de campos e botão.
 *  2. Validação: não enviar com campos vazios.
 *  3. Fluxo de sucesso: chamar service login e onSuccess.
 *
 * Nesta fase o componente (src/components/auth/Login.js) e o service (src/services/authService.js)
 * ainda NÃO existem — estes testes devem falhar (RED).
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Quando criarmos o componente usaremos este caminho:
import Login from '../components/auth/Login';

// Mock futuro do service de autenticação
jest.mock('../services/authService', () => ({
  login: jest.fn()
}));
import { login } from '../services/authService';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Login (Autenticação)', () => {

  test('renderiza heading e campos de Email e Senha e botão Entrar', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('mostra mensagens de validação e não chama login ao enviar vazio', async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/email é obrigatório/i)).toBeInTheDocument();
    expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  test('envia credenciais válidas, chama service login e onSuccess', async () => {
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

  test('exibe erro de credenciais quando login rejeita e não chama onSuccess', async () => {
    const onSuccess = jest.fn();
    login.mockRejectedValueOnce(new Error('Credenciais inválidas'));
    render(<Login onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
  fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'Errada!' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/credenciais inválidas/i);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('desabilita botão durante request e reabilita após concluir', async () => {
    const onSuccess = jest.fn();
    const fakeSession = { user: { id: 'u2', email: 'user@test.com' }, token: 'zzz' };
    // Promise atrasada
    let resolvePromise;
    const pending = new Promise(res => { resolvePromise = () => res(fakeSession); });
    login.mockReturnValueOnce(pending);
    render(<Login onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
  fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'Segredo123' } });
    const btn = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(btn);
    expect(btn).toBeDisabled();
    resolvePromise();
    await waitFor(() => expect(btn).not.toBeDisabled());
    expect(onSuccess).toHaveBeenCalled();
  });

  test('faz trim de email e senha antes de chamar login', async () => {
    const onSuccess = jest.fn();
    const fakeSession = { user: { id: 'u3', email: 'user@test.com' }, token: 'tok' };
    login.mockResolvedValueOnce(fakeSession);
    render(<Login onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: '  user@test.com  ' } });
  fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: '  Abc123  ' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('user@test.com', 'Abc123');
    });
  });

  test('ignora segundo clique rápido (não duplica chamada de login)', async () => {
    const onSuccess = jest.fn();
    let resolvePromise;
    const pending = new Promise(res => { resolvePromise = () => res({ user: { id: 'u5', email: 'user@test.com' }, token: 't' }); });
    login.mockReturnValueOnce(pending);
    render(<Login onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
  fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'SenhaOk!' } });
    const btn = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(btn);
    fireEvent.click(btn); // segundo clique enquanto disabled
    expect(login).toHaveBeenCalledTimes(1);
    resolvePromise();
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  test('submit com tecla Enter no campo senha', async () => {
    const onSuccess = jest.fn();
    const fakeSession = { user: { id: 'u6', email: 'user@test.com' }, token: 'tok' };
    login.mockResolvedValueOnce(fakeSession);
    render(<Login onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
  const senhaInput = screen.getByLabelText(/^senha$/i);
    fireEvent.change(senhaInput, { target: { value: 'Segredo!' } });
    fireEvent.keyDown(senhaInput, { key: 'Enter', code: 'Enter' });
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  test('toggle mostrar/ocultar senha altera o tipo do input', () => {
    render(<Login />);
  const senhaInput = screen.getByLabelText(/^senha$/i);
    expect(senhaInput).toHaveAttribute('type', 'password');
    const toggleBtn = screen.getByRole('button', { name: /mostrar senha/i });
    fireEvent.click(toggleBtn);
    expect(senhaInput).toHaveAttribute('type', 'text');
    // Botão deve atualizar label acessível
    const ocultarBtn = screen.getByRole('button', { name: /ocultar senha/i });
    fireEvent.click(ocultarBtn);
    expect(senhaInput).toHaveAttribute('type', 'password');
  });

});