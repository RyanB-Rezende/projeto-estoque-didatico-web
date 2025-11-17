import { supabase } from '../supabase/supabase.js';
import { getProdutoById, updateProduto } from '../produtos/produtosService';

// Table name constant (single source of truth)
const TABLE = 'movimentacao';

// Insert new movement record
export async function insertMovimentacao(mov) {
  const payload = {
    id_produtos: mov.id_produtos,
    id_turma: mov.id_turma ?? null,
    id_usuarios: mov.id_usuarios,
    data_saida: mov.data_saida || new Date().toISOString(),
    quantidade: Number(mov.quantidade),
    tipo: mov.tipo, // 'entrada' | 'saida'
    observacao: mov.observacao || null,
  };
  const { data, error } = await supabase.from(TABLE).insert([payload]).select('*').single();
  if (error) throw error;
  return data;
}

export async function getMovimentacoesAll() {
  const { data, error } = await supabase.from(TABLE).select('*').order('data_saida', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getMovimentacoesByUsuario(idUsuario) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id_usuarios', idUsuario).order('data_saida', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getMovimentacoesByTurma(idTurma) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id_turma', idTurma).order('data_saida', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateMovimentacao(mov) {
  const { error } = await supabase.from(TABLE).update({
    quantidade: Number(mov.quantidade),
    tipo: mov.tipo,
    observacao: mov.observacao || null,
  }).eq('id_movimentacao', mov.id_movimentacao);
  if (error) throw error;
}

export async function deleteMovimentacao(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id_movimentacao', id);
  if (error) throw error;
}

export async function clearAllMovimentacoes() {
  const { error } = await supabase.from(TABLE).delete().neq('id_movimentacao', 0);
  if (error) throw error;
}

// Update product saldo based on movement without creating duplicate movement record
export async function applyMovimentacaoToProduto(idProduto, quantidade, tipo) {
  const produto = await getProdutoById(idProduto);
  if (!produto) throw new Error('Produto não encontrado');
  const q = Number(quantidade);
  if (isNaN(q) || q <= 0) throw new Error('Quantidade inválida');

  const entrada = Number(produto.entrada) || 0;
  const saida = Number(produto.saida) || 0;
  let saldo = Number(produto.saldo) || (entrada - saida);

  let novoEntrada = entrada;
  let novoSaida = saida;
  if (tipo === 'entrada') {
    novoEntrada = entrada + q;
    saldo = saldo + q;
  } else {
    novoSaida = saida + q;
    saldo = saldo - q;
    if (saldo < 0) saldo = 0; // evita saldo negativo
  }

  await updateProduto(idProduto, {
    nome: produto.nome,
    medida: produto.medida,
    local: produto.local,
    entrada: novoEntrada,
    saida: novoSaida,
    saldo: saldo,
    codigo: produto.codigo,
    data_entrada: produto.data_entrada,
  });
}
