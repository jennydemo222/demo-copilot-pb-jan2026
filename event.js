/**
 * Event API Module
 * Provides functionality to create, store, and retrieve events
 * Includes audit event functionality for security tracking
 */

/**
 * Audit event type constants for security logging
 */
const AUDIT_EVENT_TYPES = {
  LOGIN_SUCCESS: 'audit.login.success',
  LOGIN_FAILURE: 'audit.login.failure',
  LOGIN_ATTEMPT: 'audit.login.attempt',
  LOGOUT: 'audit.logout',
  ACCESS_DENIED: 'audit.access.denied',
  PERMISSION_CHANGED: 'audit.permission.changed',
  USER_CREATED: 'audit.user.created',
  USER_DELETED: 'audit.user.deleted',
  USER_MODIFIED: 'audit.user.modified',
  PASSWORD_CHANGED: 'audit.password.changed',
  PASSWORD_RESET: 'audit.password.reset',
  SESSION_CREATED: 'audit.session.created',
  SESSION_EXPIRED: 'audit.session.expired',
  SUSPICIOUS_ACTIVITY: 'audit.security.suspicious',
  DATA_ACCESS: 'audit.data.access',
  DATA_MODIFIED: 'audit.data.modified',
  DATA_DELETED: 'audit.data.deleted'
};

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

/**
 * Creates an audit event for security tracking
 * @param {string} type - The audit event type (use AUDIT_EVENT_TYPES constants)
 * @param {string} message - Description of the audit event
 * @param {Object} metadata - Additional audit metadata (e.g., username, ip, action)
 * @returns {Object} Created audit event object with success status
 */
function createAuditEvent(type, message, metadata = {}) {
  // Enrich metadata with audit-specific fields
  const auditMetadata = {
    ...metadata,
    severity: metadata.severity || 'info',
    source: metadata.source || 'system',
    auditTimestamp: new Date().toISOString()
  };

  return createEvent(type, message, auditMetadata);
}

/**
 * Gets all audit events (events with type starting with 'audit.')
 * @param {string} auditType - Optional filter by specific audit type
 * @returns {Object} Array of audit events with success status
 */
function getAuditEvents(auditType = null) {
  let filteredEvents;
  
  if (auditType !== null) {
    if (typeof auditType !== 'string' || auditType.trim().length === 0) {
      return {
        success: false,
        error: 'Audit type must be a non-empty string when provided'
      };
    }
    // Filter by specific audit type
    filteredEvents = events.filter(e => e.type === auditType.trim());
  } else {
    // Get all audit events (those starting with 'audit.')
    filteredEvents = events.filter(e => e.type.startsWith('audit.'));
  }

  return {
    success: true,
    events: [...filteredEvents],
    count: filteredEvents.length
  };
}

/**
 * Gets count of audit events
 * @param {string} auditType - Optional filter by specific audit type
 * @returns {Object} Count with success status
 */
function getAuditEventCount(auditType = null) {
  const result = getAuditEvents(auditType);
  if (!result.success) {
    return result;
  }
  
  return {
    success: true,
    count: result.count,
    ...(auditType && { type: auditType.trim() })
  };
}

/**
 * Gets audit events within a specific time range
 * @param {Date|string} startTime - Start time for filtering (ISO string or Date object)
 * @param {Date|string} endTime - End time for filtering (ISO string or Date object)
 * @returns {Object} Array of audit events within time range
 */
function getAuditEventsByTimeRange(startTime, endTime) {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        success: false,
        error: 'Invalid time range provided'
      };
    }

    if (start > end) {
      return {
        success: false,
        error: 'Start time must be before end time'
      };
    }

    const auditEvents = events.filter(e => e.type.startsWith('audit.'));
    const filteredEvents = auditEvents.filter(e => {
      const eventTime = new Date(e.timestamp);
      return eventTime >= start && eventTime <= end;
    });

    return {
      success: true,
      events: [...filteredEvents],
      count: filteredEvents.length,
      timeRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error processing time range query'
    };
  }
}

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  clearEvents,
  getEventCount,
  AUDIT_EVENT_TYPES,
  createAuditEvent,
  getAuditEvents,
  getAuditEventCount,
  getAuditEventsByTimeRange
};
