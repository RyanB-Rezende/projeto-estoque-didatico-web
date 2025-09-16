import { addCurso, getCursos, updateCurso, deleteCurso } from '../../services/cursos/cursosService';
import { supabase } from '../../services/supabase/supabase';

jest.mock('../../services/supabase/supabase', () => ({
  supabase: { from: jest.fn() }
}));

beforeEach(() => {
  supabase.from.mockReset();
});

describe('Service cursos', () => {
  test('getCursos lista itens ordenados por nome', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: [{ id_cursos: 1, nome: 'A' }], error: null });
    const mockSelect = jest.fn(() => ({ order: mockOrder }));
    supabase.from.mockReturnValue({ select: mockSelect });

    const data = await getCursos();

    expect(supabase.from).toHaveBeenCalledWith('cursos');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('nome', { ascending: true });
    expect(data).toHaveLength(1);
  });

  test('addCurso envia apenas nome normalizado e retorna inserido', async () => {
    const mockSelect = jest.fn().mockResolvedValue({ data: [{ id_cursos: 3, nome: 'Curso X' }], error: null });
    const mockInsert = jest.fn(() => ({ select: mockSelect }));
    supabase.from.mockReturnValue({ insert: mockInsert });

    const result = await addCurso({ nome: '  Curso X  ' });

    expect(supabase.from).toHaveBeenCalledWith('cursos');
    expect(mockInsert).toHaveBeenCalledTimes(1);
    const payload = mockInsert.mock.calls[0][0][0];
    expect(payload).toEqual({ nome: 'Curso X' });
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(result).toMatchObject({ id_cursos: 3, nome: 'Curso X' });
  });

  test('updateCurso atualiza nome e retorna single', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: { id_cursos: 5, nome: 'Atualizado' }, error: null });
    const mockEq = jest.fn(() => ({ select: jest.fn(() => ({ single: mockSingle })) }));
    const mockUpdate = jest.fn(() => ({ eq: mockEq }));
    supabase.from.mockReturnValue({ update: mockUpdate });

    const result = await updateCurso(5, { nome: '  Atualizado  ' });

    expect(supabase.from).toHaveBeenCalledWith('cursos');
    const sent = mockUpdate.mock.calls[0][0];
    expect(sent).toEqual({ nome: 'Atualizado' });
    expect(mockEq).toHaveBeenCalledWith('id_cursos', 5);
    expect(mockSingle).toHaveBeenCalled();
    expect(result).toMatchObject({ id_cursos: 5, nome: 'Atualizado' });
  });

  test('deleteCurso deleta por id', async () => {
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    const mockDelete = jest.fn(() => ({ eq: mockEq }));
    supabase.from.mockReturnValue({ delete: mockDelete });

    await deleteCurso(7);

    expect(supabase.from).toHaveBeenCalledWith('cursos');
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockEq).toHaveBeenCalledWith('id_cursos', 7);
  });

  test('getCursos propaga erro do supabase', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: null, error: new Error('falhou') });
    const mockSelect = jest.fn(() => ({ order: mockOrder }));
    supabase.from.mockReturnValue({ select: mockSelect });

    await expect(getCursos()).rejects.toThrow('falhou');
  });
});
