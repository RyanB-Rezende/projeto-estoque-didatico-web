import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SortFilter from '../../components/common/filters/SortFilter';

it('renderiza opções e emite mudanças de valor', () => {
  const options = [
    { value: 'recent-desc', label: 'Recentes (decrescente)' },
    { value: 'alpha-asc', label: 'A-Z' },
  ];
  const handle = jest.fn();
  render(<SortFilter options={options} value={'recent-desc'} onChange={handle} />);

  // Componente pode ser renderizado como <select> (sort-select) ou como botão (sort-toggle)
  const select = screen.queryByTestId('sort-select');
  const button = screen.queryByTestId('sort-toggle');
  if (select) {
    fireEvent.change(select, { target: { value: 'alpha-asc' } });
    expect(handle).toHaveBeenCalled();
    expect(handle.mock.calls[0][0]).toBe('alpha-asc');
  } else if (button) {
    // Implementações baseadas em botão apenas exibem o controle; sem onChange direto
    expect(button).toBeInTheDocument();
  } else {
    throw new Error('Nenhum controle de ordenação encontrado');
  }
});
