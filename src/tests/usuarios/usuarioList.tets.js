import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UsuarioList from '../../components/usuario/UsuarioList';
import * as usuarioService from '../../services/usuario/usuarioService';

// Mocks
jest.mock('../../services/usuario/usuarioService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate
}));

const mockNavigate = jest.fn();

const mockUsuarios = [
  {
    id_usuario: 1,
    nome: 'João Silva',
    email: 'joao@test.com',
    telefone: '11999999999',
    cpf: '12345678901',
    endereco: 'Rua Test, 123',
    status: 'Instrutor(a)',
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
    status: 'Aluno(a)',
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

describe('UsuarioList Component', () => {
  beforeEach(() => {
    usuarioService.getUsuarios.mockResolvedValue(mockUsuarios);
    usuarioService.deleteUsuario.mockResolvedValue(true);
    jest.clearAllMocks();
    global.alert = jest.fn();
    global.confirm = jest.fn(() => true);
  });

  test('deve renderizar o título da lista', async () => {
    renderComponent();
    expect(screen.getByText('📋 Lista de Usuários')).toBeInTheDocument();
  });

  test('deve mostrar botão para novo usuário', async () => {
    renderComponent();
    expect(screen.getByText('+ Novo Usuário')).toBeInTheDocument();
  });

  test('deve carregar e exibir lista de usuários', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });

    expect(screen.getByText('joao@test.com')).toBeInTheDocument();
    expect(screen.getByText('maria@test.com')).toBeInTheDocument();
    expect(usuarioService.getUsuarios).toHaveBeenCalled();
  });

  test('deve exibir estado de carregamento', () => {
    usuarioService.getUsuarios.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    
    expect(screen.getByText('Carregando usuários...')).toBeInTheDocument();
  });

  test('deve exibir mensagem quando não há usuários', async () => {
    usuarioService.getUsuarios.mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Nenhum usuário encontrado.')).toBeInTheDocument();
    });
  });

  test('deve tratar erro ao carregar usuários', async () => {
    usuarioService.getUsuarios.mockRejectedValue(new Error('Erro ao carregar'));
    renderComponent();

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Erro ao carregar usuários');
    });
  });

  test('deve filtrar usuários por nome', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    fireEvent.change(searchInput, { target: { value: 'João' } });

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
  });

  test('deve filtrar usuários por email', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    fireEvent.change(searchInput, { target: { value: 'maria@test.com' } });

    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
  });

  test('deve filtrar usuários por CPF', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    fireEvent.change(searchInput, { target: { value: '123.456.789-01' } });

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
  });

  test('deve filtrar usuários por telefone', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    fireEvent.change(searchInput, { target: { value: '(11) 88888-8888' } });

    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
  });

  test('deve exibir "Nenhum usuário encontrado" quando busca não retorna resultados', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    fireEvent.change(searchInput, { target: { value: 'Usuário Inexistente' } });

    expect(screen.getByText('Nenhum usuário encontrado.')).toBeInTheDocument();
  });

  test('deve limpar busca quando campo está vazio', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    fireEvent.change(searchInput, { target: { value: 'João' } });
    fireEvent.change(searchInput, { target: { value: '' } });

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
  });

  test('deve navegar para página de edição ao clicar no botão editar', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('✏️');
    expect(editButtons[0]).toHaveAttribute('href', '/usuarios/editar/1');
  });

  test('deve navegar para página de cadastro ao clicar em novo usuário', () => {
    renderComponent();

    const newUserButton = screen.getByText('+ Novo Usuário');
    expect(newUserButton).toHaveAttribute('href', '/usuarios/cadastro');
  });

  test('deve deletar usuário com confirmação', async () => {
    global.confirm.mockReturnValue(true);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('🗑️');
    fireEvent.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalledWith('Tem certeza que deseja excluir o usuário João Silva?');
    
    await waitFor(() => {
      expect(usuarioService.deleteUsuario).toHaveBeenCalledWith(1);
      expect(global.alert).toHaveBeenCalledWith('Usuário excluído com sucesso!');
    });
  });

  test('deve cancelar deleção quando usuário nega confirmação', async () => {
    global.confirm.mockReturnValue(false);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('🗑️');
    fireEvent.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalled();
    expect(usuarioService.deleteUsuario).not.toHaveBeenCalled();
  });

  test('deve tratar erro ao deletar usuário', async () => {
    global.confirm.mockReturnValue(true);
    usuarioService.deleteUsuario.mockRejectedValue(new Error('Erro ao deletar'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('🗑️');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Erro ao excluir usuário');
    });
  });

  test('deve recarregar lista após deletar usuário', async () => {
    global.confirm.mockReturnValue(true);
    usuarioService.deleteUsuario.mockResolvedValue(true);
    usuarioService.getUsuarios
      .mockResolvedValueOnce(mockUsuarios)
      .mockResolvedValueOnce([mockUsuarios[1]]);
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('🗑️');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(usuarioService.getUsuarios).toHaveBeenCalledTimes(2);
    });
  });

  test('deve exibir dados formatados dos usuários', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
    expect(screen.getByText('123.456.789-01')).toBeInTheDocument();
    expect(screen.getByText('Instrutor(a)')).toBeInTheDocument();
  });

  test('deve exibir endereço completo do usuário', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Rua Test, 123')).toBeInTheDocument();
      expect(screen.getByText('Rua Test, 456')).toBeInTheDocument();
    });
  });

  test('deve exibir cargo e turma do usuário', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Professor')).toBeInTheDocument();
      expect(screen.getByText('Turma A')).toBeInTheDocument();
      expect(screen.getByText('Estudante')).toBeInTheDocument();
      expect(screen.getByText('Turma B')).toBeInTheDocument();
    });
  });

  test('deve formatar data de nascimento', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('01/01/1990')).toBeInTheDocument();
      expect(screen.getByText('15/05/1995')).toBeInTheDocument();
    });
  });

  test('deve ser case-insensitive na busca', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    fireEvent.change(searchInput, { target: { value: 'joão' } });

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
  });

  test('deve buscar por termo parcial', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    fireEvent.change(searchInput, { target: { value: 'Silva' } });

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
  });

  test('deve exibir ícones de ação para cada usuário', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const editIcons = screen.getAllByText('✏️');
    const deleteIcons = screen.getAllByText('🗑️');

    expect(editIcons).toHaveLength(2);
    expect(deleteIcons).toHaveLength(2);
  });

  test('deve manter estado de busca durante recarregamento', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    fireEvent.change(searchInput, { target: { value: 'João' } });

    expect(searchInput.value).toBe('João');
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  test('deve lidar com usuários sem alguns campos opcionais', async () => {
    const usuarioIncompleto = {
      id_usuario: 3,
      nome: 'Teste Usuário',
      email: 'teste@test.com',
      telefone: '',
      cpf: '',
      endereco: '',
      status: 'Aluno(a)',
      cargo: '',
      turma: '',
      data_nascimento: ''
    };

    usuarioService.getUsuarios.mockResolvedValue([usuarioIncompleto]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Teste Usuário')).toBeInTheDocument();
      expect(screen.getByText('teste@test.com')).toBeInTheDocument();
    });
  });

  test('deve exibir status do usuário corretamente', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Instrutor(a)')).toBeInTheDocument();
      expect(screen.getByText('Aluno(a)')).toBeInTheDocument();
    });
  });

  test('deve buscar em todos os campos do usuário', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    // Buscar por endereço
    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    fireEvent.change(searchInput, { target: { value: 'Rua Test, 123' } });

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
  });

  test('deve buscar por status do usuário', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    fireEvent.change(searchInput, { target: { value: 'Instrutor' } });

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
  });

  test('deve buscar por cargo do usuário', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    fireEvent.change(searchInput, { target: { value: 'Professor' } });

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
  });

  test('deve buscar por turma do usuário', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    fireEvent.change(searchInput, { target: { value: 'Turma B' } });

    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
  });

  test('deve tratar valores null ou undefined nos campos', async () => {
    const usuarioComNulls = {
      id_usuario: 4,
      nome: 'Usuário Null',
      email: 'null@test.com',
      telefone: null,
      cpf: undefined,
      endereco: null,
      status: 'Aluno(a)',
      cargo: null,
      turma: undefined,
      data_nascimento: null
    };

    usuarioService.getUsuarios.mockResolvedValue([usuarioComNulls]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Usuário Null')).toBeInTheDocument();
      expect(screen.getByText('null@test.com')).toBeInTheDocument();
    });
  });

  test('deve recarregar lista quando component monta', () => {
    renderComponent();
    expect(usuarioService.getUsuarios).toHaveBeenCalledTimes(1);
  });

  test('deve limpar loading após carregar dados', async () => {
    renderComponent();

    expect(screen.getByText('Carregando usuários...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Carregando usuários...')).not.toBeInTheDocument();
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });
  });

  test('deve exibir contagem total de usuários', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Total: 2 usuários')).toBeInTheDocument();
    });
  });

  test('deve atualizar contagem após filtrar', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Total: 2 usuários')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    fireEvent.change(searchInput, { target: { value: 'João' } });

    expect(screen.getByText('Total: 1 usuários')).toBeInTheDocument();
  });
});