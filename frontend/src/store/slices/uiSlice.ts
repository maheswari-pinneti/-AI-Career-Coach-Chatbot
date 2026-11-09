import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeMode } from '../../types';

interface UiState {
  themeMode: ThemeMode;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ai_career_coach_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

const initialState: UiState = {
  themeMode: getInitialTheme(),
  sidebarOpen: false,
  sidebarCollapsed: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('ai_career_coach_theme', state.themeMode);
      }
    },
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('ai_career_coach_theme', state.themeMode);
      }
    },
    toggleSidebarOpen: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const {
  toggleTheme,
  setThemeMode,
  toggleSidebarOpen,
  setSidebarOpen,
  toggleSidebarCollapsed,
} = uiSlice.actions;

export default uiSlice.reducer;
