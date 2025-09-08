import { supabase } from '../supabase/supabase';

// Helper para sanitizar e preparar objeto antes de enviar ao banco
const sanitizeProduto = (produto) => {
  const entrada = produto.entrada === '' || produto.entrada === undefined ? 0 : Number(produto.entrada);
  const saida = produto.saida === '' || produto.saida === undefined ? 0 : Number(produto.saida);
  let saldo = produto.saldo;
  if (saldo === undefined || saldo === null || isNaN(Number(saldo))) {
    saldo = entrada - saida; // saldo inicial calculado se não informado
  }
  return {
    nome: produto.nome?.trim(),
    medida: Number(produto.medida), // FK para tabela medida (id_medida)
    local: produto.local?.trim() || null,
    entrada: entrada,
    saida: saida,
    saldo: Number(saldo),
    codigo: produto.codigo?.trim() || null,
    data_entrada: produto.data_entrada || null,
  };
};

export const getProdutos = async () => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('id_produtos', { ascending: true });
  if (error) throw error;
  return data;
};

export const getProdutoById = async (id) => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id_produtos', id)
    .single();
  if (error) throw error;
  return data;
};

export const addProduto = async (produto) => {
  const novo = sanitizeProduto(produto);
  const { data, error } = await supabase
    .from('produtos')
    .insert([novo])
    .select('*');
  if (error) throw error;
  return data[0];
};

export const updateProduto = async (id, produto) => {
  const atualizado = sanitizeProduto(produto);
  // Remove chaves com undefined para não sobrescrever com null indevido
  Object.keys(atualizado).forEach(k => atualizado[k] === undefined && delete atualizado[k]);
  const { data, error } = await supabase
    .from('produtos')
    .update(atualizado)
    .eq('id_produtos', id)
    .select('*');
  if (error) throw error;
  return data?.[0];
};

export const deleteProduto = async (id) => {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id_produtos', id);
  if (error) throw error;
};

// Utilitário opcional para popular selects de medidas
export const getMedidas = async () => {
  const { data, error } = await supabase
    .from('medida')
    .select('id_medida, medida, descricao')
    .order('id_medida', { ascending: true });
  if (error) throw error;
  return data;
};
