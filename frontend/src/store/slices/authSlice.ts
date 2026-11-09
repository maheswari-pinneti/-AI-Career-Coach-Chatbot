import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const getStoredItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('ai_coach_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialAccessToken = getStoredItem('ai_coach_access_token');
const initialRefreshToken = getStoredItem('ai_coach_refresh_token');
const initialUser = getStoredUser();

const initialState: AuthState = {
  user: initialUser,
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
  isAuthenticated: Boolean(initialAccessToken),
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.error = null;

      try {
        localStorage.setItem('ai_coach_access_token', accessToken);
        localStorage.setItem('ai_coach_refresh_token', refreshToken);
        localStorage.setItem('ai_coach_user', JSON.stringify(user));
      } catch {
        // Fallback for private mode storage limits
      }
    },
    updateTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;

      try {
        localStorage.setItem('ai_coach_access_token', accessToken);
        localStorage.setItem('ai_coach_refresh_token', refreshToken);
      } catch {
        // Fallback
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        try {
          localStorage.setItem('ai_coach_user', JSON.stringify(state.user));
        } catch {
          // Fallback
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;

      try {
        localStorage.removeItem('ai_coach_access_token');
        localStorage.removeItem('ai_coach_refresh_token');
        localStorage.removeItem('ai_coach_user');
      } catch {
        // Fallback
      }
    },
  },
});

export const { setCredentials, updateTokens, updateUser, setLoading, setError, logout } =
  authSlice.actions;

export default authSlice.reducer;
