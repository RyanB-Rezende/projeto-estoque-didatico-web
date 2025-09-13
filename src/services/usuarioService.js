export const getUsuario = async () => {
  const {data, error} = await supabase
    .from('usuarios')
    .select('*');
  if (error) throw error;
  return data;
};

export const addUsuario = async (usuario) => {
  const {data, error} = await supabase
    .from('usuarios')
    .insert([usuario]);
  if (error) throw error;
  return data;
};

export const deleteUsuario = async (id) => {
  const {error} = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const updateUsuario = async (id, usuario) => {
  const {data, error} = await supabase
    .from('usuarios')
    .update(usuario)
    .eq('id', id);
  if (error) throw error;
  return data;
};