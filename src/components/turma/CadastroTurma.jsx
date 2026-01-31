import React, { useState, useEffect } from 'react';
import { addTurma } from '../../services/turma/turmaService';
import { getUsuarios } from '../../services/usuario/usuarioService';

export default function CadastroTurma({ onSubmit, asModal = false, onCancel, titulo = 'Cadastro de Turma' }) {
  const [nome, setNome] = useState('');
  const [instrutores, setInstrutores] = useState([]);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);
  const [loadingInstrutores, setLoadingInstrutores] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const carregarInstrutores = async () => {
      try {
        setLoadingInstrutores(true);
        const usuarios = await getUsuarios();
        // Filtra apenas usuários com cargo 3 (instrutor)
        const instrutoresFilterados = usuarios.filter(user => {
          const cargo = user.cargo;
          return cargo === 3 || cargo === '3';
        });
        console.log('Instrutores encontrados:', instrutoresFilterados);
        setUsuariosDisponiveis(instrutoresFilterados);
      } catch (err) {
        console.error('Erro ao carregar instrutores:', err);
        setErrors(prev => ({ ...prev, instrutores: 'Erro ao carregar instrutores' }));
      } finally {
        setLoadingInstrutores(false);
      }
    };
    carregarInstrutores();
  }, []);

  const validate = () => {
    const e = {};
    if (!nome.trim()) e.nome = 'Nome da Turma é obrigatório';
    if (instrutores.length === 0) e.instrutores = 'Selecione pelo menos um instrutor';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      setSubmitting(true);
      const result = await addTurma({ turma: nome.trim(), instrutores });
      onSubmit && onSubmit(result);
      setNome('');
      setInstrutores([]);
      setErrors({});
    } catch (err) {
      setErrors(prev => ({ ...prev, geral: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectInstrutores = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => ({
      id_usuarios: option.value,
      nome: option.text
    }));
    setInstrutores(selectedOptions);
    // Limpa o erro de instrutores quando seleciona
    if (selectedOptions.length > 0 && errors.instrutores) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.instrutores;
        return newErrors;
      });
    }
  };

  const wrapStyles = asModal ? {
    position: 'fixed', inset: 0, zIndex: 2200,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.55)'
  } : {};
  const panelStyles = {
    background: '#f5f2fa',
    borderRadius: '24px',
    width: '360px',
    maxWidth: '92vw',
    padding: '24px 28px',
    boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
    fontSize: '14px'
  };
  const lineField = 'w-100 bg-transparent border-0 border-bottom pb-1 px-0 form-control shadow-none';
  const labelCls = 'fw-normal mb-1 small text-body-secondary';

  return (
    <div style={wrapStyles} role={asModal ? 'dialog' : undefined} aria-modal={asModal || undefined}>
      <form onSubmit={handleSubmit} noValidate style={asModal ? panelStyles : undefined}>
        <h1 className="h6 fw-semibold mb-3" style={{letterSpacing:'0.2px'}}>{titulo}</h1>
        <div className="mb-3">
          <label htmlFor="turma-nome" className={labelCls}>Nome da Turma</label>
          <input id="turma-nome" className={lineField + (errors.nome ? ' is-invalid' : '')} value={nome} onChange={e=>setNome(e.target.value)} aria-invalid={!!errors.nome} />
          {errors.nome && <div className="text-danger small" role="alert">{errors.nome}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="turma-instrutores" className={labelCls}>Instrutores</label>
          <select 
            id="turma-instrutores" 
            multiple 
            className={'form-select form-select-sm' + (errors.instrutores ? ' is-invalid' : '')}
            value={instrutores.map(i => i.id_usuarios)} 
            onChange={handleSelectInstrutores}
            disabled={loadingInstrutores}
            aria-invalid={!!errors.instrutores}
            style={{minHeight: '100px'}}
          >
            {!loadingInstrutores && usuariosDisponiveis.length === 0 ? (
              <option disabled>Nenhum instrutor disponível</option>
            ) : loadingInstrutores ? (
              <option disabled>Carregando instrutores...</option>
            ) : (
              usuariosDisponiveis.map(user => (
                <option key={user.id_usuarios} value={user.id_usuarios}>
                  {user.nome}
                </option>
              ))
            )}
          </select>
          {errors.instrutores && <div className="text-danger small" role="alert">{errors.instrutores}</div>}
          <small className="text-muted d-block mt-1">Selecione um ou mais instrutores (use Ctrl+Click para múltiplas seleções)</small>
        </div>
        {errors.geral && <div className="alert alert-danger py-2" role="alert">{errors.geral}</div>}
        <div className="d-flex justify-content-end align-items-center gap-3 mt-3">
          <button type="button" className={asModal ? 'btn btn-sm btn-link' : 'btn btn-secondary btn-sm'} onClick={() => { setNome(''); setInstrutores([]); setErrors({}); onCancel && onCancel(); }}>Cancelar</button>
          <button type="submit" className={asModal ? 'btn btn-sm btn-primary rounded-pill px-4' : 'btn btn-primary btn-sm'} disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </div>
  );
}
