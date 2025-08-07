
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const storedUser = localStorage.getItem('currentUser');
  const user = storedUser ? JSON.parse(storedUser) : null;
  return user ? children : <Navigate to="/DashBoard" replace />; // Redirect to Login if not authenticated
};

export default ProtectedRoute;
