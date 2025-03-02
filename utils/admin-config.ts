/**
 * Utility functions for admin configuration
 */

/**
 * Get the list of admin emails from environment variables
 * Falls back to a default list if not set
 */
export function getAdminEmails(): string[] {
  // Get admin emails from environment variable
  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  
  // If environment variable is set, parse it as a comma-separated list
  if (adminEmailsEnv) {
    return adminEmailsEnv.split(',').map(email => email.trim());
  }
  
  // Default admin email (only used if environment variable is not set)
  return ['marvinsmit1988@gmail.com'];
}
