/**
 * Example usage of the login function and event API
 */

const { login, guestLogin } = require('./login');
const { createEvent, getEvents, getEventById, getEventCount } = require('./event');

console.log('=== Login Function Examples ===\n');

// Example 1: Successful login
console.log('Example 1: Valid credentials');
const result1 = login('admin', 'admin123');
console.log(result1);

// Log the successful login as an event
if (result1.success) {
  createEvent('login', 'User logged in successfully', {
    username: result1.user.username,
    role: result1.user.role
  });
}
console.log();

// Example 2: Invalid username
console.log('Example 2: Invalid username');
const result2 = login('wronguser', 'admin123');
console.log(result2);

// Log the failed login as an event
if (!result2.success) {
  createEvent('login_failed', 'Login attempt failed', {
    username: 'wronguser',
    reason: result2.error
  });
}
console.log();

// Example 3: Invalid password
console.log('Example 3: Invalid password');
const result3 = login('admin', 'wrongpass');
console.log(result3);

// Log the failed login as an event
if (!result3.success) {
  createEvent('login_failed', 'Login attempt failed', {
    username: 'admin',
    reason: result3.error
  });
}
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

// Log the successful login as an event
if (result5.success) {
  createEvent('login', 'User logged in successfully', {
    username: result5.user.username,
    role: result5.user.role
  });
}
console.log();

console.log('=== Available test users ===');
console.log('- username: admin, password: admin123, role: administrator');
console.log('- username: user, password: user123, role: user');
console.log('- username: demo, password: demo123, role: user');
console.log();

console.log('=== Guest Login Examples ===\n');

// Example 6: Guest login
console.log('Example 6: Guest login without credentials');
const result6 = guestLogin();
console.log(result6);

// Log the guest login as an event
if (result6.success) {
  createEvent('guest_login', 'Guest user logged in', {
    username: result6.user.username,
    role: result6.user.role
  });
}
console.log();

// Example 7: Multiple guest logins
console.log('Example 7: Multiple guest logins (demonstrating unique usernames)');
const guest1 = guestLogin();
const guest2 = guestLogin();
console.log('Guest 1:', guest1.user.username);
console.log('Guest 2:', guest2.user.username);
console.log('Usernames are unique:', guest1.user.username !== guest2.user.username);
console.log();

console.log('=== Event API Examples ===\n');

// Example 1: Create a custom event
console.log('Example 1: Creating a custom event');
const event1 = createEvent('user_action', 'User performed an action', {
  action: 'update_profile',
  timestamp: Date.now()
});
console.log(event1);
console.log();

// Example 2: Get all events
console.log('Example 2: Getting all events');
const allEvents = getEvents();
console.log(`Total events: ${allEvents.count}`);
console.log(allEvents);
console.log();

// Example 3: Get events by type
console.log('Example 3: Getting login events only');
const loginEvents = getEvents('login');
console.log(`Login events: ${loginEvents.count}`);
console.log(loginEvents);
console.log();

// Example 4: Get specific event by ID
console.log('Example 4: Getting event by ID');
const eventById = getEventById(1);
console.log(eventById);
console.log();

// Example 5: Get event count
console.log('Example 5: Getting event count');
const countResult = getEventCount();
console.log(`Total events: ${countResult.count}`);

const loginCountResult = getEventCount('login');
console.log(`Login events: ${loginCountResult.count}`);
console.log();
