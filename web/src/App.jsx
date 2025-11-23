import { BrowserRouter, Link } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

function App() {
  // Vamos simular que o usuário está "deslogado" no início
  const usuarioLogado = false; 

  return (
    <BrowserRouter>
      <div style={{ padding: '20px' }}>
        <h1>Sistema Academia</h1>
        <hr />
        
        {/* Aqui entram as rotas */}
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;