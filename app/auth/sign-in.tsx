import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/src/presentation/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SignInScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { signIn, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      let errorMessage = 'Erreur de connexion';

      if (error.code === 'UserNotConfirmedException') {
        errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
        Alert.alert('Email non confirmé', errorMessage, [
          { text: 'OK', onPress: () => router.push('/auth/confirm-email') },
        ]);
        return;
      } else if (error.code === 'NotAuthorizedException') {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.code === 'UserNotFoundException') {
        errorMessage = 'Utilisateur non trouvé';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <IconSymbol
              name="sunrise.fill"
              size={64}
              color={Colors[colorScheme ?? 'light'].tint}
            />
            <ThemedText type="title" style={styles.title}>
              MorningHelper
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Votre assistant intelligent du matin
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ThemedText type="subtitle" style={styles.formTitle}>
              Connexion
            </ThemedText>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' },
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="votre@email.com"
                placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Mot de passe</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push('/auth/forgot-password')}
              disabled={isLoading}
            >
              <ThemedText style={styles.forgotPasswordText}>
                Mot de passe oublié ?
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, isLoading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <ThemedText style={styles.dividerText}>OU</ThemedText>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/auth/sign-up')}
              disabled={isLoading}
            >
              <ThemedText style={styles.buttonText}>Créer un compte</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
  },
  button: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    opacity: 0.6,
  },
});
