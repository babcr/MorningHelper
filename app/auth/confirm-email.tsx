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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/src/presentation/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const { confirmSignUp, resendConfirmationCode } = useAuth();

  const [email, setEmail] = useState((params.email as string) || '');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleConfirm = async () => {
    if (!email || !code) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      await confirmSignUp(email, code);

      Alert.alert(
        'Email confirmé!',
        'Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.',
        [
          {
            text: 'Se connecter',
            onPress: () => router.replace('/auth/sign-in'),
          },
        ]
      );
    } catch (error: any) {
      let errorMessage = 'Erreur lors de la confirmation';

      if (error.code === 'CodeMismatchException') {
        errorMessage = 'Code de vérification incorrect';
      } else if (error.code === 'ExpiredCodeException') {
        errorMessage = 'Le code a expiré. Veuillez demander un nouveau code';
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

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    try {
      setIsResending(true);
      await resendConfirmationCode(email);
      Alert.alert('Code renvoyé', 'Un nouveau code de vérification a été envoyé à votre email');
    } catch (error: any) {
      let errorMessage = 'Erreur lors du renvoi du code';

      if (error.code === 'UserNotFoundException') {
        errorMessage = 'Utilisateur non trouvé';
      } else if (error.code === 'LimitExceededException') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsResending(false);
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].tint} />
            </TouchableOpacity>
            <IconSymbol
              name="envelope.fill"
              size={64}
              color={Colors[colorScheme ?? 'light'].tint}
            />
            <ThemedText type="title" style={styles.title}>
              Vérifiez votre email
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Nous avons envoyé un code de vérification à votre adresse email
            </ThemedText>
          </View>

          {/* Form */}
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
                editable={!isLoading && !isResending}
              />
            </View>

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
                editable={!isLoading && !isResending}
              />
              <ThemedText style={styles.hint}>
                Entrez le code à 6 chiffres reçu par email
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, isLoading && styles.buttonDisabled]}
              onPress={handleConfirm}
              disabled={isLoading || isResending}
            >
              <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                {isLoading ? 'Vérification...' : 'Confirmer'}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.resendSection}>
              <ThemedText style={styles.resendText}>
                Vous n'avez pas reçu le code ?
              </ThemedText>
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={isLoading || isResending}
              >
                <ThemedText style={[styles.link, (isLoading || isResending) && styles.linkDisabled]}>
                  {isResending ? 'Envoi...' : 'Renvoyer le code'}
                </ThemedText>
              </TouchableOpacity>
            </View>
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
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  resendText: {
    fontSize: 14,
    opacity: 0.7,
  },
  link: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  linkDisabled: {
    opacity: 0.5,
  },
});
