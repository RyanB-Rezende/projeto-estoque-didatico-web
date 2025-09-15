import { getTurmas, createTurma, updateTurma, deleteTurma } from '../services/turmaService';
import supabase from '../services/supabaseClient';

jest.mock('../services/supabaseClient');

describe('Turma Service', () => {
  test('deve ter funções de serviço definidas', () => {
    const turmaService = require('../services/turmaService');
    expect(typeof turmaService.getTurmas).toBe('function');
    expect(typeof turmaService.createTurma).toBe('function');
  });

    const result = await getTurmas();
    expect(result).toEqual(mockTurmas);
    });

  test('deve criar uma nova turma', async () => {
    const novaTurma = { nome: 'Turma B', capacidade: 30 };
    supabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        data: [novaTurma],
        error: null
      })
    });

    const result = await createTurma(novaTurma);
    expect(result).toEqual([novaTurma]);
  });