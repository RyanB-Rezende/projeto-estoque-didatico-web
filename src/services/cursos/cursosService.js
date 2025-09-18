import { supabase } from '../supabase/supabase.js';

// Serviço de cursos - implementação mínima para atender testes TDD
export const addCurso = async (curso) => {
  const payload = {
    nome: curso.nome?.trim()
  };
  const { data, error } = await supabase
    .from('cursos')
    .insert([payload])
    .select('*');
  if (error) throw error;
  return data[0];
};

export const getCursos = async () => {
  const { data, error } = await supabase
    .from('cursos')
    .select('*')
    .order('nome', { ascending: true });
  if (error) throw error;
  return data;
};

export const updateCurso = async (id_cursos, changes) => {
  const payload = {};
  if (changes?.nome != null) payload.nome = String(changes.nome).trim();
  const { data, error } = await supabase
    .from('cursos')
    .update(payload)
    .eq('id_cursos', id_cursos)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const deleteCurso = async (id_cursos) => {
  const { error } = await supabase
    .from('cursos')
    .delete()
    .eq('id_cursos', id_cursos);
  if (error) throw error;
  return true;
};
