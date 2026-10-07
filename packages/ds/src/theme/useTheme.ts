import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

export function useTheme() {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme: bọc app trong <ThemeProvider>');
  return t;
}
