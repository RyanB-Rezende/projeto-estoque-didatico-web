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

export const addTurma = async ({ turma, instrutores = [] }) => {
  // insere coluna "turma" (nome da turma)
  const payload = { turma: String(turma || '').trim() };
  const { data, error } = await supabase
    .from('turma')
    .insert([payload])
    .select('*')
    .single();
  if (error) throw error;
  
  // Se houver instrutores, associá-los à turma
  if (instrutores.length > 0 && data?.id_turma) {
    try {
      // Atualizar cada usuário instrutor com a turma criada
      for (const instrutor of instrutores) {
        await supabase
          .from('usuarios')
          .update({ turma: data.id_turma })
          .eq('id_usuarios', instrutor.id_usuarios);
      }
    } catch (err) {
      console.warn('Erro ao associar instrutores à turma:', err);
      // Não lança erro, pois a turma foi criada com sucesso
    }
  }
  
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
  
  // Se houver instrutores, associá-los à turma
  if (changes?.instrutores && changes.instrutores.length > 0) {
    try {
      // Primeiro, remover todos os instrutores da turma atual
      const { data: usuariosAtuais } = await supabase
        .from('usuarios')
        .select('id_usuarios')
        .eq('turma', id_turma);
      
      if (usuariosAtuais && usuariosAtuais.length > 0) {
        for (const usuario of usuariosAtuais) {
          await supabase
            .from('usuarios')
            .update({ turma: null })
            .eq('id_usuarios', usuario.id_usuarios);
        }
      }
      
      // Adicionar os novos instrutores selecionados
      for (const instrutor of changes.instrutores) {
        await supabase
          .from('usuarios')
          .update({ turma: id_turma })
          .eq('id_usuarios', instrutor.id_usuarios);
      }
    } catch (err) {
      console.warn('Erro ao atualizar instrutores da turma:', err);
      // Não lança erro, pois a turma foi atualizada com sucesso
    }
  }
  
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