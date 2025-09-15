import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUsuarios, updateUsuario } from '../services/usuarioService';
import { getTurmas } from '../services/turmaService';
import { getCargos } from '../services/cargoService';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaLock, FaArrowLeft } from 'react-icons/fa';

const EditUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    cargo: '',
    senha: '',
    turma: '',
    cpf: '',
    data_nascimento: '',
    status: 'ativo'
  });
  
  const [turmas, setTurmas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Funções para formatação
  const formatarTelefone = (valor) => {
    const numbers = valor.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    }
    return valor;
  };

  const formatarCPF = (valor) => {
    const numbers = valor.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
    return valor;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let valorFormatado = value;
    
    // Aplicar formatação específica para cada campo
    if (name === 'telefone') {
      valorFormatado = formatarTelefone(value);
    } else if (name === 'cpf') {
      valorFormatado = formatarCPF(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: valorFormatado
    }));
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        
        // Carregar dados do usuário
        const usuarios = await getUsuarios();
        const usuario = usuarios.find(u => u.id_usuarios === parseInt(id));
        
        if (!usuario) {
          alert('Usuário não encontrado!');
          navigate('/');
          return;
        }

        // Formatar telefone e CPF ao carregar os dados
        setFormData({
          nome: usuario.nome || '',
          telefone: formatarTelefone(usuario.telefone || ''),
          email: usuario.email || '',
          endereco: usuario.endereco || '',
          cargo: usuario.cargo || '',
          senha: '', // Não carrega a senha por segurança
          turma: usuario.turma || '',
          cpf: formatarCPF(usuario.cpf || ''),
          data_nascimento: usuario.data_nascimento || '',
          status: usuario.status || 'ativo'
        });

        // Carregar turmas e cargos
        const [turmasData, cargosData] = await Promise.all([
          getTurmas().catch(() => []),
          getCargos()
        ]);
        
        setTurmas(turmasData);
        setCargos(cargosData);

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados do usuário');
        navigate('/');
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validação
    if (!formData.nome || !formData.telefone || !formData.email || !formData.endereco || !formData.cargo || !formData.cpf) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      setLoading(false);
      return;
    }
    
    try {
      // Remover formatação antes de enviar
      const dadosParaEnviar = { 
        ...formData,
        telefone: formData.telefone.replace(/\D/g, ''),
        cpf: formData.cpf.replace(/\D/g, '')
      };
      
      if (!dadosParaEnviar.senha) {
        delete dadosParaEnviar.senha; // Remove a senha se estiver vazia
      }
      
      // Converter para números
      dadosParaEnviar.cargo = parseInt(dadosParaEnviar.cargo);
      dadosParaEnviar.turma = dadosParaEnviar.turma ? parseInt(dadosParaEnviar.turma) : null;
      
      await updateUsuario(parseInt(id), dadosParaEnviar);
      
      alert('Usuário atualizado com sucesso!');
      navigate('/');
      
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (carregando) return (
    <div style={{
      background: "linear-gradient(to bottom, #0a84ff, #0077e6)",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial, sans-serif",
      color: "white"
    }}>
      Carregando...
    </div>
  );

  return (
    <div style={{
      background: "linear-gradient(to bottom, #0a84ff, #0077e6)",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial, sans-serif",
      padding: "20px"
    }}>
      <div style={{
        background: "#fff",
        padding: "2rem",
        borderRadius: "12px",
        width: "400px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        textAlign: "center"
      }}>
        {/* Cabeçalho */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: "none",
              border: "none",
              color: "#0077e6",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              marginRight: "10px"
            }}
          >
            <FaArrowLeft size={20} />
          </button>
          <h2 style={{ margin: 0, color: '#333', flex: 1 }}>Editar Usuário</h2>
        </div>

        {/* Avatar */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
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
            <FaUser size={40} color="#0077e6" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={inputGroup}>
            <FaUser style={iconStyle} />
            <input 
              type="text" 
              name="nome" 
              value={formData.nome} 
              onChange={handleChange} 
              placeholder="Nome completo *" 
              style={inputStyle} 
              required 
            />
          </div>

          <div style={inputGroup}>
            <FaEnvelope style={iconStyle} />
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="E-mail *" 
              style={inputStyle} 
              required 
            />
          </div>

          <div style={inputGroup}>
            <FaPhone style={iconStyle} />
            <input 
              type="text" 
              name="telefone" 
              value={formData.telefone} 
              onChange={handleChange} 
              placeholder="Telefone *" 
              style={inputStyle} 
              required 
              maxLength={15}
            />
          </div>

          <div style={inputGroup}>
            <FaIdCard style={iconStyle} />
            <input 
              type="text" 
              name="cpf" 
              value={formData.cpf} 
              onChange={handleChange} 
              placeholder="CPF *" 
              style={inputStyle} 
              required 
              maxLength={14}
            />
          </div>

          <div style={inputGroup}>
            <FaMapMarkerAlt style={iconStyle} />
            <input 
              type="text" 
              name="endereco" 
              value={formData.endereco} 
              onChange={handleChange} 
              placeholder="Endereço *" 
              style={inputStyle} 
              required 
            />
          </div>

          <div style={inputGroup}>
            <FaUser style={iconStyle} />
            <select 
              name="cargo" 
              value={formData.cargo} 
              onChange={handleChange} 
              style={inputStyle}
              required
            >
              <option value="">Selecione o cargo *</option>
              {cargos.map(cargo => (
                <option key={cargo.id_cargos} value={cargo.id_cargos}>
                  {cargo.cargo}
                </option>
              ))}
            </select>
          </div>

          <div style={inputGroup}>
            <FaLock style={iconStyle} />
            <input 
              type="password" 
              name="senha" 
              value={formData.senha} 
              onChange={handleChange} 
              placeholder="Nova senha (deixe em branco para manter a atual)" 
              style={inputStyle} 
            />
          </div>

          <div style={inputGroup}>
            <FaUser style={iconStyle} />
            <select 
              name="turma" 
              value={formData.turma} 
              onChange={handleChange} 
              style={inputStyle}
            >
              <option value="">Selecione uma turma (opcional)</option>
              {turmas.map(turma => (
                <option key={turma.id_turma} value={turma.id_turma}>
                  {turma.turma} {turma.instrutor && `- ${turma.instrutor}`}
                </option>
              ))}
            </select>
          </div>

          <div style={inputGroup}>
            <FaUser style={iconStyle} />
            <input 
              type="date" 
              name="data_nascimento" 
              value={formData.data_nascimento} 
              onChange={handleChange} 
              style={inputStyle} 
            />
          </div>

          <div style={inputGroup}>
            <FaUser style={iconStyle} />
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange} 
              style={inputStyle}
              required
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <button 
            type="submit" 
            style={{
              ...btnSubmit,
              backgroundColor: loading ? '#ccc' : '#28a745'
            }} 
            disabled={loading}
          >
            {loading ? "Atualizando..." : "Atualizar Usuário"}
          </button>
        </form>
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

export default EditUsuario;