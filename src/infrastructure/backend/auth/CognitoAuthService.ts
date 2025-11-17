import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { ENV } from '@/shared/config/env';
import { Platform } from 'react-native';

/**
 * Configuration Cognito
 */
const poolData = {
  UserPoolId: ENV.AWS_COGNITO_USER_POOL_ID,
  ClientId: ENV.AWS_COGNITO_CLIENT_ID,
};

/**
 * Interface utilisateur Cognito
 */
export interface CognitoUserData {
  username: string;
  email: string;
  attributes: Record<string, string>;
  session?: CognitoUserSession;
}

/**
 * Service d'authentification AWS Cognito
 * Gère sign-up, sign-in, sign-out, récupération de session, etc.
 */
export class CognitoAuthService {
  private userPool: CognitoUserPool;
  private currentUser: CognitoUser | null = null;

  constructor() {
    this.userPool = new CognitoUserPool(poolData);
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async signUp(
    email: string,
    password: string,
    additionalAttributes?: Record<string, string>
  ): Promise<CognitoUser> {
    return new Promise((resolve, reject) => {
      const attributeList: CognitoUserAttribute[] = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email,
        }),
      ];

      // Ajouter les attributs personnalisés
      const platform = Platform.OS as 'ios' | 'android' | 'web';
      const defaultAttributes = {
        'custom:platform': platform,
        'custom:created_at': Date.now().toString(),
        'custom:subscription_status': 'trial',
        'custom:trial_start': Date.now().toString(),
        'custom:trial_end': (Date.now() + 30 * 24 * 60 * 60 * 1000).toString(), // +30 jours
        'custom:onboarding_completed': 'false',
        'custom:gdpr_consent': 'false',
        'custom:data_collection_consent': 'false',
        'custom:location_sharing_consent': 'false',
        'custom:ai_processing_consent': 'false',
        'custom:marketing_consent': 'false',
      };

      const allAttributes = { ...defaultAttributes, ...additionalAttributes };

      Object.entries(allAttributes).forEach(([name, value]) => {
        attributeList.push(
          new CognitoUserAttribute({
            Name: name,
            Value: value,
          })
        );
      });

      this.userPool.signUp(
        email,
        password,
        attributeList,
        [],
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          if (result) {
            resolve(result.user);
          } else {
            reject(new Error('Sign up failed: no result'));
          }
        }
      );
    });
  }

  /**
   * Confirmation du code de vérification email
   */
  async confirmSignUp(email: string, code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const userData = {
        Username: email,
        Pool: this.userPool,
      };

      const cognitoUser = new CognitoUser(userData);

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  /**
   * Renvoi du code de confirmation
   */
  async resendConfirmationCode(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const userData = {
        Username: email,
        Pool: this.userPool,
      };

      const cognitoUser = new CognitoUser(userData);

      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  /**
   * Connexion
   */
  async signIn(email: string, password: string): Promise<CognitoUserData> {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const userData = {
        Username: email,
        Pool: this.userPool,
      };

      const cognitoUser = new CognitoUser(userData);

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async (session) => {
          this.currentUser = cognitoUser;

          // Récupérer les attributs utilisateur
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              reject(err);
              return;
            }

            const userAttributes: Record<string, string> = {};
            attributes?.forEach((attr) => {
              userAttributes[attr.Name] = attr.Value;
            });

            // Mettre à jour last_login
            this.updateUserAttribute('custom:last_login', Date.now().toString()).catch(
              (err) => console.warn('Failed to update last_login:', err)
            );

            resolve({
              username: email,
              email: userAttributes.email || email,
              attributes: userAttributes,
              session,
            });
          });
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Gérer le changement de mot de passe obligatoire
          reject(new Error('New password required'));
        },
      });
    });
  }

  /**
   * Déconnexion
   */
  async signOut(): Promise<void> {
    return new Promise((resolve) => {
      const cognitoUser = this.userPool.getCurrentUser();

      if (cognitoUser) {
        cognitoUser.signOut();
      }

      this.currentUser = null;
      resolve();
    });
  }

  /**
   * Récupérer la session actuelle
   */
  async getCurrentSession(): Promise<CognitoUserSession | null> {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.userPool.getCurrentUser();

      if (!cognitoUser) {
        resolve(null);
        return;
      }

      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          reject(err);
          return;
        }

        if (session && session.isValid()) {
          this.currentUser = cognitoUser;
          resolve(session);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Récupérer les données de l'utilisateur actuel
   */
  async getCurrentUser(): Promise<CognitoUserData | null> {
    try {
      const session = await this.getCurrentSession();

      if (!session || !this.currentUser) {
        return null;
      }

      return new Promise((resolve, reject) => {
        this.currentUser!.getUserAttributes((err, attributes) => {
          if (err) {
            reject(err);
            return;
          }

          const userAttributes: Record<string, string> = {};
          attributes?.forEach((attr) => {
            userAttributes[attr.Name] = attr.Value;
          });

          resolve({
            username: this.currentUser!.getUsername(),
            email: userAttributes.email || '',
            attributes: userAttributes,
            session,
          });
        });
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un attribut utilisateur
   */
  async updateUserAttribute(attributeName: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.userPool.getCurrentUser();

      if (!cognitoUser) {
        reject(new Error('No user logged in'));
        return;
      }

      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          reject(err || new Error('No session'));
          return;
        }

        const attribute = new CognitoUserAttribute({
          Name: attributeName,
          Value: value,
        });

        cognitoUser.updateAttributes([attribute], (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        });
      });
    });
  }

  /**
   * Mettre à jour plusieurs attributs
   */
  async updateUserAttributes(attributes: Record<string, string>): Promise<void> {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.userPool.getCurrentUser();

      if (!cognitoUser) {
        reject(new Error('No user logged in'));
        return;
      }

      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          reject(err || new Error('No session'));
          return;
        }

        const attributeList = Object.entries(attributes).map(
          ([name, value]) =>
            new CognitoUserAttribute({
              Name: name,
              Value: value,
            })
        );

        cognitoUser.updateAttributes(attributeList, (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        });
      });
    });
  }

  /**
   * Demander un changement de mot de passe (mot de passe oublié)
   */
  async forgotPassword(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const userData = {
        Username: email,
        Pool: this.userPool,
      };

      const cognitoUser = new CognitoUser(userData);

      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  /**
   * Confirmer le nouveau mot de passe avec le code reçu
   */
  async confirmPassword(
    email: string,
    verificationCode: string,
    newPassword: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const userData = {
        Username: email,
        Pool: this.userPool,
      };

      const cognitoUser = new CognitoUser(userData);

      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  /**
   * Changer le mot de passe (utilisateur connecté)
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.userPool.getCurrentUser();

      if (!cognitoUser) {
        reject(new Error('No user logged in'));
        return;
      }

      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          reject(err || new Error('No session'));
          return;
        }

        cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        });
      });
    });
  }

  /**
   * Supprimer le compte utilisateur
   */
  async deleteUser(): Promise<void> {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.userPool.getCurrentUser();

      if (!cognitoUser) {
        reject(new Error('No user logged in'));
        return;
      }

      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          reject(err || new Error('No session'));
          return;
        }

        cognitoUser.deleteUser((err, result) => {
          if (err) {
            reject(err);
            return;
          }

          this.currentUser = null;
          resolve();
        });
      });
    });
  }

  /**
   * Vérifier si un utilisateur est connecté
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      return session !== null && session.isValid();
    } catch {
      return false;
    }
  }

  /**
   * Récupérer le token JWT
   */
  async getIdToken(): Promise<string | null> {
    try {
      const session = await this.getCurrentSession();
      return session?.getIdToken().getJwtToken() || null;
    } catch {
      return null;
    }
  }

  /**
   * Récupérer le refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const session = await this.getCurrentSession();
      return session?.getRefreshToken().getToken() || null;
    } catch {
      return null;
    }
  }
}

// Export une instance singleton
export const cognitoAuthService = new CognitoAuthService();
