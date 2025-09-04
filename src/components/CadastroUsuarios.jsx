// ...imports...

import React, { useState } from "react";

export default function CadastroUsuarios ({ onSubmit = () => {} }) {
    const [formData, setFormData] = useState({
        nome: "",
        telefone: "",
        email: "",
        endereco: "",
        cargo: "",
        senha: "",
        turma: "",
        cpf: "",
        foto: null,
        dataNascimento: "",
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData({
            ...formData,
            [name]: type === "file" ? files[0] : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

return (
        <form role="form" aria-label="formulario" onSubmit={handleSubmit}>
            <label>
                Nome
                <input name="nome" value={formData.nome} onChange={handleChange} />
            </label>
            <label>
                Telefone
                <input name="telefone" value={formData.telefone} onChange={handleChange} />
            </label>
            <label>
                Email
                <input name="email" value={formData.email} onChange={handleChange} />
            </label>
            <label>
                Endereço
                <input name="endereco" value={formData.endereco} onChange={handleChange} />
            </label>
            <label>
                Cargo
                <input name="cargo" value={formData.cargo} onChange={handleChange} />
            </label>
            <label>
                Senha
                <input name="senha" type="password" value={formData.senha} onChange={handleChange} />
            </label>
            <label>
                Turma
                <input name="turma" value={formData.turma} onChange={handleChange} />
            </label>
            <label>
                Cpf
                <input name="cpf" value={formData.cpf} onChange={handleChange} />
            </label>
            <label>
                Foto
                <input name="foto" type="file" onChange={handleChange} />
            </label>
            <label>
                Nascimento
                <input name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} />
            </label>
            <button type="submit">Salvar</button>
        </form>
    );
};