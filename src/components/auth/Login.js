import React, { useState } from 'react';
import { login as loginService } from '../../services/authService';
import logoImg from '../../senac.png';

// Notas:
//  - Utiliza utilitários Bootstrap + Bootstrap Icons.
//  - Só mantemos estilos inline mínimos para gradiente e gradiente no botão.
//  - Largura adaptativa via col responsivo.

/**
 * Componente Login (versão mínima para GREEN dos testes):
 * - Campos controlados email, senha
 * - Validação obrigatória
 * - Chama login(email, senha) e onSuccess(session)
 */
export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Sem restauração de sessão (requisito anterior).

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email é obrigatório';
    if (!senha.trim()) e.senha = 'Senha é obrigatória';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      setSubmitting(true);
      const session = await loginService(email.trim(), senha.trim());
      onSuccess && onSuccess(session);
    } catch (err) {
      // Poderemos exibir erro de credenciais em etapa futura de TDD
      setErrors(prev => ({ ...prev, geral: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{position:'fixed',inset:0,margin:0,padding:0,width:'100%',height:'100dvh',background:'linear-gradient(135deg, #0e79d9 0%, #0a6bc4 40%, #0a67bd 60%, #0d74d8 100%)'}}>
      <div className="w-100 d-flex justify-content-center" style={{padding:'0 8px'}}>
        <div className="card border-0 shadow" style={{borderRadius:'10px',maxWidth:'760px',width:'clamp(320px,70%,640px)'}}>
          <div className="card-body py-4 px-4 px-sm-5">
                {/* Heading oculto para testes */}
                <h1 className="visually-hidden">Login</h1>
                <div className="text-center mb-3">
                  <img src={logoImg} alt="Senac" style={{width:145}} draggable={false} />
                  <h2 className="h5 fw-semibold mt-2 mb-4 text-primary" style={{letterSpacing:'.4px'}}>Controle de Estoque</h2>
                </div>
                <form onSubmit={handleSubmit} aria-describedby={errors.geral ? 'login-error' : undefined}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label visually-hidden">Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white"><i className="bi bi-envelope text-primary" aria-hidden="true" /></span>
                      <input id="email" name="email" type="email" className="form-control" placeholder="Email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} aria-invalid={!!errors.email} />
                    </div>
                    {errors.email && <div className="text-danger small fw-semibold mt-1" role="alert">{errors.email}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="senha" className="form-label visually-hidden">Senha</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white"><i className="bi bi-lock text-primary" aria-hidden="true" /></span>
                      <input id="senha" name="senha" type={showPassword ? 'text' : 'password'} className="form-control" placeholder="Senha" autoComplete="current-password" value={senha} onChange={e=>setSenha(e.target.value)} aria-invalid={!!errors.senha} onKeyDown={e=>{ if(e.key==='Enter'){ handleSubmit(e); } }} />
                      <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowPassword(s=>!s)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                        <i className={showPassword ? 'bi bi-eye' : 'bi bi-eye-slash'} aria-hidden="true" />
                      </button>
                    </div>
                    {errors.senha && <div className="text-danger small fw-semibold mt-1" role="alert">{errors.senha}</div>}
                  </div>
                  {errors.geral && <div id="login-error" role="alert" className="alert alert-danger py-2 mb-3">{errors.geral}</div>}
                  <div className="d-grid">
                    <button type="submit" disabled={submitting} className="btn text-white fw-semibold" style={{background:'linear-gradient(90deg,#1890ff,#0f7ad6)'}}> {submitting ? 'Entrando...' : 'Entrar'} </button>
                  </div>
                </form>
          </div>
        </div>
      </div>
    </div>
  );
}
