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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { forgotPassword, confirmPassword } = useAuth();

  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    try {
      setIsLoading(true);
      await forgotPassword(email);
      setStep('confirm');
      Alert.alert(
        'Code envoyé',
        'Un code de vérification a été envoyé à votre adresse email'
      );
    } catch (error: any) {
      let errorMessage = "Erreur lors de l'envoi du code";

      if (error.code === 'UserNotFoundException') {
        errorMessage = 'Aucun compte trouvé avec cet email';
      } else if (error.code === 'LimitExceededException') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!code || !newPassword || !confirmPasswordValue) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        'Mot de passe invalide',
        'Le mot de passe doit contenir au moins:\n• 8 caractères\n• Une majuscule\n• Une minuscule\n• Un chiffre\n• Un caractère spécial'
      );
      return;
    }

    if (newPassword !== confirmPasswordValue) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setIsLoading(true);
      await confirmPassword(email, code, newPassword);

      Alert.alert(
        'Mot de passe réinitialisé!',
        'Votre mot de passe a été changé avec succès. Vous pouvez maintenant vous connecter.',
        [
          {
            text: 'Se connecter',
            onPress: () => router.replace('/auth/sign-in'),
          },
        ]
      );
    } catch (error: any) {
      let errorMessage = 'Erreur lors de la réinitialisation';

      if (error.code === 'CodeMismatchException') {
        errorMessage = 'Code de vérification incorrect';
      } else if (error.code === 'ExpiredCodeException') {
        errorMessage = 'Le code a expiré. Veuillez demander un nouveau code';
      } else if (error.code === 'InvalidPasswordException') {
        errorMessage = 'Le mot de passe ne respecte pas les critères de sécurité';
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
            <TouchableOpacity
              onPress={() => step === 'request' ? router.back() : setStep('request')}
              style={styles.backButton}
            >
              <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].tint} />
            </TouchableOpacity>
            <IconSymbol
              name="lock.fill"
              size={64}
              color={Colors[colorScheme ?? 'light'].tint}
            />
            <ThemedText type="title" style={styles.title}>
              {step === 'request' ? 'Mot de passe oublié' : 'Nouveau mot de passe'}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {step === 'request'
                ? 'Entrez votre email pour recevoir un code de réinitialisation'
                : 'Entrez le code reçu et votre nouveau mot de passe'}
            </ThemedText>
          </View>

          {/* Form - Request Step */}
          {step === 'request' && (
            <View style={styles.form}>
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

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, isLoading && styles.buttonDisabled]}
                onPress={handleRequestReset}
                disabled={isLoading}
              >
                <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                  {isLoading ? 'Envoi...' : 'Envoyer le code'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToSignIn}
                onPress={() => router.back()}
                disabled={isLoading}
              >
                <ThemedText style={styles.link}>
                  Retour à la connexion
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Form - Confirm Step */}
          {step === 'confirm' && (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Code de vérification</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' },
                  ]}
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Nouveau mot de passe</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' },
                  ]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <ThemedText style={styles.hint}>
                  Min. 8 caractères avec majuscule, minuscule, chiffre et caractère spécial
                </ThemedText>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Confirmer le mot de passe</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' },
                  ]}
                  value={confirmPasswordValue}
                  onChangeText={setConfirmPasswordValue}
                  placeholder="••••••••"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, isLoading && styles.buttonDisabled]}
                onPress={handleConfirmReset}
                disabled={isLoading}
              >
                <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                  {isLoading ? 'Confirmation...' : 'Réinitialiser le mot de passe'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendLink}
                onPress={handleRequestReset}
                disabled={isLoading}
              >
                <ThemedText style={styles.link}>
                  Renvoyer le code
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
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
    paddingTop: 60,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: -40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
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
  hint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
    fontStyle: 'italic',
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
  backToSignIn: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  link: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
