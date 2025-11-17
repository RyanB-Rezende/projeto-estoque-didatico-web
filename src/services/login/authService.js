// Service de autenticação
// API:
//  - login(email, senha): consulta tabela 'usuarios' no Supabase
//  - logout()
//  - getSession()
//  - isAuthenticated()

import { supabase } from '../supabase/supabase.js';
import bcrypt from 'bcryptjs';

const STORAGE_KEY = 'auth_session';
let currentSession = null;

const persist = () => {
  try {
    if (currentSession) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSession));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (_) {
    // ignore storage errors (ex: quota / não disponível)
  }
};

// Intencionalmente NÃO restauramos sessão ao carregar para obrigar novo login em cada refresh.
// (Se futuramente quisermos restaurar, poderemos expor uma função restoreSession()).

export async function login(email, senha) {
  const emailTrim = (email || '').trim().toLowerCase();
  const senhaTrim = (senha || '').trim();

  // Consulta usuário pelo email
  let row;
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuarios, email, senha, nome, status')
      .eq('email', emailTrim)
      .single();
    if (error) {
      // Se for erro de no row found supabase pode sinalizar como error; trata igual a não encontrado
      row = null;
    } else {
      row = data;
    }
  } catch (e) {
    row = null; // Falha de rede ou outra: não revelar detalhes
  }

  // Usuário não encontrado
  if (!row) {
    currentSession = null;
    persist();
    throw new Error('Credenciais inválidas');
  }

  // Simplificação: ignoramos status; qualquer usuário existente pode autenticar se senha confere.

  // Comparação de senha com suporte a hash (bcrypt) e fallback plaintext para legados
  const senhaHash = row.senha || '';
  let ok = false;
  if (senhaHash.startsWith('$2a$') || senhaHash.startsWith('$2b$') || senhaHash.startsWith('$2y$')) {
    try {
      ok = bcrypt.compareSync(senhaTrim, senhaHash);
    } catch (_) {
      ok = false;
    }
  } else {
    // Fallback: dados antigos sem hash
    ok = senhaHash === senhaTrim;
  }

  if (!ok) {
    currentSession = null;
    persist();
    throw new Error('Credenciais inválidas');
  }

  currentSession = {
    user: {
      id: row.id_usuarios,
      email: row.email,
      nome: row.nome,
      status: row.status || ''
    },
    token: 'tok_' + Math.random().toString(36).slice(2)
  };
  persist();
  return currentSession;
}

export async function logout() {
  currentSession = null;
  persist();
}

export function getSession() {
  return currentSession;
}

export function isAuthenticated() {
  return !!currentSession;
}
