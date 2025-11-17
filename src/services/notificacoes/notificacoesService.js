import { supabase } from '../supabase/supabase.js';

const TABLE = 'notificacoes';

export async function insertNotificacao(n) {
  const payload = {
    solicitante_nome: n.solicitante_nome,
    solicitante_cargo: n.solicitante_cargo,
    produto_nome: n.produto_nome,
    quantidade: Number(n.quantidade),
    data_solicitacao: (n.data_solicitacao || new Date()).toISOString(),
    lida: !!n.lida,
    id_movimentacao: n.id_movimentacao ?? null,
    observacao: n.observacao ?? null,
    status: n.status || 'pendente',
    quantidade_aprovada: n.quantidade_aprovada ?? null,
  };
  const { data, error } = await supabase.from(TABLE).insert([payload]).select('id_notificacao').single();
  if (error) throw error;
  return data?.id_notificacao;
}

export async function fetchAllNotificacoes() {
  const { data, error } = await supabase.from(TABLE).select('*').order('data_solicitacao', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchNotificacoesByUser(solicitanteNome) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('solicitante_nome', solicitanteNome).order('data_solicitacao', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateNotificacaoStatus(id, { status, observacao, quantidadeAprovada }) {
  const { error } = await supabase.from(TABLE).update({
    status,
    observacao: observacao ?? null,
    quantidade_aprovada: quantidadeAprovada ?? null,
    lida: true,
  }).eq('id_notificacao', id);
  if (error) throw error;
  return id;
}

export async function deleteAllNotificacoes() {
  const { error } = await supabase.from(TABLE).delete().neq('id_notificacao', 0);
  if (error) throw error;
}

export async function getUnreadCountNotificacoes() {
  const { data, error } = await supabase.from(TABLE).select('*').eq('lida', false);
  if (error) throw error;
  return (data || []).length;
}

export async function markNotificacaoAsRead(id) {
  const { error } = await supabase.from(TABLE).update({ lida: true }).eq('id_notificacao', id);
  if (error) throw error;
}
