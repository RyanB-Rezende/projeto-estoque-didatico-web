import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useParams, useNavigate } from 'react-router-dom';
import EditUsuario from '../../components/usuario/EditUsuario';
import * as usuarioService from '../../services/usuario/usuarioService';
import * as turmaService from '../../services/turma/turmaService';
import * as cargoService from '../../services/cargo/cargoService';

// Mock das dependências
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../../services/usuario/usuarioService');
jest.mock('../../services/turma/turmaService');
jest.mock('../../services/cargo/cargoService');

const mockNavigate = jest.fn();
const mockParams = { id: '1' };

const mockUsuario = {
  nome: 'João Silva',
  telefone: '11999999999',
  email: 'joao@test.com',
  endereco: 'Rua Test, 123',
  cargo: '1',
  turma: '1',
  cpf: '12345678901',
  data_nascimento: '1990-01-01',
  status: 'Instrutor(a)',
  senha: 'senha123'
};

const mockTurmas = [
  { id_turma: 1, turma: 'Turma A', instrutor: 'Prof. A' },
  { id_turma: 2, turma: 'Turma B', instrutor: 'Prof. B' }
];

const mockCargos = [
  { id_cargos: 1, cargo: 'Instrutor' },
  { id_cargos: 2, cargo: 'Admin' }
];

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <EditUsuario />
    </BrowserRouter>
  );
};

describe('EditUsuario', () => {
  beforeEach(() => {
    useParams.mockReturnValue(mockParams);
    useNavigate.mockReturnValue(mockNavigate);
    usuarioService.getUsuarioById.mockResolvedValue(mockUsuario);
    turmaService.getTurmas.mockResolvedValue(mockTurmas);
    cargoService.getCargos.mockResolvedValue(mockCargos);
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  test('deve renderizar o estado de carregamento', () => {
    usuarioService.getUsuarioById.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  test('deve carregar e renderizar dados do usuário', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    expect(screen.getByDisplayValue('joao@test.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('(11) 99999-9999')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123.456.789-01')).toBeInTheDocument();
  });

  test('deve navegar de volta quando usuário não encontrado', async () => {
    usuarioService.getUsuarioById.mockResolvedValue(null);
    renderComponent();

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Usuário não encontrado!');
      expect(mockNavigate).toHaveBeenCalledWith('/usuarios');
    });
  });

  test('deve tratar erro ao carregar dados', async () => {
    usuarioService.getUsuarioById.mockRejectedValue(new Error('Erro teste'));
    renderComponent();

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Erro ao carregar dados do usuário');
      expect(mockNavigate).toHaveBeenCalledWith('/usuarios');
    });
  });

  test('deve tratar erro ao carregar turmas', async () => {
    turmaService.getTurmas.mockRejectedValue(new Error('Erro turmas'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    });

    expect(turmaService.getTurmas).toHaveBeenCalled();
  });

  test('deve tratar erro ao carregar cargos', async () => {
    cargoService.getCargos.mockRejectedValue(new Error('Erro cargos'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    });

    expect(cargoService.getCargos).toHaveBeenCalled();
  });

  // Testes de formatação de telefone corrigidos
  test('deve formatar telefone com 10 dígitos', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const telefoneInput = screen.getByPlaceholderText('Telefone *');
    
    // Limpar primeiro e depois inserir
    fireEvent.change(telefoneInput, { target: { value: '' } });
    fireEvent.change(telefoneInput, { target: { value: '1199998888' } });
    expect(telefoneInput.value).toBe('(11) 99998-888');
  });

  test('deve formatar telefone com 11 dígitos', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const telefoneInput = screen.getByPlaceholderText('Telefone *');
    
    fireEvent.change(telefoneInput, { target: { value: '' } });
    fireEvent.change(telefoneInput, { target: { value: '11987654321' } });
    expect(telefoneInput.value).toBe('(11) 98765-4321');
  });

  test('deve limitar telefone apenas números', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const telefoneInput = screen.getByPlaceholderText('Telefone *');
    
    fireEvent.change(telefoneInput, { target: { value: '' } });
    fireEvent.change(telefoneInput, { target: { value: 'abc123def456' } });
    expect(telefoneInput.value).toBe('(12) 3456');
  });

  // Testes de formatação de CPF corrigidos
  test('deve formatar CPF corretamente', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const cpfInput = screen.getByPlaceholderText('CPF *');
    fireEvent.change(cpfInput, { target: { value: '' } });
    fireEvent.change(cpfInput, { target: { value: '98765432100' } });
    
    expect(cpfInput.value).toBe('987.654.321-00');
  });

  test('deve limitar CPF apenas números', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const cpfInput = screen.getByPlaceholderText('CPF *');
    fireEvent.change(cpfInput, { target: { value: '' } });
    fireEvent.change(cpfInput, { target: { value: 'abc12345678901def' } });
    
    expect(cpfInput.value).toBe('123.456.789-01');
  });

  test('deve limitar CPF a 11 dígitos', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const cpfInput = screen.getByPlaceholderText('CPF *');
    fireEvent.change(cpfInput, { target: { value: '' } });
    fireEvent.change(cpfInput, { target: { value: '12345678901' } });
    
    expect(cpfInput.value).toBe('123.456.789-01');
  });

  // Testes de campos do formulário corrigidos
  test('deve atualizar campos básicos do formulário', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const nomeInput = screen.getByPlaceholderText('Nome completo *');
    const emailInput = screen.getByPlaceholderText('E-mail *');
    const enderecoInput = screen.getByPlaceholderText('Endereço *');
    const senhaInput = screen.getByPlaceholderText('Nova senha (deixe em branco para manter a atual)');
    const dataNascimentoInput = screen.getByDisplayValue('1990-01-01');

    fireEvent.change(nomeInput, { target: { value: 'Maria Silva' } });
    fireEvent.change(emailInput, { target: { value: 'maria@test.com' } });
    fireEvent.change(enderecoInput, { target: { value: 'Nova Rua, 456' } });
    fireEvent.change(senhaInput, { target: { value: 'novaSenha123' } });
    fireEvent.change(dataNascimentoInput, { target: { value: '1995-05-15' } });
    
    expect(nomeInput.value).toBe('Maria Silva');
    expect(emailInput.value).toBe('maria@test.com');
    expect(enderecoInput.value).toBe('Nova Rua, 456');
    expect(senhaInput.value).toBe('novaSenha123');
    expect(dataNascimentoInput.value).toBe('1995-05-15');
  });

  test('deve atualizar campo status', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const statusSelect = screen.getByDisplayValue('Instrutor(a)');
    fireEvent.change(statusSelect, { target: { value: 'Aluno(a)' } });
    
    expect(statusSelect.value).toBe('Aluno(a)');
  });

  test('deve atualizar select de cargo', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    // Buscar pelo label do select
    const cargoSelect = screen.getByRole('combobox', { name: /cargo/i });
    fireEvent.change(cargoSelect, { target: { value: '2' } });
    
    expect(cargoSelect.value).toBe('2');
  });

  test('deve atualizar select de turma', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    // Buscar pelo label do select
    const turmaSelect = screen.getByRole('combobox', { name: /turma/i });
    fireEvent.change(turmaSelect, { target: { value: '2' } });
    
    expect(turmaSelect.value).toBe('2');
  });

  test('deve submeter formulário com sucesso', async () => {
    usuarioService.updateUsuario.mockResolvedValue();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Atualizar Usuário');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(usuarioService.updateUsuario).toHaveBeenCalledWith(1, expect.objectContaining({
        nome: 'João Silva',
        telefone: '11999999999',
        cpf: '12345678901',
        cargo: 1,
        turma: 1
      }));
      expect(global.alert).toHaveBeenCalledWith('Usuário atualizado com sucesso!');
      expect(mockNavigate).toHaveBeenCalledWith('/usuarios');
    });
  });

  test('deve validar campos obrigatórios - nome vazio', async () => {
    usuarioService.getUsuarioById.mockResolvedValue({ ...mockUsuario, nome: '' });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Atualizar Usuário');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Por favor, preencha todos os campos obrigatórios!');
    });
  });

  test('deve validar campos obrigatórios - email vazio', async () => {
    usuarioService.getUsuarioById.mockResolvedValue({ ...mockUsuario, email: '' });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Atualizar Usuário');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Por favor, preencha todos os campos obrigatórios!');
    });
  });

  test('deve validar campos obrigatórios - telefone vazio', async () => {
    usuarioService.getUsuarioById.mockResolvedValue({ ...mockUsuario, telefone: '' });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Atualizar Usuário');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Por favor, preencha todos os campos obrigatórios!');
    });
  });

  test('deve validar campos obrigatórios - endereço vazio', async () => {
    usuarioService.getUsuarioById.mockResolvedValue({ ...mockUsuario, endereco: '' });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Atualizar Usuário');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Por favor, preencha todos os campos obrigatórios!');
    });
  });

  test('deve validar campos obrigatórios - CPF vazio', async () => {
    usuarioService.getUsuarioById.mockResolvedValue({ ...mockUsuario, cpf: '' });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Atualizar Usuário');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Por favor, preencha todos os campos obrigatórios!');
    });
  });

  test('deve validar campos obrigatórios - data nascimento vazia', async () => {
    usuarioService.getUsuarioById.mockResolvedValue({ ...mockUsuario, data_nascimento: '' });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Atualizar Usuário');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Por favor, preencha todos os campos obrigatórios!');
    });
  });

  test('deve tratar erro na atualização', async () => {
    usuarioService.updateUsuario.mockRejectedValue(new Error('Erro na atualização'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Atualizar Usuário');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Erro ao atualizar usuário: Erro na atualização');
    });
  });

  test('deve navegar de volta ao clicar no botão voltar', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: '' });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/usuarios');
  });

  test('deve normalizar data de nascimento do formato brasileiro', async () => {
    usuarioService.getUsuarioById.mockResolvedValue({
      ...mockUsuario,
      data_nascimento: '01/01/1990'
    });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('1990-01-01')).toBeInTheDocument();
    });
  });

  test('deve normalizar data de nascimento já no formato ISO', async () => {
    usuarioService.getUsuarioById.mockResolvedValue({
      ...mockUsuario,
      data_nascimento: '1990-01-01'
    });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('1990-01-01')).toBeInTheDocument();
    });
  });

  test('deve remover senha vazia do payload', async () => {
    usuarioService.updateUsuario.mockResolvedValue();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const senhaInput = screen.getByPlaceholderText('Nova senha (deixe em branco para manter a atual)');
    fireEvent.change(senhaInput, { target: { value: '' } });

    const submitButton = screen.getByText('Atualizar Usuário');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(usuarioService.updateUsuario).toHaveBeenCalledWith(1, expect.not.objectContaining({
        senha: expect.anything()
      }));
    });
  });

  test('deve incluir senha no payload quando preenchida', async () => {
    usuarioService.updateUsuario.mockResolvedValue();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const senhaInput = screen.getByPlaceholderText('Nova senha (deixe em branco para manter a atual)');
    fireEvent.change(senhaInput, { target: { value: 'novaSenha123' } });

    const submitButton = screen.getByText('Atualizar Usuário');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(usuarioService.updateUsuario).toHaveBeenCalledWith(1, expect.objectContaining({
        senha: 'novaSenha123'
      }));
    });
  });

  test('deve desabilitar botão durante loading', async () => {
    usuarioService.updateUsuario.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Atualizar Usuário');
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  test('deve renderizar options de turmas corretamente', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Turma A - Prof. A')).toBeInTheDocument();
      expect(screen.getByText('Turma B - Prof. B')).toBeInTheDocument();
    });
  });

  test('deve renderizar options de cargos corretamente', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Instrutor')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  test('deve renderizar com turmas vazias quando há erro', async () => {
    turmaService.getTurmas.mockRejectedValue(new Error('Erro'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    });

    expect(screen.queryByText('Turma A - Prof. A')).not.toBeInTheDocument();
  });

  test('deve renderizar com cargos vazios quando há erro', async () => {
    cargoService.getCargos.mockRejectedValue(new Error('Erro'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    });

    expect(screen.queryByText('Instrutor')).not.toBeInTheDocument();
  });

  test('deve converter cargo string para number no submit', async () => {
    usuarioService.updateUsuario.mockResolvedValue();
    usuarioService.getUsuarioById.mockResolvedValue({
      ...mockUsuario,
      cargo: '2'
    });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Atualizar Usuário');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(usuarioService.updateUsuario).toHaveBeenCalledWith(1, expect.objectContaining({
        cargo: 2
      }));
    });
  });

  test('deve converter turma string para number no submit', async () => {
    usuarioService.updateUsuario.mockResolvedValue();
    usuarioService.getUsuarioById.mockResolvedValue({
      ...mockUsuario,
      turma: '2'
    });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Atualizar Usuário');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(usuarioService.updateUsuario).toHaveBeenCalledWith(1, expect.objectContaining({
        turma: 2
      }));
    });
  });

  // Teste adicional para cobertura completa
  test('deve testar normalização de data com string vazia', async () => {
    usuarioService.getUsuarioById.mockResolvedValue({
      ...mockUsuario,
      data_nascimento: ''
    });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    });
  });

  test('deve testar formatação de telefone com string vazia', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const telefoneInput = screen.getByPlaceholderText('Telefone *');
    fireEvent.change(telefoneInput, { target: { value: '' } });
    
    expect(telefoneInput.value).toBe('');
  });

  test('deve testar formatação de CPF com string vazia', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    const cpfInput = screen.getByPlaceholderText('CPF *');
    fireEvent.change(cpfInput, { target: { value: '' } });
    
    expect(cpfInput.value).toBe('');
  });
});