import { getCargos } from '../../services/cargo/cargoService';

// Mock do supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      order: jest.fn()
    }))
  }))
};

jest.mock('../../services/supabase/supabaseClient', () => ({
  supabase: mockSupabase
}));

describe('cargoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  describe('getCargos', () => {
    test('deve retornar cargos com sucesso', async () => {
      const mockData = [
        { id_cargos: 1, nome: 'Professor' },
        { id_cargos: 2, nome: 'Coordenador' }
      ];

      mockSupabase.from().select().order.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await getCargos();

      expect(mockSupabase.from).toHaveBeenCalledWith('cargos');
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*');
      expect(mockSupabase.from().select().order).toHaveBeenCalledWith('id_cargos');
      expect(result).toEqual(mockData);
    });

    test('deve retornar lista vazia quando não há cargos', async () => {
      mockSupabase.from().select().order.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await getCargos();

      expect(result).toEqual([]);
    });

    test('deve tratar erro do Supabase no if', async () => {
      const mockError = {
        message: 'Database connection error',
        code: 'CONNECTION_ERROR'
      };

      mockSupabase.from().select().order.mockResolvedValue({
        data: null,
        error: mockError
      });

      await expect(getCargos()).rejects.toThrow(mockError);
      expect(console.error).toHaveBeenCalledWith('Erro ao buscar cargos:', mockError);
    });

    test('deve tratar exceção no catch', async () => {
      const networkError = new Error('Network Error');

      mockSupabase.from().select().order.mockRejectedValue(networkError);

      await expect(getCargos()).rejects.toThrow('Network Error');
      expect(console.error).toHaveBeenCalledWith('Erro ao buscar cargos:', networkError);
    });

    test('deve executar query chain corretamente', async () => {
      mockSupabase.from().select().order.mockResolvedValue({
        data: [],
        error: null
      });

      await getCargos();

      // Verifica se a chain foi executada na ordem correta
      expect(mockSupabase.from).toHaveBeenCalledWith('cargos');
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*');
      expect(mockSupabase.from().select().order).toHaveBeenCalledWith('id_cargos');
    });

    test('deve retornar dados mesmo quando data é null', async () => {
      mockSupabase.from().select().order.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await getCargos();

      expect(result).toBeNull();
    });

    test('deve usar destructuring { data, error } corretamente', async () => {
      const mockResponse = {
        data: [{ id_cargos: 1, nome: 'Teste' }],
        error: null
      };

      mockSupabase.from().select().order.mockResolvedValue(mockResponse);

      const result = await getCargos();

      expect(result).toBe(mockResponse.data);
    });

    test('deve executar await corretamente', async () => {
      mockSupabase.from().select().order.mockResolvedValue({
        data: [],
        error: null
      });

      const promise = getCargos();
      
      expect(promise).toBeInstanceOf(Promise);
      
      await promise;
      
      expect(mockSupabase.from().select().order).toHaveBeenCalled();
    });

    test('deve ser uma função async', () => {
      expect(getCargos).toBeInstanceOf(Function);
      expect(getCargos.constructor.name).toBe('AsyncFunction');
    });

    test('deve executar try block completamente', async () => {
      const mockData = [{ id_cargos: 1 }];
      
      mockSupabase.from().select().order.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await getCargos();

      // Verifica se passou pelo try sem ir para o catch
      expect(result).toEqual(mockData);
      expect(console.error).not.toHaveBeenCalled();
    });

    test('deve executar catch block quando há exceção', async () => {
      const error = new Error('Async error');
      
      mockSupabase.from().select().order.mockRejectedValue(error);

      await expect(getCargos()).rejects.toThrow(error);
      
      // Verifica se passou pelo catch
      expect(console.error).toHaveBeenCalledWith('Erro ao buscar cargos:', error);
    });

    test('deve usar tabela cargos específica', async () => {
      mockSupabase.from().select().order.mockResolvedValue({
        data: [],
        error: null
      });

      await getCargos();

      expect(mockSupabase.from).toHaveBeenCalledWith('cargos');
      expect(mockSupabase.from).not.toHaveBeenCalledWith('cargo');
    });

    test('deve ordenar por id_cargos específico', async () => {
      mockSupabase.from().select().order.mockResolvedValue({
        data: [],
        error: null
      });

      await getCargos();

      expect(mockSupabase.from().select().order).toHaveBeenCalledWith('id_cargos');
    });
  });
});