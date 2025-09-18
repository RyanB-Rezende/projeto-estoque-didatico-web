import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navigation from '../../components/common/Navigation';
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
    return render(
      <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {ui}
      </MemoryRouter>
    );
  };

  test('deve renderizar os links de navegação', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });
    
    renderWithRouter(<Navigation />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Cadastrar Usuário')).toBeInTheDocument();
    expect(screen.getByText('Lista de Usuários')).toBeInTheDocument();
  });

  test('deve destacar o link "Home" quando estiver na página inicial', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });
    
    renderWithRouter(<Navigation />);
    
    const homeLink = screen.getByText('Home');
    const cadastrarLink = screen.getByText('Cadastrar Usuário');
    const listaLink = screen.getByText('Lista de Usuários');
    
    expect(homeLink).toHaveStyle('color: #3498db');
    expect(homeLink).toHaveStyle('backgroundColor: white');
    
    expect(cadastrarLink).toHaveStyle('color: white');
    expect(cadastrarLink).toHaveStyle('backgroundColor: transparent');
    expect(listaLink).toHaveStyle('color: white');
    expect(listaLink).toHaveStyle('backgroundColor: transparent');
  });

  test('deve destacar o link "Lista de Usuários" quando estiver na página /usuarios', () => {
    mockUseLocation.mockReturnValue({ pathname: '/usuarios' });
    
    renderWithRouter(<Navigation />, { route: '/usuarios' });
    
    const homeLink = screen.getByText('Home');
    const cadastrarLink = screen.getByText('Cadastrar Usuário');
    const listaLink = screen.getByText('Lista de Usuários');
    
    // Verifica estilos quando na página de usuários
    expect(listaLink).toHaveStyle('color: #3498db');
    expect(listaLink).toHaveStyle('backgroundColor: white');
    
    expect(homeLink).toHaveStyle('color: white');
    expect(homeLink).toHaveStyle('backgroundColor: transparent');
    expect(cadastrarLink).toHaveStyle('color: white');
    expect(cadastrarLink).toHaveStyle('backgroundColor: transparent');
  });

  test('deve destacar o link "Cadastrar Usuário" quando estiver na página /cadastro', () => {
    mockUseLocation.mockReturnValue({ pathname: '/cadastro' });
    
    renderWithRouter(<Navigation />, { route: '/cadastro' });
    
    const homeLink = screen.getByText('Home');
    const cadastrarLink = screen.getByText('Cadastrar Usuário');
    const listaLink = screen.getByText('Lista de Usuários');

    expect(cadastrarLink).toHaveStyle('color: #3498db');
    expect(cadastrarLink).toHaveStyle('backgroundColor: white');

    expect(homeLink).toHaveStyle('color: white');
    expect(homeLink).toHaveStyle('backgroundColor: transparent');
    expect(listaLink).toHaveStyle('color: white');
    expect(listaLink).toHaveStyle('backgroundColor: transparent');
  });

  test('deve manter estilos normais para ambas as rotas quando em outra página', () => {
    mockUseLocation.mockReturnValue({ pathname: '/outra-rota' });
    
    renderWithRouter(<Navigation />, { route: '/outra-rota' });
    
    const homeLink = screen.getByText('Home');
    const cadastrarLink = screen.getByText('Cadastrar Usuário');
    const listaLink = screen.getByText('Lista de Usuários');
    
    // Ambos os links devem ter estilos normais (não destacados)
    expect(homeLink).toHaveStyle('color: white');
    expect(homeLink).toHaveStyle('backgroundColor: transparent');
    expect(cadastrarLink).toHaveStyle('color: white');
    expect(cadastrarLink).toHaveStyle('backgroundColor: transparent');
    
    expect(listaLink).toHaveStyle('color: white');
    expect(listaLink).toHaveStyle('backgroundColor: transparent');
  });

  test('os links devem ter as rotas corretas', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });
    
    renderWithRouter(<Navigation />);
    
    const homeLink = screen.getByText('Home');
    const cadastrarLink = screen.getByText('Cadastrar Usuário');
    const listaLink = screen.getByText('Lista de Usuários');
    
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    expect(listaLink.closest('a')).toHaveAttribute('href', '/usuarios');
    expect(cadastrarLink.closest('a')).toHaveAttribute('href', '/cadastro');
  });

  test('deve aplicar estilos de container corretamente', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });
    
    const { container } = renderWithRouter(<Navigation />);
    
    const navElement = container.querySelector('nav');
    const innerDiv = container.querySelector('nav > div');
    
  expect(navElement).toHaveStyle('backgroundColor: #2c3e50');
  expect(navElement).toHaveStyle('padding: 0.75rem 0');
  expect(navElement).toHaveStyle('marginBottom: 2rem');
    
    expect(innerDiv).toHaveStyle('maxWidth: 1200px');
    expect(innerDiv).toHaveStyle('margin: 0 auto');
    expect(innerDiv).toHaveStyle('display: flex');
    expect(innerDiv).toHaveStyle('justifyContent: space-between');
    expect(innerDiv).toHaveStyle('alignItems: center');
  });
});