/**
 * Test file for Admin API module
 */

const {
  getUser,
  listUsers,
  addUser,
  deleteUser,
  updateUserSettings,
  bulkUpdateUserSettings,
  resetUsers
} = require('./admin');

// Test counter
let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Run tests
console.log('Running Admin API tests...\n');

// Reset before starting
resetUsers();

// ── getUser ─────────────────────────────────────────────────────────────────

test('getUser: should return user details without password', () => {
  const result = getUser('admin');
  assert(result.success === true, 'Should succeed');
  assert(result.user.username === 'admin', 'Username should match');
  assert(result.user.role === 'administrator', 'Role should match');
  assert(result.user.settings !== undefined, 'Settings should be present');
  assert(result.user.password === undefined, 'Password should NOT be exposed');
});

test('getUser: should return settings object with all default keys', () => {
  const result = getUser('user');
  assert(result.success === true, 'Should succeed');
  assert(typeof result.user.settings.emailNotifications === 'boolean', 'emailNotifications should be boolean');
  assert(typeof result.user.settings.theme === 'string', 'theme should be string');
  assert(typeof result.user.settings.language === 'string', 'language should be string');
  assert(typeof result.user.settings.isActive === 'boolean', 'isActive should be boolean');
});

test('getUser: should fail for non-existent user', () => {
  const result = getUser('nonexistent');
  assert(result.success === false, 'Should fail');
  assert(result.error.includes('not found'), 'Error should mention not found');
});

test('getUser: should fail with empty username', () => {
  const result = getUser('');
  assert(result.success === false, 'Should fail');
  assert(result.error, 'Should have error message');
});

test('getUser: should fail with null username', () => {
  const result = getUser(null);
  assert(result.success === false, 'Should fail');
  assert(result.error, 'Should have error message');
});

test('getUser: should trim whitespace in username', () => {
  const result = getUser('  admin  ');
  assert(result.success === true, 'Should succeed after trimming');
  assert(result.user.username === 'admin', 'Username should be trimmed');
});

// ── listUsers ────────────────────────────────────────────────────────────────

test('listUsers: should return all users without passwords', () => {
  const result = listUsers();
  assert(result.success === true, 'Should succeed');
  assert(result.count === 3, 'Should have 3 users');
  assert(result.users.length === 3, 'Users array should have 3 items');
  result.users.forEach(u => {
    assert(u.password === undefined, 'Password should NOT be exposed');
    assert(u.username !== undefined, 'Username should be present');
    assert(u.role !== undefined, 'Role should be present');
    assert(u.settings !== undefined, 'Settings should be present');
  });
});

// ── addUser ──────────────────────────────────────────────────────────────────

test('addUser: should add a new user with default settings', () => {
  const result = addUser({ username: 'newuser', password: 'pass123', role: 'user' });
  assert(result.success === true, 'Should succeed');
  assert(result.user.username === 'newuser', 'Username should match');
  assert(result.user.role === 'user', 'Role should match');
  assert(result.user.settings.isActive === true, 'Default isActive should be true');
  assert(result.message.includes('created'), 'Should have created message');
});

test('addUser: should add a user with custom initial settings', () => {
  const result = addUser({
    username: 'customuser',
    password: 'pass456',
    role: 'user',
    settings: { theme: 'dark', emailNotifications: false }
  });
  assert(result.success === true, 'Should succeed');
  assert(result.user.settings.theme === 'dark', 'Theme should be dark');
  assert(result.user.settings.emailNotifications === false, 'emailNotifications should be false');
  // Defaults should still be applied for missing keys
  assert(result.user.settings.language === 'en', 'Language should default to en');
});

test('addUser: should fail for duplicate username', () => {
  const result = addUser({ username: 'admin', password: 'pass', role: 'user' });
  assert(result.success === false, 'Should fail');
  assert(result.error.includes('already exists'), 'Error should mention duplicate');
});

test('addUser: should fail with invalid role', () => {
  const result = addUser({ username: 'badrole', password: 'pass', role: 'superuser' });
  assert(result.success === false, 'Should fail');
  assert(result.error.includes('Role'), 'Error should mention Role');
});

test('addUser: should fail with empty username', () => {
  const result = addUser({ username: '', password: 'pass', role: 'user' });
  assert(result.success === false, 'Should fail');
  assert(result.error, 'Should have error message');
});

test('addUser: should fail with missing userData', () => {
  const result = addUser(null);
  assert(result.success === false, 'Should fail');
  assert(result.error, 'Should have error message');
});

test('addUser: should fail with username containing invalid characters', () => {
  const result = addUser({ username: 'bad user!', password: 'pass', role: 'user' });
  assert(result.success === false, 'Should fail');
  assert(result.error.includes('invalid characters'), 'Error should mention invalid characters');
});

test('addUser: should fail with unknown setting key', () => {
  const result = addUser({
    username: 'testsettings',
    password: 'pass',
    role: 'user',
    settings: { unknownKey: true }
  });
  assert(result.success === false, 'Should fail');
  assert(result.error.includes('Unknown setting'), 'Error should mention unknown setting');
});

// ── deleteUser ───────────────────────────────────────────────────────────────

test('deleteUser: should delete an existing user', () => {
  // Add a temporary user first
  addUser({ username: 'tempuser', password: 'pass', role: 'user' });
  const result = deleteUser('tempuser');
  assert(result.success === true, 'Should succeed');
  assert(result.message.includes('deleted'), 'Should have deleted message');

  // Verify user is gone
  const check = getUser('tempuser');
  assert(check.success === false, 'User should no longer exist');
});

test('deleteUser: should fail for non-existent user', () => {
  const result = deleteUser('nobody');
  assert(result.success === false, 'Should fail');
  assert(result.error.includes('not found'), 'Error should mention not found');
});

test('deleteUser: should fail with empty username', () => {
  const result = deleteUser('');
  assert(result.success === false, 'Should fail');
  assert(result.error, 'Should have error message');
});

// ── updateUserSettings ───────────────────────────────────────────────────────

test('updateUserSettings: should update a single setting', () => {
  resetUsers();
  const result = updateUserSettings('user', { theme: 'dark' });
  assert(result.success === true, 'Should succeed');
  assert(result.settings.theme === 'dark', 'Theme should be updated');
  assert(result.message.includes('updated'), 'Should have updated message');
});

test('updateUserSettings: should support partial updates (other settings unchanged)', () => {
  resetUsers();
  updateUserSettings('user', { theme: 'dark' });
  const result = updateUserSettings('user', { language: 'fr' });
  assert(result.success === true, 'Should succeed');
  assert(result.settings.theme === 'dark', 'Previous theme change should persist');
  assert(result.settings.language === 'fr', 'Language should be updated');
});

test('updateUserSettings: should update multiple settings at once', () => {
  resetUsers();
  const result = updateUserSettings('admin', { theme: 'light', emailNotifications: false });
  assert(result.success === true, 'Should succeed');
  assert(result.settings.theme === 'light', 'Theme should be light');
  assert(result.settings.emailNotifications === false, 'emailNotifications should be false');
});

test('updateUserSettings: should fail for non-existent user', () => {
  const result = updateUserSettings('nobody', { theme: 'dark' });
  assert(result.success === false, 'Should fail');
  assert(result.error.includes('not found'), 'Error should mention not found');
});

test('updateUserSettings: should fail with unknown setting key', () => {
  const result = updateUserSettings('user', { unknownKey: 'value' });
  assert(result.success === false, 'Should fail');
  assert(result.error.includes('Unknown setting'), 'Error should mention unknown setting');
});

test('updateUserSettings: should fail when setting value has wrong type', () => {
  const result = updateUserSettings('user', { emailNotifications: 'yes' });
  assert(result.success === false, 'Should fail');
  assert(result.error.includes('"emailNotifications"'), 'Error should mention the field name');
  assert(result.error.includes('boolean'), 'Error should mention expected type');
});

test('updateUserSettings: should fail with empty settings object', () => {
  const result = updateUserSettings('user', {});
  assert(result.success === false, 'Should fail');
  assert(result.error.includes('at least one'), 'Error should mention at least one field');
});

test('updateUserSettings: should fail with null settings', () => {
  const result = updateUserSettings('user', null);
  assert(result.success === false, 'Should fail');
  assert(result.error, 'Should have error message');
});

// ── bulkUpdateUserSettings ───────────────────────────────────────────────────

test('bulkUpdateUserSettings: should update multiple users successfully', () => {
  resetUsers();
  const result = bulkUpdateUserSettings([
    { username: 'user', settings: { theme: 'dark' } },
    { username: 'demo', settings: { language: 'es' } }
  ]);
  assert(result.success === true, 'Should succeed');
  assert(result.summary.total === 2, 'Total should be 2');
  assert(result.summary.succeeded === 2, 'Succeeded should be 2');
  assert(result.summary.failed === 0, 'Failed should be 0');
  assert(result.failures.length === 0, 'Failures should be empty');
  assert(result.results[0].settings.theme === 'dark', 'First user theme should be dark');
  assert(result.results[1].settings.language === 'es', 'Second user language should be es');
});

test('bulkUpdateUserSettings: should report per-row errors without failing the entire batch', () => {
  resetUsers();
  const result = bulkUpdateUserSettings([
    { username: 'user', settings: { theme: 'dark' } },
    { username: 'nonexistent', settings: { theme: 'dark' } },
    { username: 'demo', settings: { language: 'de' } }
  ]);
  assert(result.success === true, 'Bulk call itself should succeed');
  assert(result.summary.total === 3, 'Total should be 3');
  assert(result.summary.succeeded === 2, 'Succeeded should be 2');
  assert(result.summary.failed === 1, 'Failed should be 1');
  assert(result.failures.length === 1, 'One failure should be reported');
  assert(result.failures[0].username === 'nonexistent', 'Failure should name the bad user');
  assert(result.failures[0].error.includes('not found'), 'Failure should explain why it failed');
  // Valid rows should still have applied
  const userResult = getUser('user');
  assert(userResult.user.settings.theme === 'dark', 'Valid user settings should be saved');
});

test('bulkUpdateUserSettings: should fail for each row with invalid settings', () => {
  resetUsers();
  const result = bulkUpdateUserSettings([
    { username: 'user', settings: { badKey: 'value' } },
    { username: 'demo', settings: { emailNotifications: 'not-a-bool' } }
  ]);
  assert(result.success === true, 'Bulk call itself should succeed');
  assert(result.summary.failed === 2, 'Both rows should fail');
  assert(result.failures[0].error.includes('Unknown setting'), 'First error should mention unknown setting');
  assert(result.failures[1].error.includes('boolean'), 'Second error should mention type mismatch');
});

test('bulkUpdateUserSettings: should fail when updates is not an array', () => {
  const result = bulkUpdateUserSettings({ username: 'user', settings: { theme: 'dark' } });
  assert(result.success === false, 'Should fail');
  assert(result.error.includes('array'), 'Error should mention array');
});

test('bulkUpdateUserSettings: should fail when updates array is empty', () => {
  const result = bulkUpdateUserSettings([]);
  assert(result.success === false, 'Should fail');
  assert(result.error.includes('empty'), 'Error should mention empty array');
});

test('bulkUpdateUserSettings: should handle row where update entry is not an object', () => {
  resetUsers();
  const result = bulkUpdateUserSettings(['not-an-object']);
  assert(result.success === true, 'Bulk call itself should succeed');
  assert(result.summary.failed === 1, 'Row should fail');
  assert(result.failures[0].index === 0, 'Failure index should be 0');
});

// ── resetUsers (utility) ──────────────────────────────────────────────────────

test('resetUsers: should restore initial user store', () => {
  // Mutate the store first
  addUser({ username: 'extra', password: 'pass', role: 'user' });
  const beforeReset = listUsers();
  assert(beforeReset.count === 4, 'Should have 4 users before reset');

  const result = resetUsers();
  assert(result.success === true, 'Reset should succeed');

  const afterReset = listUsers();
  assert(afterReset.count === 3, 'Should be back to 3 users after reset');
});

// Print summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
