import { useColorScheme } from 'react-native';

export const lightTheme = {
  colors: {
    $text: '#222',
    $background: '#f8fafc',
    $primary: '#a99d6b',
    $primaryBlue: '#1E3A8A',
    $muted: '#b3b3b3',
    $error: 'red',
    $white: '#fff',
    $black: '#000',
  },
};

export const darkTheme = {
  colors: {
    $text: '#fff',
    $background: '#18181b',
    $primary: '#a99d6b',
    $primaryBlue: '#1E3A8A',
    $muted: '#888',
    $error: 'red',
    $white: '#18181b',
    $black: '#fff',
  },
};

export function useAppTheme() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
