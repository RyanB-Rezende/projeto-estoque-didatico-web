import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UsuarioList from '../../components/usuario/UsuarioList';
import * as usuarioService from '../../services/usuario/usuarioService';

// Mock do usuarioService
jest.mock('../../services/usuario/usuarioService');

// Mock do react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => mockNavigate
}));

const mockUsuarios = [
  {
    id_usuario: 1,
    nome: 'João Silva',
    email: 'joao@test.com',
    telefone: '11999999999',
    cpf: '12345678901',
    endereco: 'Rua Test, 123',
    status: 'Ativo',
    cargo: 'Professor',
    turma: 'Turma A',
    data_nascimento: '1990-01-01'
  },
  {
    id_usuario: 2,
    nome: 'Maria Santos',
    email: 'maria@test.com',
    telefone: '11888888888',
    cpf: '98765432100',
    endereco: 'Rua Test, 456',
    status: 'Ativo',
    cargo: 'Estudante',
    turma: 'Turma B',
    data_nascimento: '1995-05-15'
  }
];

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <UsuarioList />
    </BrowserRouter>
  );
};

describe('UsuarioList', () => {
  beforeEach(() => {
    usuarioService.getUsuarios.mockResolvedValue(mockUsuarios);
    usuarioService.deleteUsuario.mockResolvedValue(true);
    jest.clearAllMocks();
    global.alert = jest.fn();
    global.confirm = jest.fn();
  });

  test('deve renderizar componente', () => {
    renderComponent();
    expect(screen.getByText(/usuário/i)).toBeInTheDocument();
  });

  test('deve carregar usuários', async () => {
    renderComponent();
    expect(usuarioService.getUsuarios).toHaveBeenCalled();
  });

  test('deve exibir lista de usuários', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });
  });

  test('deve exibir loading', () => {
    usuarioService.getUsuarios.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  test('deve exibir erro ao carregar', async () => {
    usuarioService.getUsuarios.mockRejectedValue(new Error('Erro'));
    renderComponent();
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalled();
    });
  });

  test('deve filtrar usuários', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'João' } });
    
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  test('deve deletar usuário', async () => {
    global.confirm.mockReturnValue(true);
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole('button')[0];
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(usuarioService.deleteUsuario).toHaveBeenCalled();
    });
  });

  test('deve cancelar deleção', async () => {
    global.confirm.mockReturnValue(false);
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole('button')[0];
    fireEvent.click(deleteButton);
    
    expect(usuarioService.deleteUsuario).not.toHaveBeenCalled();
  });

  test('deve tratar erro ao deletar', async () => {
    global.confirm.mockReturnValue(true);
    usuarioService.deleteUsuario.mockRejectedValue(new Error('Erro'));
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole('button')[0];
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalled();
    });
  });

  test('deve navegar para edição', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const editLink = screen.getAllByRole('link')[0];
    expect(editLink).toHaveAttribute('href');
  });

  test('deve exibir lista vazia', async () => {
    usuarioService.getUsuarios.mockResolvedValue([]);
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/nenhum usuário/i)).toBeInTheDocument();
    });
  });

  test('deve formatar dados', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });
    
    // Verifica se dados formatados estão presentes
    expect(screen.getByText(/joao@test.com/i)).toBeInTheDocument();
  });

  test('deve limpar busca', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'João' } });
    fireEvent.change(searchInput, { target: { value: '' } });
    
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
  });

  test('deve buscar case insensitive', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'joão' } });
    
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  test('deve exibir sem resultados na busca', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'Inexistente' } });
    
    expect(screen.getByText(/nenhum usuário/i)).toBeInTheDocument();
  });

  test('deve recarregar após deletar', async () => {
    global.confirm.mockReturnValue(true);
    usuarioService.getUsuarios
      .mockResolvedValueOnce(mockUsuarios)
      .mockResolvedValueOnce([mockUsuarios[1]]);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole('button')[0];
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(usuarioService.getUsuarios).toHaveBeenCalledTimes(2);
    });
  });

  test('deve lidar com dados incompletos', async () => {
    const usuarioIncompleto = {
      id_usuario: 3,
      nome: 'Teste',
      email: 'teste@test.com',
      telefone: null,
      cpf: '',
      endereco: null,
      status: 'Ativo',
      cargo: null,
      turma: '',
      data_nascimento: null
    };

    usuarioService.getUsuarios.mockResolvedValue([usuarioIncompleto]);
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Teste')).toBeInTheDocument();
    });
  });

  test('deve buscar por diferentes campos', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox');
    
    // Buscar por email
    fireEvent.change(searchInput, { target: { value: 'maria@test.com' } });
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    
    // Buscar por telefone
    fireEvent.change(searchInput, { target: { value: '11999999999' } });
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  test('deve manter estado após interações', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'João' } });
    
    expect(searchInput.value).toBe('João');
  });

  test('deve exibir botões de ação', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('deve exibir links de navegação', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});