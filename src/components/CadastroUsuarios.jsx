import React, { useState } from "react";
import { supabase } from "../supabase";

export default function CadastroUsuarios({ onSubmit = () => {} }) {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    endereco: "",
    cargo: "",
    senha: "",
    turma: "",
    cpf: "",
    data_nascimento: "",
  });

  const [cargos, setCargos] = useState([]);
  const [errors, setErrors] = useState({});

    // Carrega os cargos disponíveis
  useEffect(() => {
    const loadCargos = async () => {
      try {
        const cargosData = await getCargos();
        setCargos(cargosData);
      } catch (error) {
        console.error("Erro ao carregar cargos:", error);
      }
    };
    
    loadCargos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
    if (!formData.turma) newErrors.turma = "A turma é obrigatória.";
    if (!formData.cpf) newErrors.cpf = "O CPF é obrigatório.";
    if (!formData.data_nascimento) newErrors.data_nascimento = "A data de nascimento é obrigatória.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const { error } = await supabase.from("usuarios").insert([formData]);

        if (error) {
          alert("Erro ao cadastrar usuário: " + error.message);
          return;
        }

        alert("Usuário cadastrado com sucesso!");
        onSubmit(formData);
        
        // Limpa o formulário
        setFormData({
          nome: "",
          telefone: "",
          email: "",
          endereco: "",
          cargo: "",
          senha: "",
          turma: "",
          cpf: "",
          data_nascimento: "",
        });

      } catch (error) {
        alert("Erro: " + error.message);
      }
    }
  };

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatPhone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const handleCpfChange = (e) => {
    const formattedValue = formatCPF(e.target.value);
    setFormData({
      ...formData,
      cpf: formattedValue,
    });
  };

  const handlePhoneChange = (e) => {
    const formattedValue = formatPhone(e.target.value);
    setFormData({
      ...formData,
      telefone: formattedValue,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="container p-3 border rounded">
      <h2 className="mb-4">Cadastro de Usuário</h2>
      
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Nome completo:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
            required
          />
          {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">CPF:</label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleCpfChange}
            className={`form-control ${errors.cpf ? 'is-invalid' : ''}`}
            placeholder="000.000.000-00"
            maxLength="14"
            required
          />
          {errors.cpf && <div className="invalid-feedback">{errors.cpf}</div>}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            required
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Telefone:</label>
          <input
            type="text"
            name="telefone"
            value={formData.telefone}
            onChange={handlePhoneChange}
            className={`form-control ${errors.telefone ? 'is-invalid' : ''}`}
            placeholder="(00) 00000-0000"
            required
          />
          {errors.telefone && <div className="invalid-feedback">{errors.telefone}</div>}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Endereço completo:</label>
        <input
          type="text"
          name="endereco"
          value={formData.endereco}
          onChange={handleChange}
          className={`form-control ${errors.endereco ? 'is-invalid' : ''}`}
          required
        />
        {errors.endereco && <div className="invalid-feedback">{errors.endereco}</div>}
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">Cargo:</label>
          <select
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            className={`form-select ${errors.cargo ? 'is-invalid' : ''}`}
            required
          >
            <option value="">Selecione o cargo</option>
            <option value="professor">Professor</option>
            <option value="aluno">Aluno</option>
            <option value="administrador">Administrador</option>
            <option value="coordenador">Coordenador</option>
          </select>
          {errors.cargo && <div className="invalid-feedback">{errors.cargo}</div>}
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">Turma:</label>
          <input
            type="text"
            name="turma"
            value={formData.turma}
            onChange={handleChange}
            className={`form-control ${errors.turma ? 'is-invalid' : ''}`}
            required
          />
          {errors.turma && <div className="invalid-feedback">{errors.turma}</div>}
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">Data de Nascimento:</label>
          <input
            type="date"
            name="data_nascimento"
            value={formData.data_nascimento}
            onChange={handleChange}
            className={`form-control ${errors.data_nascimento ? 'is-invalid' : ''}`}
            required
          />
          {errors.data_nascimento && <div className="invalid-feedback">{errors.data_nascimento}</div>}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Senha:</label>
        <input
          type="password"
          name="senha"
          value={formData.senha}
          onChange={handleChange}
          className={`form-control ${errors.senha ? 'is-invalid' : ''}`}
          required
        />
        {errors.senha && <div className="invalid-feedback">{errors.senha}</div>}
      </div>

      <button type="submit" className="btn btn-dark w-100">Cadastrar Usuário</button>
    </form>
  );
}