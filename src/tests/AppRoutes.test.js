import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { jest } from '@jest/globals';

jest.mock('../components/UsuarioList', () => () => <div>Lista de Usuários</div>);
jest.mock('../components/CadastroUsuarios', () => () => <div>Cadastro de Usuários</div>);
jest.mock('../components/EditUsuario', () => () => <div>Edição de Usuário</div>);

describe('AppRoutes', () => {
  test('deve renderizar rotas sem erro', () => {
    render(
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    );
  });

  // Testes de redirecionamento podem ser adicionados aqui
});