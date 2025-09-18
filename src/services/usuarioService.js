import { supabase } from './supabase/supabaseClient';

export const createUsuario = async (usuarioData) => {
  try {
    const dadosConvertidos = {
      nome: usuarioData.nome,
      telefone: usuarioData.telefone,
      email: usuarioData.email,
      endereco: usuarioData.endereco,
      cargo: usuarioData.cargo,
      senha: usuarioData.senha,
      status: usuarioData.status ||  '',
      turma: usuarioData.turma || null, // Garante que seja null se vazio
      cpf: usuarioData.cpf,
      data_nascimento: usuarioData.data_nascimento || null
    };

    console.log('Dados sendo enviados:', dadosConvertidos);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([dadosConvertidos])
      .select();

    if (error) {
      console.error('Erro detalhado do Supabase:', error);
      
      // Tratamento específico para foreign key error
      if (error.code === '23503') {
        if (error.message.includes('turma')) {
          throw new Error('A turma selecionada não existe no sistema');
        } else if (error.message.includes('cargo')) {
          throw new Error('O cargo selecionado não existe no sistema');
        }
      }
      
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

export const getUsuarios = async () => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
     .select(`
        *,
        cargos:cargo (cargo)
      `)
      .order('id_usuarios', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
};

// Atualizar usuário
export const updateUsuario = async (id, usuarioData) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update(usuarioData)
      .eq('id_usuarios', id)
      .select();

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro no serviço de atualização:', error);
    throw error;
  }
};

export const deleteUsuario = async (id) => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id_usuarios', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
};