import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, getUsuarioById } from '../services/usuarioService';
import supabase from '../services/supabaseClient';
import { jest } from '@jest/globals';
import { waitFor, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';


jest.mock('../services/supabaseClient');

describe('Usuario Service', () => {
  beforeEach(() => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis()
    });
  });

  test('deve buscar todos os usuários', async () => {
    const mockUsuarios = [{ id: 1, nome: 'João' }];
    supabase.from().select.mockResolvedValue({ data: mockUsuarios, error: null });

    const result = await getUsuarios();
    expect(result).toEqual(mockUsuarios);
  });

  test('deve criar um novo usuário', async () => {
    const novoUsuario = { nome: 'Maria', email: 'maria@email.com' };
    supabase.from().insert.mockResolvedValue({ data: [novoUsuario], error: null });

    const result = await createUsuario(novoUsuario);
    expect(result).toEqual([novoUsuario]);
  });

  test('deve lidar com erro ao criar usuário', async () => {
    supabase.from().insert.mockResolvedValue({ data: null, error: { message: 'Erro' } });

    await expect(createUsuario({})).rejects.toThrow('Erro');
  });
});