import React, { useState } from 'react';
import { addCurso } from '../../services/cursos/cursosService';

// Formulário de Cadastro de Curso no estilo "janela" (similar ao CadastroProduto)
export default function CadastroCurso({ onSubmit, asModal = false, onCancel, titulo = 'Cadastro de Curso' }) {
  const [nome, setNome] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!nome.trim()) e.nome = 'Nome do Curso é obrigatório';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      setSubmitting(true);
      const result = await addCurso({ nome: nome.trim() });
      onSubmit && onSubmit(result);
      // limpa formulário após sucesso
      setNome('');
      setErrors({});
    } catch (err) {
      setErrors(prev => ({ ...prev, geral: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  const wrapStyles = asModal ? {
    position: 'fixed', inset: 0, zIndex: 2000,
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
      <form onSubmit={handleSubmit} noValidate style={asModal ? panelStyles : undefined} className={asModal ? 'bg-light-subtle' : ''} aria-describedby={errors.geral ? 'curso-error' : undefined}>
        {asModal && (
          <style>{`
            form .form-control:focus { box-shadow:none; }
            .btn-pill-save { background:#ffffff; border:1px solid #e3dff0; color:#4a4a5e; font-weight:500; }
            .btn-pill-save:hover { background:#f1eef7; }
            .btn-cancel-link { color:#6a55c2; text-decoration:none; }
            .btn-cancel-link:hover { text-decoration:underline; }
          `}</style>
        )}
        <h1 className="h6 fw-semibold mb-3" style={{letterSpacing:'0.2px'}}>{titulo}</h1>
        <div className="mb-3">
          <label htmlFor="nome" className={labelCls}>Nome do Curso</label>
          <input id="nome" className={lineField + (errors.nome ? ' is-invalid' : '')} value={nome} onChange={e=>setNome(e.target.value)} aria-invalid={!!errors.nome} />
          {errors.nome && <div className="text-danger small" role="alert">{errors.nome}</div>}
        </div>
        {errors.geral && <div id="curso-error" className="alert alert-danger py-2" role="alert">{errors.geral}</div>}
        <div className="d-flex justify-content-end align-items-center gap-3 mt-3">
          <button type="button" className={asModal ? 'btn btn-sm btn-cancel-link' : 'btn btn-secondary btn-sm'} onClick={() => { setNome(''); setErrors({}); onCancel && onCancel(); }}>Cancelar</button>
          <button type="submit" className={asModal ? 'btn btn-sm btn-pill-save rounded-pill px-4' : 'btn btn-primary btn-sm'} disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </div>
  );
}
