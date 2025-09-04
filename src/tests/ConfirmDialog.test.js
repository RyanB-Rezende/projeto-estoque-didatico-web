import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React, { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

// Wrapper de integração que simula uma lista simples com remoção confirmada
function ListaComConfirmacao() {
  const [itens, setItens] = useState([{ id: 1, nome: 'Item A' }]);
  const [alvo, setAlvo] = useState(null);
  const abrir = (item) => setAlvo(item);
  const cancelar = () => setAlvo(null);
  const confirmar = () => {
    setItens(prev => prev.filter(i => i.id !== alvo.id));
    setAlvo(null);
  };
  return (
    <div>
      <ul>{itens.map(i => (
        <li key={i.id}>
          <span>{i.nome}</span>{' '}
          <button type="button" onClick={() => abrir(i)} aria-label={`Remover ${i.nome}`}>Remover</button>
        </li>
      ))}</ul>
      {alvo && (
        <ConfirmDialog
          title="Remover"
            message={<span>Confirmar remoção de <strong>{alvo.nome}</strong>?</span>}
          confirmLabel="Sim"
          cancelLabel="Não"
          onCancel={cancelar}
          onConfirm={confirmar}
        />
      )}
    </div>
  );
}

test('fluxo de confirmação remove item apenas após confirmar', async () => {
  render(<ListaComConfirmacao />);

  // Item presente inicialmente
  expect(screen.getByText('Item A')).toBeInTheDocument();

  // Abre dialog
  fireEvent.click(screen.getByRole('button', { name: /remover item a/i }));
  const dialog = await screen.findByTestId('confirm-dialog');
  expect(dialog).toBeInTheDocument();
  expect(dialog).toHaveTextContent(/confirmar remoção/i);

  // Cancelar não remove
  fireEvent.click(screen.getByRole('button', { name: /cancelar remoção/i }));
  await waitFor(() => expect(screen.queryByTestId('confirm-dialog')).toBeNull());
  expect(screen.getByText('Item A')).toBeInTheDocument();

  // Abrir novamente e confirmar
  fireEvent.click(screen.getByRole('button', { name: /remover item a/i }));
  await screen.findByTestId('confirm-dialog');
  fireEvent.click(screen.getByRole('button', { name: /confirmar remoção/i }));

  await waitFor(() => {
    expect(screen.queryByText('Item A')).toBeNull();
  });
});
