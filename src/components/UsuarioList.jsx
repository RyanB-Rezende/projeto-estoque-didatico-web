import { use, useEffect, useState } from "react"
import { getUsuario } from "../services/usuarioService";

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    getUsuario().then(setUsuarios);
  }, []);

  const handleDelete = async (id) => {
    await deleteUsuario(id);
    setUsuarios((prevUsuarios) => prevUsuarios.filter((usuario) => usuario.id !== id));
  };
  return (
    <ul>
      {usuarios.map((usuario) => (
        <li key={usuario.id}>
          <strong>{usuario.nome}</strong> - {usuario.email} - {usuario.telefone}
          <button onClick={() => handleDelete(usuario.id)}>Remover</button>
        </li>
      ))}
      </ul>
  );
};

export default UsuarioList;