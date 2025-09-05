import React, { useState, useEffect } from "react";
import { getUsuario } from "../services/usuarioService";

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    getUsuario().then(setUsuarios);
  }, []);

  return (
    <ul>
      {usuarios.map((u) => (
        <li key={u.id}>
          <strong>{u.nome}</strong> - {u.email} - {u.telefone}
        </li>
      ))}
    </ul>
  );
};

export default UsuarioList;
