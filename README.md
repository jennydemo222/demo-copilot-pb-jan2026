# demo-copilot-pb-jan2026

A simple login function implementation in Node.js with an Event API for logging and tracking events.

## Features

- User authentication with username and password
- Comprehensive input validation
- Enhanced error handling with try-catch blocks
- Protection against common security issues (input length validation, special character filtering)
- Role-based user information
- **Event API** for creating and retrieving events
- **Audit Event API** for security logging and tracking
- Event filtering and counting capabilities
- Automatic audit logging for login attempts and security events

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

### Audit Event API

```javascript
const { 
  createAuditEvent, 
  getAuditEvents, 
  getAuditEventCount,
  getAuditEventsByTimeRange,
  AUDIT_EVENT_TYPES 
} = require('./event');

// Create an audit event for security tracking
const auditResult = createAuditEvent(
  AUDIT_EVENT_TYPES.LOGIN_SUCCESS,
  'User logged in successfully',
  { 
    username: 'admin', 
    role: 'administrator',
    ipAddress: '192.168.1.1'
  }
);
console.log(auditResult.event);

// Get all audit events
const auditEvents = getAuditEvents();
console.log(`Total audit events: ${auditEvents.count}`);

// Get audit events by specific type
const loginSuccessEvents = getAuditEvents(AUDIT_EVENT_TYPES.LOGIN_SUCCESS);
console.log(`Successful login events: ${loginSuccessEvents.count}`);

// Get audit event count
const auditCount = getAuditEventCount();
console.log(`Total audit events: ${auditCount.count}`);

// Get audit events within a time range
const startTime = new Date('2026-01-01');
const endTime = new Date();
const timeRangeEvents = getAuditEventsByTimeRange(startTime, endTime);
console.log(`Audit events in range: ${timeRangeEvents.count}`);
```

**Note:** The login function automatically creates audit events for all login attempts, including:
- Successful logins (`AUDIT_EVENT_TYPES.LOGIN_SUCCESS`)
- Failed logins (`AUDIT_EVENT_TYPES.LOGIN_FAILURE`)
- Suspicious activities (`AUDIT_EVENT_TYPES.SUSPICIOUS_ACTIVITY`)
- Login attempts (`AUDIT_EVENT_TYPES.LOGIN_ATTEMPT`)

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

### Audit Event API

The Audit Event API provides specialized functionality for security event logging and tracking. All audit events are automatically enriched with security-relevant metadata.

#### Audit Event Type Constants

The following constants are available via `AUDIT_EVENT_TYPES`:

- `LOGIN_SUCCESS` - Successful user login
- `LOGIN_FAILURE` - Failed login attempt
- `LOGIN_ATTEMPT` - Login attempt initiated
- `LOGOUT` - User logout
- `ACCESS_DENIED` - Access denied to a resource
- `PERMISSION_CHANGED` - User permissions modified
- `USER_CREATED` - New user account created
- `USER_DELETED` - User account deleted
- `USER_MODIFIED` - User account modified
- `PASSWORD_CHANGED` - Password changed
- `PASSWORD_RESET` - Password reset
- `SESSION_CREATED` - New session created
- `SESSION_EXPIRED` - Session expired
- `SUSPICIOUS_ACTIVITY` - Suspicious security activity detected
- `DATA_ACCESS` - Data accessed
- `DATA_MODIFIED` - Data modified
- `DATA_DELETED` - Data deleted

#### `createAuditEvent(type, message, metadata)`

Creates an audit event specifically for security tracking. Automatically enriches the event with audit-specific metadata.

**Parameters:**
- `type` (string): The audit event type (use `AUDIT_EVENT_TYPES` constants)
- `message` (string): Description of the audit event
- `metadata` (object, optional): Additional metadata (automatically enriched with `severity`, `source`, and `auditTimestamp`)

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, event: { id, type, message, metadata, timestamp }, message: 'Event created successfully' }`
  - On failure: `{ success: false, error: 'Error message' }`

**Example:**
```javascript
const result = createAuditEvent(
  AUDIT_EVENT_TYPES.ACCESS_DENIED,
  'User attempted to access restricted resource',
  { 
    username: 'john', 
    resource: '/admin/panel',
    severity: 'warning'
  }
);
```

#### `getAuditEvents(auditType)`

Retrieves all audit events (events with type starting with 'audit.') or filters by specific audit type.

**Parameters:**
- `auditType` (string, optional): Filter by specific audit event type

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, events: [...], count: number }`
  - On failure: `{ success: false, error: 'Error message' }`

#### `getAuditEventCount(auditType)`

Gets count of audit events, optionally filtered by type.

**Parameters:**
- `auditType` (string, optional): Filter count by specific audit event type

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, count: number, type?: string }`
  - On failure: `{ success: false, error: 'Error message' }`

#### `getAuditEventsByTimeRange(startTime, endTime)`

Retrieves audit events within a specific time range.

**Parameters:**
- `startTime` (Date|string): Start time for filtering (ISO string or Date object)
- `endTime` (Date|string): End time for filtering (ISO string or Date object)

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, events: [...], count: number, timeRange: { start, end } }`
  - On failure: `{ success: false, error: 'Error message' }`

**Example:**
```javascript
const startTime = new Date('2026-01-01');
const endTime = new Date();
const result = getAuditEventsByTimeRange(startTime, endTime);
console.log(`Found ${result.count} audit events in the specified time range`);
```

#### Automatic Audit Logging

The login function automatically creates audit events for:
- **Login attempts** - Every login attempt is logged
- **Successful logins** - Records username and role
- **Failed logins** - Records failure reason (user not found, incorrect password, etc.)
- **Suspicious activities** - Logs suspicious behavior such as:
  - Invalid characters in username
  - Excessively long username or password (potential DOS attack)
  - Unexpected errors during login

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
node audit.test.js  # Audit event tests
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