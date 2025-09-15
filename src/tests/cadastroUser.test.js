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

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe('CadastroUsuarios', () => {
  const mockOnUsuarioCadastrado = jest.fn();

  beforeEach(() => {
    mockOnUsuarioCadastrado.mockClear();
    createUsuario.mockClear();
    
    // Mock dos dados de turmas e cargos
    getTurmas.mockResolvedValue([
      { id_turma: 1, turma: 'Turma A', instrutor: 'João Silva' },
      { id_turma: 2, turma: 'Turma B', instrutor: 'Maria Santos' }
    ]);
    
    getCargos.mockResolvedValue([
      { id_cargos: 1, cargo: 'Professor' },
      { id_cargos: 2, cargo: 'Aluno' }
    ]);
  });

  test("renderiza CadastroUsuarios sem quebrar", async () => {
    render(
      <MemoryRouter>
        <CadastroUsuarios />
      </MemoryRouter>
    );
    
    // Aguarda o carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText(/cadastrar usuário/i)).toBeInTheDocument();
    });
  });

  test('envia dados para o Supabase com estrutura correta', async () => {
    const mockUsuario = { 
      id_usuarios: 1, 
      nome: 'João Silva', 
      email: 'joao@email.com',
      status: 'ativo'
    };
    
    createUsuario.mockResolvedValue(mockUsuario);

    render(
      <MemoryRouter>
        <CadastroUsuarios onUsuarioCadastrado={mockOnUsuarioCadastrado} />
      </MemoryRouter>
    );

    // Aguardar carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText('Selecione um cargo')).toBeInTheDocument();
    });

    // Preencher campos - usando métodos mais robustos para encontrar elementos
    const nomeInput = screen.getByPlaceholderText(/digite o nome completo/i) || screen.getByLabelText(/nome/i);
    const telefoneInput = screen.getByPlaceholderText(/digite o telefone/i) || screen.getByLabelText(/telefone/i);
    const emailInput = screen.getByPlaceholderText(/digite o email/i) || screen.getByLabelText(/email/i);
    const enderecoInput = screen.getByPlaceholderText(/digite o endereço/i) || screen.getByLabelText(/endereço/i);
    const senhaInput = screen.getByPlaceholderText(/digite a senha/i) || screen.getByLabelText(/senha/i);
    const cpfInput = screen.getByPlaceholderText(/digite o cpf/i) || screen.getByLabelText(/cpf/i);

    fireEvent.change(nomeInput, { target: { value: 'João Silva' } });
    fireEvent.change(telefoneInput, { target: { value: '11999999999' } });
    fireEvent.change(emailInput, { target: { value: 'joao@email.com' } });
    fireEvent.change(enderecoInput, { target: { value: 'Rua A, 123' } });
    fireEvent.change(senhaInput, { target: { value: 'senha123' } });
    fireEvent.change(cpfInput, { target: { value: '12345678900' } });

    // Selecionar cargo (assumindo que é um select)
    const cargoSelect = screen.getByLabelText(/cargo/i) || screen.getByTestId('cargo-select');
    fireEvent.change(cargoSelect, { target: { value: '1' } });

    // Submeter
    const submitButton = screen.getByText(/cadastrar usuário/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createUsuario).toHaveBeenCalled();
    });
  });

  test('exibe mensagem de erro quando o cadastro falha', async () => {
    createUsuario.mockRejectedValue(new Error('Erro ao cadastrar'));

    render(
      <MemoryRouter>
        <CadastroUsuarios onUsuarioCadastrado={mockOnUsuarioCadastrado} />
      </MemoryRouter>
    );

    // Aguardar carregamento
    await waitFor(() => {
      expect(screen.getByText('Selecione um cargo')).toBeInTheDocument();
    });

    // Preencher campos mínimos
    const nomeInput = screen.getByPlaceholderText(/digite o nome completo/i) || screen.getByLabelText(/nome/i);
    fireEvent.change(nomeInput, { target: { value: 'João Silva' } });

    // Tentar submeter sem preencher todos os campos obrigatórios
    const submitButton = screen.getByText(/cadastrar usuário/i);
    fireEvent.click(submitButton);

    // Verificar se a mensagem de erro é exibida
    await waitFor(() => {
      expect(screen.getByText(/erro ao cadastrar/i)).toBeInTheDocument();
    });
  });

  test('validação de campos obrigatórios', async () => {
    render(
      <MemoryRouter>
        <CadastroUsuarios onUsuarioCadastrado={mockOnUsuarioCadastrado} />
      </MemoryRouter>
    );

    // Aguardar carregamento
    await waitFor(() => {
      expect(screen.getByText('Selecione um cargo')).toBeInTheDocument();
    });

    // Tentar submeter sem preencher campos
    const submitButton = screen.getByText(/cadastrar usuário/i);
    fireEvent.click(submitButton);

    // Verificar se mensagens de erro de validação são exibidas
    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    });
  });
});