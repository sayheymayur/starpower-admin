import { Link, useNavigate } from 'react-router';
import Button from '../components/ui/button/Button';
import { useAuth } from '../context/AuthContext';
import { canAccessAstro, canEnterFullDashboardShell, getAccessibleHomeRoute } from '../utils/authRoles';

export default function Unauthorized() {
  const { scopes, user, logout } = useAuth();
  const navigate = useNavigate();
  const homeRoute = getAccessibleHomeRoute(scopes, user);
  const hasAnyAccess =
    canEnterFullDashboardShell(scopes) ||
    canAccessAstro(scopes) ||
    homeRoute !== '/settings/password';

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Access denied
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
        Your account does not have permission to view this page. Contact an
        administrator if you need access, or sign in with a different account.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasAnyAccess && (
          <Link to={homeRoute}>
            <Button variant="outline">Go to dashboard</Button>
          </Link>
        )}
        <Link to="/settings/password">
          <Button variant="outline">Account settings</Button>
        </Link>
        <Button onClick={signOut}>Sign in again</Button>
      </div>
    </div>
  );
}
