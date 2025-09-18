import React from 'react';
import { MemoryRouter } from 'react-router-dom';

export function withMemoryRouter(ui, { route = '/', future = { v7_startTransition: true, v7_relativeSplatPath: true } } = {}) {
  return (
    <MemoryRouter initialEntries={[route]} future={future}>
      {ui}
    </MemoryRouter>
  );
}
