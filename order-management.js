/**
 * Order Management Module - Gamma Line Integration
 * Provides functionality to track and manage orders for the order management team
 */

const { createEvent, getEvents } = require('./event');

/**
 * Creates a new order and tracks the event
 * @param {Object} orderData - The order information
 * @param {string} orderData.order_id - Unique order identifier
 * @param {string} orderData.customer_id - Customer identifier
 * @param {Array} orderData.items - Array of order items
 * @param {number} orderData.total_amount - Total order amount
 * @param {string} orderData.status - Order status (pending, processing, fulfilled, cancelled)
 * @returns {Object} Result with success status and order details
 */
function createOrder(orderData) {
  try {
    // Validate required fields
    if (!orderData || typeof orderData !== 'object') {
      return {
        success: false,
        error: 'Order data must be an object'
      };
    }

    if (Array.isArray(orderData)) {
      return {
        success: false,
        error: 'Order data must be an object, not an array'
      };
    }

    const requiredFields = ['order_id', 'customer_id', 'items', 'total_amount'];
    for (const field of requiredFields) {
      if (orderData[field] === undefined || orderData[field] === null) {
        return {
          success: false,
          error: `${field} is required`
        };
      }
    }

    // Validate field types
    if (typeof orderData.order_id !== 'string' || orderData.order_id.trim().length === 0) {
      return {
        success: false,
        error: 'order_id must be a non-empty string'
      };
    }

    if (typeof orderData.customer_id !== 'string' || orderData.customer_id.trim().length === 0) {
      return {
        success: false,
        error: 'customer_id must be a non-empty string'
      };
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return {
        success: false,
        error: 'items must be a non-empty array'
      };
    }

    if (typeof orderData.total_amount !== 'number' || orderData.total_amount < 0) {
      return {
        success: false,
        error: 'total_amount must be a non-negative number'
      };
    }

    // Validate status if provided, otherwise default to 'pending'
    const validStatuses = ['pending', 'processing', 'fulfilled', 'cancelled'];
    const status = orderData.status || 'pending';
    
    if (typeof status !== 'string' || !validStatuses.includes(status)) {
      return {
        success: false,
        error: `status must be one of: ${validStatuses.join(', ')}`
      };
    }

    // Create order metadata
    const metadata = {
      order_id: orderData.order_id.trim(),
      customer_id: orderData.customer_id.trim(),
      items: orderData.items,
      total_amount: orderData.total_amount,
      status: status,
      created_at: new Date().toISOString()
    };

    // Track the order creation event
    const result = createEvent(
      'order_created',
      `Order created: ${metadata.order_id}`,
      metadata
    );

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      order: result.event,
      message: 'Order created successfully'
    };
  } catch (error) {
    console.error('Unexpected error in createOrder:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while creating the order'
    };
  }
}

/**
 * Updates an existing order status
 * @param {string} orderId - The order ID to update
 * @param {string} newStatus - New status (processing, fulfilled, cancelled)
 * @param {Object} additionalData - Additional data for the update (optional)
 * @returns {Object} Result with success status and updated order details
 */
function updateOrderStatus(orderId, newStatus, additionalData = {}) {
  try {
    // Validate inputs
    if (typeof orderId !== 'string' || orderId.trim().length === 0) {
      return {
        success: false,
        error: 'orderId must be a non-empty string'
      };
    }

    const validStatuses = ['pending', 'processing', 'fulfilled', 'cancelled'];
    if (typeof newStatus !== 'string' || !validStatuses.includes(newStatus)) {
      return {
        success: false,
        error: `newStatus must be one of: ${validStatuses.join(', ')}`
      };
    }

    if (typeof additionalData !== 'object' || additionalData === null || Array.isArray(additionalData)) {
      return {
        success: false,
        error: 'additionalData must be an object'
      };
    }

    // Create update metadata
    const metadata = {
      order_id: orderId.trim(),
      new_status: newStatus,
      updated_at: new Date().toISOString(),
      ...additionalData
    };

    // Track the order update event
    const result = createEvent(
      'order_updated',
      `Order status updated: ${metadata.order_id} -> ${newStatus}`,
      metadata
    );

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      order: result.event,
      message: 'Order status updated successfully'
    };
  } catch (error) {
    console.error('Unexpected error in updateOrderStatus:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the order'
    };
  }
}

/**
 * Cancels an order
 * @param {string} orderId - The order ID to cancel
 * @param {string} reason - Reason for cancellation
 * @returns {Object} Result with success status
 */
function cancelOrder(orderId, reason = '') {
  try {
    // Validate inputs
    if (typeof orderId !== 'string' || orderId.trim().length === 0) {
      return {
        success: false,
        error: 'orderId must be a non-empty string'
      };
    }

    if (typeof reason !== 'string') {
      return {
        success: false,
        error: 'reason must be a string'
      };
    }

    // Create cancellation metadata
    const metadata = {
      order_id: orderId.trim(),
      reason: reason.trim(),
      cancelled_at: new Date().toISOString()
    };

    // Track the order cancellation event
    const result = createEvent(
      'order_cancelled',
      `Order cancelled: ${metadata.order_id}`,
      metadata
    );

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      order: result.event,
      message: 'Order cancelled successfully'
    };
  } catch (error) {
    console.error('Unexpected error in cancelOrder:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while cancelling the order'
    };
  }
}

/**
 * Marks an order as fulfilled
 * @param {string} orderId - The order ID to fulfill
 * @param {Object} fulfillmentData - Fulfillment details (optional)
 * @returns {Object} Result with success status
 */
function fulfillOrder(orderId, fulfillmentData = {}) {
  try {
    // Validate inputs
    if (typeof orderId !== 'string' || orderId.trim().length === 0) {
      return {
        success: false,
        error: 'orderId must be a non-empty string'
      };
    }

    if (typeof fulfillmentData !== 'object' || fulfillmentData === null || Array.isArray(fulfillmentData)) {
      return {
        success: false,
        error: 'fulfillmentData must be an object'
      };
    }

    // Create fulfillment metadata
    const metadata = {
      order_id: orderId.trim(),
      fulfilled_at: new Date().toISOString(),
      ...fulfillmentData
    };

    // Track the order fulfillment event
    const result = createEvent(
      'order_fulfilled',
      `Order fulfilled: ${metadata.order_id}`,
      metadata
    );

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      order: result.event,
      message: 'Order fulfilled successfully'
    };
  } catch (error) {
    console.error('Unexpected error in fulfillOrder:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fulfilling the order'
    };
  }
}

/**
 * Retrieves order events, optionally filtered by order_id or customer_id
 * @param {Object} filters - Optional filters
 * @param {string} filters.order_id - Filter by order ID
 * @param {string} filters.customer_id - Filter by customer ID
 * @param {string} filters.status - Filter by order status
 * @returns {Object} Array of order events with success status
 */
function getOrderEvents(filters = {}) {
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
      if (filters.order_id !== undefined && filters.order_id !== null) {
        if (typeof filters.order_id !== 'string' || filters.order_id.trim().length === 0) {
          return {
            success: false,
            error: 'order_id filter must be a non-empty string when provided'
          };
        }
      }

      if (filters.customer_id !== undefined && filters.customer_id !== null) {
        if (typeof filters.customer_id !== 'string' || filters.customer_id.trim().length === 0) {
          return {
            success: false,
            error: 'customer_id filter must be a non-empty string when provided'
          };
        }
      }

      if (filters.status !== undefined && filters.status !== null) {
        if (typeof filters.status !== 'string' || filters.status.trim().length === 0) {
          return {
            success: false,
            error: 'status filter must be a non-empty string when provided'
          };
        }
      }
    }

    // Get all events
    const allEventsResult = getEvents();
    if (!allEventsResult.success) {
      return allEventsResult;
    }

    // Filter order-related events
    const orderEventTypes = ['order_created', 'order_updated', 'order_cancelled', 'order_fulfilled'];
    let orderEvents = allEventsResult.events.filter(e => orderEventTypes.includes(e.type));

    // Apply filters if provided
    if (filters.order_id) {
      orderEvents = orderEvents.filter(e => 
        e.metadata && e.metadata.order_id === filters.order_id
      );
    }

    if (filters.customer_id) {
      orderEvents = orderEvents.filter(e => 
        e.metadata && e.metadata.customer_id === filters.customer_id
      );
    }

    if (filters.status) {
      orderEvents = orderEvents.filter(e => 
        e.metadata && (e.metadata.status === filters.status || e.metadata.new_status === filters.status)
      );
    }

    return {
      success: true,
      events: orderEvents,
      count: orderEvents.length
    };
  } catch (error) {
    console.error('Unexpected error in getOrderEvents:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while retrieving order events'
    };
  }
}

module.exports = {
  createOrder,
  updateOrderStatus,
  cancelOrder,
  fulfillOrder,
  getOrderEvents
};
