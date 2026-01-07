/**
 * Event API Module
 * Provides functionality to create, store, and retrieve events
 */

/**
 * In-memory event storage for demonstration purposes
 * In a real application, this would be replaced with database storage
 */
const events = [];
let eventIdCounter = 1;

/**
 * Creates a new event
 * @param {string} type - The type of event (e.g., 'login', 'logout', 'error')
 * @param {string} message - Description of the event
 * @param {Object} metadata - Additional metadata for the event (optional)
 * @returns {Object} Created event object with success status
 */
function createEvent(type, message, metadata = {}) {
  // Validate input parameters
  if (typeof type !== 'string' || type.trim().length === 0) {
    return {
      success: false,
      error: 'Event type is required and must be a non-empty string'
    };
  }

  if (typeof message !== 'string' || message.trim().length === 0) {
    return {
      success: false,
      error: 'Event message is required and must be a non-empty string'
    };
  }

  if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
    return {
      success: false,
      error: 'Metadata must be an object'
    };
  }

  // Create the event
  const event = {
    id: eventIdCounter++,
    type: type.trim(),
    message: message.trim(),
    metadata: { ...metadata },
    timestamp: new Date().toISOString()
  };

  // Store the event
  events.push(event);

  return {
    success: true,
    event: event,
    message: 'Event created successfully'
  };
}

/**
 * Retrieves all events or filters by type
 * @param {string} type - Optional filter by event type
 * @returns {Object} Array of events with success status
 */
function getEvents(type = null) {
  let filteredEvents = events;

  // Filter by type if provided
  if (type !== null) {
    if (typeof type !== 'string' || type.trim().length === 0) {
      return {
        success: false,
        error: 'Event type must be a non-empty string when provided'
      };
    }
    filteredEvents = events.filter(e => e.type === type.trim());
  }

  return {
    success: true,
    events: [...filteredEvents],
    count: filteredEvents.length
  };
}

/**
 * Retrieves a specific event by ID
 * @param {number} id - The event ID
 * @returns {Object} Event object with success status
 */
function getEventById(id) {
  if (typeof id !== 'number' || id <= 0 || !Number.isInteger(id)) {
    return {
      success: false,
      error: 'Event ID must be a positive integer'
    };
  }

  const event = events.find(e => e.id === id);

  if (!event) {
    return {
      success: false,
      error: `Event with ID ${id} not found`
    };
  }

  return {
    success: true,
    event: { ...event }
  };
}

/**
 * Clears all events from storage
 * Useful for testing purposes
 * @returns {Object} Success status
 */
function clearEvents() {
  const count = events.length;
  events.length = 0;
  eventIdCounter = 1;

  return {
    success: true,
    message: `Cleared ${count} event(s)`,
    count: count
  };
}

/**
 * Gets count of events, optionally filtered by type
 * @param {string} type - Optional filter by event type
 * @returns {Object} Count with success status
 */
function getEventCount(type = null) {
  if (type !== null) {
    if (typeof type !== 'string' || type.trim().length === 0) {
      return {
        success: false,
        error: 'Event type must be a non-empty string when provided'
      };
    }
    const count = events.filter(e => e.type === type.trim()).length;
    return {
      success: true,
      count: count,
      type: type.trim()
    };
  }

  return {
    success: true,
    count: events.length
  };
}

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  clearEvents,
  getEventCount
};
