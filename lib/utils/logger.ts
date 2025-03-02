/**
 * Logger utility that only logs in development mode
 * This prevents sensitive information from being logged in production
 */

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

/**
 * Safe logger that only logs in development mode
 */
const logger = {
  /**
   * Log information (only in development)
   */
  log: (...args: any[]): void => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (only in development)
   */
  warn: (...args: any[]): void => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log errors (only in development)
   */
  error: (...args: any[]): void => {
    if (isDev) {
      console.error(...args);
    }
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args: any[]): void => {
    if (isDev) {
      console.debug(...args);
    }
  },

  /**
   * Log information (only in development)
   */
  info: (...args: any[]): void => {
    if (isDev) {
      console.info(...args);
    }
  }
};

export default logger;
