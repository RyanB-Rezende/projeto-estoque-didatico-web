// Mock mínimo - substitui toda a função supabase
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({
          data: [{ id_cargos: 1, cargo: 'Professor' }],
          error: null
        })
      })
    })
  }
}));

// Usa require para evitar problemas de hoisting
const { getCargos } = require('../services/cargoService');

describe('Cargo Service', () => {
  test('getCargos retorna dados', async () => {
    const result = await getCargos();
    expect(result).toEqual([{ id_cargos: 1, cargo: 'Professor' }]);
  });
});