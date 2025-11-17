import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/src/presentation/contexts/AuthContext';

/**
 * Point d'entrée de l'application
 * Redirige vers auth ou tabs selon l'état d'authentification
 */
export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  // Afficher un loader pendant la vérification de la session
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Rediriger selon l'état d'authentification
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/auth/sign-in" />;
  }
}
