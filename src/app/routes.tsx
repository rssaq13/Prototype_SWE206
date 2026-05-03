import { createBrowserRouter, Navigate } from 'react-router';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import StockOperations from './pages/StockOperations';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import ActivityLogs from './pages/ActivityLogs';
import Settings from './pages/Settings';
import Layout from './components/Layout';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

// Role-based Route Component
function RoleRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user } = useAuth();
  return user && allowedRoles.includes(user.role) ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/inventory',
    element: (
      <ProtectedRoute>
        <Layout>
          <Inventory />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/stock-operations',
    element: (
      <ProtectedRoute>
        <Layout>
          <StockOperations />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['Admin', 'Manager']}>
          <Layout>
            <Reports />
          </Layout>
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['Admin']}>
          <Layout>
            <UserManagement />
          </Layout>
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/activity-logs',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['Admin']}>
          <Layout>
            <ActivityLogs />
          </Layout>
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Layout>
          <Settings />
        </Layout>
      </ProtectedRoute>
    ),
  },
]);
