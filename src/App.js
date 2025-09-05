import { useState } from "react";
import CadastroUsuarios from "./components/CadastroUsuarios";

function App() {
  const [usuarios, setUsuarios] = useState([]);

  const handleCadastro = (dados) => {
    setUsuarios([...usuarios, dados]);
  };

  return (
    <div>
      <CadastroUsuarios onSubmit={handleCadastro} />
      <h2>Usuários cadastrados:</h2>
      <ul>
        {usuarios.map((usuario, idx) => (
          <li key={idx}>
            {usuario.nome} - {usuario.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;