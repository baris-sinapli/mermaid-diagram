import { writable } from 'svelte/store';
import type { Notification } from '$lib/types';

function createNotificationStore() {
  const { subscribe, update } = writable<Notification[]>([]);

  return {
    subscribe,
    add: (notification: Omit<Notification, 'id'>) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newNotification: Notification = { id, ...notification };

      update((notifications) => [...notifications, newNotification]);

      // Auto-remove after duration
      if (notification.duration !== 0) {
        setTimeout(() => {
          update((notifications) => notifications.filter((n) => n.id !== id));
        }, notification.duration || 5000);
      }

      return id;
    },
    remove: (id: string) => update((notifications) => notifications.filter((n) => n.id !== id)),
    clear: () => update(() => []),
  };
}

export const notificationStore = createNotificationStore();

// Helper functions
export const showSuccess = (message: string, title = 'Success') =>
  notificationStore.add({ type: 'success', title, message });

export const showError = (message: string, title = 'Error') =>
  notificationStore.add({ type: 'error', title, message, duration: 0 });

export const showWarning = (message: string, title = 'Warning') =>
  notificationStore.add({ type: 'warning', title, message });

export const showInfo = (message: string, title = 'Info') =>
  notificationStore.add({ type: 'info', title, message });
