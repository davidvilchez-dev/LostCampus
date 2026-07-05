import { Navigate, Outlet } from 'react-router';
import useAuthStore from '../store/authStore';

export default function AdminRoute() {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.es_admin) {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}
