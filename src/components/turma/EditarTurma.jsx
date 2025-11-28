import React, { useState } from 'react';
import { updateTurma } from '../../services/turma/turmaService';

// Componente de edição de Turma em modal simples.
// Espera props: turma (obj), onSuccess(atualizado), onCancel()
export default function EditarTurma({ turma, onSuccess, onCancel }) {
  const [nome, setNome] = useState(turma?.turma || turma?.nome || '');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  if (!turma) return null;

  const validate = () => {
    const e = {};
    if (!nome.trim()) e.nome = 'Nome da Turma é obrigatório';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const eVal = validate();
    setErrors(eVal);
    if (Object.keys(eVal).length) return;
    try {
      setSaving(true);
      const atualizado = await updateTurma(turma.id_turma, { turma: nome.trim() });
      onSuccess && onSuccess(atualizado);
    } catch (err) {
      setErrors(prev => ({ ...prev, geral: err.message }));
      setSaving(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
      role="dialog"
      aria-modal="true"
    >
      <form onSubmit={submit} noValidate className="bg-light-subtle rounded-4 shadow-lg p-4 mx-3" style={{minWidth:'320px', maxWidth:'440px'}}>
        <h1 className="h6 fw-semibold mb-4">Editar Turma</h1>
        <div className="mb-3">
          <label htmlFor="editar-turma-nome" className="fw-normal mb-1 small text-body-secondary">Nome da Turma</label>
          <input
            id="editar-turma-nome"
            className={`w-100 bg-transparent border-0 border-bottom pb-1 px-0 form-control shadow-none${errors.nome ? ' is-invalid' : ''}`}
            value={nome}
            onChange={e=>setNome(e.target.value)}
            aria-invalid={!!errors.nome}
          />
          {errors.nome && <div className="text-danger small mt-1" role="alert">{errors.nome}</div>}
        </div>
        {errors.geral && <div className="alert alert-danger py-2" role="alert">{errors.geral}</div>}
        <div className="d-flex justify-content-end align-items-center gap-3 mt-3">
          <button type="button" className="btn btn-sm btn-link link-primary p-0" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn btn-sm btn-outline-secondary rounded-pill px-4" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </div>
  );
}
