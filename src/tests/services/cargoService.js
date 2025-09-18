import { supabase } from './supabaseClient';

export const getCargos = async () => {
	const { data, error } = await supabase
		.from('cargos')
		.select('*')
		.order('id_cargos');
	if (error) throw error;
	return data;
};
