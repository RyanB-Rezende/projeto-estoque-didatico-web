import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UsuarioList from "../components/UsuarioList";
import * as service from "../services/usuarioService";

jest.mock("../services/usuarioService");

test("exibir lista de contatos", async () => {
  service.getUsuario.mockResolvedValue([
    { id: 1, nome: "João", email: "joao@gmail.com" },
    { id: 2, nome: "Maria", email: "maria@gmail.com" },
  ]);

  render(<UsuarioList />);

  await waitFor(() => {
    expect(screen.getByText("João")).toBeInTheDocument();
    expect(screen.getByText("Maria")).toBeInTheDocument();
  });
});

test("exibir mensagem quando não contatos cadastrados", async () => {
  service.getUsuario.mockResolvedValue([]);

  render(<UsuarioList />);

  await waitFor(() => {
    expect(screen.getByText(/Nenhum usuário cadastrado/i)).toBeInTheDocument();
  });
});

test("deleta um contato ao clicar em Remover", async () => {
    const deleteUsuarioMock = jest.fn().mockResolvedValue();

    service.getUsuario.mockResolvedValue([
        { id: 1, nome: "João", email: "joao@gmail.com" },
    ]);
    service.deleteUsuario = deleteUsuarioMock;

    render(<UsuarioList />);

    await waitFor(() => {
        expect(screen.getByText("João")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Remover/i));

    await waitFor(() => {
        expect(deleteUsuarioMock).toHaveBeenCalledWith(1);
        expect(screen.queryByText("João")).not.toBeInTheDocument();
    });
});

