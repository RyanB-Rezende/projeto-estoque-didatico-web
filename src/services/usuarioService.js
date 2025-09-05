import { supabase } from "../supabase"; // ← Corrija o import

export const getUsuarios = async () => {
    const {data, error} = await supabase.from('usuarios').select(`
        *,
        cargos (*)
    `);
    if (error) throw error;
    return data;
};

export const addUsuario = async (usuarioData) => {
    const {data, error} = await supabase.from('usuarios').insert([usuarioData]).select();
    if (error) throw error;
    return data;
};

export const getCargos = async () => {
    const {data, error} = await supabase.from('cargos').select("*");
    if (error) throw error;
    return data;
};