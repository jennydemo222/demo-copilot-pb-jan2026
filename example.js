/**
 * Example usage of the login function
 */

const { login } = require('./login');

console.log('=== Login Function Examples ===\n');

// Example 1: Successful login
console.log('Example 1: Valid credentials');
const result1 = login('admin', 'admin123');
console.log(result1);
console.log();

// Example 2: Invalid username
console.log('Example 2: Invalid username');
const result2 = login('wronguser', 'admin123');
console.log(result2);
console.log();

// Example 3: Invalid password
console.log('Example 3: Invalid password');
const result3 = login('admin', 'wrongpass');
console.log(result3);
console.log();

// Example 4: Empty credentials
console.log('Example 4: Empty username');
const result4 = login('', 'admin123');
console.log(result4);
console.log();

// Example 5: Another valid user
console.log('Example 5: Another valid user');
const result5 = login('user', 'user123');
console.log(result5);
console.log();

console.log('=== Available test users ===');
console.log('- username: admin, password: admin123, role: administrator');
console.log('- username: user, password: user123, role: user');
console.log('- username: demo, password: demo123, role: user');
