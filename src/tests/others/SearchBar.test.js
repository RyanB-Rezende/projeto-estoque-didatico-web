import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SearchBar from '../../components/common/SearchBar';

// Wrapper para simular filtragem de produtos a partir do termo pesquisado
function ProductSearchWrapper({ products }) {
  const [query, setQuery] = useState('');
  const filtered = products.filter(p => p.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <SearchBar debounceMs={10} onSearch={setQuery} placeholder="Procurar produtos..." onAdd={() => {}} />
      <ul data-testid="results">
        {filtered.length ? (
          filtered.map(p => <li key={p}>{p}</li>)
        ) : (
          <li>Nenhum resultado</li>
        )}
      </ul>
    </div>
  );
}

describe('SearchBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renderiza input e botão adicionar', () => {
    render(<SearchBar onSearch={() => {}} onAdd={() => {}} />);
    expect(screen.getByPlaceholderText(/Procurar produtos/i)).toBeInTheDocument();
    expect(screen.getByTestId('add-button')).toBeInTheDocument();
  });

  test('realiza busca e retorna produto correspondente', () => {
    const products = ['Agulha 0,70 x 25mm 22G', 'Seringa 5ml'];
    render(<ProductSearchWrapper products={products} />);

    const input = screen.getByPlaceholderText(/Procurar produtos/i);
    fireEvent.change(input, { target: { value: 'agulha' } });

    act(() => {
      jest.advanceTimersByTime(15); // > debounceMs (10)
    });

    expect(screen.getByText(/Agulha 0,70 x 25mm 22G/i)).toBeInTheDocument();
    expect(screen.queryByText(/Nenhum resultado/i)).not.toBeInTheDocument();
  });

  test('mostra mensagem de nenhum resultado quando não encontra', () => {
    const products = ['Agulha 0,70 x 25mm 22G', 'Seringa 5ml'];
    render(<ProductSearchWrapper products={products} />);

    const input = screen.getByPlaceholderText(/Procurar produtos/i);
    fireEvent.change(input, { target: { value: 'xyz' } });

    act(() => {
      jest.advanceTimersByTime(15);
    });

    expect(screen.getByText(/Nenhum resultado/i)).toBeInTheDocument();
    expect(screen.queryByText(/Agulha 0,70/i)).not.toBeInTheDocument();
  });
});
