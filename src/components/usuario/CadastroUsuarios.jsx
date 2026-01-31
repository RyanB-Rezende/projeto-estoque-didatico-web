import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUsuario } from '../../services/usuario/usuarioService';
import { getCargos } from '../../services/cargo/cargoService';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaLock } from 'react-icons/fa';

const CadastroUsuarios = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    cargo: '',
    senha: '',
    confirmarSenha: '',
    turma: '',
    cpf: '',
    data_nascimento: ''
  });

  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      try {
  const cargosData = await getCargos();
  setCargos(cargosData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    carregarDados();
  }, []);

  // Funções de máscara
  const formatTelefone = (value) => {
    value = value.replace(/\D/g, ""); // remove tudo que não é número
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2"); // adiciona parênteses
    value = value.replace(/(\d{5})(\d{4})$/, "$1-$2"); // adiciona hífen
    return value;
  };

  const formatCPF = (value) => {
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return value;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "telefone") value = formatTelefone(value);
    if (name === "cpf") value = formatCPF(value);

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Revalida campo específico e regras dependentes (senha confirmada)
    setErrors(prev => {
      const next = { ...prev };
      if (showErrors) {
        // Campos obrigatórios
        ['nome','email','telefone','cpf','endereco','cargo','senha','confirmarSenha'].forEach(c => {
          if (c === name) {
            if (!value || value.trim() === '') next[c] = 'Obrigatório'; else delete next[c];
          }
        });
        // Revalida máscara CPF/telefone se desejar (placeholder simplificado)
        if (name === 'telefone' && value && value.replace(/\D/g,'').length < 10) next.telefone = 'Telefone incompleto';
        if (name === 'cpf' && value && value.replace(/\D/g,'').length < 11) next.cpf = 'CPF incompleto';
        // Senha mismatch
        const senhaVal = name === 'senha' ? value : formData.senha;
        const confVal = name === 'confirmarSenha' ? value : formData.confirmarSenha;
        if (senhaVal && confVal && senhaVal !== confVal) {
          next.senha = 'Senhas diferentes';
          next.confirmarSenha = 'Senhas diferentes';
        } else {
          if (next.senha === 'Senhas diferentes') delete next.senha;
          if (next.confirmarSenha === 'Senhas diferentes') delete next.confirmarSenha;
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowErrors(true);

    // Construir mapa de erros obrigatório
    const currentErrors = {};
    ['nome','email','telefone','cpf','endereco','cargo','senha','confirmarSenha'].forEach(c => {
      if (!formData[c] || formData[c].trim() === '') currentErrors[c] = 'Obrigatório';
    });
    if (formData.telefone && formData.telefone.replace(/\D/g,'').length < 10) currentErrors.telefone = 'Telefone incompleto';
    if (formData.cpf && formData.cpf.replace(/\D/g,'').length < 11) currentErrors.cpf = 'CPF incompleto';
    if (formData.senha && formData.confirmarSenha && formData.senha !== formData.confirmarSenha) {
      currentErrors.senha = 'Senhas diferentes';
      currentErrors.confirmarSenha = 'Senhas diferentes';
    }
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) {
      const values = Object.values(currentErrors);
      const mismatch = values.includes('Senhas diferentes');
      const hasMissing = values.includes('Obrigatório');
      const allMissing = hasMissing && values.every(v => v === 'Obrigatório');
      const message = mismatch
        ? 'As senhas não conferem. Confirme a senha corretamente.'
        : allMissing
        ? 'Por favor, preencha todos os campos obrigatórios!'
        : 'Por favor, corrija os campos destacados.';
      alert(message);
      setLoading(false);
      return;
    }

  try {
    // Determinar o status com base no cargo selecionado
    let status = 'ATIVO'; // Valor padrão
    if (parseInt(formData.cargo) === 2) {
      status = 'admin';
    } else if (parseInt(formData.cargo) === 3) {
      status = 'Instrutor(a)';
    }

    const { confirmarSenha, ...rest } = formData;
    const dadosParaEnviar = {
      ...rest,
      cargo: parseInt(formData.cargo),
      turma: formData.turma ? parseInt(formData.turma) : null,
      status: status // Adicionamos o status calculado
    };

    console.log('Dados sendo enviados:', dadosParaEnviar);

    const usuarioCriado = await createUsuario(dadosParaEnviar);
    console.log('✅ Usuário salvo no Supabase:', usuarioCriado);

    alert('Usuário cadastrado com sucesso!');
    navigate('/usuarios');
  } catch (error) {
    console.error('❌ Erro ao cadastrar usuário:', error);
    alert('Erro ao cadastrar usuário: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{
      background: "linear-gradient(to bottom, #0a84ff, #0077e6)",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        background: "#fff",
        padding: "2rem",
        borderRadius: "12px",
        width: "400px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        textAlign: "center"
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <div style={{
            background: "#eaeaea",
            borderRadius: "50%",
            padding: "1rem",
            width: "70px",
            height: "70px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <FaUser size={40} />
          </div>
        </div>

        <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Cadastro de Usuário</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{...inputGroup, border: errors.nome? '1px solid #dc3545':'1px solid #ddd'}}>
            <FaUser style={iconStyle} />
            <input 
              type="text" 
              name="nome" 
              value={formData.nome} 
              onChange={handleChange} 
              placeholder="Nome completo" 
              style={inputStyle} 
              required 
            />
          </div>

          <div style={{...inputGroup, border: errors.email? '1px solid #dc3545':'1px solid #ddd'}}>
            <FaEnvelope style={iconStyle} />
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="E-mail" 
              style={inputStyle} 
              required 
            />
          </div>

          <div style={{...inputGroup, border: errors.telefone? '1px solid #dc3545':'1px solid #ddd'}}>
            <FaPhone style={iconStyle} />
            <input 
              type="text" 
              name="telefone" 
              value={formData.telefone} 
              onChange={handleChange} 
              placeholder="Telefone" 
              style={inputStyle} 
              required 
              maxLength={15}
            />
          </div>

          <div style={{...inputGroup, border: errors.cpf? '1px solid #dc3545':'1px solid #ddd'}}>
            <FaIdCard style={iconStyle} />
            <input 
              type="text" 
              name="cpf" 
              value={formData.cpf} 
              onChange={handleChange} 
              placeholder="CPF" 
              style={inputStyle} 
              required 
              maxLength={14}
            />
          </div>

          <div style={{...inputGroup, border: errors.endereco? '1px solid #dc3545':'1px solid #ddd'}}>
            <FaMapMarkerAlt style={iconStyle} />
            <input 
              type="text" 
              name="endereco" 
              value={formData.endereco} 
              onChange={handleChange} 
              placeholder="Endereço" 
              style={inputStyle} 
              required 
            />
          </div>

          <div style={{...inputGroup, border: errors.cargo? '1px solid #dc3545':'1px solid #ddd'}}>
            <FaUser style={iconStyle} />
            <select 
              name="cargo" 
              value={formData.cargo} 
              onChange={handleChange} 
              style={inputStyle}
              required
            >
              <option value="">Selecione o cargo</option>
              {cargos.map(cargo => (
                <option key={cargo.id_cargos} value={cargo.id_cargos}>
                  {cargo.cargo}
                </option>
              ))}
            </select>
          </div>

          <div style={{...inputGroup, border: errors.senha? '1px solid #dc3545':'1px solid #ddd'}}>
            <FaLock style={iconStyle} />
            <input 
              type="password" 
              name="senha" 
              value={formData.senha} 
              onChange={handleChange} 
              placeholder="Senha" 
              style={inputStyle} 
              required 
            />
          </div>

          <div style={{...inputGroup, border: errors.confirmarSenha? '1px solid #dc3545':'1px solid #ddd'}}>
            <FaLock style={iconStyle} />
            <input 
              type="password" 
              name="confirmarSenha" 
              value={formData.confirmarSenha} 
              onChange={handleChange} 
              placeholder="Confirmar senha" 
              style={inputStyle} 
              required 
              aria-invalid={formData.confirmarSenha && formData.senha !== formData.confirmarSenha}
            />
          </div>

          {showErrors && Object.keys(errors).length > 0 && (
            <div style={{ color:'#dc3545', fontSize:12, textAlign:'left' }} role="alert">
              {errors.confirmarSenha === 'Senhas diferentes' || errors.senha === 'Senhas diferentes' ? 'As senhas não conferem.' : 'Verifique os campos obrigatórios.'}
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...btnSubmit,
              backgroundColor: loading ? '#ccc' : 'orange'
            }} 
            disabled={loading}
          >
            {loading ? "Salvando..." : "Criar Conta"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "14px", color: "#0077e6" }}>
          Já tem uma conta? <a href="/login" style={{ color: "#0077e6", textDecoration: "none", fontWeight: "bold" }}>Entrar</a>
        </p>
      </div>
    </div>
  );
};

// estilos inline reaproveitáveis
const inputGroup = {
  display: "flex",
  alignItems: "center",
  background: "#f7f7f7",
  borderRadius: "8px",
  padding: "0.5rem 1rem",
  border: "1px solid #ddd"
};

const iconStyle = {
  marginRight: "8px",
  color: "#0077e6"
};

const inputStyle = {
  border: "none",
  outline: "none",
  flex: 1,
  background: "transparent",
  fontSize: "14px",
  padding: "8px 0"
};

const btnSubmit = {
  marginTop: "1rem",
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "background 0.3s",
  fontSize: "16px"
};

export default CadastroUsuarios;
