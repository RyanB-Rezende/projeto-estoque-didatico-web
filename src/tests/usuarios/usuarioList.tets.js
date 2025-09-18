import { render, screen } from '@testing-library/react';
import UsuarioList from '../../components/usuario/UsuarioList';

// Mocks
jest.mock('../services/usuarioService', () => ({
  getUsuarios: jest.fn(() => Promise.resolve([])),
  deleteUsuario: jest.fn(() => Promise.resolve(true))
}));

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe('UsuarioList Component', () => {
  test('deve renderizar o título da lista', async () => {
    render(<UsuarioList />);
    expect(await screen.findByText('📋 Lista de Usuários')).toBeInTheDocument();
  });

  test('deve mostrar botão para novo usuário', async () => {
    render(<UsuarioList />);
    expect(await screen.findByText('+ Novo Usuário')).toBeInTheDocument();
  });
});