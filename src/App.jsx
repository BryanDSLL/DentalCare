import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProvedorAutenticacao } from './contexts/AuthContext';
import { ProvedorTema } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes.jsx';
import Agendamentos from './pages/Agendamentos.jsx';
import Configuracoes from './pages/Configuracoes.jsx';
import LandingContratacao from './pages/LandingContratacao'; // Importando a nova página

function App() {
  return (
    <ProvedorTema>
      <ProvedorAutenticacao>
        <Router basename="/">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cdssecret" element={<Register />} />
            <Route path="/contratar" element={<LandingContratacao />} /> {/* Nova rota adicionada */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="agendamentos" element={<Agendamentos />} />
              <Route path="pacientes" element={<Pacientes />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>
          </Routes>
        </Router>
      </ProvedorAutenticacao>
    </ProvedorTema>
  );
}

export default App;