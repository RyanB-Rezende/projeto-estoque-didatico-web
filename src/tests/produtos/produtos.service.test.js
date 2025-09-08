/**
 * Suite mínima (3 testes) no estilo simples de mock igual ao exemplo de contatos.
 * 1. getProdutos lista itens (confere from, select('*') e chain order).
 * 2. addProduto calcula saldo (entrada - saida) quando não informado explicitamente.
 * 3. getProdutos propaga erro do Supabase.
 */

import { getProdutos, addProduto, updateProduto } from '../../services/produtos/produtosService';
import { supabase } from '../../services/supabase/supabase';

// Mock simples do Supabase
jest.mock('../../services/supabase/supabase', () => ({
  supabase: { from: jest.fn() }
}));

beforeEach(() => {
  supabase.from.mockReset();
});

describe('Service produtos (mínimo útil)', () => {
  test('getProdutos lista itens', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: [{ id_produtos: 1, nome: 'A' }], error: null });
    const mockSelect = jest.fn(() => ({ order: mockOrder }));
    supabase.from.mockReturnValue({ select: mockSelect });

    const data = await getProdutos();

    expect(supabase.from).toHaveBeenCalledWith('produtos');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('id_produtos', { ascending: true });
    expect(data).toHaveLength(1);
  });

  test('addProduto calcula saldo quando ausente', async () => {
    const mockSelect = jest.fn().mockResolvedValue({ data: [{ id_produtos: 10, nome: 'Lápis', medida: 1, entrada: 8, saida: 3, saldo: 5 }], error: null });
    const mockInsert = jest.fn(() => ({ select: mockSelect }));
    supabase.from.mockReturnValue({ insert: mockInsert });

    const result = await addProduto({ nome: 'Lápis', medida: 1, entrada: 8, saida: 3 });

    expect(supabase.from).toHaveBeenCalledWith('produtos');
    expect(mockInsert).toHaveBeenCalledTimes(1);
    const payloadEnviado = mockInsert.mock.calls[0][0][0];
    expect(payloadEnviado.saldo).toBe(5);
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(result.saldo).toBe(5);
  });

  test('getProdutos propaga erro do Supabase', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: null, error: new Error('falhou') });
    const mockSelect = jest.fn(() => ({ order: mockOrder }));
    supabase.from.mockReturnValue({ select: mockSelect });

    await expect(getProdutos()).rejects.toThrow('falhou');
    expect(supabase.from).toHaveBeenCalledWith('produtos');
    expect(mockSelect).toHaveBeenCalledWith('*');
  });

  test('updateProduto calcula saldo quando ausente e sanitiza campos', async () => {
    const mockSelect = jest.fn().mockResolvedValue({ data: [{ id_produtos: 55, nome: 'Item', medida: 2, entrada: 10, saida: 3, saldo: 7, local: 'Lab', codigo: 'COD' }], error: null });
    const mockEq = jest.fn(() => ({ select: mockSelect }));
    const mockUpdate = jest.fn(() => ({ eq: mockEq }));
    supabase.from.mockReturnValue({ update: mockUpdate });

    const result = await updateProduto(55, { nome: '  Item  ', medida: '2', entrada: '10', saida: '3', local: ' Lab ', codigo: 'COD', saldo: undefined, foo: 'bar' });

    expect(supabase.from).toHaveBeenCalledWith('produtos');
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const payload = mockUpdate.mock.calls[0][0];
    expect(payload).toMatchObject({ nome: 'Item', medida: 2, entrada: 10, saida: 3, saldo: 7, local: 'Lab', codigo: 'COD' });
    expect(payload).not.toHaveProperty('foo');
    expect(mockEq).toHaveBeenCalledWith('id_produtos', 55);
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(result.saldo).toBe(7);
  });
});
