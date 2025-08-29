// Teste RED inicial para o componente CadastroProduto
// Objetivo (primeiro passo TDD): garantir que o componente renderize um título principal
// Hierarquia dos testes de unidade:
//  - Componente: CadastroProduto
//     - Contexto: Renderização inicial
//         - Deve exibir o título "Cadastro de Produto"

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CadastroProduto, { cadastrarProduto } from '../components/CadastroProduto';

describe('CadastroProduto', () => {
	describe('Renderização inicial', () => {
		test('deve exibir o título "Cadastro de Produto"', () => {
			render(<CadastroProduto />);
			// RED: Falhará porque o componente ainda não está implementado / não renderiza o título
			expect(
				screen.getByRole('heading', { name: /cadastro de produto/i })
			).toBeInTheDocument();
		});
	});
});

describe('cadastrarProduto', () => {
  test('deve lançar erro quando nome não informado', async () => {
    await expect(cadastrarProduto({})).rejects.toThrow(/nome obrigatório/i);
  });
});

