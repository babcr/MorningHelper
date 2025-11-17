import { SubscriptionStatus, Platform } from '../types';

/**
 * Utilisateur de l'application
 */
export interface User {
  id: string;
  email: string;
  displayName?: string;

  // Authentification
  authProvider: 'email' | 'google' | 'apple';
  emailVerified: boolean;

  // Abonnement
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiryDate?: Date;
  trialStartDate?: Date;
  trialEndDate?: Date;

  // Plateforme d'origine
  platform: Platform;

  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;

  // RGPD
  gdprConsent: boolean;
  gdprConsentDate?: Date;
}

/**
 * Informations d'abonnement
 */
export interface Subscription {
  id: string;
  userId: string;

  platform: Platform;
  productId: string;
  purchaseToken: string;

  status: SubscriptionStatus;
  startDate: Date;
  expiryDate: Date;
  autoRenew: boolean;

  priceAmount: number;
  priceCurrency: string;

  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
}
