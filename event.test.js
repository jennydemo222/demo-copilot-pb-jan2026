/**
 * Test file for event API
 */

const {
  createEvent,
  getEvents,
  getEventById,
  clearEvents,
  getEventCount
} = require('./event');

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
console.log('Running event API tests...\n');

// Clear events before starting tests
clearEvents();

// Test 1: Create event with valid parameters
test('Should create event with valid parameters', () => {
  const result = createEvent('login', 'User logged in', { userId: 123 });
  assert(result.success === true, 'Event creation should succeed');
  assert(result.event.type === 'login', 'Event type should be login');
  assert(result.event.message === 'User logged in', 'Event message should match');
  assert(result.event.metadata.userId === 123, 'Metadata should be stored');
  assert(result.event.id === 1, 'Event ID should be 1');
  assert(result.event.timestamp, 'Event should have timestamp');
});

// Test 2: Create event without metadata
test('Should create event without metadata', () => {
  const result = createEvent('logout', 'User logged out');
  assert(result.success === true, 'Event creation should succeed');
  assert(result.event.type === 'logout', 'Event type should be logout');
  assert(result.event.metadata, 'Metadata should exist as empty object');
  assert(Object.keys(result.event.metadata).length === 0, 'Metadata should be empty');
});

// Test 3: Fail to create event with empty type
test('Should fail to create event with empty type', () => {
  const result = createEvent('', 'Test message');
  assert(result.success === false, 'Event creation should fail');
  assert(result.error, 'Should have error message');
});

// Test 4: Fail to create event with empty message
test('Should fail to create event with empty message', () => {
  const result = createEvent('test', '');
  assert(result.success === false, 'Event creation should fail');
  assert(result.error, 'Should have error message');
});

// Test 5: Fail to create event with non-string type
test('Should fail to create event with non-string type', () => {
  const result = createEvent(123, 'Test message');
  assert(result.success === false, 'Event creation should fail');
  assert(result.error, 'Should have error message');
});

// Test 6: Fail to create event with invalid metadata
test('Should fail to create event with invalid metadata', () => {
  const result = createEvent('test', 'Test message', 'invalid');
  assert(result.success === false, 'Event creation should fail');
  assert(result.error.includes('object'), 'Error should mention object');
});

// Test 7: Get all events
test('Should get all events', () => {
  const result = getEvents();
  assert(result.success === true, 'Getting events should succeed');
  assert(result.events.length === 2, 'Should have 2 events');
  assert(result.count === 2, 'Count should be 2');
});

// Test 8: Get events filtered by type
test('Should get events filtered by type', () => {
  createEvent('error', 'Test error', { code: 500 });
  const result = getEvents('error');
  assert(result.success === true, 'Getting events should succeed');
  assert(result.events.length === 1, 'Should have 1 error event');
  assert(result.events[0].type === 'error', 'Event type should be error');
});

// Test 9: Get events with invalid filter type
test('Should fail to get events with invalid filter type', () => {
  const result = getEvents('');
  assert(result.success === false, 'Getting events should fail');
  assert(result.error, 'Should have error message');
});

// Test 10: Get event by ID
test('Should get event by ID', () => {
  const result = getEventById(1);
  assert(result.success === true, 'Getting event should succeed');
  assert(result.event.id === 1, 'Event ID should be 1');
  assert(result.event.type === 'login', 'Event type should be login');
});

// Test 11: Fail to get event with invalid ID
test('Should fail to get event with invalid ID', () => {
  const result = getEventById(999);
  assert(result.success === false, 'Getting event should fail');
  assert(result.error.includes('not found'), 'Error should mention not found');
});

// Test 12: Fail to get event with non-integer ID
test('Should fail to get event with non-integer ID', () => {
  const result = getEventById('invalid');
  assert(result.success === false, 'Getting event should fail');
  assert(result.error, 'Should have error message');
});

// Test 13: Get event count
test('Should get total event count', () => {
  const result = getEventCount();
  assert(result.success === true, 'Getting count should succeed');
  assert(result.count === 3, 'Should have 3 events');
});

// Test 14: Get event count by type
test('Should get event count by type', () => {
  const result = getEventCount('login');
  assert(result.success === true, 'Getting count should succeed');
  assert(result.count === 1, 'Should have 1 login event');
  assert(result.type === 'login', 'Type should be login');
});

// Test 15: Fail to get event count with invalid type
test('Should fail to get event count with invalid type', () => {
  const result = getEventCount('');
  assert(result.success === false, 'Getting count should fail');
  assert(result.error, 'Should have error message');
});

// Test 16: Clear all events
test('Should clear all events', () => {
  const result = clearEvents();
  assert(result.success === true, 'Clearing events should succeed');
  assert(result.count === 3, 'Should have cleared 3 events');
  
  const eventsResult = getEvents();
  assert(eventsResult.events.length === 0, 'Events should be empty after clear');
});

// Test 17: Event IDs reset after clear
test('Should reset event IDs after clear', () => {
  const result = createEvent('test', 'After clear');
  assert(result.success === true, 'Event creation should succeed');
  assert(result.event.id === 1, 'Event ID should reset to 1');
});

// Test 18: Handle whitespace in type and message
test('Should trim whitespace in type and message', () => {
  const result = createEvent('  test  ', '  Test message  ');
  assert(result.success === true, 'Event creation should succeed');
  assert(result.event.type === 'test', 'Type should be trimmed');
  assert(result.event.message === 'Test message', 'Message should be trimmed');
});

// Test 19: Store complex metadata
test('Should store complex metadata', () => {
  const metadata = {
    user: { id: 1, name: 'John' },
    details: ['info1', 'info2'],
    nested: { level: 1 }
  };
  const result = createEvent('complex', 'Complex event', metadata);
  assert(result.success === true, 'Event creation should succeed');
  assert(result.event.metadata.user.name === 'John', 'Nested metadata should be stored');
  assert(result.event.metadata.details.length === 2, 'Array metadata should be stored');
});

// Test 20: Fail with array as metadata
test('Should fail with array as metadata', () => {
  const result = createEvent('test', 'Test', ['invalid']);
  assert(result.success === false, 'Event creation should fail');
  assert(result.error, 'Should have error message');
});

// Test 21: Fail with circular reference in metadata
test('Should fail with circular reference in metadata', () => {
  const circularObj = { name: 'test' };
  circularObj.self = circularObj; // Create circular reference
  
  const result = createEvent('test', 'Test with circular ref', circularObj);
  assert(result.success === false, 'Event creation should fail');
  assert(result.error.includes('circular') || result.error.includes('serializable'), 'Error should mention serialization issue');
});

// Test 22: Handle function in metadata gracefully
test('Should silently remove function from metadata', () => {
  const metadataWithFunc = { 
    name: 'test',
    func: function() { return 'test'; }
  };
  
  const result = createEvent('test', 'Test with function', metadataWithFunc);
  assert(result.success === true, 'Event creation should succeed');
  assert(result.event.metadata.name === 'test', 'Should keep regular properties');
  assert(result.event.metadata.func === undefined, 'Function should be removed');
});

// Test 23: Metadata should not be mutated after event creation
test('Should protect stored event from external metadata mutations', () => {
  clearEvents();
  const metadata = {
    user: { id: 1, name: 'John' },
    tags: ['tag1', 'tag2']
  };
  createEvent('test', 'Test event', metadata);
  
  // Mutate the original metadata
  metadata.user.name = 'Jane';
  metadata.tags.push('tag3');
  
  // Retrieve the event and verify it wasn't affected
  const retrieved = getEventById(1);
  assert(retrieved.success === true, 'Should retrieve event successfully');
  assert(retrieved.event.metadata.user.name === 'John', 'User name should not be mutated');
  assert(retrieved.event.metadata.tags.length === 2, 'Tags array should not be mutated');
});

// Test 24: Retrieved event metadata should not mutate stored event
test('Should protect stored event from retrieved metadata mutations', () => {
  clearEvents();
  createEvent('test', 'Test event', { value: { count: 10 } });
  
  // Retrieve and mutate
  const retrieved1 = getEventById(1);
  retrieved1.event.metadata.value.count = 999;
  
  // Retrieve again and verify original is intact
  const retrieved2 = getEventById(1);
  assert(retrieved2.event.metadata.value.count === 10, 'Stored event should not be mutated');
});

// Test 25: getEvents() results should not mutate stored events
test('Should protect stored events from getEvents() result mutations', () => {
  clearEvents();
  createEvent('test', 'Test event', { data: ['a', 'b'] });
  
  // Get events and mutate
  const events = getEvents();
  events.events[0].metadata.data.push('c');
  
  // Retrieve and verify original is intact
  const retrieved = getEventById(1);
  assert(retrieved.event.metadata.data.length === 2, 'Stored event should not be mutated');
  assert(retrieved.event.metadata.data[0] === 'a', 'Original data should be intact');
  assert(retrieved.event.metadata.data[1] === 'b', 'Original data should be intact');
});

// Print summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
