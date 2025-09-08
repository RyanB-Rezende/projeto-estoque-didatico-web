import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase/supabase';
import { getProdutoById, updateProduto } from '../../services/produtos/produtosService';

/**
 * Componente de edição de produto (TDD)
 * Props:
 *  - id (number | string) id_produtos a ser carregado
 *  - onSuccess(produtoAtualizado)
 *  - onCancel()
 *  - asModal (default true) => aplica overlay similar ao CadastroProduto
 */
export default function EditarProduto({ id, onSuccess, onCancel, asModal = true }) {
  const [formData, setFormData] = useState({
    nome: '', medida: '', local: '', codigo: '', data_entrada: '', entrada: ''
  });
  const [medidas, setMedidas] = useState([]);
  const [loadingProduto, setLoadingProduto] = useState(true);
  const [loadingMedidas, setLoadingMedidas] = useState(true);
  const [erroCarregar, setErroCarregar] = useState(null);
  const [erroMedidas, setErroMedidas] = useState(null);
  const [errors, setErrors] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [status, setStatus] = useState({ tipo: null, mensagem: '' });

  // Carrega produto
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        setLoadingProduto(true);
        const p = await getProdutoById(id);
        if (!p) throw new Error('Produto não encontrado');
        if (ativo) {
          setFormData({
            nome: p.nome || '',
            medida: p.medida != null ? String(p.medida) : '',
            local: p.local || '',
            codigo: p.codigo || '',
            data_entrada: p.data_entrada || '',
            entrada: p.entrada != null ? String(p.entrada) : ''
          });
        }
      } catch (e) {
        if (ativo) setErroCarregar(e.message || 'Erro ao carregar produto');
      } finally {
        if (ativo) setLoadingProduto(false);
      }
    })();
    return () => { ativo = false; };
  }, [id]);

  // Carrega medidas
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        setLoadingMedidas(true);
        const { data, error } = await supabase
          .from('medida')
          .select('id_medida, medida')
          .order('id_medida', { ascending: true });
        if (error) throw error;
        if (ativo) setMedidas((data || []).map(r => ({ id: r.id_medida, nome: r.medida })));
      } catch (e) {
        if (ativo) setErroMedidas(e.message || 'Erro ao carregar medidas');
      } finally {
        if (ativo) setLoadingMedidas(false);
      }
    })();
    return () => { ativo = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    const novo = {};
    if (!formData.nome.trim()) novo.nome = 'Nome é obrigatório';
    if (!formData.medida.toString().trim()) {
      novo.medida = 'Medida é obrigatória';
    } else if (!medidas.some(m => String(m.id) === String(formData.medida))) {
      novo.medida = 'Medida inválida';
    }
    if (!formData.local.trim()) novo.local = 'Local é obrigatório';
    if (!formData.codigo.trim()) novo.codigo = 'Código é obrigatório';
    if (!formData.data_entrada.trim()) novo.data_entrada = 'Data de entrada é obrigatória';
    if (!formData.entrada.toString().trim()) {
      novo.entrada = 'Quantidade é obrigatória';
    } else if (isNaN(Number(formData.entrada))) {
      novo.entrada = 'Quantidade deve ser numérica';
    } else if (Number(formData.entrada) < 0) {
      novo.entrada = 'Quantidade não pode ser negativa';
    }
    return novo;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ tipo: null, mensagem: '' });
    const novo = validar();
    setErrors(novo);
    if (Object.keys(novo).length) return;
    try {
      setSalvando(true);
      const payload = {
        ...formData,
        medida: Number(formData.medida),
        entrada: Number(formData.entrada || 0)
      };
      const atualizado = await updateProduto(id, payload);
      setStatus({ tipo: 'sucesso', mensagem: 'Atualizado' });
      onSuccess && onSuccess(atualizado || { id_produtos: id, ...payload });
    } catch (err) {
      setStatus({ tipo: 'erro', mensagem: err.message || 'Erro ao salvar' });
    } finally {
      setSalvando(false);
    }
  };

  if (erroCarregar) {
    return <div className="alert alert-danger" role="alert">Erro ao carregar produto</div>;
  }

  const wrapStyles = asModal ? {
    position: 'fixed', inset: 0, zIndex: 1050,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.55)'
  } : {};
  const panelStyles = {
    background: '#f5f2fa', borderRadius: '28px', width: '360px', maxWidth: '92vw',
    padding: '28px 36px 24px', boxShadow: '0 8px 28px rgba(0,0,0,0.25)', fontSize: '14px'
  };
  const labelCls = 'fw-normal mb-1 small text-body-secondary';
  const lineField = 'w-100 bg-transparent border-0 border-bottom pb-1 px-0 form-control shadow-none';
  const errorText = 'text-danger small mt-1';

  return (
    <div style={wrapStyles} role={asModal ? 'dialog' : undefined} aria-modal={asModal || undefined}>
      <form role="form" onSubmit={handleSubmit} noValidate style={panelStyles} className="bg-light-subtle">
        <style>{`
          form .form-control:focus, form select:focus { box-shadow:none; }
          .line-select { appearance:none; -webkit-appearance:none; padding-right:18px; cursor:pointer; }
          .btn-pill-save { background:#ffffff; border:1px solid #e3dff0; color:#4a4a5e; font-weight:500; }
          .btn-pill-save:hover { background:#f1eef7; }
          .btn-cancel-link { color:#6a55c2; text-decoration:none; }
          .btn-cancel-link:hover { text-decoration:underline; }
        `}</style>
        <h1 className="h5 fw-semibold mb-4" style={{ letterSpacing: '0.2px' }}>Editar Produto</h1>
        {loadingProduto ? <div className="small text-muted mb-3">Carregando...</div> : null}
        <div className="mb-3">
          <label htmlFor="nome" className={labelCls}>Nome</label>
          <input id="nome" name="nome" type="text" className={lineField + (errors.nome ? ' is-invalid' : '')} value={formData.nome} onChange={handleChange} />
          {errors.nome && <div className={errorText}>{errors.nome}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="medida" className={labelCls}>Medida</label>
          <select id="medida" name="medida" className={lineField + ' line-select fw-semibold' + (errors.medida ? ' is-invalid' : '')} value={formData.medida} onChange={handleChange} disabled={loadingMedidas || !!erroMedidas}>
            <option value="" disabled>{loadingMedidas ? 'Carregando...' : 'Selecione'}</option>
            {medidas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
          {(erroMedidas || errors.medida) && <div className={errorText}>{erroMedidas || errors.medida}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="local" className={labelCls}>Local</label>
            <input id="local" name="local" type="text" className={lineField + (errors.local ? ' is-invalid' : '')} value={formData.local} onChange={handleChange} />
          {errors.local && <div className={errorText}>{errors.local}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="codigo" className={labelCls}>Código</label>
          <input id="codigo" name="codigo" type="text" className={lineField + (errors.codigo ? ' is-invalid' : '')} value={formData.codigo} onChange={handleChange} />
          {errors.codigo && <div className={errorText}>{errors.codigo}</div>}
        </div>
        <div className="mb-4">
          <label htmlFor="data_entrada" className={labelCls + ' d-block'}>Data de Entrada</label>
          <div className="d-flex align-items-center gap-2">
            <input id="data_entrada" name="data_entrada" type="date" className={lineField + ' flex-grow-1' + (errors.data_entrada ? ' is-invalid' : '')} value={formData.data_entrada} onChange={handleChange} style={{ maxWidth: '160px' }} />
            <i className="bi bi-calendar-event" style={{ fontSize: '20px' }}></i>
          </div>
          {errors.data_entrada && <div className={errorText}>{errors.data_entrada}</div>}
        </div>
        <div className="mb-4">
          <label htmlFor="entrada" className={labelCls}>Quantidade</label>
          <input id="entrada" name="entrada" type="number" min="0" className={lineField + (errors.entrada ? ' is-invalid' : '')} value={formData.entrada} onChange={handleChange} />
          {errors.entrada && <div className={errorText}>{errors.entrada}</div>}
        </div>
        <div className="d-flex justify-content-end align-items-center gap-3">
          <button type="button" className="btn btn-sm btn-cancel-link" onClick={() => { onCancel && onCancel(); }}>Cancelar</button>
          <button type="submit" className="btn btn-sm btn-pill-save rounded-pill px-4" disabled={salvando}>{salvando ? spinner() : <i className="bi bi-save me-1"></i>}Salvar</button>
        </div>
        {status.mensagem && <div className={`mt-3 small ${status.tipo === 'erro' ? 'text-danger' : 'text-success'}`}>{status.mensagem}</div>}
      </form>
    </div>
  );
}

function spinner(){
  return <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>;
}
