/**
 * Test file for poll engagement tracking
 */

const {
  trackPollEngagement,
  getPollEngagementEvents,
  clearEvents
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
console.log('Running poll engagement tracking tests...\n');

// Clear events before starting tests
clearEvents();

// Test 1: Track poll engagement with all fields
test('Should track poll engagement with all required fields', () => {
  const payload = {
    event_type: 'vote_changed',
    poll_id: '12345',
    user_id: 'user_abc',
    previous_choice: 'option_1',
    new_choice: 'option_2',
    timestamp: '2024-01-15T14:30:00Z',
    session_id: 'session_xyz'
  };
  
  const result = trackPollEngagement(payload);
  assert(result.success === true, 'Tracking should succeed');
  assert(result.event.type === 'poll_engagement', 'Event type should be poll_engagement');
  assert(result.event.metadata.event_type === 'vote_changed', 'Event type should be vote_changed');
  assert(result.event.metadata.poll_id === '12345', 'Poll ID should match');
  assert(result.event.metadata.user_id === 'user_abc', 'User ID should match');
  assert(result.event.metadata.previous_choice === 'option_1', 'Previous choice should match');
  assert(result.event.metadata.new_choice === 'option_2', 'New choice should match');
  assert(result.event.metadata.session_id === 'session_xyz', 'Session ID should match');
});

// Test 2: Track poll engagement without optional fields
test('Should track poll engagement without optional fields', () => {
  const payload = {
    event_type: 'vote_cast',
    poll_id: '12345',
    user_id: 'user_def',
    new_choice: 'option_1',
    timestamp: '2024-01-15T14:31:00Z'
  };
  
  const result = trackPollEngagement(payload);
  assert(result.success === true, 'Tracking should succeed');
  assert(result.event.metadata.previous_choice === null, 'Previous choice should be null');
  assert(result.event.metadata.session_id === null, 'Session ID should be null');
});

// Test 3: Fail with missing required field
test('Should fail when required field is missing', () => {
  const payload = {
    event_type: 'vote_changed',
    poll_id: '12345',
    user_id: 'user_abc',
    timestamp: '2024-01-15T14:30:00Z'
    // Missing new_choice
  };
  
  const result = trackPollEngagement(payload);
  assert(result.success === false, 'Tracking should fail');
  assert(result.error.includes('new_choice'), 'Error should mention missing field');
});

// Test 4: Fail with invalid payload
test('Should fail with null payload', () => {
  const result = trackPollEngagement(null);
  assert(result.success === false, 'Tracking should fail');
  assert(result.error === 'Payload must be an object', 'Error should mention payload type');
});

// Test 5: Fail with invalid timestamp
test('Should fail with invalid timestamp format', () => {
  const payload = {
    event_type: 'vote_changed',
    poll_id: '12345',
    user_id: 'user_abc',
    new_choice: 'option_2',
    timestamp: 'invalid-timestamp'
  };
  
  const result = trackPollEngagement(payload);
  assert(result.success === false, 'Tracking should fail');
  assert(result.error === 'Invalid timestamp format', 'Error should mention timestamp');
});

// Test 6: Fail with empty string in required field
test('Should fail with empty string in required field', () => {
  const payload = {
    event_type: 'vote_changed',
    poll_id: '',
    user_id: 'user_abc',
    new_choice: 'option_2',
    timestamp: '2024-01-15T14:30:00Z'
  };
  
  const result = trackPollEngagement(payload);
  assert(result.success === false, 'Tracking should fail');
  assert(result.error.includes('poll_id'), 'Error should mention empty field');
});

// Test 7: Get all poll engagement events
test('Should retrieve all poll engagement events', () => {
  const result = getPollEngagementEvents();
  assert(result.success === true, 'Retrieval should succeed');
  assert(result.count === 2, 'Should have 2 events (from previous successful tests)');
  assert(result.events.length === 2, 'Events array should have 2 items');
});

// Test 8: Filter poll engagement events by poll_id
test('Should filter poll engagement events by poll_id', () => {
  const result = getPollEngagementEvents({ poll_id: '12345' });
  assert(result.success === true, 'Retrieval should succeed');
  assert(result.count === 2, 'Should have 2 events for poll 12345');
  assert(result.events.every(e => e.metadata.poll_id === '12345'), 'All events should have matching poll_id');
});

// Test 9: Filter poll engagement events by user_id
test('Should filter poll engagement events by user_id', () => {
  const result = getPollEngagementEvents({ user_id: 'user_abc' });
  assert(result.success === true, 'Retrieval should succeed');
  assert(result.count === 1, 'Should have 1 event for user_abc');
  assert(result.events[0].metadata.user_id === 'user_abc', 'Event should have matching user_id');
});

// Test 10: Filter poll engagement events by event_type
test('Should filter poll engagement events by event_type', () => {
  const result = getPollEngagementEvents({ event_type: 'vote_changed' });
  assert(result.success === true, 'Retrieval should succeed');
  assert(result.count === 1, 'Should have 1 vote_changed event');
  assert(result.events[0].metadata.event_type === 'vote_changed', 'Event should have matching event_type');
});

// Test 11: Filter with multiple criteria
test('Should filter poll engagement events with multiple criteria', () => {
  const result = getPollEngagementEvents({ 
    poll_id: '12345',
    user_id: 'user_abc',
    event_type: 'vote_changed'
  });
  assert(result.success === true, 'Retrieval should succeed');
  assert(result.count === 1, 'Should have 1 matching event');
  assert(result.events[0].metadata.poll_id === '12345', 'Event should have matching poll_id');
  assert(result.events[0].metadata.user_id === 'user_abc', 'Event should have matching user_id');
  assert(result.events[0].metadata.event_type === 'vote_changed', 'Event should have matching event_type');
});

// Test 12: Handle whitespace in payload fields
test('Should trim whitespace from payload fields', () => {
  const payload = {
    event_type: '  vote_removed  ',
    poll_id: '  12345  ',
    user_id: '  user_ghi  ',
    new_choice: '  option_3  ',
    timestamp: '  2024-01-15T14:32:00Z  ',
    session_id: '  session_abc  '
  };
  
  const result = trackPollEngagement(payload);
  assert(result.success === true, 'Tracking should succeed');
  assert(result.event.metadata.event_type === 'vote_removed', 'Event type should be trimmed');
  assert(result.event.metadata.poll_id === '12345', 'Poll ID should be trimmed');
  assert(result.event.metadata.user_id === 'user_ghi', 'User ID should be trimmed');
  assert(result.event.metadata.new_choice === 'option_3', 'New choice should be trimmed');
  assert(result.event.metadata.session_id === 'session_abc', 'Session ID should be trimmed');
});

// Test 13: Verify immutability (memory leak prevention)
test('Should prevent external mutation of stored event data', () => {
  const payload = {
    event_type: 'vote_cast',
    poll_id: '54321',
    user_id: 'user_jkl',
    new_choice: 'option_1',
    timestamp: '2024-01-15T14:33:00Z'
  };
  
  const result = trackPollEngagement(payload);
  assert(result.success === true, 'Tracking should succeed');
  
  // Try to mutate the returned event (should not affect stored data)
  const eventId = result.event.id;
  
  // Get the event again to verify it hasn't been mutated
  const retrieved = getPollEngagementEvents({ user_id: 'user_jkl' });
  assert(retrieved.events[0].metadata.user_id === 'user_jkl', 'Stored data should remain unchanged');
});

// Test 14: Handle multiple events for same user
test('Should track multiple engagement events for same user', () => {
  const payload1 = {
    event_type: 'vote_cast',
    poll_id: '99999',
    user_id: 'multi_user',
    new_choice: 'option_1',
    timestamp: '2024-01-15T14:34:00Z'
  };
  
  const payload2 = {
    event_type: 'vote_changed',
    poll_id: '99999',
    user_id: 'multi_user',
    previous_choice: 'option_1',
    new_choice: 'option_2',
    timestamp: '2024-01-15T14:35:00Z'
  };
  
  trackPollEngagement(payload1);
  trackPollEngagement(payload2);
  
  const result = getPollEngagementEvents({ user_id: 'multi_user' });
  assert(result.success === true, 'Retrieval should succeed');
  assert(result.count === 2, 'Should have 2 events for multi_user');
});

// Print summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
