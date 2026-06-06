import { createContext, useContext, useState, useEffect } from 'react';

export const dark = {
  bg: '#0A0C10', surface: '#11141C', card: '#181D28', border: '#252D3D',
  accent: '#F5A623', accentGlow: 'rgba(245,166,35,.15)', green: '#22D3A0',
  red: '#F56565', text: '#EEF0F4', sub: '#8B93A8', muted: '#4A526A',
  navBg: '#0E1118', shadow: '0 4px 24px rgba(0,0,0,.5)',
  isDark: true,
};

export const light = {
  bg: '#F4F6FB', surface: '#FFFFFF', card: '#FFFFFF', border: '#E2E8F0',
  accent: '#F5A623', accentGlow: 'rgba(245,166,35,.12)', green: '#16A37F',
  red: '#E53E3E', text: '#1A202C', sub: '#4A5568', muted: '#A0AEC0',
  navBg: '#FFFFFF', shadow: '0 2px 16px rgba(0,0,0,.08)',
  isDark: false,
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('kp_theme') !== 'light');
  const T = isDark ? dark : light;

  useEffect(() => { localStorage.setItem('kp_theme', isDark ? 'dark' : 'light'); }, [isDark]);

  const toggle = () => setIsDark(d => !d);

  return (
    <ThemeContext.Provider value={{ T, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);