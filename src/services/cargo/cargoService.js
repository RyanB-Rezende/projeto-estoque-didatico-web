import { supabase } from '../supabase/supabaseClient';

export const getCargos = async () => {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
      .order('id_cargos');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar cargos:', error);
    throw error;
  }
};