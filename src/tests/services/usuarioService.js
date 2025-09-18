import { supabase } from './supabaseClient';

export const getUsuarios = async () => {
	const { data, error } = await supabase
		.from('usuarios')
		.select('*')
		.order('id_usuarios');
	if (error) throw error;
	return data;
};

export const createUsuario = async (usuario) => {
	const { data, error } = await supabase
		.from('usuarios')
		.insert([usuario])
		.select();
	if (error) throw error;
	return data;
};

export const getUsuarioById = async (id) => {
	const { data, error } = await supabase
		.from('usuarios')
		.select('*')
		.eq('id_usuarios', id)
		.single();
	if (error) throw error;
	return data;
};

export const updateUsuario = async (id, changes) => {
	const { data, error } = await supabase
		.from('usuarios')
		.update(changes)
		.eq('id_usuarios', id)
		.select();
	if (error) throw error;
	return data;
};

export const deleteUsuario = async (id) => {
	const { error } = await supabase
		.from('usuarios')
		.delete()
		.eq('id_usuarios', id);
	if (error) throw error;
	return true;
};
