import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { ExpoNotificationService } from '@/src/infrastructure/services/notifications';
import { NotificationContent } from '@/src/domain/types';
import { GroupedReminders } from '@/src/domain/entities';

/**
 * Interface du contexte de notifications
 */
export interface NotificationContextType {
  hasPermission: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  sendNotification: (content: NotificationContent) => Promise<string>;
  scheduleNotification: (content: NotificationContent, triggerDate: Date) => Promise<string>;
  sendGroupedNotifications: (grouped: GroupedReminders[]) => Promise<void>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
  lastNotification: Notifications.Notification | null;
  lastNotificationResponse: Notifications.NotificationResponse | null;
}

/**
 * Context de notifications
 */
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Hook pour utiliser le contexte de notifications
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

/**
 * Provider de notifications
 * Gère l'état global des notifications et leurs permissions
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
  const [lastNotificationResponse, setLastNotificationResponse] =
    useState<Notifications.NotificationResponse | null>(null);

  const [notificationService] = useState(() => new ExpoNotificationService());

  /**
   * Vérifie les permissions au chargement
   */
  useEffect(() => {
    checkPermissions();
    setupListeners();
  }, []);

  /**
   * Vérifie si les permissions sont accordées
   */
  const checkPermissions = async () => {
    try {
      setIsLoading(true);
      const hasPerms = await notificationService.hasPermissions();
      setHasPermission(hasPerms);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Configure les listeners de notifications
   */
  const setupListeners = () => {
    // Écouter les notifications reçues
    const receivedSubscription = notificationService.onNotificationReceived((notification) => {
      console.log('Notification received:', notification);
      setLastNotification(notification);
    });

    // Écouter les interactions avec les notifications
    const responseSubscription = notificationService.onNotificationResponse((response) => {
      console.log('Notification response:', response);
      setLastNotificationResponse(response);
      // Ici on pourrait naviguer vers un écran spécifique selon le type de notification
    });

    // Cleanup lors du démontage
    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  };

  /**
   * Demande la permission de notifications
   */
  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermissions();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  /**
   * Envoie une notification immédiate
   */
  const sendNotification = async (content: NotificationContent): Promise<string> => {
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }
    return await notificationService.sendNotification(content);
  };

  /**
   * Programme une notification
   */
  const scheduleNotification = async (
    content: NotificationContent,
    triggerDate: Date
  ): Promise<string> => {
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }
    return await notificationService.scheduleNotification(content, triggerDate);
  };

  /**
   * Envoie des notifications groupées
   */
  const sendGroupedNotifications = async (grouped: GroupedReminders[]): Promise<void> => {
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }
    return await notificationService.sendGroupedNotifications(grouped);
  };

  /**
   * Annule une notification
   */
  const cancelNotification = async (notificationId: string): Promise<void> => {
    return await notificationService.cancelNotification(notificationId);
  };

  /**
   * Annule toutes les notifications
   */
  const cancelAllNotifications = async (): Promise<void> => {
    return await notificationService.cancelAllNotifications();
  };

  /**
   * Met à jour le badge de l'application
   */
  const setBadgeCount = async (count: number): Promise<void> => {
    return await notificationService.setBadgeCount(count);
  };

  const value: NotificationContextType = {
    hasPermission,
    isLoading,
    requestPermission,
    sendNotification,
    scheduleNotification,
    sendGroupedNotifications,
    cancelNotification,
    cancelAllNotifications,
    setBadgeCount,
    lastNotification,
    lastNotificationResponse,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
