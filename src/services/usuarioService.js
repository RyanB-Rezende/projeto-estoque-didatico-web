import { supabase } from "@supabase/supabase-js";

export const getUsuario = async () => {
    const {data, error} = await supabase.from('usuarios').select("*");
    if (error) throw error;
    return data;
};

export const addUsuario = async () => {
    const {data, error} = await supabase.from('usuarios').select("*");
    if (error) throw error;
    return data;
};

