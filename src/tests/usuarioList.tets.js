import { render, screen, waitFor } from "@testing-library/dom";
import UsuarioList from "../components/UsuarioList";
import * as service from "../services/usuarioService";

jest.mock("../services/usuarioService");

test ("exibe lista de usuários", async () => {
    ServiceWorker.getUsuarios.mockResolvedValue([
        { id: 1, nome: "João", email: "joao@gmail.com", telefone: "123456789" },
        { id: 2, nome: "Maria", email: "maria@gmail.com", telefone: "987654321" },
    ]);

    render(<UsuarioList />);

    await waitFor(() => {
        expect(screen.getByText("João")).toBeInTheDocument();
        expect(screen.getByText("Maria")).toBeInTheDocument();
    });
});

test ("exibe mensagem quando não há usuários", async () => {
    ServiceWorker.getUsuarios.mockResolvedValue([]);

    render(<UsuarioList />);

    await waitFor(() => {
        expect(screen.getByText(/Nenhum usuário encontrado/i)).toBeInTheDocument();
    });
});