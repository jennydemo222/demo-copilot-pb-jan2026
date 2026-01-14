/**
 * Example usage of the Poll Engagement Tracking API
 * 
 * This example demonstrates how to track user interactions with polls
 * to prevent memory leaks and enable granular engagement analytics.
 */

const { 
  trackPollEngagement, 
  getPollEngagementEvents,
  clearEvents
} = require('./event');

console.log('=== Poll Engagement Tracking Examples ===\n');

// Clear any existing events
clearEvents();

// Example 1: Track a new vote being cast
console.log('Example 1: User casts initial vote');
const voteCast = trackPollEngagement({
  event_type: 'vote_cast',
  poll_id: '12345',
  user_id: 'user_abc',
  new_choice: 'option_1',
  timestamp: '2024-01-15T14:30:00Z',
  session_id: 'session_xyz'
});
console.log(voteCast);
console.log();

// Example 2: Track a vote being changed
console.log('Example 2: User changes their vote');
const voteChanged = trackPollEngagement({
  event_type: 'vote_changed',
  poll_id: '12345',
  user_id: 'user_abc',
  previous_choice: 'option_1',
  new_choice: 'option_2',
  timestamp: '2024-01-15T14:31:00Z',
  session_id: 'session_xyz'
});
console.log(voteChanged);
console.log();

// Example 3: Track vote removal
console.log('Example 3: User removes their vote');
const voteRemoved = trackPollEngagement({
  event_type: 'vote_removed',
  poll_id: '12345',
  user_id: 'user_abc',
  previous_choice: 'option_2',
  new_choice: 'none',
  timestamp: '2024-01-15T14:32:00Z',
  session_id: 'session_xyz'
});
console.log(voteRemoved);
console.log();

// Example 4: Track engagement from another user
console.log('Example 4: Different user votes on same poll');
const anotherVote = trackPollEngagement({
  event_type: 'vote_cast',
  poll_id: '12345',
  user_id: 'user_def',
  new_choice: 'option_3',
  timestamp: '2024-01-15T14:33:00Z',
  session_id: 'session_abc'
});
console.log(anotherVote);
console.log();

// Example 5: Track engagement on different poll
console.log('Example 5: User votes on different poll');
const differentPoll = trackPollEngagement({
  event_type: 'vote_cast',
  poll_id: '67890',
  user_id: 'user_abc',
  new_choice: 'option_1',
  timestamp: '2024-01-15T14:34:00Z',
  session_id: 'session_xyz'
});
console.log(differentPoll);
console.log();

// Example 6: Get all poll engagement events
console.log('Example 6: Retrieve all poll engagement events');
const allEvents = getPollEngagementEvents();
console.log(`Total events: ${allEvents.count}`);
console.log(allEvents);
console.log();

// Example 7: Filter by poll ID
console.log('Example 7: Get all events for poll 12345');
const poll12345Events = getPollEngagementEvents({ poll_id: '12345' });
console.log(`Events for poll 12345: ${poll12345Events.count}`);
console.log(poll12345Events);
console.log();

// Example 8: Filter by user ID
console.log('Example 8: Get all events for user_abc');
const userAbcEvents = getPollEngagementEvents({ user_id: 'user_abc' });
console.log(`Events for user_abc: ${userAbcEvents.count}`);
console.log(userAbcEvents);
console.log();

// Example 9: Filter by event type
console.log('Example 9: Get all vote_changed events');
const voteChangedEvents = getPollEngagementEvents({ event_type: 'vote_changed' });
console.log(`Vote changed events: ${voteChangedEvents.count}`);
console.log(voteChangedEvents);
console.log();

// Example 10: Filter with multiple criteria
console.log('Example 10: Get vote changes for user_abc on poll 12345');
const specificEvents = getPollEngagementEvents({
  poll_id: '12345',
  user_id: 'user_abc',
  event_type: 'vote_changed'
});
console.log(`Matching events: ${specificEvents.count}`);
console.log(specificEvents);
console.log();

// Example 11: Handle validation errors
console.log('Example 11: Error handling - missing required field');
const invalidPayload = trackPollEngagement({
  event_type: 'vote_cast',
  poll_id: '12345',
  user_id: 'user_xyz',
  timestamp: '2024-01-15T14:35:00Z'
  // Missing new_choice field
});
console.log(invalidPayload);
console.log();

// Example 12: Handle validation errors - invalid timestamp
console.log('Example 12: Error handling - invalid timestamp');
const invalidTimestamp = trackPollEngagement({
  event_type: 'vote_cast',
  poll_id: '12345',
  user_id: 'user_xyz',
  new_choice: 'option_1',
  timestamp: 'not-a-valid-timestamp'
});
console.log(invalidTimestamp);
console.log();

console.log('=== Benefits of This Approach ===');
console.log('1. Prevents memory leaks through proper event structure');
console.log('2. Uses Object.freeze to ensure immutability');
console.log('3. Validates all required fields before storing');
console.log('4. Supports session tracking for behavioral analytics');
console.log('5. Provides flexible filtering for engagement analysis');
console.log('6. Integrates seamlessly with existing event system');
