/**
 * Login Function
 * Validates user credentials and returns authentication result
 * Includes audit logging for security tracking
 */

const { createAuditEvent, AUDIT_EVENT_TYPES } = require('./event');

/**
 * Simulated user database for demonstration purposes
 * In a real application, this would be replaced with actual database queries
 * 
 * ⚠️ SECURITY WARNING: Passwords are stored in plain text for demonstration only.
 * In production, NEVER store passwords in plain text. Always use proper password
 * hashing algorithms like bcrypt, argon2, or scrypt.
 */
const users = [
  { username: 'admin', password: 'admin123', role: 'administrator' },
  { username: 'user', password: 'user123', role: 'user' },
  { username: 'demo', password: 'demo123', role: 'user' }
];

/**
 * Login function to authenticate users
 * @param {string} username - The username to authenticate
 * @param {string} password - The password to verify
 * @returns {Object} Authentication result with success status and user info or error message
 */
function login(username, password) {
  try {
    // Log login attempt
    const attemptMetadata = {
      username: username || 'undefined',
      severity: 'info',
      source: 'login'
    };

    // Validate input parameters exist and are of correct type
    if (username === undefined || username === null || typeof username !== 'string') {
      createAuditEvent(
        AUDIT_EVENT_TYPES.LOGIN_FAILURE,
        'Login failed: Invalid username type',
        { ...attemptMetadata, reason: 'invalid_username_type' }
      );
      return {
        success: false,
        error: 'Username is required and must be a string'
      };
    }

    if (password === undefined || password === null || typeof password !== 'string') {
      createAuditEvent(
        AUDIT_EVENT_TYPES.LOGIN_FAILURE,
        'Login failed: Invalid password type',
        { ...attemptMetadata, reason: 'invalid_password_type' }
      );
      return {
        success: false,
        error: 'Password is required and must be a string'
      };
    }

    // Validate input length BEFORE trimming to prevent DOS attacks with large strings
    if (username.length > 255) {
      createAuditEvent(
        AUDIT_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
        'Suspicious activity: Username exceeds maximum length',
        { ...attemptMetadata, reason: 'username_too_long', length: username.length, severity: 'warning' }
      );
      return {
        success: false,
        error: 'Username is too long (maximum 255 characters)'
      };
    }

    if (password.length > 255) {
      createAuditEvent(
        AUDIT_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
        'Suspicious activity: Password exceeds maximum length',
        { ...attemptMetadata, reason: 'password_too_long', length: password.length, severity: 'warning' }
      );
      return {
        success: false,
        error: 'Password is too long (maximum 255 characters)'
      };
    }

    // Trim whitespace from inputs
    username = username.trim();
    password = password.trim();

    // Update metadata with trimmed username
    attemptMetadata.username = username;

    // Check if username and password are not empty after trimming
    if (username.length === 0) {
      createAuditEvent(
        AUDIT_EVENT_TYPES.LOGIN_FAILURE,
        'Login failed: Empty username',
        { ...attemptMetadata, reason: 'empty_username' }
      );
      return {
        success: false,
        error: 'Username cannot be empty'
      };
    }

    if (password.length === 0) {
      createAuditEvent(
        AUDIT_EVENT_TYPES.LOGIN_FAILURE,
        'Login failed: Empty password',
        { ...attemptMetadata, reason: 'empty_password' }
      );
      return {
        success: false,
        error: 'Password cannot be empty'
      };
    }

    // Validate username format - only allow alphanumeric, underscore, hyphen, and dot
    const usernamePattern = /^[a-zA-Z0-9._-]+$/;
    if (!usernamePattern.test(username)) {
      createAuditEvent(
        AUDIT_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
        'Suspicious activity: Username contains invalid characters',
        { ...attemptMetadata, reason: 'invalid_characters', severity: 'warning' }
      );
      return {
        success: false,
        error: 'Username contains invalid characters (only letters, numbers, dots, hyphens, and underscores allowed)'
      };
    }

    // Log the actual login attempt
    createAuditEvent(
      AUDIT_EVENT_TYPES.LOGIN_ATTEMPT,
      'User login attempt',
      attemptMetadata
    );

    // Find user in the database
    const user = users.find(u => u.username === username);

    if (!user) {
      createAuditEvent(
        AUDIT_EVENT_TYPES.LOGIN_FAILURE,
        'Login failed: User not found',
        { ...attemptMetadata, reason: 'user_not_found', severity: 'warning' }
      );
      return {
        success: false,
        error: 'Invalid username or password'
      };
    }

    // Verify password
    if (user.password !== password) {
      createAuditEvent(
        AUDIT_EVENT_TYPES.LOGIN_FAILURE,
        'Login failed: Incorrect password',
        { ...attemptMetadata, reason: 'incorrect_password', severity: 'warning' }
      );
      return {
        success: false,
        error: 'Invalid username or password'
      };
    }

    // Successful login - log audit event
    createAuditEvent(
      AUDIT_EVENT_TYPES.LOGIN_SUCCESS,
      'User logged in successfully',
      {
        username: user.username,
        role: user.role,
        severity: 'info',
        source: 'login'
      }
    );

    return {
      success: true,
      user: {
        username: user.username,
        role: user.role
      },
      message: 'Login successful'
    };
  } catch (error) {
    // Catch any unexpected errors and return a safe error message
    // In production, you should log the actual error for debugging
    console.error('Login error:', error);
    createAuditEvent(
      AUDIT_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
      'Unexpected error during login',
      {
        username: username || 'unknown',
        reason: 'unexpected_error',
        error: error.message,
        severity: 'error',
        source: 'login'
      }
    );
    return {
      success: false,
      error: 'An unexpected error occurred during login. Please try again.'
    };
  }
}

module.exports = { login };
