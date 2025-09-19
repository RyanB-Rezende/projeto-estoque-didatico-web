import { supabase } from '../supabase/supabaseClient';
import bcrypt from 'bcryptjs';

export const createUsuario = async (usuarioData) => {
  try {
    // Hash da senha antes de salvar
    let senhaHash = usuarioData.senha;
    if (senhaHash && typeof senhaHash === 'string') {
      const salt = bcrypt.genSaltSync(10);
      senhaHash = bcrypt.hashSync(senhaHash, salt);
    }
    const dadosConvertidos = {
      nome: usuarioData.nome,
      telefone: usuarioData.telefone,
      email: usuarioData.email,
      endereco: usuarioData.endereco,
      cargo: usuarioData.cargo,
      senha: senhaHash,
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
        id_usuarios, nome, telefone, email, endereco, cargo, senha, status, turma, cpf, data_nascimento,
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

// Buscar um único usuário por ID (suporta número e string/UUID)
export const getUsuarioById = async (id) => {
  try {
    const isNumericId = typeof id === 'number' || /^\d+$/.test(String(id));

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_usuarios', isNumericId ? Number(id) : String(id))
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    throw error;
  }
};

// Atualizar usuário
export const updateUsuario = async (id, usuarioData) => {
  try {
    // Se senha vier preenchida, aplicar hash antes de atualizar
    const payload = { ...usuarioData };
    if (payload.senha && typeof payload.senha === 'string' && payload.senha.trim().length > 0) {
      const salt = bcrypt.genSaltSync(10);
      payload.senha = bcrypt.hashSync(payload.senha, salt);
    } else {
      // Evita atualizar senha com string vazia
      delete payload.senha;
    }
    const isNumericId = typeof id === 'number' || /^\d+$/.test(String(id));
    const { data, error } = await supabase
      .from('usuarios')
      .update(payload)
      .eq('id_usuarios', isNumericId ? Number(id) : String(id))
      .select()
      .single();

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