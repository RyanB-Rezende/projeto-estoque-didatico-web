import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function CadastroUsuarios({ onSubmit = () => {} }) {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    endereco: "",
    cargo: "",
    senha: "",
    turma: "",
    data_nascimento: "",
    foto: "",
  });

  const [cargos, setCargos] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function fetchCargos() {
      const { data, error } = await supabase.from("cargos").select("*");
      if (!error) setCargos(data);
    }
    fetchCargos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCpfChange = (e) => {
    const formattedValue = e.target.value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
    setFormData((prev) => ({ ...prev, cpf: formattedValue }));
  };

  const handlePhoneChange = (e) => {
    const formattedValue = e.target.value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
    setFormData((prev) => ({ ...prev, telefone: formattedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    // Validações
    if (!formData.nome) newErrors.nome = "O nome é obrigatório.";
    if (!formData.telefone) newErrors.telefone = "O telefone é obrigatório.";
    if (!formData.email) newErrors.email = "O email é obrigatório.";
    if (!formData.endereco) newErrors.endereco = "O endereço é obrigatório.";
    if (!formData.cargo) newErrors.cargo = "O cargo é obrigatório.";
    if (!formData.senha) newErrors.senha = "A senha é obrigatória.";
    if (!formData.cpf) newErrors.cpf = "O CPF é obrigatório.";
    if (!formData.data_nascimento) newErrors.data_nascimento = "A data de nascimento é obrigatória.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const usuario = {
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email,
          endereco: formData.endereco,
          senha: formData.senha,
          cpf: formData.cpf,
          foto: formData.foto || null,
          data_nascimento: formData.data_nascimento || null,
          cargo: formData.cargo,
          turma: formData.turma || null,
        };

        const { error } = await supabase.from("usuarios").insert([usuario]);
        if (error) {
          alert("Erro ao cadastrar usuário: " + error.message);
          return;
        }

        alert("Usuário cadastrado com sucesso!");
        onSubmit(formData);
        setFormData({
          nome: "",
          cpf: "",
          email: "",
          telefone: "",
          endereco: "",
          cargo: "",
          senha: "",
          turma: "",
          data_nascimento: "",
          foto: "",
        });
      } catch (error) {
        alert("Erro: " + error.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container p-3 border rounded">
      <h2 className="mb-4">Cadastro de Usuário</h2>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="nome">Nome completo:</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className={`form-control ${errors.nome ? "is-invalid" : ""}`}
            required
          />
          {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="cpf">CPF:</label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleCpfChange}
            className={`form-control ${errors.cpf ? "is-invalid" : ""}`}
            placeholder="000.000.000-00"
            maxLength={14}
            required
          />
          {errors.cpf && <div className="invalid-feedback">{errors.cpf}</div>}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            required
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="telefone">Telefone:</label>
          <input
            type="text"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handlePhoneChange}
            className={`form-control ${errors.telefone ? "is-invalid" : ""}`}
            placeholder="(00) 00000-0000"
            required
          />
          {errors.telefone && <div className="invalid-feedback">{errors.telefone}</div>}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="endereco">Endereço completo:</label>
        <input
          type="text"
          id="endereco"
          name="endereco"
          value={formData.endereco}
          onChange={handleChange}
          className={`form-control ${errors.endereco ? "is-invalid" : ""}`}
          required
        />
        {errors.endereco && <div className="invalid-feedback">{errors.endereco}</div>}
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label" htmlFor="cargo">Cargo:</label>
          <select
            id="cargo"
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            className={`form-select ${errors.cargo ? "is-invalid" : ""}`}
            required
          >
            <option value="">Selecione o cargo</option>
            {cargos.map((cargo) => (
              <option key={cargo.id_cargo} value={cargo.id_cargo}>{cargo.cargo}</option>
            ))}
          </select>
          {errors.cargo && <div className="invalid-feedback">{errors.cargo}</div>}
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label" htmlFor="turma">Turma (opcional):</label>
          <input
            type="text"
            id="turma"
            name="turma"
            value={formData.turma}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label" htmlFor="data_nascimento">Data de Nascimento:</label>
          <input
            type="date"
            id="data_nascimento"
            name="data_nascimento"
            value={formData.data_nascimento}
            onChange={handleChange}
            className={`form-control ${errors.data_nascimento ? "is-invalid" : ""}`}
            required
          />
          {errors.data_nascimento && <div className="invalid-feedback">{errors.data_nascimento}</div>}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="senha">Senha:</label>
        <input
          type="password"
          id="senha"
          name="senha"
          value={formData.senha}
          onChange={handleChange}
          className={`form-control ${errors.senha ? "is-invalid" : ""}`}
          required
        />
        {errors.senha && <div className="invalid-feedback">{errors.senha}</div>}
      </div>

      <button type="submit" className="btn btn-dark w-100">Cadastrar Usuário</button>
    </form>
  );
}
