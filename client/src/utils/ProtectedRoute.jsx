import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = () => {
    const { isAuthenticated, isConnected } = useSelector((state) => state.user);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const publicWhileDisconnected = ["/profile"];

    const isDisconnectedProtectedPage =
        !isConnected && !publicWhileDisconnected.includes(location.pathname);

    if (isDisconnectedProtectedPage) {
        return <Navigate to="/profile" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
