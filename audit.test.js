/**
 * Test file for audit event functionality
 */

const {
  createAuditEvent,
  getAuditEvents,
  getAuditEventCount,
  getAuditEventsByTimeRange,
  clearEvents,
  AUDIT_EVENT_TYPES
} = require('./event');

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
console.log('Running audit event tests...\n');

// Clear events before starting tests
clearEvents();

// Test 1: Create audit event with valid parameters
test('Should create audit event with valid parameters', () => {
  const result = createAuditEvent(
    AUDIT_EVENT_TYPES.LOGIN_SUCCESS,
    'User logged in',
    { username: 'testuser', role: 'admin' }
  );
  assert(result.success === true, 'Audit event creation should succeed');
  assert(result.event.type === AUDIT_EVENT_TYPES.LOGIN_SUCCESS, 'Event type should match');
  assert(result.event.metadata.username === 'testuser', 'Username metadata should be stored');
  assert(result.event.metadata.severity === 'info', 'Default severity should be info');
  assert(result.event.metadata.source === 'system', 'Default source should be system');
  assert(result.event.metadata.auditTimestamp, 'Audit timestamp should exist');
});

// Test 2: Create audit event with custom severity
test('Should create audit event with custom severity', () => {
  const result = createAuditEvent(
    AUDIT_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
    'Suspicious login attempt',
    { username: 'testuser', severity: 'warning', reason: 'multiple_failed_attempts' }
  );
  assert(result.success === true, 'Audit event creation should succeed');
  assert(result.event.metadata.severity === 'warning', 'Custom severity should be preserved');
});

// Test 3: Verify AUDIT_EVENT_TYPES constants exist
test('Should have audit event type constants defined', () => {
  assert(AUDIT_EVENT_TYPES.LOGIN_SUCCESS, 'LOGIN_SUCCESS constant should exist');
  assert(AUDIT_EVENT_TYPES.LOGIN_FAILURE, 'LOGIN_FAILURE constant should exist');
  assert(AUDIT_EVENT_TYPES.SUSPICIOUS_ACTIVITY, 'SUSPICIOUS_ACTIVITY constant should exist');
  assert(AUDIT_EVENT_TYPES.ACCESS_DENIED, 'ACCESS_DENIED constant should exist');
  assert(AUDIT_EVENT_TYPES.PASSWORD_CHANGED, 'PASSWORD_CHANGED constant should exist');
});

// Test 4: Get all audit events
test('Should get all audit events', () => {
  createAuditEvent(AUDIT_EVENT_TYPES.LOGOUT, 'User logged out', { username: 'testuser' });
  const result = getAuditEvents();
  assert(result.success === true, 'Getting audit events should succeed');
  assert(result.count === 3, 'Should have 3 audit events');
  assert(result.events.every(e => e.type.startsWith('audit.')), 'All events should be audit events');
});

// Test 5: Get audit events by specific type
test('Should get audit events filtered by type', () => {
  const result = getAuditEvents(AUDIT_EVENT_TYPES.LOGIN_SUCCESS);
  assert(result.success === true, 'Getting filtered audit events should succeed');
  assert(result.count === 1, 'Should have 1 LOGIN_SUCCESS event');
  assert(result.events[0].type === AUDIT_EVENT_TYPES.LOGIN_SUCCESS, 'Event type should match filter');
});

// Test 6: Get audit event count
test('Should get total audit event count', () => {
  const result = getAuditEventCount();
  assert(result.success === true, 'Getting audit count should succeed');
  assert(result.count === 3, 'Should have 3 audit events');
});

// Test 7: Get audit event count by type
test('Should get audit event count by type', () => {
  const result = getAuditEventCount(AUDIT_EVENT_TYPES.LOGOUT);
  assert(result.success === true, 'Getting count by type should succeed');
  assert(result.count === 1, 'Should have 1 LOGOUT event');
  assert(result.type === AUDIT_EVENT_TYPES.LOGOUT, 'Type should be included in response');
});

// Test 8: Fail to get audit events with invalid type
test('Should fail to get audit events with invalid type', () => {
  const result = getAuditEvents('');
  assert(result.success === false, 'Getting audit events should fail with empty type');
  assert(result.error, 'Should have error message');
});

// Test 9: Get audit events by time range
test('Should get audit events by time range', () => {
  clearEvents();
  const startTime = new Date();
  
  // Create audit events
  createAuditEvent(AUDIT_EVENT_TYPES.LOGIN_SUCCESS, 'Login 1', { username: 'user1' });
  
  // Wait a tiny bit to ensure different timestamp
  const now = Date.now();
  while (Date.now() - now < 10) {} // Small delay
  
  createAuditEvent(AUDIT_EVENT_TYPES.LOGIN_SUCCESS, 'Login 2', { username: 'user2' });
  
  const endTime = new Date();
  
  const result = getAuditEventsByTimeRange(startTime, endTime);
  assert(result.success === true, 'Getting events by time range should succeed');
  assert(result.count === 2, 'Should have 2 events in range');
  assert(result.timeRange, 'Should include timeRange in response');
});

// Test 10: Fail with invalid time range
test('Should fail with invalid time range', () => {
  const result = getAuditEventsByTimeRange('invalid', 'invalid');
  assert(result.success === false, 'Should fail with invalid time range');
  assert(result.error, 'Should have error message');
});

// Test 11: Fail when start time is after end time
test('Should fail when start time is after end time', () => {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() + 10000); // 10 seconds later
  
  const result = getAuditEventsByTimeRange(startTime, endTime);
  assert(result.success === false, 'Should fail when start > end');
  assert(result.error.includes('before'), 'Error should mention time order');
});

// Test 12: Login function creates audit events for successful login
test('Should create audit events for successful login', () => {
  clearEvents();
  const result = login('admin', 'admin123');
  
  assert(result.success === true, 'Login should succeed');
  
  const auditEvents = getAuditEvents();
  assert(auditEvents.count >= 2, 'Should have at least 2 audit events (attempt and success)');
  
  const successEvents = getAuditEvents(AUDIT_EVENT_TYPES.LOGIN_SUCCESS);
  assert(successEvents.count === 1, 'Should have 1 LOGIN_SUCCESS event');
  assert(successEvents.events[0].metadata.username === 'admin', 'Should log correct username');
});

// Test 13: Login function creates audit events for failed login
test('Should create audit events for failed login', () => {
  clearEvents();
  const result = login('admin', 'wrongpassword');
  
  assert(result.success === false, 'Login should fail');
  
  const auditEvents = getAuditEvents();
  assert(auditEvents.count >= 2, 'Should have at least 2 audit events (attempt and failure)');
  
  const failureEvents = getAuditEvents(AUDIT_EVENT_TYPES.LOGIN_FAILURE);
  assert(failureEvents.count === 1, 'Should have 1 LOGIN_FAILURE event');
  assert(failureEvents.events[0].metadata.reason === 'incorrect_password', 'Should log failure reason');
});

// Test 14: Login function creates suspicious activity audit for invalid characters
test('Should create suspicious activity audit for invalid characters', () => {
  clearEvents();
  const result = login('admin@#$', 'admin123');
  
  assert(result.success === false, 'Login should fail');
  
  const suspiciousEvents = getAuditEvents(AUDIT_EVENT_TYPES.SUSPICIOUS_ACTIVITY);
  assert(suspiciousEvents.count === 1, 'Should have 1 SUSPICIOUS_ACTIVITY event');
  assert(suspiciousEvents.events[0].metadata.reason === 'invalid_characters', 'Should log reason');
});

// Test 15: Login function creates suspicious activity audit for too long input
test('Should create suspicious activity audit for too long input', () => {
  clearEvents();
  const longUsername = 'a'.repeat(256);
  const result = login(longUsername, 'admin123');
  
  assert(result.success === false, 'Login should fail');
  
  const suspiciousEvents = getAuditEvents(AUDIT_EVENT_TYPES.SUSPICIOUS_ACTIVITY);
  assert(suspiciousEvents.count === 1, 'Should have 1 SUSPICIOUS_ACTIVITY event');
  assert(suspiciousEvents.events[0].metadata.reason === 'username_too_long', 'Should log reason');
  assert(suspiciousEvents.events[0].metadata.severity === 'warning', 'Should have warning severity');
});

// Test 16: Audit events include all required metadata fields
test('Should include all required audit metadata fields', () => {
  clearEvents();
  login('admin', 'admin123');
  
  const auditEvents = getAuditEvents();
  const event = auditEvents.events[0];
  
  assert(event.id, 'Event should have ID');
  assert(event.type, 'Event should have type');
  assert(event.message, 'Event should have message');
  assert(event.timestamp, 'Event should have timestamp');
  assert(event.metadata, 'Event should have metadata');
  assert(event.metadata.severity, 'Metadata should have severity');
  assert(event.metadata.source, 'Metadata should have source');
  assert(event.metadata.auditTimestamp, 'Metadata should have auditTimestamp');
});

// Test 17: Multiple login attempts create multiple audit events
test('Should create multiple audit events for multiple login attempts', () => {
  clearEvents();
  
  login('admin', 'admin123'); // Success
  login('user', 'wrong'); // Failure
  login('demo', 'demo123'); // Success
  
  const auditEvents = getAuditEvents();
  assert(auditEvents.count >= 6, 'Should have at least 6 audit events (3 attempts + 3 results)');
  
  const successEvents = getAuditEvents(AUDIT_EVENT_TYPES.LOGIN_SUCCESS);
  assert(successEvents.count === 2, 'Should have 2 successful logins');
  
  const failureEvents = getAuditEvents(AUDIT_EVENT_TYPES.LOGIN_FAILURE);
  assert(failureEvents.count === 1, 'Should have 1 failed login');
});

// Test 18: Audit events preserve metadata correctly
test('Should preserve audit metadata correctly', () => {
  clearEvents();
  
  const metadata = {
    username: 'testuser',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    customField: 'customValue'
  };
  
  createAuditEvent(AUDIT_EVENT_TYPES.ACCESS_DENIED, 'Access denied', metadata);
  
  const auditEvents = getAuditEvents();
  const event = auditEvents.events[0];
  
  assert(event.metadata.username === 'testuser', 'Username should be preserved');
  assert(event.metadata.ipAddress === '192.168.1.1', 'IP address should be preserved');
  assert(event.metadata.userAgent === 'Mozilla/5.0', 'User agent should be preserved');
  assert(event.metadata.customField === 'customValue', 'Custom fields should be preserved');
});

// Print summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
