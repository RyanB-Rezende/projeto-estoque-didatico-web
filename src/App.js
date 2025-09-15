import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navigation from './components/Navigation';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <AppRoutes "/cadastro"/>
      </div>
    </Router>
  );
}

export default App;