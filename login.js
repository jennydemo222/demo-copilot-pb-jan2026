/**
 * Login Function
 * Validates user credentials and returns authentication result
 */

const crypto = require('crypto');

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
    // Validate input parameters exist and are of correct type
    if (username === undefined || username === null || typeof username !== 'string') {
      return {
        success: false,
        error: 'Username is required and must be a string'
      };
    }

    if (password === undefined || password === null || typeof password !== 'string') {
      return {
        success: false,
        error: 'Password is required and must be a string'
      };
    }

    // Validate input length BEFORE trimming to prevent DOS attacks with large strings
    if (username.length > 255) {
      return {
        success: false,
        error: 'Username is too long (maximum 255 characters)'
      };
    }

    if (password.length > 255) {
      return {
        success: false,
        error: 'Password is too long (maximum 255 characters)'
      };
    }

    // Trim whitespace from inputs
    username = username.trim();
    password = password.trim();

    // Check if username and password are not empty after trimming
    if (username.length === 0) {
      return {
        success: false,
        error: 'Username cannot be empty'
      };
    }

    if (password.length === 0) {
      return {
        success: false,
        error: 'Password cannot be empty'
      };
    }

    // Validate username format - only allow alphanumeric, underscore, hyphen, and dot
    const usernamePattern = /^[a-zA-Z0-9._-]+$/;
    if (!usernamePattern.test(username)) {
      return {
        success: false,
        error: 'Username contains invalid characters (only letters, numbers, dots, hyphens, and underscores allowed)'
      };
    }

    // Find user in the database
    const user = users.find(u => u.username === username);

    if (!user) {
      return {
        success: false,
        error: 'Invalid username or password'
      };
    }

    // Verify password
    if (user.password !== password) {
      return {
        success: false,
        error: 'Invalid username or password'
      };
    }

    // Successful login
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
    return {
      success: false,
      error: 'An unexpected error occurred during login. Please try again.'
    };
  }
}

/**
 * Guest login function to authenticate guest users without credentials
 * Generates a unique guest username and assigns guest role
 * @returns {Object} Authentication result with success status and guest user info
 */
function guestLogin() {
  try {
    // Generate unique guest username using timestamp and cryptographically secure random bytes
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(4).toString('hex');
    const guestUsername = `guest_${timestamp}_${randomBytes}`;

    // Successful guest login
    return {
      success: true,
      user: {
        username: guestUsername,
        role: 'guest'
      },
      message: 'Guest login successful'
    };
  } catch (error) {
    // Catch any unexpected errors and return a safe error message
    console.error('Guest login error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during guest login. Please try again.'
    };
  }
}

module.exports = { login, guestLogin };
