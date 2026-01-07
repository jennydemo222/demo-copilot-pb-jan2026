/**
 * Login Function
 * Validates user credentials and returns authentication result
 */

/**
 * Simulated user database for demonstration purposes
 * In a real application, this would be replaced with actual database queries
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
  // Validate input parameters
  if (typeof username !== 'string') {
    return {
      success: false,
      error: 'Username is required and must be a string'
    };
  }

  if (typeof password !== 'string') {
    return {
      success: false,
      error: 'Password is required and must be a string'
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
}

module.exports = { login };
