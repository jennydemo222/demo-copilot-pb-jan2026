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
  try {
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

    // Deep clone metadata to prevent mutation and ensure serializability
    let clonedMetadata;
    try {
      clonedMetadata = JSON.parse(JSON.stringify(metadata));
    } catch (err) {
      return {
        success: false,
        error: 'Metadata contains non-serializable data (e.g., circular references, functions)'
      };
    }

    // Create the event
    const event = {
      id: eventIdCounter++,
      type: type.trim(),
      message: message.trim(),
      metadata: clonedMetadata,
      timestamp: new Date().toISOString()
    };

    // Store the event
    events.push(event);

    // Return a deep clone to prevent external mutation
    try {
      return {
        success: true,
        event: JSON.parse(JSON.stringify(event)),
        message: 'Event created successfully'
      };
    } catch (err) {
      return {
        success: false,
        error: 'Failed to serialize event data'
      };
    }
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error in createEvent:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while creating the event'
    };
  }
}

/**
 * Retrieves all events or filters by type
 * @param {string} type - Optional filter by event type
 * @returns {Object} Array of events with success status
 */
function getEvents(type = null) {
  try {
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

    // Deep clone to prevent external mutation
    try {
      return {
        success: true,
        events: JSON.parse(JSON.stringify(filteredEvents)),
        count: filteredEvents.length
      };
    } catch (err) {
      return {
        success: false,
        error: 'Failed to serialize events data'
      };
    }
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error in getEvents:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while retrieving events'
    };
  }
}

/**
 * Retrieves a specific event by ID
 * @param {number} id - The event ID
 * @returns {Object} Event object with success status
 */
function getEventById(id) {
  try {
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

    // Deep clone to prevent external mutation
    try {
      return {
        success: true,
        event: JSON.parse(JSON.stringify(event))
      };
    } catch (err) {
      return {
        success: false,
        error: 'Failed to serialize event data'
      };
    }
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error in getEventById:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while retrieving the event'
    };
  }
}

/**
 * Clears all events from storage
 * Useful for testing purposes
 * @returns {Object} Success status
 */
function clearEvents() {
  try {
    const count = events.length;
    events.length = 0;
    eventIdCounter = 1;

    return {
      success: true,
      message: `Cleared ${count} event(s)`,
      count: count
    };
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error in clearEvents:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while clearing events'
    };
  }
}

/**
 * Gets count of events, optionally filtered by type
 * @param {string} type - Optional filter by event type
 * @returns {Object} Count with success status
 */
function getEventCount(type = null) {
  try {
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
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error in getEventCount:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while counting events'
    };
  }
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
  try {
    // Validate required fields
    if (!payload || typeof payload !== 'object') {
      return {
        success: false,
        error: 'Payload must be an object'
      };
    }

    // Check for array (arrays are technically objects in JavaScript)
    if (Array.isArray(payload)) {
      return {
        success: false,
        error: 'Payload must be an object, not an array'
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

    // Validate optional fields if provided
    if (payload.previous_choice !== undefined && payload.previous_choice !== null) {
      if (typeof payload.previous_choice !== 'string') {
        return {
          success: false,
          error: 'previous_choice must be a string when provided'
        };
      }
    }

    if (payload.session_id !== undefined && payload.session_id !== null) {
      if (typeof payload.session_id !== 'string') {
        return {
          success: false,
          error: 'session_id must be a string when provided'
        };
      }
    }

    // Validate timestamp format (after trimming)
    const timestamp = new Date(payload.timestamp.trim());
    if (isNaN(timestamp.getTime())) {
      return {
        success: false,
        error: 'Invalid timestamp format. Must be a valid ISO 8601 date string'
      };
    }

    // Validate event_type has reasonable length
    if (payload.event_type.trim().length > 100) {
      return {
        success: false,
        error: 'event_type is too long (maximum 100 characters)'
      };
    }

    // Validate poll_id and user_id have reasonable lengths
    if (payload.poll_id.trim().length > 255) {
      return {
        success: false,
        error: 'poll_id is too long (maximum 255 characters)'
      };
    }

    if (payload.user_id.trim().length > 255) {
      return {
        success: false,
        error: 'user_id is too long (maximum 255 characters)'
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
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error in trackPollEngagement:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while tracking poll engagement'
    };
  }
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
  try {
    // Validate filters parameter
    if (filters !== null && filters !== undefined) {
      if (typeof filters !== 'object' || Array.isArray(filters)) {
        return {
          success: false,
          error: 'Filters must be an object'
        };
      }

      // Validate filter values if provided
      if (filters.poll_id !== undefined && filters.poll_id !== null) {
        if (typeof filters.poll_id !== 'string' || filters.poll_id.trim().length === 0) {
          return {
            success: false,
            error: 'poll_id filter must be a non-empty string when provided'
          };
        }
      }

      if (filters.user_id !== undefined && filters.user_id !== null) {
        if (typeof filters.user_id !== 'string' || filters.user_id.trim().length === 0) {
          return {
            success: false,
            error: 'user_id filter must be a non-empty string when provided'
          };
        }
      }

      if (filters.event_type !== undefined && filters.event_type !== null) {
        if (typeof filters.event_type !== 'string' || filters.event_type.trim().length === 0) {
          return {
            success: false,
            error: 'event_type filter must be a non-empty string when provided'
          };
        }
      }
    }

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

    // Deep clone to prevent external mutation
    try {
      return {
        success: true,
        events: JSON.parse(JSON.stringify(filteredEvents)),
        count: filteredEvents.length
      };
    } catch (err) {
      return {
        success: false,
        error: 'Failed to serialize poll engagement events'
      };
    }
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error in getPollEngagementEvents:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while retrieving poll engagement events'
    };
  }
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
