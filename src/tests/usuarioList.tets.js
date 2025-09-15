import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import UsuarioList from '../components/UsuarioList';
import { getUsuarios, deleteUsuario } from '../services/usuarioService';

// Mock dos serviços
jest.mock('../services/usuarioService');

describe('UsuarioList', () => {
  const mockUsuarios = [
    {
      id_usuarios: 1,
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '11999999999',
      cargos: { cargo: 'Administrador' },
      status: 'ativo'
    },
    {
      id_usuarios: 2,
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '11888888888',
      cargos: { cargo: 'Instrutor(a)' },
      status: 'ativo'
    }
  ];

  beforeEach(() => {
    getUsuarios.mockClear();
    deleteUsuario.mockClear();
  });

  test('renderiza lista de usuários', async () => {
    getUsuarios.mockResolvedValue(mockUsuarios);

    render(
      <Router>
        <UsuarioList />
      </Router>
    );

    // Verifica se os usuários são renderizados
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('joao@email.com')).toBeInTheDocument();
      expect(screen.getByText('maria@email.com')).toBeInTheDocument();
    });
  });

  test('exibe mensagem quando não há usuários', async () => {
    getUsuarios.mockResolvedValue([]);

    render(
      <Router>
        <UsuarioList />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhum usuário cadastrado')).toBeInTheDocument();
      expect(screen.getByText('Cadastrar Primeiro Usuário')).toBeInTheDocument();
    });
  });

  test('exclui usuário ao clicar em excluir', async () => {
    getUsuarios.mockResolvedValue(mockUsuarios);
    deleteUsuario.mockResolvedValue(true);

    // Mock do window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    render(
      <Router>
        <UsuarioList />
      </Router>
    );

    // Aguarda carregar os usuários
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    // Clica no botão excluir
    const excluirButtons = screen.getAllByText('🗑️ Excluir');
    fireEvent.click(excluirButtons[0]);

    // Verifica se a função delete foi chamada
    await waitFor(() => {
      expect(deleteUsuario).toHaveBeenCalledWith(1);
    });

    confirmSpy.mockRestore();
  });

  test('não exclui usuário quando cancelado', async () => {
    getUsuarios.mockResolvedValue(mockUsuarios);

    // Mock do window.confirm retornando false
    const confirmSpy = jest.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => false);

    render(
      <Router>
        <UsuarioList />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const excluirButtons = screen.getAllByText('🗑️ Excluir');
    fireEvent.click(excluirButtons[0]);

    // Verifica que delete não foi chamado
    expect(deleteUsuario).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  test('exibe erro ao falhar ao carregar usuários', async () => {
    getUsuarios.mockRejectedValue(new Error('Erro de conexão'));

    render(
      <Router>
        <UsuarioList />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar usuários/)).toBeInTheDocument();
    });
  });
});