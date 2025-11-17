import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/src/presentation/contexts/AuthContext';
import { NotificationProvider } from '@/src/presentation/contexts/NotificationContext';
import { SettingsProvider } from '@/src/presentation/contexts/SettingsContext';
import { SuggestionsProvider } from '@/src/presentation/contexts/SuggestionsContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <NotificationProvider>
        <SettingsProvider>
          <SuggestionsProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </SuggestionsProvider>
        </SettingsProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
