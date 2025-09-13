import CadastroUsuarios from "../components/CadastroUsuarios";
import { fireEvent, render, screen } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';


test("chama onSubmit com dados corretos", () => {
  const handleSubmit = jest.fn();
  render(<CadastroUsuarios onSubmit={handleSubmit} />);

  fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "João" } });
  fireEvent.change(screen.getByLabelText(/telefone/i), { target: { value: "123456789" } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "joao@gmail.com" } });
  fireEvent.change(screen.getByLabelText(/endereço/i), { target: { value: "Rua A, 123" } });
  fireEvent.change(screen.getByLabelText(/cargo/i), { target: { value: "Desenvolvedor" } });
  fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: "senha123" } });
  fireEvent.change(screen.getByLabelText(/turma/i), { target: { value: "Turma 1" } });
  fireEvent.change(screen.getByLabelText(/cpf/i), { target: { value: "123.456.789-00" } });
  fireEvent.change(screen.getByLabelText(/data de nascimento/i), { target: { value: "1990-01-01" } });

  fireEvent.submit(screen.getByRole("form"));

  expect(handleSubmit).toHaveBeenCalledWith({
    nome: "João",
    telefone: "123456789",
    email: "joao@gmail.com",
    endereco: "Rua A, 123",
    cargo: "Desenvolvedor",
    senha: "senha123",
    turma: "Turma 1",
    cpf: "123.456.789-00",
    dataNascimento: "1990-01-01",
  });
});

test ("redenriza inputs de nome, telefone, email, endereço, cargo, senaha, turma, cpf e data de nascimento", () => {
    render(<CadastroUsuarios />);

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/endereço/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cargo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/turma/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data de nascimento/i)).toBeInTheDocument();
});

test("atualiza contato existente", () => {
  const handleSubmit = jest.fn();
  const usuarioExistente = {
    nome: "João",
    telefone: "123456789",
    email: "joao@gmail.com",
    endereco: "Rua A, 123",
    cargo: "Desenvolvedor", 
    senha: "senha123",
    turma: "Turma 1",
    cpf: "123.456.789-00",
    dataNascimento: "1990-01-01",
  };

  render(<CadastroUsuarios usuario={usuarioExistente} onSubmit={handleSubmit} />);

  fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "João Silva" } });
  fireEvent.submit(screen.getByRole("form"));

  expect(handleSubmit).toHaveBeenCalledWith({
    nome: "João Silva",
    telefone: "123456789",
    email: "joao1@gmail.com",
    endereco: "Rua A, 123",
    cargo: "Desenvolvedor", 
    senha: "senha123",
    turma: "Turma 1",
    cpf: "123.456.789-00",
    dataNascimento: "1990-01-01",
  });
});