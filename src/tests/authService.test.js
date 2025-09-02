/**
 * Testes RED para o service de autenticação (authService.js)
 * Objetivos da API esperada (ainda não implementada):
 *  - login(email, senha): retorna { user: { id, email }, token }
 *      - Rejeita com Error('Credenciais inválidas') quando e/ou senha incorretos
 *  - logout(): limpa sessão (memória + localStorage)
 *  - getSession(): retorna sessão atual ou null
 *  - isAuthenticated(): boolean
 *  - (futuro) restoreSession(): carrega sessão persistida no load
 *
 * Estes testes DEVEM falhar agora porque o módulo '../services/authService' ainda não existe.
 */

import '@testing-library/jest-dom';

// Mock do supabase para testes de login baseado em tabela usuarios
jest.mock('../services/supabase', () => ({
  supabase: { from: jest.fn() }
}));

// Import da API real após mocks
import { login, logout, getSession, isAuthenticated } from '../services/authService';
import { supabase } from '../services/supabase';

// Helper para limpar localStorage entre testes
const clearStorage = () => {
  if (typeof localStorage !== 'undefined') localStorage.clear();
};

const makeQueryMock = ({ data, error } = {}) => {
  const single = jest.fn().mockResolvedValue({ data, error });
  const eq = jest.fn(() => ({ single }));
  const select = jest.fn(() => ({ eq, single }));
  return { select, eq, single };
};

beforeEach(() => {
  clearStorage();
  supabase.from.mockReset();
});

describe('authService (Supabase)', () => {
  test('login sucesso: usuário existe e senha correta -> retorna sessão e persiste', async () => {
    const userRow = { id_usuarios: 'u123', email: 'user@test.com', senha: 'SenhaForte123', nome: 'Usuário Teste' };
    const q = makeQueryMock({ data: userRow });
    supabase.from.mockImplementation((table) => {
      expect(table).toBe('usuarios');
      return { select: q.select };
    });

    const session = await login('user@test.com', 'SenhaForte123');
    expect(session).toEqual(expect.objectContaining({
      user: expect.objectContaining({ id: 'u123', email: 'user@test.com', nome: 'Usuário Teste' }),
      token: expect.any(String)
    }));
    expect(getSession()).toEqual(session);
    expect(isAuthenticated()).toBe(true);
    expect(localStorage.getItem('auth_session')).toBeTruthy();
    expect(q.select).toHaveBeenCalled();
  });

  test('login falha: senha incorreta -> credenciais inválidas e sessão continua null', async () => {
    const userRow = { id_usuarios: 'u123', email: 'user@test.com', senha: 'SenhaForte123', nome: 'Usuário Teste' };
  const q = makeQueryMock({ data: userRow });
  supabase.from.mockImplementation(() => ({ select: q.select }));

    await expect(login('user@test.com', 'Errada')).rejects.toThrow(/credenciais inválidas/i);
    expect(isAuthenticated()).toBe(false);
    expect(getSession()).toBeNull();
  });

  test('login falha: usuário não encontrado -> credenciais inválidas', async () => {
  const q = makeQueryMock({ data: null, error: null });
  supabase.from.mockImplementation(() => ({ select: q.select }));

    await expect(login('naoexiste@test.com', 'Qualquer123')).rejects.toThrow(/credenciais inválidas/i);
    expect(isAuthenticated()).toBe(false);
    expect(getSession()).toBeNull();
  });

  // (Removido) Caso de usuário inativo: não há mais bloqueio por status.

  test('logout limpa sessão e storage após login bem-sucedido', async () => {
    const userRow = { id_usuarios: 'u123', email: 'user@test.com', senha: 'SenhaForte123', nome: 'Usuário Teste' };
  const q = makeQueryMock({ data: userRow });
  supabase.from.mockImplementation(() => ({ select: q.select }));
    await login('user@test.com', 'SenhaForte123');
    expect(isAuthenticated()).toBe(true);
    await logout();
    expect(isAuthenticated()).toBe(false);
    expect(getSession()).toBeNull();
    expect(localStorage.getItem('auth_session')).toBeNull();
  });

  // (Removidos) Testes de variações de status: lógica simplificada ignora campo.

  test('login normaliza email (trim + lower) antes de consultar', async () => {
    const userRow = { id_usuarios: 'u555', email: 'user@test.com', senha: 'SenhaForte123', nome: 'User Normalize' };
    const q = makeQueryMock({ data: userRow });
    supabase.from.mockImplementation(() => ({ select: q.select }));
    await login('  User@Test.Com  ', 'SenhaForte123');
    expect(q.eq).toHaveBeenCalledWith('email', 'user@test.com');
    expect(isAuthenticated()).toBe(true);
  });

  test('login aceita senha com espaços nas extremidades (trim)', async () => {
    const userRow = { id_usuarios: 'u556', email: 'trim@test.com', senha: 'SenhaForte123', nome: 'User Trim' };
    const q = makeQueryMock({ data: userRow });
    supabase.from.mockImplementation(() => ({ select: q.select }));
    const session = await login('trim@test.com', '  SenhaForte123  ');
    expect(session.user.id).toBe('u556');
  });

  test('tokens de logins consecutivos são diferentes (renovação de sessão)', async () => {
    const userRow = { id_usuarios: 'u777', email: 'multi@test.com', senha: 'SenhaForte123', nome: 'User Multi' };
    const q = makeQueryMock({ data: userRow });
    supabase.from.mockImplementation(() => ({ select: q.select }));
    const s1 = await login('multi@test.com', 'SenhaForte123');
    const t1 = s1.token;
    const s2 = await login('multi@test.com', 'SenhaForte123');
    expect(s2.token).not.toBe(t1);
  });

  test('logout é idempotente (chamar duas vezes mantém estado limpo)', async () => {
    const userRow = { id_usuarios: 'u888', email: 'ido@test.com', senha: 'SenhaForte123', nome: 'User Ido' };
    const q = makeQueryMock({ data: userRow });
    supabase.from.mockImplementation(() => ({ select: q.select }));
    await login('ido@test.com', 'SenhaForte123');
    await logout();
    await logout(); // segunda chamada não deve quebrar
    expect(isAuthenticated()).toBe(false);
    expect(getSession()).toBeNull();
  });

  test('erro de rede tratado como credenciais inválidas', async () => {
    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockRejectedValue(new Error('network'))
        })
      })
    }));
    await expect(login('net@test.com', 'SenhaForte123')).rejects.toThrow(/credenciais inválidas/i);
    expect(isAuthenticated()).toBe(false);
    expect(getSession()).toBeNull();
  });
});
