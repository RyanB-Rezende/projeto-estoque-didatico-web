import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CadastroUsuarios from "../components/CadastroUsuarios";
import { supabase } from "../services/supabaseClient";

// Mock do Supabase para evitar chamadas reais e erro de importação
jest.mock("../services/supabaseClient", () => ({
  supabase: {
    from: () => ({
      insert: async () => ({ data: {}, error: null })
    })
  }
}));

//  Teste 1: Renderiza todos os inputs
test("renderiza todos os campos do formulário", () => {
  render(<CadastroUsuarios />);

  expect(screen.getByLabelText(/Nome/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Telefone/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Endereço/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Cargo/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Turma/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Cpf/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Foto/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Nascimento/i)).toBeInTheDocument();
});

//  Teste 2: Submete com os dados corretos
test("chama onSubmit com dados corretos", async () => {
  const handleSubmit = jest.fn();
  render(<CadastroUsuarios onSubmit={handleSubmit} />);

  fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: "João" } });
  fireEvent.change(screen.getByLabelText(/Telefone/i), { target: { value: "123456789" } });
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "joao@email.com" } });
  fireEvent.change(screen.getByLabelText(/Endereço/i), { target: { value: "Rua A, 123" } });
  fireEvent.change(screen.getByLabelText(/Cargo/i), { target: { value: "Desenvolvedor" } });
  fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: "senha123" } });
  fireEvent.change(screen.getByLabelText(/Turma/i), { target: { value: "Turma 1" } });
  fireEvent.change(screen.getByLabelText(/Cpf/i), { target: { value: "123.456.789-00" } });
  fireEvent.change(screen.getByLabelText(/Foto/i), { target: { files: [new File([], "foto.png")] } });
  fireEvent.change(screen.getByLabelText(/Nascimento/i), { target: { value: "2000-01-01" } });

  fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith({
      nome: "João",
      telefone: "123456789",
      email: "joao@email.com",
      endereco: "Rua A, 123",
      cargo: "Desenvolvedor",
      senha: "senha123",
      turma: "Turma 1",
      cpf: "123.456.789-00",
      foto: expect.any(File),
      dataNascimento: "2000-01-01",
    })
  );
});
