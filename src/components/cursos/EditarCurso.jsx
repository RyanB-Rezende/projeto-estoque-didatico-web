import React, { useEffect, useState } from 'react';
import { getCursos, updateCurso } from '../../services/cursos/cursosService';

export default function EditarCurso({ id, onSuccess, onCancel, asModal = false }) {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        setLoading(true);
        // Reaproveita getCursos e filtra (para evitar criar getCursoById agora)
        const lista = await getCursos();
        const cur = (lista || []).find(c => String(c.id_cursos) === String(id));
        if (!cur) throw new Error('Curso não encontrado');
        if (ativo) setNome(cur.nome || '');
      } catch (e) {
        if (ativo) setError('Erro ao carregar curso');
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => { ativo = false; };
  }, [id]);

  const validar = () => {
    const e = {};
    if (!nome.trim()) e.nome = 'Nome do Curso é obrigatório';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eMap = validar();
    setErrors(eMap);
    if (Object.keys(eMap).length) return;
    try {
      setSaving(true);
      const atualizado = await updateCurso(id, { nome: nome.trim() });
      onSuccess && onSuccess(atualizado);
    } catch (err) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-3">Carregando...</div>;
  if (error) return <div className="alert alert-danger" role="alert">Erro ao carregar curso</div>;

  return (
    <form role="form" onSubmit={handleSubmit} noValidate className={asModal ? '' : ''}>
      <div className="mb-3">
        <label htmlFor="nome" className="form-label">Nome do Curso</label>
        <input id="nome" className={`form-control${errors.nome ? ' is-invalid' : ''}`} value={nome} onChange={e=>setNome(e.target.value)} />
        {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
      </div>
      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
      </div>
    </form>
  );
}
