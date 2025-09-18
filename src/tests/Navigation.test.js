import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../components/Navigation';
import '@testing-library/jest-dom';

// Mock do useLocation
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockUseLocation(),
}));

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(ui, { wrapper: BrowserRouter });
  };

  test('deve renderizar os links de navegação', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });
    
    renderWithRouter(<Navigation />);
    
    expect(screen.getByText('Cadastrar Usuário')).toBeInTheDocument();
    expect(screen.getByText('Lista de Usuários')).toBeInTheDocument();
  });

  test('deve destacar o link "Cadastrar Usuário" quando estiver na página inicial', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });
    
    renderWithRouter(<Navigation />);
    
    const cadastrarLink = screen.getByText('Cadastrar Usuário');
    const listaLink = screen.getByText('Lista de Usuários');
    
    // Verifica estilos quando na página inicial
    expect(cadastrarLink).toHaveStyle('color: #3498db');
    expect(cadastrarLink).toHaveStyle('backgroundColor: white');
    
    expect(listaLink).toHaveStyle('color: white');
    expect(listaLink).toHaveStyle('backgroundColor: transparent');
  });

  test('deve destacar o link "Lista de Usuários" quando estiver na página /usuarios', () => {
    mockUseLocation.mockReturnValue({ pathname: '/usuarios' });
    
    renderWithRouter(<Navigation />, { route: '/usuarios' });
    
    const cadastrarLink = screen.getByText('Cadastrar Usuário');
    const listaLink = screen.getByText('Lista de Usuários');
    
    // Verifica estilos quando na página de usuários
    expect(listaLink).toHaveStyle('color: #3498db');
    expect(listaLink).toHaveStyle('backgroundColor: white');
    
    expect(cadastrarLink).toHaveStyle('color: white');
    expect(cadastrarLink).toHaveStyle('backgroundColor: transparent');
  });

  test('deve manter estilos normais para ambas as rotas quando em outra página', () => {
    mockUseLocation.mockReturnValue({ pathname: '/outra-rota' });
    
    renderWithRouter(<Navigation />, { route: '/outra-rota' });
    
    const cadastrarLink = screen.getByText('Cadastrar Usuário');
    const listaLink = screen.getByText('Lista de Usuários');
    
    // Ambos os links devem ter estilos normais (não destacados)
    expect(cadastrarLink).toHaveStyle('color: white');
    expect(cadastrarLink).toHaveStyle('backgroundColor: transparent');
    
    expect(listaLink).toHaveStyle('color: white');
    expect(listaLink).toHaveStyle('backgroundColor: transparent');
  });

  test('os links devem ter as rotas corretas', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });
    
    renderWithRouter(<Navigation />);
    
    const cadastrarLink = screen.getByText('Cadastrar Usuário');
    const listaLink = screen.getByText('Lista de Usuários');
    
    expect(cadastrarLink.closest('a')).toHaveAttribute('href', '/');
    expect(listaLink.closest('a')).toHaveAttribute('href', '/usuarios');
  });

  test('deve aplicar estilos de container corretamente', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });
    
    const { container } = renderWithRouter(<Navigation />);
    
    const navElement = container.querySelector('nav');
    const innerDiv = container.querySelector('nav > div');
    
    expect(navElement).toHaveStyle('backgroundColor: #2c3e50');
    expect(navElement).toHaveStyle('padding: 1rem');
    expect(navElement).toHaveStyle('marginBottom: 2rem');
    
    expect(innerDiv).toHaveStyle('maxWidth: 1200px');
    expect(innerDiv).toHaveStyle('margin: 0 auto');
    expect(innerDiv).toHaveStyle('display: flex');
    expect(innerDiv).toHaveStyle('justifyContent: space-between');
    expect(innerDiv).toHaveStyle('alignItems: center');
  });
});