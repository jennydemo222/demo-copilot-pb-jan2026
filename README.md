# demo-copilot-pb-jan2026

A simple login function implementation in Node.js.

## Features

- User authentication with username and password
- Input validation
- Error handling
- Role-based user information

## Installation

No external dependencies required. Just Node.js.

## Usage

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

## Test Users

The following test users are available:

- **Username:** `admin`, **Password:** `admin123`, **Role:** administrator
- **Username:** `user`, **Password:** `user123`, **Role:** user
- **Username:** `demo`, **Password:** `demo123`, **Role:** user

## API

### `login(username, password)`

Authenticates a user with the provided credentials.

**Parameters:**
- `username` (string): The username to authenticate
- `password` (string): The password to verify

**Returns:**
- Object with the following structure:
  - On success: `{ success: true, user: { username, role }, message: 'Login successful' }`
  - On failure: `{ success: false, error: 'Error message' }`

## Examples

Run the example file to see the login function in action:

```bash
node example.js
```

## Testing

Run the test suite:

```bash
npm test
```

Or directly:

```bash
node test.js
```

## Security Note

This is a demonstration implementation. In a production environment:
- Never store passwords in plain text
- Use proper password hashing (bcrypt, argon2, etc.)
- Implement rate limiting
- Use secure session management
- Connect to a real database
- Add logging and monitoring