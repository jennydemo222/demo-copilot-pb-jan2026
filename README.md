# demo-copilot-pb-jan2026

A simple login function implementation in Node.js with an Event API for logging and tracking events.

## Features

- User authentication with username and password
- **Guest login flow** for quick access without credentials
- Comprehensive input validation
- Enhanced error handling with try-catch blocks
- Protection against common security issues (input length validation, special character filtering)
- Role-based user information
- **Event API** for creating and retrieving events
- Event filtering and counting capabilities
- **Poll Engagement Tracking** with memory leak prevention and granular analytics
- **Gamma Line Integration** - Order Management API for tracking orders, fulfillment, and cancellations

## Installation

No external dependencies required. Just Node.js.

## Usage

### Login API

```javascript
const { login, guestLogin } = require('./login');

// Attempt to login with credentials
const result = login('admin', 'admin123');

if (result.success) {
  console.log('Login successful!');
  console.log('User:', result.user.username);
  console.log('Role:', result.user.role);
} else {
  console.log('Login failed:', result.error);
}

// Login as a guest without credentials
const guestResult = guestLogin();

if (guestResult.success) {
  console.log('Guest login successful!');
  console.log('User:', guestResult.user.username);
  console.log('Role:', guestResult.user.role);
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

### Order Management API (Gamma Line Integration)

```javascript
const {
  createOrder,
  updateOrderStatus,
  cancelOrder,
  fulfillOrder,
  getOrderEvents
} = require('./order-management');

// Create a new order
const order = createOrder({
  order_id: 'ORD-12345',
  customer_id: 'CUST-789',
  items: [
    { product_id: 'PROD-1', quantity: 2, price: 29.99 },
    { product_id: 'PROD-2', quantity: 1, price: 49.99 }
  ],
  total_amount: 109.97
});

// Update order status
const update = updateOrderStatus('ORD-12345', 'processing', {
  warehouse_location: 'Warehouse-B'
});

// Fulfill an order
const fulfillment = fulfillOrder('ORD-12345', {
  tracking_number: 'TRACK-123',
  carrier: 'UPS'
});

// Cancel an order
const cancellation = cancelOrder('ORD-12345', 'Customer requested');

// Get all order events
const allOrders = getOrderEvents();

// Filter by order ID
const orderEvents = getOrderEvents({ order_id: 'ORD-12345' });

// Filter by customer
const customerOrders = getOrderEvents({ customer_id: 'CUST-789' });

// Filter by status
const processingOrders = getOrderEvents({ status: 'processing' });
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

#### `guestLogin()`

Authenticates a guest user without requiring credentials. Generates a unique guest username automatically.

**Parameters:**
- None

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, user: { username, role }, message: 'Guest login successful' }`
  - On failure: `{ success: false, error: 'Error message' }`

**Features:**
- No credentials required
- Automatically generates unique guest username (format: `guest_<timestamp>_<random>`)
- Assigns 'guest' role to user
- Consistent response structure with regular login

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

### Order Management API (Gamma Line Integration)

#### `createOrder(orderData)`

Creates a new order and tracks the event.

**Parameters:**
- `orderData` (object): The order information with the following fields:
  - `order_id` (string, required): Unique order identifier
  - `customer_id` (string, required): Customer identifier
  - `items` (array, required): Array of order items (must be non-empty)
  - `total_amount` (number, required): Total order amount (must be non-negative)
  - `status` (string, optional): Order status - one of: 'pending' (default), 'processing', 'fulfilled', 'cancelled'

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, order: { id, type, message, metadata, timestamp }, message: 'Order created successfully' }`
  - On failure: `{ success: false, error: 'Error message' }`

**Example:**
```javascript
const order = createOrder({
  order_id: 'ORD-12345',
  customer_id: 'CUST-789',
  items: [
    { product_id: 'PROD-1', quantity: 2, price: 29.99 }
  ],
  total_amount: 59.98
});
```

#### `updateOrderStatus(orderId, newStatus, additionalData)`

Updates an existing order status.

**Parameters:**
- `orderId` (string, required): The order ID to update
- `newStatus` (string, required): New status - one of: 'pending', 'processing', 'fulfilled', 'cancelled'
- `additionalData` (object, optional): Additional data for the update

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, order: { id, type, message, metadata, timestamp }, message: 'Order status updated successfully' }`
  - On failure: `{ success: false, error: 'Error message' }`

**Example:**
```javascript
const update = updateOrderStatus('ORD-12345', 'processing', {
  warehouse_location: 'Warehouse-B',
  estimated_ship_date: '2024-01-22'
});
```

#### `cancelOrder(orderId, reason)`

Cancels an order.

**Parameters:**
- `orderId` (string, required): The order ID to cancel
- `reason` (string, optional): Reason for cancellation

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, order: { id, type, message, metadata, timestamp }, message: 'Order cancelled successfully' }`
  - On failure: `{ success: false, error: 'Error message' }`

**Example:**
```javascript
const cancellation = cancelOrder('ORD-12345', 'Customer requested cancellation');
```

#### `fulfillOrder(orderId, fulfillmentData)`

Marks an order as fulfilled.

**Parameters:**
- `orderId` (string, required): The order ID to fulfill
- `fulfillmentData` (object, optional): Fulfillment details (e.g., tracking number, carrier)

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, order: { id, type, message, metadata, timestamp }, message: 'Order fulfilled successfully' }`
  - On failure: `{ success: false, error: 'Error message' }`

**Example:**
```javascript
const fulfillment = fulfillOrder('ORD-12345', {
  tracking_number: 'TRACK-123',
  carrier: 'UPS',
  estimated_delivery: '2024-01-25'
});
```

#### `getOrderEvents(filters)`

Retrieves order events, optionally filtered by order_id, customer_id, or status.

**Parameters:**
- `filters` (object, optional): Optional filters with the following fields:
  - `order_id` (string): Filter by order ID
  - `customer_id` (string): Filter by customer ID
  - `status` (string): Filter by order status

**Returns:**
- Object with the following structure:
  - `{ success: true, events: [...], count: number }`

**Example:**
```javascript
// Get all order events
const allOrders = getOrderEvents();

// Filter by order ID
const orderEvents = getOrderEvents({ order_id: 'ORD-12345' });

// Filter by customer
const customerOrders = getOrderEvents({ customer_id: 'CUST-789' });

// Filter by status
const processingOrders = getOrderEvents({ status: 'processing' });
```

## Examples

Run the example files to see the APIs in action:

```bash
node example.js                    # Login and event API examples
node poll-engagement-example.js    # Poll engagement tracking examples
node order-management-example.js   # Order management (Gamma Line) examples
```

## Testing

Run the test suite for all APIs:

```bash
npm test                            # Login and event API tests
node poll-engagement.test.js        # Poll engagement tracking tests
node order-management.test.js       # Order management (Gamma Line) tests
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