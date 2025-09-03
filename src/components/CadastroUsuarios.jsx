// ...imports...

import React, { useState } from "react";

function CadastroUsuarios({ onSubmit }) {
    const [form, setForm] = useState({
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
        const { name, value, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({
                ...form,
                foto: form.foto,
                dataNascimento: form.dataNascimento,
            });
        }
    };

    return (
       <form onSubmit={handleSubmit} aria-label="formulario">
            <label>
                Nome
                <input name="nome" value={form.nome} onChange={handleChange} />
            </label>
            <label>
                Telefone
                <input name="telefone" value={form.telefone} onChange={handleChange} />
            </label>
            <label>
                Email
                <input name="email" value={form.email} onChange={handleChange} />
            </label>
            <label>
                Endereço
                <input name="endereco" value={form.endereco} onChange={handleChange} />
            </label>
            <label>
                Cargo
                <input name="cargo" value={form.cargo} onChange={handleChange} />
            </label>
            <label>
                Senha
                <input name="senha" type="password" value={form.senha} onChange={handleChange} />
            </label>
            <label>
                Turma
                <input name="turma" value={form.turma} onChange={handleChange} />
            </label>
            <label>
                Cpf
                <input name="cpf" value={form.cpf} onChange={handleChange} />
            </label>
            <label>
                Foto
                <input name="foto" type="file" onChange={handleChange} />
            </label>
            <label>
                Nascimento
                <input name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange} />
            </label>
            <button type="submit">Salvar</button>
        </form>
    );
}

export default CadastroUsuarios;