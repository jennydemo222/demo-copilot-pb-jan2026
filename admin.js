/**
 * Admin API Module
 * Provides administrative capabilities for user management and bulk settings operations.
 * All operations include proper validation and explicit error reporting — no silent failures.
 */

/**
 * In-memory user store for demonstration purposes.
 * In a real application this would be backed by a database.
 * Pre-seeded with the same users as login.js so the two modules are consistent.
 *
 * ⚠️ SECURITY WARNING: Passwords are stored in plain text for demonstration only.
 */
const users = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'administrator',
    settings: { emailNotifications: true, theme: 'default', language: 'en', isActive: true }
  },
  {
    username: 'user',
    password: 'user123',
    role: 'user',
    settings: { emailNotifications: true, theme: 'default', language: 'en', isActive: true }
  },
  {
    username: 'demo',
    password: 'demo123',
    role: 'user',
    settings: { emailNotifications: true, theme: 'default', language: 'en', isActive: true }
  }
];

/** Allowed setting keys and their expected types */
const ALLOWED_SETTINGS = {
  emailNotifications: 'boolean',
  theme: 'string',
  language: 'string',
  isActive: 'boolean'
};

/**
 * Validates a settings object against the allowed keys and types.
 * @param {Object} settings - Settings to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
function validateSettings(settings) {
  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
    return { valid: false, error: 'Settings must be a non-null object' };
  }

  if (Object.keys(settings).length === 0) {
    return { valid: false, error: 'Settings must contain at least one field' };
  }

  for (const key of Object.keys(settings)) {
    if (!(key in ALLOWED_SETTINGS)) {
      return {
        valid: false,
        error: `Unknown setting "${key}". Allowed settings: ${Object.keys(ALLOWED_SETTINGS).join(', ')}`
      };
    }
    const expectedType = ALLOWED_SETTINGS[key];
    if (typeof settings[key] !== expectedType) {
      return {
        valid: false,
        error: `Setting "${key}" must be a ${expectedType}, got ${typeof settings[key]}`
      };
    }
  }

  return { valid: true, error: null };
}

/**
 * Retrieves a user's details (without password) along with their settings.
 * @param {string} username - The username to look up
 * @returns {Object} Result with success status and user details or error message
 */
function getUser(username) {
  try {
    if (typeof username !== 'string' || username.trim().length === 0) {
      return { success: false, error: 'Username must be a non-empty string' };
    }

    const user = users.find(u => u.username === username.trim());
    if (!user) {
      return { success: false, error: `User "${username.trim()}" not found` };
    }

    return {
      success: true,
      user: {
        username: user.username,
        role: user.role,
        settings: JSON.parse(JSON.stringify(user.settings))
      }
    };
  } catch (error) {
    console.error('Unexpected error in getUser:', error);
    return { success: false, error: 'An unexpected error occurred while retrieving the user' };
  }
}

/**
 * Lists all users with their roles and settings (passwords are never exposed).
 * @returns {Object} Result with success status and array of user objects
 */
function listUsers() {
  try {
    const userList = users.map(u => ({
      username: u.username,
      role: u.role,
      settings: JSON.parse(JSON.stringify(u.settings))
    }));

    return { success: true, users: userList, count: userList.length };
  } catch (error) {
    console.error('Unexpected error in listUsers:', error);
    return { success: false, error: 'An unexpected error occurred while listing users' };
  }
}

/**
 * Adds a new user.
 * @param {Object} userData - New user data
 * @param {string} userData.username - Unique username
 * @param {string} userData.password - Plain-text password (demonstration only)
 * @param {string} userData.role - Role ('administrator' or 'user')
 * @param {Object} [userData.settings] - Optional initial settings
 * @returns {Object} Result with success status and created user or error message
 */
function addUser(userData) {
  try {
    if (typeof userData !== 'object' || userData === null || Array.isArray(userData)) {
      return { success: false, error: 'User data must be a non-null object' };
    }

    const { username, password, role, settings } = userData;

    if (typeof username !== 'string' || username.trim().length === 0) {
      return { success: false, error: 'Username must be a non-empty string' };
    }

    if (username.trim().length > 255) {
      return { success: false, error: 'Username is too long (maximum 255 characters)' };
    }

    const usernamePattern = /^[a-zA-Z0-9._-]+$/;
    if (!usernamePattern.test(username.trim())) {
      return {
        success: false,
        error: 'Username contains invalid characters (only letters, numbers, dots, hyphens, and underscores allowed)'
      };
    }

    if (users.find(u => u.username === username.trim())) {
      return { success: false, error: `User "${username.trim()}" already exists` };
    }

    if (typeof password !== 'string' || password.trim().length === 0) {
      return { success: false, error: 'Password must be a non-empty string' };
    }

    const allowedRoles = ['administrator', 'user'];
    if (typeof role !== 'string' || !allowedRoles.includes(role)) {
      return { success: false, error: `Role must be one of: ${allowedRoles.join(', ')}` };
    }

    const defaultSettings = { emailNotifications: true, theme: 'default', language: 'en', isActive: true };
    let resolvedSettings = defaultSettings;

    if (settings !== undefined) {
      const validation = validateSettings(settings);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      resolvedSettings = Object.assign({}, defaultSettings, settings);
    }

    const newUser = {
      username: username.trim(),
      password: password.trim(),
      role,
      settings: resolvedSettings
    };

    users.push(newUser);

    return {
      success: true,
      user: { username: newUser.username, role: newUser.role, settings: JSON.parse(JSON.stringify(newUser.settings)) },
      message: `User "${newUser.username}" created successfully`
    };
  } catch (error) {
    console.error('Unexpected error in addUser:', error);
    return { success: false, error: 'An unexpected error occurred while adding the user' };
  }
}

/**
 * Deletes a user by username.
 * @param {string} username - The username to delete
 * @returns {Object} Result with success status or error message
 */
function deleteUser(username) {
  try {
    if (typeof username !== 'string' || username.trim().length === 0) {
      return { success: false, error: 'Username must be a non-empty string' };
    }

    const index = users.findIndex(u => u.username === username.trim());
    if (index === -1) {
      return { success: false, error: `User "${username.trim()}" not found` };
    }

    users.splice(index, 1);
    return { success: true, message: `User "${username.trim()}" deleted successfully` };
  } catch (error) {
    console.error('Unexpected error in deleteUser:', error);
    return { success: false, error: 'An unexpected error occurred while deleting the user' };
  }
}

/**
 * Updates settings for a single user (partial update — only supplied keys are changed).
 * @param {string} username - The username whose settings to update
 * @param {Object} settings - Partial settings object with fields to update
 * @returns {Object} Result with success status and updated user settings or error message
 */
function updateUserSettings(username, settings) {
  try {
    if (typeof username !== 'string' || username.trim().length === 0) {
      return { success: false, error: 'Username must be a non-empty string' };
    }

    const validation = validateSettings(settings);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const user = users.find(u => u.username === username.trim());
    if (!user) {
      return { success: false, error: `User "${username.trim()}" not found` };
    }

    Object.assign(user.settings, settings);

    return {
      success: true,
      username: user.username,
      settings: JSON.parse(JSON.stringify(user.settings)),
      message: `Settings updated for user "${user.username}"`
    };
  } catch (error) {
    console.error('Unexpected error in updateUserSettings:', error);
    return { success: false, error: 'An unexpected error occurred while updating user settings' };
  }
}

/**
 * Bulk-updates settings for multiple users in a single call.
 * Each row is validated independently; rows with errors are reported individually
 * so that valid rows still succeed (no silent failures on bad rows).
 *
 * @param {Array<{username: string, settings: Object}>} updates - Array of update operations
 * @returns {Object} Result with per-row results, a list of failures, and an overall summary
 *
 * @example
 * const result = bulkUpdateUserSettings([
 *   { username: 'user', settings: { theme: 'dark' } },
 *   { username: 'nonexistent', settings: { theme: 'dark' } }  // will fail with clear error
 * ]);
 * // result.summary => { total: 2, succeeded: 1, failed: 1 }
 * // result.failures => [{ index: 1, username: 'nonexistent', error: 'User "nonexistent" not found' }]
 */
function bulkUpdateUserSettings(updates) {
  try {
    if (!Array.isArray(updates)) {
      return { success: false, error: 'Updates must be an array' };
    }

    if (updates.length === 0) {
      return { success: false, error: 'Updates array must not be empty' };
    }

    const results = [];
    const failures = [];

    updates.forEach((update, index) => {
      // Validate the shape of each row explicitly
      if (typeof update !== 'object' || update === null || Array.isArray(update)) {
        const err = `Row ${index}: each update must be a non-null object`;
        failures.push({ index, username: null, error: err });
        results.push({ index, success: false, error: err });
        return;
      }

      const { username, settings } = update;

      if (typeof username !== 'string' || username.trim().length === 0) {
        const err = `Row ${index}: username must be a non-empty string`;
        failures.push({ index, username: null, error: err });
        results.push({ index, success: false, error: err });
        return;
      }

      const rowResult = updateUserSettings(username, settings);

      if (!rowResult.success) {
        failures.push({ index, username: username.trim(), error: rowResult.error });
        results.push({ index, username: username.trim(), success: false, error: rowResult.error });
      } else {
        results.push({
          index,
          username: rowResult.username,
          success: true,
          settings: rowResult.settings
        });
      }
    });

    const succeeded = results.filter(r => r.success).length;
    const failed = failures.length;

    return {
      success: true,
      results,
      failures,
      summary: { total: updates.length, succeeded, failed }
    };
  } catch (error) {
    console.error('Unexpected error in bulkUpdateUserSettings:', error);
    return { success: false, error: 'An unexpected error occurred during bulk update' };
  }
}

/**
 * Resets the user store to its initial state.
 * Useful for testing purposes.
 * @returns {Object} Success status
 */
function resetUsers() {
  try {
    users.length = 0;
    users.push(
      {
        username: 'admin',
        password: 'admin123',
        role: 'administrator',
        settings: { emailNotifications: true, theme: 'default', language: 'en', isActive: true }
      },
      {
        username: 'user',
        password: 'user123',
        role: 'user',
        settings: { emailNotifications: true, theme: 'default', language: 'en', isActive: true }
      },
      {
        username: 'demo',
        password: 'demo123',
        role: 'user',
        settings: { emailNotifications: true, theme: 'default', language: 'en', isActive: true }
      }
    );
    return { success: true, message: 'User store reset to initial state' };
  } catch (error) {
    console.error('Unexpected error in resetUsers:', error);
    return { success: false, error: 'An unexpected error occurred while resetting users' };
  }
}

module.exports = {
  getUser,
  listUsers,
  addUser,
  deleteUser,
  updateUserSettings,
  bulkUpdateUserSettings,
  resetUsers
};
