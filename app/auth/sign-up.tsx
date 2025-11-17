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
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/src/presentation/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SignUpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [dataCollectionConsent, setDataCollectionConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // AWS Cognito exige: min 8 caractères, majuscule, minuscule, chiffre, caractère spécial
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  const handleSignUp = async () => {
    // Validation
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erreur', 'Adresse email invalide');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        'Mot de passe invalide',
        'Le mot de passe doit contenir au moins:\n• 8 caractères\n• Une majuscule\n• Une minuscule\n• Un chiffre\n• Un caractère spécial'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (!gdprConsent) {
      Alert.alert(
        'Consentement requis',
        'Vous devez accepter les conditions générales et la politique de confidentialité'
      );
      return;
    }

    try {
      setIsLoading(true);

      const additionalAttributes = {
        'custom:gdpr_consent': 'true',
        'custom:gdpr_consent_date': Date.now().toString(),
        'custom:data_collection_consent': dataCollectionConsent.toString(),
        'custom:location_sharing_consent': dataCollectionConsent.toString(),
        'custom:ai_processing_consent': dataCollectionConsent.toString(),
      };

      await signUp(email, password, additionalAttributes);

      Alert.alert(
        'Inscription réussie!',
        'Un email de confirmation a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception.',
        [
          {
            text: 'OK',
            onPress: () => router.push({ pathname: '/auth/confirm-email', params: { email } }),
          },
        ]
      );
    } catch (error: any) {
      let errorMessage = "Erreur lors de l'inscription";

      if (error.code === 'UsernameExistsException') {
        errorMessage = 'Un compte existe déjà avec cet email';
      } else if (error.code === 'InvalidPasswordException') {
        errorMessage = 'Le mot de passe ne respecte pas les critères de sécurité';
      } else if (error.code === 'InvalidParameterException') {
        errorMessage = 'Paramètres invalides. Vérifiez votre email et mot de passe';
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].tint} />
            </TouchableOpacity>
            <IconSymbol
              name="sunrise.fill"
              size={48}
              color={Colors[colorScheme ?? 'light'].tint}
            />
            <ThemedText type="title" style={styles.title}>
              Créer un compte
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Commencez votre essai gratuit de 30 jours
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
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Consentements RGPD */}
            <View style={styles.consentSection}>
              <View style={styles.consentItem}>
                <Switch
                  value={gdprConsent}
                  onValueChange={setGdprConsent}
                  trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
                  disabled={isLoading}
                />
                <ThemedText style={styles.consentText}>
                  J'accepte les{' '}
                  <ThemedText style={styles.link}>conditions générales</ThemedText> et la{' '}
                  <ThemedText style={styles.link}>politique de confidentialité</ThemedText> *
                </ThemedText>
              </View>

              <View style={styles.consentItem}>
                <Switch
                  value={dataCollectionConsent}
                  onValueChange={setDataCollectionConsent}
                  trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
                  disabled={isLoading}
                />
                <ThemedText style={styles.consentText}>
                  J'accepte la collecte de mes données pour améliorer l'expérience (optionnel)
                </ThemedText>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                {isLoading ? 'Création...' : "S'inscrire"}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signInLink}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <ThemedText style={styles.signInLinkText}>
                Vous avez déjà un compte ?{' '}
                <ThemedText style={styles.link}>Se connecter</ThemedText>
              </ThemedText>
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
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  title: {
    fontSize: 28,
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
  hint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
    fontStyle: 'italic',
  },
  consentSection: {
    marginVertical: 20,
    gap: 16,
  },
  consentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
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
  signInLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  signInLinkText: {
    fontSize: 14,
  },
});
