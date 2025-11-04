import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilterPanel from '../../components/common/filters/FilterPanel';

test('toggle de direção ao clicar no mesmo critério', () => {
  const handleSort = jest.fn();
  render(
    <FilterPanel
      open={true}
      sort={{ key: 'alpha', dir: 'asc' }}
      onChangeSort={handleSort}
      medidaOptions={[]}
      selectedMedidas={[]}
      onToggleMedida={() => {}}
      onClose={() => {}}
    />
  );

  const alphaBtn = screen.getByRole('button', { name: /ordem alfabética/i });
  // Primeiro clique no mesmo critério deve inverter para desc
  fireEvent.click(alphaBtn);
  expect(handleSort).toHaveBeenCalledWith({ key: 'alpha', dir: 'desc' });
});
