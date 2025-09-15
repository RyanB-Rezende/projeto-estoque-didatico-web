import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CadastroUsuarios from '../components/CadastroUsuarios';
import { createUsuario } from '../services/usuarioService';
import { getTurmas } from '../services/turmaService';
import { getCargos } from '../services/cargoService';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import '@testing-library/jest-dom';

// Mock dos serviços
jest.mock('../services/usuarioService');
jest.mock('../services/turmaService');
jest.mock('../services/cargoService');

// Mock do react-router-dom para o hook useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe('CadastroUsuarios', () => {
  // Mock do window.alert
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

  beforeEach(() => {
    // Limpa os mocks antes de cada teste
    createUsuario.mockClear();
    getTurmas.mockClear();
    getCargos.mockClear();
    alertSpy.mockClear();
    mockNavigate.mockClear();

    // Mock de retorno dos serviços
    getTurmas.mockResolvedValue([
      { id_turma: 1, turma: 'Turma A', instrutor: 'João Silva' },
      { id_turma: 2, turma: 'Turma B', instrutor: 'Maria Santos' }
    ]);

    getCargos.mockResolvedValue([
      { id_cargos: 1, cargo: 'Professor' },
      { id_cargos: 2, cargo: 'Aluno' }
    ]);
  });

  afterAll(() => {
    // Restaura o mock do alert
    alertSpy.mockRestore();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <CadastroUsuarios />
      </MemoryRouter>
    );
  };

  const fillForm = () => {
    fireEvent.change(screen.getByPlaceholderText(/nome completo/i), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByPlaceholderText(/e-mail/i), { target: { value: 'joao@email.com' } });
    fireEvent.change(screen.getByPlaceholderText(/telefone/i), { target: { value: '11999999999' } });
    fireEvent.change(screen.getByPlaceholderText(/cpf/i), { target: { value: '12345678900' } });
    fireEvent.change(screen.getByPlaceholderText(/endereço/i), { target: { value: 'Rua A, 123' } });
    fireEvent.change(screen.getByPlaceholderText(/senha/i), { target: { value: 'senha123' } });
    // O select de cargo não tem um label associado, então buscamos pelo role de combobox
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
  };

  test("renderiza o formulário de cadastro corretamente", async () => {
    renderComponent();

    // Aguarda o carregamento dos dados (cargos)
    await waitFor(() => {
      expect(screen.getByText(/selecione o cargo/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  test('deve exibir alerta de validação se campos obrigatórios não forem preenchidos', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/selecione o cargo/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Por favor, preencha todos os campos obrigatórios!');
    });
    expect(createUsuario).not.toHaveBeenCalled();
  });

  test('deve chamar createUsuario com os dados corretos e navegar em caso de sucesso', async () => {
    createUsuario.mockResolvedValue({ id: 1, nome: 'João Silva' });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/selecione o cargo/i)).toBeInTheDocument();
    });

    fillForm();

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    fireEvent.click(submitButton);

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
        data_nascimento: '',
      });
    });

    expect(alertSpy).toHaveBeenCalledWith('Usuário cadastrado com sucesso!');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('deve exibir alerta de erro quando o cadastro falha na API', async () => {
    createUsuario.mockRejectedValue(new Error('Erro na API'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/selecione o cargo/i)).toBeInTheDocument();
    });

    fillForm();

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createUsuario).toHaveBeenCalled();
    });

    expect(alertSpy).toHaveBeenCalledWith('Erro ao cadastrar usuário: Erro na API');
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});