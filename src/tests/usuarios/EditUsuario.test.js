import { render, screen } from '@testing-library/react';
import EditUsuario from '../../components/usuario/EditUsuario';

// Mocks simplificados
jest.mock('../services/usuarioService', () => ({
  getUsuarioById: jest.fn(),
  updateUsuario: jest.fn()
}));

jest.mock('../services/turmaService', () => ({
  getTurmas: jest.fn(() => Promise.resolve([]))
}));

jest.mock('../services/cargoService', () => ({
  getCargos: jest.fn(() => Promise.resolve([]))
}));

describe('EditUsuario Component', () => {
  test('deve existir o componente', () => {
    expect(EditUsuario).toBeDefined();
  });

  test('deve ser uma função', () => {
    expect(typeof EditUsuario).toBe('function');
  });
});