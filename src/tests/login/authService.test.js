/**
 * Suite mínima (3 testes) para authService.
 * Mantido apenas o essencial:
 * 1. login sucesso (normaliza email + trim senha, persiste sessão, gera token).
 * 2. login falha (credenciais inválidas -> sessão permanece null).
 * 3. logout limpa sessão e storage.
 * Demais cenários (usuário inexistente separado, tokens diferentes, idempotência, erro rede) omitidos.
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

describe('authService (mínimo útil)', () => {
  test('login sucesso normaliza email, trim senha, retorna sessão e persiste', async () => {
    const userRow = { id_usuarios: 'u123', email: 'user@test.com', senha: 'SenhaForte123', nome: 'Usuário Teste' };
    const q = makeQueryMock({ data: userRow });
    supabase.from.mockImplementation(() => ({ select: q.select }));
    const session = await login('  User@Test.Com  ', '  SenhaForte123  ');
    expect(q.eq).toHaveBeenCalledWith('email', 'user@test.com');
    expect(session.user.id).toBe('u123');
    expect(session.token).toEqual(expect.any(String));
    expect(isAuthenticated()).toBe(true);
    expect(getSession()).toEqual(session);
    expect(localStorage.getItem('auth_session')).toBeTruthy();
  });

  test('login falha credenciais inválidas mantém sessão null', async () => {
    const userRow = { id_usuarios: 'u123', email: 'user@test.com', senha: 'SenhaForte123', nome: 'Usuário Teste' };
    const q = makeQueryMock({ data: userRow });
    supabase.from.mockImplementation(() => ({ select: q.select }));
    await expect(login('user@test.com', 'Errada')).rejects.toThrow(/credenciais inválidas/i);
    expect(isAuthenticated()).toBe(false);
    expect(getSession()).toBeNull();
  });

  test('logout limpa sessão e storage', async () => {
    const userRow = { id_usuarios: 'u999', email: 'outro@test.com', senha: 'SenhaForte123', nome: 'Outro' };
    const q = makeQueryMock({ data: userRow });
    supabase.from.mockImplementation(() => ({ select: q.select }));
    await login('outro@test.com', 'SenhaForte123');
    await logout();
    expect(isAuthenticated()).toBe(false);
    expect(getSession()).toBeNull();
    expect(localStorage.getItem('auth_session')).toBeNull();
  });
});
