/**
 * Example usage of the login function and event API
 */

const { login } = require('./login');
const { 
  createEvent, 
  getEvents, 
  getEventById, 
  getEventCount,
  createAuditEvent,
  getAuditEvents,
  getAuditEventCount,
  AUDIT_EVENT_TYPES
} = require('./event');

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

console.log('=== Audit Event API Examples ===\n');

// Example 1: View all audit events created by login attempts
console.log('Example 1: Viewing audit events from login attempts');
const allAuditEvents = getAuditEvents();
console.log(`Total audit events: ${allAuditEvents.count}`);
console.log('Audit events:');
allAuditEvents.events.forEach(event => {
  console.log(`  - [${event.metadata.severity.toUpperCase()}] ${event.type}: ${event.message}`);
  console.log(`    Username: ${event.metadata.username || 'N/A'}, Source: ${event.metadata.source}`);
});
console.log();

// Example 2: Get successful login audit events
console.log('Example 2: Getting successful login audit events');
const successAudits = getAuditEvents(AUDIT_EVENT_TYPES.LOGIN_SUCCESS);
console.log(`Successful login audit events: ${successAudits.count}`);
console.log(successAudits);
console.log();

// Example 3: Get failed login audit events
console.log('Example 3: Getting failed login audit events');
const failureAudits = getAuditEvents(AUDIT_EVENT_TYPES.LOGIN_FAILURE);
console.log(`Failed login audit events: ${failureAudits.count}`);
console.log(failureAudits);
console.log();

// Example 4: Create custom audit event
console.log('Example 4: Creating custom audit event');
const customAudit = createAuditEvent(
  AUDIT_EVENT_TYPES.DATA_ACCESS,
  'User accessed sensitive data',
  {
    username: 'admin',
    resource: '/api/users/data',
    ipAddress: '192.168.1.100',
    severity: 'warning'
  }
);
console.log(customAudit);
console.log();

// Example 5: Get audit event count
console.log('Example 5: Getting audit event counts');
const totalAuditCount = getAuditEventCount();
console.log(`Total audit events: ${totalAuditCount.count}`);

const loginSuccessCount = getAuditEventCount(AUDIT_EVENT_TYPES.LOGIN_SUCCESS);
console.log(`Login success audit events: ${loginSuccessCount.count}`);
console.log();

// Example 6: Demonstrate suspicious activity detection
console.log('Example 6: Demonstrating suspicious activity detection');
const suspiciousLogin = login('admin@#$', 'test'); // Invalid characters
const suspiciousAudits = getAuditEvents(AUDIT_EVENT_TYPES.SUSPICIOUS_ACTIVITY);
console.log(`Suspicious activity events: ${suspiciousAudits.count}`);
if (suspiciousAudits.count > 0) {
  console.log('Last suspicious activity:');
  const lastSuspicious = suspiciousAudits.events[suspiciousAudits.events.length - 1];
  console.log(`  Type: ${lastSuspicious.type}`);
  console.log(`  Message: ${lastSuspicious.message}`);
  console.log(`  Reason: ${lastSuspicious.metadata.reason}`);
  console.log(`  Severity: ${lastSuspicious.metadata.severity}`);
}
console.log();
