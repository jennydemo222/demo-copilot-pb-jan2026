# demo-copilot-pb-jan2026

A simple login function implementation in Node.js with an Event API for logging and tracking events.

## Features

- User authentication with username and password
- Input validation
- Error handling
- Role-based user information
- **Event API** for creating and retrieving events
- Event filtering and counting capabilities

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
- `username` (string): The username to authenticate
- `password` (string): The password to verify

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, user: { username, role }, message: 'Login successful' }`
  - On failure: `{ success: false, error: 'Error message' }`

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

## Examples

Run the example file to see the login function and event API in action:

```bash
node example.js
```

## Testing

Run the test suite for both login and event APIs:

```bash
npm test
```

Or run tests individually:

```bash
node test.js        # Login tests
node event.test.js  # Event API tests
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