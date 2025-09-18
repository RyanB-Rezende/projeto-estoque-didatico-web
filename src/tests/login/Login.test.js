/**
 * Suite reduzida de testes para Login.
 * Mantemos somente 3 casos realmente úteis (mínimo pedagógico):
 *  1. Renderização básica dos campos essenciais.
 *  2. Validação (não envia vazio, mostra erros, não chama service).
 *  3. Fluxo de sucesso (chama service e onSuccess com credenciais válidas).
 * Demais cenários (trim, duplo clique, enter, toggle senha, erro credencial, loading) foram
 * intencionalmente removidos conforme diretriz de simplificação.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../../components/login/Login';

jest.mock('../../services/login/authService', () => ({
  login: jest.fn()
}));
import { login } from '../../services/login/authService';

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

  test('exibe mensagem de erro geral quando backend supabase falha (offline ou chave inválida)', async () => {
    const onSuccess = jest.fn();
    const backendError = new Error('Falha de conexão: verifique sua chave ou disponibilidade do serviço');
    login.mockRejectedValueOnce(backendError);
    render(<Login onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'Secr3t!' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    // Aguarda mensagem de erro geral aparecer (role=alert da div de erro geral)
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/falha de conexão/i);
    // onSuccess não deve ser chamado
    expect(onSuccess).not.toHaveBeenCalled();
    // login chamado com credenciais fornecidas
    expect(login).toHaveBeenCalledWith('user@test.com', 'Secr3t!');
  });

  test('exibe mensagem de credenciais inválidas quando senha está incorreta', async () => {
    const onSuccess = jest.fn();
    const invalidCredsError = new Error('Credenciais inválidas: email ou senha incorretos');
    login.mockRejectedValueOnce(invalidCredsError);
    render(<Login onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'SenhaErrada!' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/credenciais inválidas/i);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(login).toHaveBeenCalledWith('user@test.com', 'SenhaErrada!');
  });

  test('toggle de mostrar/ocultar senha altera tipo e ícone', () => {
    render(<Login />);
    const senhaInput = screen.getByLabelText(/^senha$/i);
    // Inicialmente senha escondida
    expect(senhaInput).toHaveAttribute('type', 'password');
    const toggleBtn = screen.getByRole('button', { name: /mostrar senha/i });
    const iconBefore = toggleBtn.querySelector('i');
    expect(iconBefore.className).toMatch(/eye-slash/); // olho fechado indicando escondido

    // Clica para mostrar
    fireEvent.click(toggleBtn);
    expect(senhaInput).toHaveAttribute('type', 'text');
    const toggleBtnAfter = screen.getByRole('button', { name: /ocultar senha/i });
    const iconAfter = toggleBtnAfter.querySelector('i');
    expect(iconAfter.className).toMatch(/bi-eye(\s|$)/); // ícone olho aberto
    expect(iconAfter.className).not.toMatch(/eye-slash/);
  });
});