// Mock do supabaseClient PRIMEIRO
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({
          data: [{ id_turma: 1, turma: 'Turma A' }],
          error: null
        })
      })
    })
  }
}));

// Import usando REQUIRE (que funcionou)
const { getTurmas } = require('../services/turmaService');

describe('Turma Service', () => {
  test('getTurmas deve retornar dados corretamente', async () => {
    const result = await getTurmas();
    expect(result).toEqual([{ id_turma: 1, turma: 'Turma A' }]);
  });

  test('getTurmas deve ser uma função', () => {
    expect(typeof getTurmas).toBe('function');
  });
});