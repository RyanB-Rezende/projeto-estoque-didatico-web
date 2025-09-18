import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CadastroUsuarios from '../../components/usuario/CadastroUsuarios';
import { createUsuario } from '../../services/usuario/usuarioService';
import { getTurmas } from '../../services/turma/turmaService';
import { getCargos } from '../../services/cargo/cargoService';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import '@testing-library/jest-dom';

// Mock dos serviços (paths reais usados pelo componente)
jest.mock('../../services/usuario/usuarioService');
jest.mock('../../services/turma/turmaService');
jest.mock('../../services/cargo/cargoService');

// Mock do react-router-dom para o hook useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock dos ícones do FontAwesome
jest.mock('react-icons/fa', () => ({
  FaUser: () => <div data-testid="fa-user">UserIcon</div>,
  FaEnvelope: () => <div data-testid="fa-envelope">EnvelopeIcon</div>,
  FaPhone: () => <div data-testid="fa-phone">PhoneIcon</div>,
  FaIdCard: () => <div data-testid="fa-id-card">IdCardIcon</div>,
  FaMapMarkerAlt: () => <div data-testid="fa-map-marker">MapMarkerIcon</div>,
  FaLock: () => <div data-testid="fa-lock">LockIcon</div>,
}));

describe('CadastroUsuarios', () => {
  // Mock do window.alert
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

  beforeEach(() => {
    // Limpa os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Mock de retorno dos serviços
    getTurmas.mockResolvedValue([
      { id_turma: 1, turma: 'Turma A', instrutor: 'João Silva' },
      { id_turma: 2, turma: 'Turma B', instrutor: 'Maria Santos' }
    ]);

    getCargos.mockResolvedValue([
      { id_cargos: 1, cargo: 'Professor' },
      { id_cargos: 2, cargo: 'Aluno' }
    ]);

    createUsuario.mockResolvedValue({ id: 1 });
  });

  afterAll(() => {
    // Restaura o mock do alert
    alertSpy.mockRestore();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CadastroUsuarios />
      </MemoryRouter>
    );
  };

  const fillForm = async (user) => {
    // Aguarda o carregamento dos dados
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/nome completo/i), 'João Silva');
    await user.type(screen.getByPlaceholderText(/e-mail/i), 'joao@email.com');
    await user.type(screen.getByPlaceholderText(/telefone/i), '11999999999');
    await user.type(screen.getByPlaceholderText(/cpf/i), '12345678900');
    await user.type(screen.getByPlaceholderText(/endereço/i), 'Rua A, 123');
    await user.type(screen.getByPlaceholderText(/senha/i), 'senha123');
    
    // Seleciona o cargo
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
  };

  test("renderiza o formulário de cadastro corretamente", async () => {
    renderComponent();

    // Aguarda o carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText(/selecione o cargo/i)).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e-mail/i)).toBeInTheDocument();
  });

  test('deve exibir alerta de validação se campos obrigatórios não forem preenchidos', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Aguarda o carregamento
    await waitFor(() => {
      expect(screen.getByText(/selecione o cargo/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    await user.click(submitButton);

    expect(alertSpy).toHaveBeenCalledWith('Por favor, preencha todos os campos obrigatórios!');
    expect(createUsuario).not.toHaveBeenCalled();
  });

  test('deve chamar createUsuario com os dados corretos e navegar em caso de sucesso', async () => {
    const user = userEvent.setup();
    renderComponent();

    await fillForm(user);

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    await user.click(submitButton);

    // Verifica se createUsuario foi chamado com os dados corretos
    await waitFor(() => {
      expect(createUsuario).toHaveBeenCalledWith({
        nome: 'João Silva',
        telefone: '(11) 99999-9999',
        email: 'joao@email.com',
        endereco: 'Rua A, 123',
        cargo: 1,
        senha: 'senha123',
        turma: null,
        cpf: '123.456.789-00',
        data_nascimento: ''
      });
    });

    expect(alertSpy).toHaveBeenCalledWith('Usuário cadastrado com sucesso!');
    expect(mockNavigate).toHaveBeenCalledWith('/usuarios'); // Corrigido para /usuarios
  });

  test('deve exibir alerta de erro quando o cadastro falha na API', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Erro na API';
    createUsuario.mockRejectedValue(new Error(errorMessage));
    
    renderComponent();

    await fillForm(user);

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createUsuario).toHaveBeenCalled();
    });

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Erro ao cadastrar usuário:'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('deve aplicar máscaras de formatação nos campos', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/telefone/i)).toBeInTheDocument();
    });

    // Testa máscara de telefone
    const telefoneInput = screen.getByPlaceholderText(/telefone/i);
    await user.type(telefoneInput, '11999999999');
    expect(telefoneInput.value).toBe('(11) 99999-9999');

    // Testa máscara de CPF
    const cpfInput = screen.getByPlaceholderText(/cpf/i);
    await user.type(cpfInput, '12345678900');
    expect(cpfInput.value).toBe('123.456.789-00');
  });
});