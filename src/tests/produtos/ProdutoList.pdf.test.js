import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProdutoList from '../../components/produtos/ProdutoList';
import * as service from '../../services/produtos/produtosService';

jest.mock('../../services/produtos/produtosService');

// Helper to stub jsPDF in window so the component doesn't try to load scripts
const stubJsPDF = (opts = {}) => {
  const autoTableMock = jest.fn();
  const saveMock = jest.fn();
  const doc = {
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    autoTable: autoTableMock,
    internal: { pageSize: { getWidth: () => 595 } },
    save: saveMock,
  };
  const jsPDF = function () { return doc; };
  jsPDF.API = { autoTable: () => {} }; // so the plugin check passes
  Object.defineProperty(window, 'jspdf', { value: { jsPDF }, writable: true });
  return { autoTableMock, saveMock };
};

afterEach(() => {
  jest.clearAllMocks();
  delete window.jspdf; // reset between tests
});

const renderList = async () => {
  service.getProdutos.mockResolvedValue([
    { id_produtos: '1', nome: 'Caneta', codigo: 'A', medida: 1, local: 'Sala', entrada: 10, saida: 2, saldo: 8 },
    { id_produtos: '2', nome: 'Lápis', codigo: 'B', medida: 1, local: 'Sala', entrada: 5,  saida: 0, saldo: 5 },
  ]);
  service.getMedidas.mockResolvedValue([{ id_medida: 1, medida: 'Unidade' }]);

  render(<ProdutoList />);
  await screen.findByText(/lista de produtos/i);
};

it('gera e baixa PDF ao clicar no botão PDF', async () => {
  const { autoTableMock, saveMock } = stubJsPDF();
  await renderList();

  const btn = screen.getByRole('button', { name: /exportar pdf|pdf/i });
  fireEvent.click(btn);

  await waitFor(() => {
    expect(autoTableMock).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalledWith('relatorio_produtos.pdf');
  });
});
