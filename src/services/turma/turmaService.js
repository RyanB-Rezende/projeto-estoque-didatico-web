import { supabase } from '../supabase/supabaseClient';

export const getTurmas = async () => {
  try {
    console.log('Buscando turmas no Supabase...');
    
    const { data, error } = await supabase
      .from('turma')
      .select('*')
      .order('id_turma');

    if (error) {
      console.error('Erro ao buscar turmas:', error);
      throw error;
    }

    console.log('Turmas encontradas:', data);
    return data;
  } catch (error) {
    console.error('Erro completo ao buscar turmas:', error);
    throw error;
  }
};

export const addTurma = async ({ turma }) => {
  // insere coluna "turma" (nome da turma)
  const payload = { turma: String(turma || '').trim() };
  const { data, error } = await supabase
    .from('turma')
    .insert([payload])
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const updateTurma = async (id_turma, changes) => {
  const payload = {};
  if (changes?.turma != null) payload.turma = String(changes.turma).trim();
  const { data, error } = await supabase
    .from('turma')
    .update(payload)
    .eq('id_turma', id_turma)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const deleteTurma = async (id_turma) => {
  const { error } = await supabase
    .from('turma')
    .delete()
    .eq('id_turma', id_turma);
  if (error) throw error;
  return true;
};