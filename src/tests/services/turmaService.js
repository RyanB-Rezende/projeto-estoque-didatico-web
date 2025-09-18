import { supabase } from './supabaseClient';

export const getTurmas = async () => {
	const { data, error } = await supabase
		.from('turma')
		.select('*')
		.order('id_turma');
	if (error) throw error;
	return data;
};
