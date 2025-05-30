import { notificationStore } from '$lib/stores/notifications';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ErrorService {
  static handle(error: unknown, context?: string) {
    console.error('Error in', context, error);

    if (error instanceof AppError) {
      notificationStore.add({
        type: 'error',
        title: 'Application Error',
        message: error.message,
        duration: 0,
      });
    } else if (error instanceof Error) {
      notificationStore.add({
        type: 'error',
        title: 'Unexpected Error',
        message: error.message,
        duration: 0,
      });
    } else {
      notificationStore.add({
        type: 'error',
        title: 'Unknown Error',
        message: 'An unexpected error occurred',
        duration: 0,
      });
    }
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.handle(error, context);
      return null;
    }
  }

  static wrapSync<T>(operation: () => T, context?: string): T | null {
    try {
      return operation();
    } catch (error) {
      this.handle(error, context);
      return null;
    }
  }
}
