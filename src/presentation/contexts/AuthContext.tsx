import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CognitoAuthService, CognitoUserData } from '@/src/infrastructure/backend/auth/CognitoAuthService';
import { CognitoUser } from 'amazon-cognito-identity-js';

/**
 * Interface du contexte d'authentification
 */
export interface AuthContextType {
  user: CognitoUserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, additionalAttributes?: Record<string, string>) => Promise<CognitoUser>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserAttribute: (attributeName: string, value: string) => Promise<void>;
  updateUserAttributes: (attributes: Record<string, string>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmPassword: (email: string, verificationCode: string, newPassword: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

/**
 * Context d'authentification
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook pour utiliser le contexte d'authentification
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Provider d'authentification
 * Gère l'état global de l'authentification utilisateur
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CognitoUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authService] = useState(() => new CognitoAuthService());

  /**
   * Vérifier la session au chargement
   */
  useEffect(() => {
    checkCurrentSession();
  }, []);

  /**
   * Vérifie si une session valide existe
   */
  const checkCurrentSession = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inscription d'un nouvel utilisateur
   */
  const signUp = async (
    email: string,
    password: string,
    additionalAttributes?: Record<string, string>
  ): Promise<CognitoUser> => {
    try {
      const cognitoUser = await authService.signUp(email, password, additionalAttributes);
      return cognitoUser;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  /**
   * Confirmation du code de vérification
   */
  const confirmSignUp = async (email: string, code: string): Promise<void> => {
    try {
      await authService.confirmSignUp(email, code);
    } catch (error) {
      console.error('Confirm sign up error:', error);
      throw error;
    }
  };

  /**
   * Renvoi du code de confirmation
   */
  const resendConfirmationCode = async (email: string): Promise<void> => {
    try {
      await authService.resendConfirmationCode(email);
    } catch (error) {
      console.error('Resend confirmation code error:', error);
      throw error;
    }
  };

  /**
   * Connexion
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const userData = await authService.signIn(email, password);
      setUser(userData);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  /**
   * Déconnexion
   */
  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  /**
   * Mettre à jour un attribut utilisateur
   */
  const updateUserAttribute = async (attributeName: string, value: string): Promise<void> => {
    try {
      await authService.updateUserAttribute(attributeName, value);
      await refreshUser();
    } catch (error) {
      console.error('Update user attribute error:', error);
      throw error;
    }
  };

  /**
   * Mettre à jour plusieurs attributs utilisateur
   */
  const updateUserAttributes = async (attributes: Record<string, string>): Promise<void> => {
    try {
      await authService.updateUserAttributes(attributes);
      await refreshUser();
    } catch (error) {
      console.error('Update user attributes error:', error);
      throw error;
    }
  };

  /**
   * Demander un changement de mot de passe
   */
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await authService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  /**
   * Confirmer le nouveau mot de passe
   */
  const confirmPassword = async (
    email: string,
    verificationCode: string,
    newPassword: string
  ): Promise<void> => {
    try {
      await authService.confirmPassword(email, verificationCode, newPassword);
    } catch (error) {
      console.error('Confirm password error:', error);
      throw error;
    }
  };

  /**
   * Changer le mot de passe
   */
  const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    try {
      await authService.changePassword(oldPassword, newPassword);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  /**
   * Supprimer le compte utilisateur
   */
  const deleteAccount = async (): Promise<void> => {
    try {
      await authService.deleteUser();
      setUser(null);
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  /**
   * Rafraîchir les données utilisateur
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Refresh user error:', error);
      throw error;
    }
  };

  /**
   * Récupérer le token JWT
   */
  const getIdToken = async (): Promise<string | null> => {
    try {
      return await authService.getIdToken();
    } catch (error) {
      console.error('Get ID token error:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: user !== null,
    signUp,
    confirmSignUp,
    resendConfirmationCode,
    signIn,
    signOut,
    updateUserAttribute,
    updateUserAttributes,
    forgotPassword,
    confirmPassword,
    changePassword,
    deleteAccount,
    refreshUser,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
