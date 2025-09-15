import { render, screen } from '@testing-library/react';
import Navigation from '../components/Navigation';

// Mock completo do react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: jest.fn(),
  useLocation: jest.fn(() => ({ 
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default'
  }))
}));

describe('Navigation Component', () => {
  test('deve renderizar a barra de navegação', () => {
    render(<Navigation />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('deve conter o título do sistema', () => {
    render(<Navigation />);
    expect(screen.getByText('Sistema de Usuários')).toBeInTheDocument();
  });
});