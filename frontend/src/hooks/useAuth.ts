import { useAppSelector, useAppDispatch } from './useRedux';
import { switchRole, logout } from '../stores/authSlice';
import { UserRole } from '../types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, activeRole, token } = useAppSelector((state) => state.auth);

  const isAdmin = activeRole === 'ADMIN';
  const isStaff = activeRole === 'STAFF';
  const isAccountant = activeRole === 'ACCOUNTANT';
  const isTenant = activeRole === 'TENANT';
  const isGuest = activeRole === 'GUEST';

  const isManagement = isAdmin || isStaff || isAccountant;

  const handleRoleSwitch = (role: UserRole) => {
    dispatch(switchRole(role));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    isAuthenticated,
    isInitialized: true,
    activeRole,
    isAdmin,
    isStaff,
    isAccountant,
    isTenant,
    isGuest,
    isManagement,
    switchRole: handleRoleSwitch,
    logout: handleLogout,
  };
};
