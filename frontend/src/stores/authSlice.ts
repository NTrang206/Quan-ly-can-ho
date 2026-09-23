import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser, UserRole } from '../types';
import { INITIAL_USERS } from './mockDatabase';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  activeRole: UserRole;
}

const getInitialUser = (): IUser => {
  const saved = localStorage.getItem('currentUser');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  // Default to Admin or Tenant
  return INITIAL_USERS[0];
};

const initialUser = getInitialUser();

const initialState: AuthState = {
  user: initialUser,
  token: localStorage.getItem('token') || 'demo-jwt-token-sunshine-homes',
  isAuthenticated: true,
  activeRole: initialUser.roleCode,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: IUser; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.activeRole = action.payload.user.roleCode;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('currentUser', JSON.stringify(action.payload.user));
    },
    switchRole: (state, action: PayloadAction<UserRole>) => {
      const targetRole = action.payload;
      const foundUser = INITIAL_USERS.find(u => u.roleCode === targetRole) || {
        id: 99,
        roleId: 99,
        roleCode: targetRole,
        username: targetRole.toLowerCase(),
        fullName: targetRole === 'GUEST' ? 'Khách Tìm Thuê' : `${targetRole} User`,
        email: `${targetRole.toLowerCase()}@sunshine.vn`,
        phone: '0900.000.000',
        isActive: true,
        createdAt: '2024-01-01',
      };
      state.user = foundUser;
      state.activeRole = targetRole;
      state.isAuthenticated = targetRole !== 'GUEST';
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.activeRole = 'GUEST';
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    },
  },
});

export const { setCredentials, switchRole, logout } = authSlice.actions;
export default authSlice.reducer;
