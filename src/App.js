import React, { useState } from 'react';
import './App.css';
import CadastroProduto from './components/CadastroProduto';

function App() {
  const [ultimoCadastro, setUltimoCadastro] = useState(null);
  const handleSubmit = (dados) => {
    setUltimoCadastro(dados);
    // (futuro) aqui chamaremos cadastrarProduto + supabase
    console.log('Produto cadastrado (simulação):', dados);
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <CadastroProduto onSubmit={handleSubmit} />
      {ultimoCadastro && (
        <pre style={{ marginTop: '1rem', background: '#f5f5f5', padding: '0.5rem' }}>
{JSON.stringify(ultimoCadastro, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
