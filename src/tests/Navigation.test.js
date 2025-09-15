import { render, screen } from '@testing-library/react';
import Navigation from '../components/Navigation';

// Mock do react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useLocation: () => ({ 
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default'
  })
}));

describe('Navigation Component', () => {
  test('deve renderizar o título do sistema', () => {
    render(<Navigation />);
    expect(screen.getByText('Sistema de Usuários')).toBeInTheDocument();
  });

  test('deve conter link para lista de usuários', () => {
    render(<Navigation />);
    expect(screen.getByText('Lista de Usuários')).toBeInTheDocument();
  });

  test('deve conter link para cadastrar usuário', () => {
    render(<Navigation />);
    expect(screen.getByText('Cadastrar Usuário')).toBeInTheDocument();
  });
});