/**
 * Order Management Example - Gamma Line Integration
 * Demonstrates how to use the order management API
 */

const {
  createOrder,
  updateOrderStatus,
  cancelOrder,
  fulfillOrder,
  getOrderEvents
} = require('./order-management');

console.log('=== Gamma Line Order Management Integration Examples ===\n');

// Example 1: Create a new order
console.log('--- Example 1: Create a New Order ---');
const newOrder = createOrder({
  order_id: 'ORD-12345',
  customer_id: 'CUST-789',
  items: [
    { product_id: 'PROD-101', name: 'Widget A', quantity: 2, price: 29.99 },
    { product_id: 'PROD-102', name: 'Widget B', quantity: 1, price: 49.99 }
  ],
  total_amount: 109.97
});

if (newOrder.success) {
  console.log('✓ Order created successfully!');
  console.log(`  Order ID: ${newOrder.order.metadata.order_id}`);
  console.log(`  Customer: ${newOrder.order.metadata.customer_id}`);
  console.log(`  Total: $${newOrder.order.metadata.total_amount}`);
  console.log(`  Status: ${newOrder.order.metadata.status}`);
  console.log(`  Created at: ${newOrder.order.metadata.created_at}`);
} else {
  console.error('✗ Failed to create order:', newOrder.error);
}

// Example 2: Update order status to processing
console.log('\n--- Example 2: Update Order Status to Processing ---');
const processingUpdate = updateOrderStatus('ORD-12345', 'processing', {
  warehouse_location: 'Warehouse-B',
  estimated_ship_date: '2024-01-22'
});

if (processingUpdate.success) {
  console.log('✓ Order status updated!');
  console.log(`  Order ID: ${processingUpdate.order.metadata.order_id}`);
  console.log(`  New Status: ${processingUpdate.order.metadata.new_status}`);
  console.log(`  Warehouse: ${processingUpdate.order.metadata.warehouse_location}`);
  console.log(`  Est. Ship Date: ${processingUpdate.order.metadata.estimated_ship_date}`);
} else {
  console.error('✗ Failed to update status:', processingUpdate.error);
}

// Example 3: Fulfill an order
console.log('\n--- Example 3: Fulfill an Order ---');
const fulfillment = fulfillOrder('ORD-12345', {
  tracking_number: 'TRACK-987654321',
  carrier: 'UPS',
  service_level: 'Ground',
  estimated_delivery: '2024-01-25'
});

if (fulfillment.success) {
  console.log('✓ Order fulfilled!');
  console.log(`  Order ID: ${fulfillment.order.metadata.order_id}`);
  console.log(`  Tracking: ${fulfillment.order.metadata.tracking_number}`);
  console.log(`  Carrier: ${fulfillment.order.metadata.carrier}`);
  console.log(`  Est. Delivery: ${fulfillment.order.metadata.estimated_delivery}`);
} else {
  console.error('✗ Failed to fulfill order:', fulfillment.error);
}

// Example 4: Create and cancel an order
console.log('\n--- Example 4: Create and Cancel an Order ---');
const cancelledOrder = createOrder({
  order_id: 'ORD-67890',
  customer_id: 'CUST-456',
  items: [
    { product_id: 'PROD-201', name: 'Gadget X', quantity: 1, price: 199.99 }
  ],
  total_amount: 199.99
});

if (cancelledOrder.success) {
  console.log('✓ Order created');
  
  const cancellation = cancelOrder('ORD-67890', 'Customer changed mind');
  
  if (cancellation.success) {
    console.log('✓ Order cancelled!');
    console.log(`  Order ID: ${cancellation.order.metadata.order_id}`);
    console.log(`  Reason: ${cancellation.order.metadata.reason}`);
    console.log(`  Cancelled at: ${cancellation.order.metadata.cancelled_at}`);
  } else {
    console.error('✗ Failed to cancel order:', cancellation.error);
  }
}

// Example 5: Retrieve all order events
console.log('\n--- Example 5: Retrieve All Order Events ---');
const allEvents = getOrderEvents();

if (allEvents.success) {
  console.log(`✓ Retrieved ${allEvents.count} order events`);
  allEvents.events.forEach(event => {
    console.log(`  - [${event.type}] ${event.message} (${event.timestamp})`);
  });
} else {
  console.error('✗ Failed to retrieve events:', allEvents.error);
}

// Example 6: Filter events by order ID
console.log('\n--- Example 6: Filter Events by Order ID ---');
const orderSpecificEvents = getOrderEvents({ order_id: 'ORD-12345' });

if (orderSpecificEvents.success) {
  console.log(`✓ Found ${orderSpecificEvents.count} events for order ORD-12345`);
  orderSpecificEvents.events.forEach(event => {
    console.log(`  - [${event.type}] ${event.message}`);
  });
} else {
  console.error('✗ Failed to filter events:', orderSpecificEvents.error);
}

// Example 7: Filter events by customer ID
console.log('\n--- Example 7: Filter Events by Customer ID ---');
const customerEvents = getOrderEvents({ customer_id: 'CUST-789' });

if (customerEvents.success) {
  console.log(`✓ Found ${customerEvents.count} events for customer CUST-789`);
} else {
  console.error('✗ Failed to filter by customer:', customerEvents.error);
}

// Example 8: Filter events by status
console.log('\n--- Example 8: Filter Events by Status ---');
const processingOrders = getOrderEvents({ status: 'processing' });

if (processingOrders.success) {
  console.log(`✓ Found ${processingOrders.count} processing orders`);
} else {
  console.error('✗ Failed to filter by status:', processingOrders.error);
}

console.log('\n=== Examples Complete ===');
