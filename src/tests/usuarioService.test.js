// Mock do supabaseClient PRIMEIRO
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({
          data: [{ id_usuarios: 1, nome: 'João Silva' }],
          error: null
        })
      }),
      insert: () => ({
        select: () => Promise.resolve({
          data: [{ id_usuarios: 1, nome: 'Teste' }],
          error: null
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => Promise.resolve({
            data: [{ id_usuarios: 1, nome: 'Teste Atualizado' }],
            error: null
          })
        })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null })
      })
    })
  }
}));

// Import usando REQUIRE
const { getUsuarios, createUsuario, updateUsuario, deleteUsuario } = require('../services/usuarioService');

describe('Usuario Service', () => {
  test('getUsuarios deve retornar dados corretamente', async () => {
    const result = await getUsuarios();
    expect(result).toEqual([{ id_usuarios: 1, nome: 'João Silva' }]);
  });

  test('createUsuario deve retornar dados corretamente', async () => {
    const result = await createUsuario({
      nome: 'Teste',
      email: 'teste@email.com',
      telefone: '123456789',
      endereco: 'Rua Teste',
      cargo: 1,
      senha: 'senha123',
      cpf: '12345678901'
    });
    expect(result).toEqual([{ id_usuarios: 1, nome: 'Teste' }]);
  });

  test('updateUsuario deve retornar dados corretamente', async () => {
    const result = await updateUsuario(1, { nome: 'Teste Atualizado' });
    expect(result).toEqual([{ id_usuarios: 1, nome: 'Teste Atualizado' }]);
  });

  test('deleteUsuario deve funcionar sem erro', async () => {
    const result = await deleteUsuario(1);
    expect(result).toBe(true);
  });
});