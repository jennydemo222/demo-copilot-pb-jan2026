# demo-copilot-pb-jan2026

A simple login function implementation in Node.js with an Event API for logging and tracking events.

## Features

- User authentication with username and password
- Comprehensive input validation
- Enhanced error handling with try-catch blocks
- Protection against common security issues (input length validation, special character filtering)
- Role-based user information
- **Event API** for creating and retrieving events
- Event filtering and counting capabilities
- **Poll Engagement Tracking** with memory leak prevention and granular analytics

## Installation

No external dependencies required. Just Node.js.

## Usage

### Login API

```javascript
const { login } = require('./login');

// Attempt to login with credentials
const result = login('admin', 'admin123');

if (result.success) {
  console.log('Login successful!');
  console.log('User:', result.user.username);
  console.log('Role:', result.user.role);
} else {
  console.log('Login failed:', result.error);
}
```

### Event API

```javascript
const { createEvent, getEvents, getEventById, getEventCount } = require('./event');

// Create an event
const result = createEvent('login', 'User logged in', { userId: 123 });
console.log(result.event);

// Get all events
const allEvents = getEvents();
console.log(`Total events: ${allEvents.count}`);

// Get events filtered by type
const loginEvents = getEvents('login');
console.log(`Login events: ${loginEvents.count}`);

// Get a specific event by ID
const event = getEventById(1);
console.log(event.event);

// Get event count
const count = getEventCount();
console.log(`Total events: ${count.count}`);

// Get event count by type
const loginCount = getEventCount('login');
console.log(`Login events: ${loginCount.count}`);
```

### Poll Engagement Tracking API

```javascript
const { trackPollEngagement, getPollEngagementEvents } = require('./event');

// Track a user voting on a poll
const voteResult = trackPollEngagement({
  event_type: 'vote_cast',
  poll_id: '12345',
  user_id: 'user_abc',
  new_choice: 'option_1',
  timestamp: '2024-01-15T14:30:00Z',
  session_id: 'session_xyz'  // Optional: for behavioral analytics
});

// Track a user changing their vote
const changeResult = trackPollEngagement({
  event_type: 'vote_changed',
  poll_id: '12345',
  user_id: 'user_abc',
  previous_choice: 'option_1',
  new_choice: 'option_2',
  timestamp: '2024-01-15T14:31:00Z',
  session_id: 'session_xyz'
});

// Get all poll engagement events
const allEngagement = getPollEngagementEvents();
console.log(`Total engagement events: ${allEngagement.count}`);

// Filter by poll ID
const pollEvents = getPollEngagementEvents({ poll_id: '12345' });

// Filter by user ID
const userEvents = getPollEngagementEvents({ user_id: 'user_abc' });

// Filter by event type
const voteChanges = getPollEngagementEvents({ event_type: 'vote_changed' });

// Filter with multiple criteria
const specificEvents = getPollEngagementEvents({
  poll_id: '12345',
  user_id: 'user_abc',
  event_type: 'vote_changed'
});
```

## Test Users

The following test users are available:

- **Username:** `admin`, **Password:** `admin123`, **Role:** administrator
- **Username:** `user`, **Password:** `user123`, **Role:** user
- **Username:** `demo`, **Password:** `demo123`, **Role:** user

## API

### Login API

#### `login(username, password)`

Authenticates a user with the provided credentials.

**Parameters:**
- `username` (string): The username to authenticate (max 255 characters, alphanumeric with dots, hyphens, and underscores)
- `password` (string): The password to verify (max 255 characters)

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, user: { username, role }, message: 'Login successful' }`
  - On failure: `{ success: false, error: 'Error message' }`

**Error Handling:**
The login function includes comprehensive error handling for:
- Undefined, null, or non-string parameters
- Empty username or password (after trimming whitespace)
- Username or password exceeding 255 characters
- Username containing invalid characters (only letters, numbers, dots, hyphens, and underscores are allowed)
- Invalid credentials (user not found or incorrect password)
- Unexpected runtime errors (caught and returned safely)

### Event API

#### `createEvent(type, message, metadata)`

Creates a new event and stores it.

**Parameters:**
- `type` (string): The type of event (e.g., 'login', 'logout', 'error')
- `message` (string): Description of the event
- `metadata` (object, optional): Additional metadata for the event

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, event: { id, type, message, metadata, timestamp }, message: 'Event created successfully' }`
  - On failure: `{ success: false, error: 'Error message' }`

#### `getEvents(type)`

Retrieves all events or filters by type.

**Parameters:**
- `type` (string, optional): Filter events by type

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, events: [...], count: number }`
  - On failure: `{ success: false, error: 'Error message' }`

#### `getEventById(id)`

Retrieves a specific event by ID.

**Parameters:**
- `id` (number): The event ID

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, event: { id, type, message, metadata, timestamp } }`
  - On failure: `{ success: false, error: 'Error message' }`

#### `getEventCount(type)`

Gets count of events, optionally filtered by type.

**Parameters:**
- `type` (string, optional): Filter count by event type

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, count: number, type?: string }`
  - On failure: `{ success: false, error: 'Error message' }`

#### `clearEvents()`

Clears all events from storage (useful for testing).

**Returns:**
- Object with the following structure:
  - `{ success: true, message: 'Cleared N event(s)', count: number }`

### Poll Engagement Tracking API

#### `trackPollEngagement(payload)`

Tracks poll engagement events with granular data. Prevents memory leaks through proper event structuring and immutability.

**Parameters:**
- `payload` (object): The poll engagement payload with the following fields:
  - `event_type` (string, required): Type of engagement (e.g., 'vote_cast', 'vote_changed', 'vote_removed')
  - `poll_id` (string, required): Unique identifier for the poll
  - `user_id` (string, required): User identifier
  - `new_choice` (string, required): New choice selected
  - `timestamp` (string, required): ISO 8601 timestamp of the event
  - `previous_choice` (string, optional): Previous choice (for vote changes)
  - `session_id` (string, optional): Session identifier for behavioral analytics

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, event: { id, type, message, metadata, timestamp }, message: 'Poll engagement tracked successfully' }`
  - On failure: `{ success: false, error: 'Error message' }`

**Example:**
```javascript
const result = trackPollEngagement({
  event_type: 'vote_changed',
  poll_id: '12345',
  user_id: 'user_abc',
  previous_choice: 'option_1',
  new_choice: 'option_2',
  timestamp: '2024-01-15T14:30:00Z',
  session_id: 'session_xyz'
});
```

#### `getPollEngagementEvents(filters)`

Retrieves poll engagement events with optional filtering.

**Parameters:**
- `filters` (object, optional): Optional filters with the following fields:
  - `poll_id` (string): Filter by poll ID
  - `user_id` (string): Filter by user ID
  - `event_type` (string): Filter by engagement type

**Returns:**
- Object with the following structure:
  - `{ success: true, events: [...], count: number }`

**Example:**
```javascript
// Get all events for a specific poll
const pollEvents = getPollEngagementEvents({ poll_id: '12345' });

// Get all events for a specific user
const userEvents = getPollEngagementEvents({ user_id: 'user_abc' });

// Combine multiple filters
const specificEvents = getPollEngagementEvents({
  poll_id: '12345',
  user_id: 'user_abc',
  event_type: 'vote_changed'
});
```

## Examples

Run the example files to see the APIs in action:

```bash
node example.js                    # Login and event API examples
node poll-engagement-example.js    # Poll engagement tracking examples
```

## Testing

Run the test suite for all APIs:

```bash
npm test                        # Login and event API tests
node poll-engagement.test.js    # Poll engagement tracking tests
```

Or run tests individually:

```bash
node test.js                # Login tests
node event.test.js          # Event API tests
node poll-engagement.test.js # Poll engagement tests
```

## Security Note

This is a demonstration implementation. In a production environment:
- Never store passwords in plain text
- Use proper password hashing (bcrypt, argon2, etc.)
- Implement rate limiting
- Use secure session management
- Connect to a real database
- Add logging and monitoring
- Store events in a persistent database instead of in-memory storage