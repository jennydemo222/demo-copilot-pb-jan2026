/**
 * Test file for guest login function
 */

const { guestLogin } = require('./login');

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
console.log('Running guest login function tests...\n');

// Test 1: Successful guest login
test('Should successfully create a guest login', () => {
  const result = guestLogin();
  assert(result.success === true, 'Guest login should succeed');
  assert(result.user !== undefined, 'Should have user object');
  assert(result.user.username !== undefined, 'Should have username');
  assert(result.user.role === 'guest', 'Role should be guest');
  assert(result.message === 'Guest login successful', 'Should have success message');
});

// Test 2: Guest username format
test('Should generate guest username with correct format', () => {
  const result = guestLogin();
  assert(result.success === true, 'Guest login should succeed');
  assert(result.user.username.startsWith('guest_'), 'Username should start with guest_');
  assert(result.user.username.split('_').length === 3, 'Username should have 3 parts separated by underscores');
});

// Test 3: Guest usernames should be unique
test('Should generate unique guest usernames', () => {
  const result1 = guestLogin();
  const result2 = guestLogin();
  assert(result1.success === true, 'First guest login should succeed');
  assert(result2.success === true, 'Second guest login should succeed');
  assert(result1.user.username !== result2.user.username, 'Guest usernames should be unique');
});

// Test 4: Multiple guest logins should all succeed
test('Should handle multiple guest logins', () => {
  const results = [];
  for (let i = 0; i < 5; i++) {
    results.push(guestLogin());
  }
  const allSuccess = results.every(r => r.success === true);
  assert(allSuccess, 'All guest logins should succeed');
  
  const allGuests = results.every(r => r.user.role === 'guest');
  assert(allGuests, 'All users should have guest role');
  
  // Check uniqueness
  const usernames = results.map(r => r.user.username);
  const uniqueUsernames = new Set(usernames);
  assert(uniqueUsernames.size === usernames.length, 'All guest usernames should be unique');
});

// Test 5: Guest login should have consistent response structure
test('Should return consistent response structure', () => {
  const result = guestLogin();
  assert(result.success !== undefined, 'Should have success property');
  assert(result.user !== undefined, 'Should have user property');
  assert(result.user.username !== undefined, 'Should have username property');
  assert(result.user.role !== undefined, 'Should have role property');
  assert(result.message !== undefined, 'Should have message property');
});

// Test 6: Guest role should be correct
test('Should assign guest role', () => {
  const result = guestLogin();
  assert(result.success === true, 'Guest login should succeed');
  assert(result.user.role === 'guest', 'Role should be exactly "guest"');
  assert(result.user.role !== 'user', 'Role should not be user');
  assert(result.user.role !== 'administrator', 'Role should not be administrator');
});

// Print summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
