/**
 * Interface générique pour les repositories (accès aux données)
 */
export interface IRepository<T> {
  /**
   * Récupère une entité par son ID
   */
  getById(id: string): Promise<T | null>;

  /**
   * Récupère toutes les entités
   */
  getAll(): Promise<T[]>;

  /**
   * Crée une nouvelle entité
   */
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * Met à jour une entité existante
   */
  update(id: string, data: Partial<T>): Promise<T>;

  /**
   * Supprime une entité
   */
  delete(id: string): Promise<boolean>;

  /**
   * Vérifie si une entité existe
   */
  exists(id: string): Promise<boolean>;
}

/**
 * Repository pour les paramètres utilisateur
 */
export interface IUserSettingsRepository extends IRepository<any> {
  getByUserId(userId: string): Promise<any | null>;
  updateByUserId(userId: string, data: Partial<any>): Promise<any>;
}

/**
 * Repository pour les rappels
 */
export interface IRemindersRepository extends IRepository<any> {
  getByUserId(userId: string): Promise<any[]>;
  getEnabledByUserId(userId: string): Promise<any[]>;
  getByCategoryAndUserId(category: string, userId: string): Promise<any[]>;
}

/**
 * Repository pour les abonnements
 */
export interface ISubscriptionRepository extends IRepository<any> {
  getActiveByUserId(userId: string): Promise<any | null>;
  validateSubscription(userId: string): Promise<boolean>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
}
