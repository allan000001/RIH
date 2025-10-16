import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import themes, { type Theme } from '@/constants/theme';
import { useApp } from './app-context';

interface ThemeContextType {
  theme: Theme;
  colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useApp();
  const deviceColorScheme = useColorScheme() ?? 'light';

  const theme = useMemo(() => {
    const role = state.userRole || 'host'; // Default to host if no role is set
    const colorScheme = deviceColorScheme as 'light' | 'dark';
    
    if (role === 'host' || role === 'connector') {
      return themes[role][colorScheme];
    }
    // Fallback to host theme if role is invalid
    return themes.host[colorScheme];
  }, [state.userRole, deviceColorScheme]);

  const value = useMemo(() => ({
    theme,
    colorScheme: deviceColorScheme as 'light' | 'dark',
  }), [theme, deviceColorScheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
