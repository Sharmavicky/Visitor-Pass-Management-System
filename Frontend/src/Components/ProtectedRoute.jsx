import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, isLoggedIn } = useAuth();

    // Not logged in at all
    if (!isLoggedIn) return <Navigate to="/login" replace />;

    // Logged in but wrong role for this route
    if (roles && !roles.includes(user.role)) {
        // Redirect to their own correct dashboard instead of an error page
        const routes = {
            admin: '/admin/dashboard',
            security: '/security/dashboard',
            employee: '/employee/dashboard',
            visitor: '/visitor/dashboard',
        };
        return <Navigate to={routes[user.role] || '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;