import { createContext, type PropsWithChildren, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { createTheme, type Emphasis, type Scheme, type Theme } from './createTheme';

export const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({
  scheme = 'auto',
  emphasis = 'neutral',
  children,
}: PropsWithChildren<{ scheme?: 'auto' | Scheme; emphasis?: Emphasis }>) {
  const system = useColorScheme();
  const resolved: Scheme = scheme === 'auto' ? (system === 'dark' ? 'dark' : 'light') : scheme;
  const theme = useMemo(() => createTheme({ scheme: resolved, emphasis }), [resolved, emphasis]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
