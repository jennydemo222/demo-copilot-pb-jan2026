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
    metadata: JSON.parse(JSON.stringify(metadata)),
    timestamp: new Date().toISOString()
  };

  // Store the event
  events.push(event);

  return {
    success: true,
    event: JSON.parse(JSON.stringify(event)),
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
    events: JSON.parse(JSON.stringify(filteredEvents)),
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
    event: JSON.parse(JSON.stringify(event))
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

/**
 * Tracks poll engagement events with granular data
 * Prevents memory leaks by properly structuring event data
 * 
 * @param {Object} payload - The poll engagement payload
 * @param {string} payload.event_type - Type of engagement (e.g., 'vote_changed', 'vote_cast', 'vote_removed')
 * @param {string} payload.poll_id - Unique identifier for the poll
 * @param {string} payload.user_id - User identifier
 * @param {string} payload.previous_choice - Previous choice (optional for new votes)
 * @param {string} payload.new_choice - New choice selected
 * @param {string} payload.timestamp - ISO timestamp of the event
 * @param {string} payload.session_id - Session identifier for tracking user behavior (optional)
 * @returns {Object} Result with success status and event details
 */
function trackPollEngagement(payload) {
  // Validate required fields
  if (!payload || typeof payload !== 'object') {
    return {
      success: false,
      error: 'Payload must be an object'
    };
  }

  const requiredFields = ['event_type', 'poll_id', 'user_id', 'new_choice', 'timestamp'];
  for (const field of requiredFields) {
    if (!payload[field] || typeof payload[field] !== 'string' || payload[field].trim().length === 0) {
      return {
        success: false,
        error: `${field} is required and must be a non-empty string`
      };
    }
  }

  // Validate timestamp format (after trimming)
  const timestamp = new Date(payload.timestamp.trim());
  if (isNaN(timestamp.getTime())) {
    return {
      success: false,
      error: 'Invalid timestamp format'
    };
  }

  // Create properly structured event data to prevent memory leaks
  // Using JSON deep cloning ensures complete immutability
  const engagementData = {
    event_type: payload.event_type.trim(),
    poll_id: payload.poll_id.trim(),
    user_id: payload.user_id.trim(),
    previous_choice: payload.previous_choice ? payload.previous_choice.trim() : null,
    new_choice: payload.new_choice.trim(),
    timestamp: payload.timestamp.trim(),
    session_id: payload.session_id ? payload.session_id.trim() : null
  };

  // Use the existing createEvent function with properly structured data
  const result = createEvent(
    'poll_engagement',
    `Poll engagement: ${engagementData.event_type}`,
    engagementData
  );

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    event: result.event,
    message: 'Poll engagement tracked successfully'
  };
}

/**
 * Retrieves poll engagement events, optionally filtered by poll_id or user_id
 * @param {Object} filters - Optional filters
 * @param {string} filters.poll_id - Filter by poll ID
 * @param {string} filters.user_id - Filter by user ID
 * @param {string} filters.event_type - Filter by engagement type
 * @returns {Object} Array of poll engagement events with success status
 */
function getPollEngagementEvents(filters = {}) {
  // Get all poll engagement events
  const pollEvents = events.filter(e => e.type === 'poll_engagement');

  let filteredEvents = pollEvents;

  // Apply filters if provided
  if (filters.poll_id) {
    filteredEvents = filteredEvents.filter(e => 
      e.metadata && e.metadata.poll_id === filters.poll_id
    );
  }

  if (filters.user_id) {
    filteredEvents = filteredEvents.filter(e => 
      e.metadata && e.metadata.user_id === filters.user_id
    );
  }

  if (filters.event_type) {
    filteredEvents = filteredEvents.filter(e => 
      e.metadata && e.metadata.event_type === filters.event_type
    );
  }

  return {
    success: true,
    events: JSON.parse(JSON.stringify(filteredEvents)),
    count: filteredEvents.length
  };
}

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  clearEvents,
  getEventCount,
  trackPollEngagement,
  getPollEngagementEvents
};
