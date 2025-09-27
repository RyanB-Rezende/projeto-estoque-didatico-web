import { getTurmas } from '../../services/turma/turmaService';
import { supabase } from '../../services/supabase/supabaseClient';

// Mock do supabase
jest.mock('../../services/supabase/supabaseClient', () => ({
  supabase: {
    from: jest.fn()
  }
}));

describe('turmaService', () => {
  let mockFrom, mockSelect, mockOrder;

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();

    // Setup chain mocks
    mockOrder = jest.fn();
    mockSelect = jest.fn(() => ({
      order: mockOrder
    }));
    mockFrom = jest.fn(() => ({
      select: mockSelect
    }));
    
    supabase.from.mockImplementation(mockFrom);
  });

  describe('getTurmas', () => {
    test('deve retornar turmas com sucesso', async () => {
      const mockTurmas = [
        { id_turma: 1, nome: 'Turma A', professor: 'Prof. João' },
        { id_turma: 2, nome: 'Turma B', professor: 'Prof. Maria' }
      ];

      mockOrder.mockResolvedValue({
        data: mockTurmas,
        error: null
      });

      const result = await getTurmas();

      expect(supabase.from).toHaveBeenCalledWith('turma');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('id_turma');
      expect(console.log).toHaveBeenCalledWith('Buscando turmas no Supabase...');
      expect(console.log).toHaveBeenCalledWith('Turmas encontradas:', mockTurmas);
      expect(result).toEqual(mockTurmas);
    });

    test('deve retornar lista vazia quando não há turmas', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await getTurmas();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('Turmas encontradas:', []);
    });

    test('deve tratar erro do Supabase', async () => {
      const mockError = {
        message: 'Erro de conexão',
        code: 'CONNECTION_ERROR'
      };

      mockOrder.mockResolvedValue({
        data: null,
        error: mockError
      });

      await expect(getTurmas()).rejects.toThrow(mockError);

      expect(console.error).toHaveBeenCalledWith('Erro ao buscar turmas:', mockError);
      expect(console.error).toHaveBeenCalledWith('Erro completo ao buscar turmas:', mockError);
    });

    test('deve tratar erro de rede/exceção', async () => {
      const networkError = new Error('Network Error');
      mockOrder.mockRejectedValue(networkError);

      await expect(getTurmas()).rejects.toThrow('Network Error');

      expect(console.error).toHaveBeenCalledWith('Erro completo ao buscar turmas:', networkError);
    });

    test('deve logar início da busca', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null
      });

      await getTurmas();

      expect(console.log).toHaveBeenCalledWith('Buscando turmas no Supabase...');
    });

    test('deve logar turmas encontradas', async () => {
      const mockData = [{ id_turma: 1, nome: 'Teste' }];
      mockOrder.mockResolvedValue({
        data: mockData,
        error: null
      });

      await getTurmas();

      expect(console.log).toHaveBeenCalledWith('Turmas encontradas:', mockData);
    });

    test('deve usar a tabela turma correta', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null
      });

      await getTurmas();

      expect(supabase.from).toHaveBeenCalledWith('turma');
    });

    test('deve selecionar todos os campos', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null
      });

      await getTurmas();

      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    test('deve ordenar por id_turma', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null
      });

      await getTurmas();

      expect(mockOrder).toHaveBeenCalledWith('id_turma');
    });

    test('deve executar try/catch corretamente - caso de sucesso', async () => {
      const mockData = [{ id_turma: 1 }];
      mockOrder.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await getTurmas();

      expect(result).toEqual(mockData);
      // Não deve chamar o console.error do catch
      expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('Erro completo'));
    });

    test('deve executar try/catch corretamente - caso de erro no if', async () => {
      const error = { message: 'Erro no if' };
      mockOrder.mockResolvedValue({
        data: null,
        error: error
      });

      await expect(getTurmas()).rejects.toThrow(error);

      // Deve chamar ambos os console.error
      expect(console.error).toHaveBeenCalledWith('Erro ao buscar turmas:', error);
      expect(console.error).toHaveBeenCalledWith('Erro completo ao buscar turmas:', error);
    });

    test('deve executar try/catch corretamente - caso de exceção', async () => {
      const error = new Error('Exceção no try');
      mockOrder.mockRejectedValue(error);

      await expect(getTurmas()).rejects.toThrow(error);

      // Deve chamar apenas o console.error do catch
      expect(console.error).toHaveBeenCalledWith('Erro completo ao buscar turmas:', error);
      expect(console.error).not.toHaveBeenCalledWith('Erro ao buscar turmas:', error);
    });

    test('deve retornar dados mesmo com null', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await getTurmas();

      expect(result).toBeNull();
      expect(console.log).toHaveBeenCalledWith('Turmas encontradas:', null);
    });

    test('deve manter a estrutura da cadeia de chamadas', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null
      });

      await getTurmas();

      // Verifica se a cadeia foi chamada na ordem correta
      expect(supabase.from).toHaveBeenCalledBefore(mockSelect);
      expect(mockSelect).toHaveBeenCalledBefore(mockOrder);
    });

    test('deve ser uma função async', () => {
      expect(getTurmas).toBeInstanceOf(Function);
      expect(getTurmas.constructor.name).toBe('AsyncFunction');
    });

    test('deve retornar uma Promise', () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null
      });

      const result = getTurmas();
      expect(result).toBeInstanceOf(Promise);
    });
  });
});