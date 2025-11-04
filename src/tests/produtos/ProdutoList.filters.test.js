import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as service from '../../services/produtos/produtosService';
import ProdutoList from '../../components/produtos/ProdutoList';

jest.mock('../../services/produtos/produtosService');

// Teste de facet por Medida
it('filtra por medida via painel de filtros (checkbox)', async () => {
  const produtos = [
    { id_produtos: '1', nome: 'Caneta', medida: 1, saldo: 8 },
    { id_produtos: '2', nome: 'Lápis', medida: 2, saldo: 5 },
    { id_produtos: '3', nome: 'Borracha', medida: 2, saldo: 10 },
  ];
  service.getProdutos.mockResolvedValue(produtos);
  service.getMedidas.mockResolvedValue([
    { id_medida: 1, medida: 'Unidade' },
    { id_medida: 2, medida: 'Caixa' },
  ]);

  render(<ProdutoList />);

  await screen.findByRole('table');
  // Abre filtros
  fireEvent.click(screen.getByRole('button', { name: /filtrar e ordenar/i }));

  // Seleciona apenas "Caixa"
  const caixaCheckbox = await screen.findByLabelText('Caixa');
  fireEvent.click(caixaCheckbox);

  // Após filtrar, apenas Lápis e Borracha devem permanecer
  await waitFor(() => {
    expect(screen.queryByText('Caneta')).toBeNull();
    expect(screen.getAllByText('Lápis').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Borracha').length).toBeGreaterThan(0);
  });
});

it('filtra por intervalo de saldo usando sliders de mínimo e máximo', async () => {
  const produtos = [
    { id_produtos: '1', nome: 'Caneta', medida: 1, saldo: 3 },
    { id_produtos: '2', nome: 'Lápis', medida: 1, saldo: 7 },
    { id_produtos: '3', nome: 'Borracha', medida: 1, saldo: 12 },
  ];
  service.getProdutos.mockResolvedValue(produtos);
  service.getMedidas.mockResolvedValue([]);

  render(<ProdutoList />);
  await screen.findByRole('table');

  // abre painel e ajusta range para [5, 10]
  fireEvent.click(screen.getByRole('button', { name: /filtrar e ordenar/i }));
  const minSlider = await screen.findByLabelText(/estoque mínimo/i);
  const maxSlider = await screen.findByLabelText(/estoque máximo/i);

  fireEvent.change(minSlider, { target: { value: '5' } });
  fireEvent.change(maxSlider, { target: { value: '10' } });

  // deve mostrar apenas o item com saldo 7 (Lápis)
  await waitFor(() => {
    const rows = screen.getAllByRole('row');
    const text = rows.map(r => r.textContent).join(' ');
    expect(text).toContain('Lápis');
    expect(text).not.toContain('Caneta');
    expect(text).not.toContain('Borracha');
  });
});
