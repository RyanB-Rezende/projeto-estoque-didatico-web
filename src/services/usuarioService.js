// import CadastroUsuarios from "../components/CadastroUsuarios"

// export const cadastrarUsuario = async () => {
//     const {data, error} = await supabase.from('usuarios').select("*");
//     if (error) { 
//         throw new error;
//         return data;
//     };

// export const listarUsuarios = async () => {
//     const {data, error} = await supabase.from('usuarios').select("*");
//     if (error) { 
//         throw new error;
//         return data;
//     };
// };
//     return data;
// };

// export const editarUsuario = async (id, usuario) => {
//     const {data, error} = await supabase.from('usuarios').update(usuario).eq('id', id);
//     if (error) {
//         throw new error;
//         return data;
//     };
//     return data;
// };

// export const deletarUsuario = async (id) => {
//     const {data, error} = await supabase.from('usuarios').delete().eq('id', id);
//     if (error) {
//         throw new error;
//         return data;
//     };
//     return data;
// };

// export default {
//     cadastrarUsuario,
//     listarUsuarios,
//     editarUsuario,
//     deletarUsuario
// };

