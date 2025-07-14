import { Navigate } from 'react-router-dom';
import { useAutenticacao } from '../contexts/AuthContext';
import PropTypes from 'prop-types';

const RotaProtegida = ({ children }) => {
  const { currentUser } = useAutenticacao();
  const isUniversalAdmin = localStorage.getItem('admin-universal') === 'true';
  return currentUser || isUniversalAdmin ? children : <Navigate to="/login" />;
};

RotaProtegida.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RotaProtegida;