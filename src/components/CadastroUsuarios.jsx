import React, { useState } from "react";
import UsuarioList from "./UsuarioList";


const CadastroUsuarios = ({onSubmit}) => {
  const [formData, setFormData] = useState({
    nome: usuario.nome || "",
    telefone: usuario.telefone || "",
    email: usuario.email || "",
    endereco: usuario.endereco || "",
    cargo: usuario.cargo || "",
    senha: usuario.senha || "",
    turma: usuario.turma || "",
    cpf: usuario.cpf || "",
    dataNascimento: usuario.dataNascimento || "",
  });

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = (e) => {
  e.preventDefault();
  onSubmit(formData);
};

  return (
    <form role= "form" onSubmit={handleSubmit}>
      <label>
        Nome
        <input type="text" name="nome" value={formData.nome} onChange={handleChange} />
      </label>
      <label>
        Telefone
        <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} />
      </label>
      <label>
        Email
        <input type="email" name="email" value={formData.email} onChange={handleChange} />
      </label>
      <label>
        Endereço
        <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} />
      </label>
      <label>
        Cargo
        <input type="text" name="cargo" value={formData.cargo} onChange={handleChange} />
      </label>
      <label>
        Senha
        <input type="password" name="senha" value={formData.senha} onChange={handleChange} />
      </label>
      <label>
        Turma
        <input type="text" name="turma" value={formData.turma} onChange={handleChange} />
      </label>
      <label>
        CPF
        <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} />
      </label>
      <label>
        Data de Nascimento
        <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} />
      </label>
      <button type="submit">Cadastrar</button>
    </form>
  );
};

export default CadastroUsuarios;