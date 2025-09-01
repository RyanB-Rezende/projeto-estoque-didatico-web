// Testes dos métodos do service de produtos usando mock do Supabase
// Foco: garantir que cada método constrói a cadeia de chamadas esperada
// e sanitiza/calcula campos corretamente (ex: saldo).

jest.mock('../services/supabase', () => {
  const state = { impls: {}, callLog: [] };
  const supabase = {
    from: (table) => {
      state.callLog.push({ op: 'from', table });
      const factory = state.impls[table];
      if (!factory) throw new Error('Mock não definido para tabela: ' + table);
      return factory(state.callLog);
    }
  };
  return {
    supabase,
    __setTable: (table, factory) => { state.impls[table] = factory; },
    __reset: () => { state.impls = {}; state.callLog = []; },
    __getLog: () => state.callLog,
  };
});

import { getProdutos, getProdutoById, addProduto, updateProduto, deleteProduto, getMedidas } from '../services/produtosService';
import { __setTable, __reset, __getLog } from '../services/supabase';

beforeEach(() => {
  __reset();
});

describe('Service produtos', () => {
  test('getProdutos deve selecionar e ordenar por id_produtos', async () => {
    __setTable('produtos', (log) => ({
      select: (cols) => { log.push({ op: 'select', cols }); return { order: () => Promise.resolve({ data: [{ id_produtos: 1 }], error: null }) }; }
    }));
    const data = await getProdutos();
    expect(data).toHaveLength(1);
    const log = __getLog();
    expect(log.find(l => l.op === 'select').cols).toBe('*');
  });

  test('getProdutoById deve usar eq e single', async () => {
    __setTable('produtos', (log) => ({
      select: () => ({
        eq: (col, val) => { log.push({ op: 'eq', col, val }); return { single: () => Promise.resolve({ data: { id_produtos: val }, error: null }) }; }
      })
    }));
    const row = await getProdutoById(42);
    expect(row.id_produtos).toBe(42);
    const log = __getLog();
    expect(log.some(l => l.op === 'eq' && l.col === 'id_produtos' && l.val === 42)).toBe(true);
  });

  test('addProduto calcula saldo se não fornecido (entrada - saida)', async () => {
    let inserted;
    __setTable('produtos', (log) => ({
      insert: (rows) => { inserted = rows[0]; return { select: () => Promise.resolve({ data: rows.map(r => ({ ...r, id_produtos: 10 })), error: null }) }; }
    }));
    const result = await addProduto({ nome: 'Lápis', medida: 1, entrada: 5, saida: 2 });
    expect(result.saldo).toBe(3);
    expect(inserted.saldo).toBe(3);
  });

  test('updateProduto aplica sanitização e retorna primeiro item', async () => {
    let updated;
    __setTable('produtos', () => ({
      update: (rows) => { updated = rows; return { eq: () => ({ select: () => Promise.resolve({ data: [{ id_produtos: 5, ...rows }], error: null }) }) }; }
    }));
    const r = await updateProduto(5, { nome: 'Caneta', medida: 2, entrada: '3', saida: '1' });
    expect(r.id_produtos).toBe(5);
    expect(updated.nome).toBe('Caneta');
  });

  test('deleteProduto executa delete com eq no id', async () => {
    const eqCalls = [];
    __setTable('produtos', () => ({
      delete: () => ({ eq: (col, val) => { eqCalls.push({ col, val }); return Promise.resolve({ error: null }); } })
    }));
    await deleteProduto(7);
    expect(eqCalls.some(c => c.col === 'id_produtos' && c.val === 7)).toBe(true);
  });

  test('getMedidas retorna lista de medidas', async () => {
    __setTable('medida', () => ({
      select: () => ({ order: () => Promise.resolve({ data: [{ id_medida: 1, medida: 'Unidade', descricao: '' }], error: null }) })
    }));
    const medidas = await getMedidas();
    expect(medidas[0].medida).toBe('Unidade');
  });

  test('propaga erro do Supabase', async () => {
    __setTable('produtos', () => ({
      select: () => ({ order: () => Promise.resolve({ data: null, error: new Error('falhou') }) })
    }));
    await expect(getProdutos()).rejects.toThrow('falhou');
  });
});
