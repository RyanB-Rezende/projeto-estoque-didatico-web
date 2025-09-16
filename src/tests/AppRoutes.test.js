import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes';

// Mock vazio
jest.mock('../components/CadastroUsuarios', () => () => <div />);
jest.mock('../components/UsuarioList', () => () => <div />);
jest.mock('../components/EditUsuario', () => () => <div />);
jest.mock('../components/Navigation', () => () => <nav />);

describe('AppRoutes', () => {
  test('deve renderizar sem erros na rota principal', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );
    
    expect(container).toBeInTheDocument();
  });
});