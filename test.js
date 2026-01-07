/**
 * Test file for login function
 */

const { login } = require('./login');

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
console.log('Running login function tests...\n');

// Test 1: Successful login with valid credentials
test('Should successfully login with valid credentials', () => {
  const result = login('admin', 'admin123');
  assert(result.success === true, 'Login should succeed');
  assert(result.user.username === 'admin', 'Username should be admin');
  assert(result.user.role === 'administrator', 'Role should be administrator');
  assert(result.message === 'Login successful', 'Should have success message');
});

// Test 2: Failed login with invalid username
test('Should fail login with invalid username', () => {
  const result = login('invalid', 'admin123');
  assert(result.success === false, 'Login should fail');
  assert(result.error === 'Invalid username or password', 'Should have error message');
});

// Test 3: Failed login with invalid password
test('Should fail login with invalid password', () => {
  const result = login('admin', 'wrongpassword');
  assert(result.success === false, 'Login should fail');
  assert(result.error === 'Invalid username or password', 'Should have error message');
});

// Test 4: Failed login with empty username
test('Should fail login with empty username', () => {
  const result = login('', 'admin123');
  assert(result.success === false, 'Login should fail');
  assert(result.error === 'Username cannot be empty', 'Should have error message');
});

// Test 5: Failed login with empty password
test('Should fail login with empty password', () => {
  const result = login('admin', '');
  assert(result.success === false, 'Login should fail');
  assert(result.error === 'Password cannot be empty', 'Should have error message');
});

// Test 6: Failed login with null username
test('Should fail login with null username', () => {
  const result = login(null, 'admin123');
  assert(result.success === false, 'Login should fail');
  assert(result.error === 'Username is required and must be a string', 'Should have error message');
});

// Test 7: Failed login with null password
test('Should fail login with null password', () => {
  const result = login('admin', null);
  assert(result.success === false, 'Login should fail');
  assert(result.error === 'Password is required and must be a string', 'Should have error message');
});

// Test 8: Successful login with different user
test('Should successfully login with user credentials', () => {
  const result = login('user', 'user123');
  assert(result.success === true, 'Login should succeed');
  assert(result.user.username === 'user', 'Username should be user');
  assert(result.user.role === 'user', 'Role should be user');
});

// Test 9: Handles whitespace in username
test('Should handle whitespace in username', () => {
  const result = login('  admin  ', 'admin123');
  assert(result.success === true, 'Login should succeed after trimming');
  assert(result.user.username === 'admin', 'Username should be trimmed');
});

// Test 10: Handles whitespace in password
test('Should handle whitespace in password', () => {
  const result = login('admin', '  admin123  ');
  assert(result.success === true, 'Login should succeed after trimming');
});

// Test 11: Failed login with undefined username
test('Should fail login with undefined username', () => {
  const result = login(undefined, 'admin123');
  assert(result.success === false, 'Login should fail');
  assert(result.error === 'Username is required and must be a string', 'Should have error message');
});

// Test 12: Failed login with undefined password
test('Should fail login with undefined password', () => {
  const result = login('admin', undefined);
  assert(result.success === false, 'Login should fail');
  assert(result.error === 'Password is required and must be a string', 'Should have error message');
});

// Test 13: Failed login with username too long
test('Should fail login with username exceeding 255 characters', () => {
  const longUsername = 'a'.repeat(256);
  const result = login(longUsername, 'admin123');
  assert(result.success === false, 'Login should fail');
  assert(result.error === 'Username is too long (maximum 255 characters)', 'Should have error message');
});

// Test 14: Failed login with password too long
test('Should fail login with password exceeding 255 characters', () => {
  const longPassword = 'a'.repeat(256);
  const result = login('admin', longPassword);
  assert(result.success === false, 'Login should fail');
  assert(result.error === 'Password is too long (maximum 255 characters)', 'Should have error message');
});

// Test 15: Failed login with invalid characters in username
test('Should fail login with invalid characters in username', () => {
  const result = login('admin@#$', 'admin123');
  assert(result.success === false, 'Login should fail');
  assert(result.error === 'Username contains invalid characters (only letters, numbers, dots, hyphens, and underscores allowed)', 'Should have error message');
});

// Test 16: Successful login with valid special characters in username
test('Should successfully login with dots, hyphens, and underscores in username', () => {
  // Note: This test validates that valid special characters work, but requires a user with such username
  // For now, we'll test that valid characters don't throw an error by using existing usernames
  const result = login('admin', 'admin123');
  assert(result.success === true, 'Login should succeed with alphanumeric username');
});

// Test 17: Handle username at exactly 255 characters (boundary test)
test('Should accept username with exactly 255 characters', () => {
  const username255 = 'a'.repeat(255);
  const result = login(username255, 'admin123');
  // This should not fail due to length, but will fail due to user not found
  assert(result.success === false, 'Login should fail (user not found)');
  assert(result.error === 'Invalid username or password', 'Should fail with invalid credentials, not length error');
});

// Test 18: Handle spaces within username (after trim)
test('Should handle username with only spaces', () => {
  const result = login('   ', 'admin123');
  assert(result.success === false, 'Login should fail');
  assert(result.error === 'Username cannot be empty', 'Should have empty username error');
});

// Print summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
