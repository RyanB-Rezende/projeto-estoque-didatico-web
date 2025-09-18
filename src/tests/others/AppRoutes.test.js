import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../../routes/AppRoutes';

// Mock vazio (ajustado para nova estrutura de pastas)
jest.mock('../../components/usuario/CadastroUsuarios', () => () => <div />);
jest.mock('../../components/usuario/UsuarioList', () => () => <div />);
jest.mock('../../components/usuario/EditUsuario', () => () => <div />);

describe('AppRoutes', () => {
  test('deve renderizar sem erros na rota principal', () => {
    const { container } = render(
      <MemoryRouter
        initialEntries={['/']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AppRoutes />
      </MemoryRouter>
    );
    
    expect(container).toBeInTheDocument();
  });
});