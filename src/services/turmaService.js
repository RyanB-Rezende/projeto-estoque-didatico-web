import { supabase } from './supabaseClient';

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