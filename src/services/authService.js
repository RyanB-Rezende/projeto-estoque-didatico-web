// Service de autenticação
// API:
//  - login(email, senha): consulta tabela 'usuarios' no Supabase
//  - logout()
//  - getSession()
//  - isAuthenticated()

import { supabase } from './supabase';

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
      .select('id_usuarios, email, senha, nome') // status removido: simplificação solicitada
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

  // Comparação de senha simples (plaintext) - TODO: hashing
  if (row.senha !== senhaTrim) {
    currentSession = null;
    persist();
    throw new Error('Credenciais inválidas');
  }

  currentSession = {
    user: {
      id: row.id_usuarios,
      email: row.email,
      nome: row.nome
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
