/**
 * Test suite for Order Management module
 */

const { 
  createOrder, 
  updateOrderStatus, 
  cancelOrder, 
  fulfillOrder, 
  getOrderEvents 
} = require('./order-management');
const { clearEvents } = require('./event');

// Test counter
let testsPassed = 0;
let testsFailed = 0;

// Helper function for assertions
function assert(condition, testName) {
  if (condition) {
    console.log(`✓ ${testName}`);
    testsPassed++;
  } else {
    console.error(`✗ ${testName}`);
    testsFailed++;
  }
}

console.log('Running Order Management tests...\n');

// Clear events before tests
clearEvents();

// Test 1: Create order with valid data
console.log('--- Create Order Tests ---');
const orderResult = createOrder({
  order_id: 'ORD-001',
  customer_id: 'CUST-123',
  items: [
    { product_id: 'PROD-1', quantity: 2, price: 29.99 },
    { product_id: 'PROD-2', quantity: 1, price: 49.99 }
  ],
  total_amount: 109.97
});

assert(orderResult.success === true, 'Should create order successfully');
assert(orderResult.order.type === 'order_created', 'Order event type should be order_created');
assert(orderResult.order.metadata.order_id === 'ORD-001', 'Order ID should match');
assert(orderResult.order.metadata.customer_id === 'CUST-123', 'Customer ID should match');
assert(orderResult.order.metadata.status === 'pending', 'Default status should be pending');
assert(orderResult.order.metadata.total_amount === 109.97, 'Total amount should match');

// Test 2: Create order with explicit status
const orderWithStatus = createOrder({
  order_id: 'ORD-002',
  customer_id: 'CUST-456',
  items: [{ product_id: 'PROD-3', quantity: 1, price: 19.99 }],
  total_amount: 19.99,
  status: 'processing'
});

assert(orderWithStatus.success === true, 'Should create order with explicit status');
assert(orderWithStatus.order.metadata.status === 'processing', 'Status should be processing');

// Test 3: Create order validation - missing required fields
const invalidOrder1 = createOrder({});
assert(invalidOrder1.success === false, 'Should fail when missing order_id');
assert(invalidOrder1.error.includes('order_id'), 'Error should mention order_id');

const invalidOrder2 = createOrder({
  order_id: 'ORD-003',
  customer_id: 'CUST-789'
  // Missing items and total_amount
});
assert(invalidOrder2.success === false, 'Should fail when missing items');

// Test 4: Create order validation - invalid field types
const invalidOrder3 = createOrder({
  order_id: '',
  customer_id: 'CUST-789',
  items: [{ product_id: 'PROD-1', quantity: 1, price: 10 }],
  total_amount: 10
});
assert(invalidOrder3.success === false, 'Should fail with empty order_id');

const invalidOrder4 = createOrder({
  order_id: 'ORD-004',
  customer_id: 'CUST-789',
  items: [],
  total_amount: 10
});
assert(invalidOrder4.success === false, 'Should fail with empty items array');

const invalidOrder5 = createOrder({
  order_id: 'ORD-005',
  customer_id: 'CUST-789',
  items: [{ product_id: 'PROD-1', quantity: 1, price: 10 }],
  total_amount: -10
});
assert(invalidOrder5.success === false, 'Should fail with negative total_amount');

const invalidOrder6 = createOrder({
  order_id: 'ORD-006',
  customer_id: 'CUST-789',
  items: [{ product_id: 'PROD-1', quantity: 1, price: 10 }],
  total_amount: 10,
  status: 'invalid_status'
});
assert(invalidOrder6.success === false, 'Should fail with invalid status');

// Test 5: Create order validation - not an object
const invalidOrder7 = createOrder('not an object');
assert(invalidOrder7.success === false, 'Should fail when not an object');

const invalidOrder8 = createOrder([]);
assert(invalidOrder8.success === false, 'Should fail when array is provided');

// Test 6: Update order status
console.log('\n--- Update Order Status Tests ---');
const updateResult = updateOrderStatus('ORD-001', 'processing');
assert(updateResult.success === true, 'Should update order status successfully');
assert(updateResult.order.type === 'order_updated', 'Event type should be order_updated');
assert(updateResult.order.metadata.order_id === 'ORD-001', 'Order ID should match');
assert(updateResult.order.metadata.new_status === 'processing', 'New status should be processing');

// Test 7: Update order status with additional data
const updateWithData = updateOrderStatus('ORD-001', 'fulfilled', {
  tracking_number: 'TRACK-12345',
  carrier: 'UPS'
});
assert(updateWithData.success === true, 'Should update with additional data');
assert(updateWithData.order.metadata.tracking_number === 'TRACK-12345', 'Tracking number should be included');

// Test 8: Update order status validation
const invalidUpdate1 = updateOrderStatus('', 'processing');
assert(invalidUpdate1.success === false, 'Should fail with empty order_id');

const invalidUpdate2 = updateOrderStatus('ORD-001', 'invalid');
assert(invalidUpdate2.success === false, 'Should fail with invalid status');

const invalidUpdate3 = updateOrderStatus('ORD-001', 'processing', []);
assert(invalidUpdate3.success === false, 'Should fail when additionalData is array');

// Test 9: Cancel order
console.log('\n--- Cancel Order Tests ---');
const cancelResult = cancelOrder('ORD-002', 'Customer requested cancellation');
assert(cancelResult.success === true, 'Should cancel order successfully');
assert(cancelResult.order.type === 'order_cancelled', 'Event type should be order_cancelled');
assert(cancelResult.order.metadata.order_id === 'ORD-002', 'Order ID should match');
assert(cancelResult.order.metadata.reason === 'Customer requested cancellation', 'Cancellation reason should match');

// Test 10: Cancel order without reason
const cancelWithoutReason = cancelOrder('ORD-001');
assert(cancelWithoutReason.success === true, 'Should cancel order without reason');
assert(cancelWithoutReason.order.metadata.reason === '', 'Reason should be empty string');

// Test 11: Cancel order validation
const invalidCancel1 = cancelOrder('');
assert(invalidCancel1.success === false, 'Should fail with empty order_id');

const invalidCancel2 = cancelOrder('ORD-001', 123);
assert(invalidCancel2.success === false, 'Should fail when reason is not a string');

// Test 12: Fulfill order
console.log('\n--- Fulfill Order Tests ---');
const fulfillResult = fulfillOrder('ORD-001', {
  tracking_number: 'TRACK-67890',
  carrier: 'FedEx',
  delivery_date: '2024-01-20'
});
assert(fulfillResult.success === true, 'Should fulfill order successfully');
assert(fulfillResult.order.type === 'order_fulfilled', 'Event type should be order_fulfilled');
assert(fulfillResult.order.metadata.order_id === 'ORD-001', 'Order ID should match');
assert(fulfillResult.order.metadata.tracking_number === 'TRACK-67890', 'Tracking number should match');

// Test 13: Fulfill order without additional data
const fulfillWithoutData = fulfillOrder('ORD-002');
assert(fulfillWithoutData.success === true, 'Should fulfill order without additional data');

// Test 14: Fulfill order validation
const invalidFulfill1 = fulfillOrder('');
assert(invalidFulfill1.success === false, 'Should fail with empty order_id');

const invalidFulfill2 = fulfillOrder('ORD-001', []);
assert(invalidFulfill2.success === false, 'Should fail when fulfillmentData is array');

// Test 15: Get order events
console.log('\n--- Get Order Events Tests ---');
const allOrderEvents = getOrderEvents();
assert(allOrderEvents.success === true, 'Should retrieve all order events');
assert(allOrderEvents.count > 0, 'Should have order events');

// Test 16: Get order events filtered by order_id
const orderEventsById = getOrderEvents({ order_id: 'ORD-001' });
assert(orderEventsById.success === true, 'Should retrieve events by order_id');
assert(orderEventsById.events.every(e => e.metadata.order_id === 'ORD-001'), 'All events should match order_id');

// Test 17: Get order events filtered by customer_id
const orderEventsByCustomer = getOrderEvents({ customer_id: 'CUST-123' });
assert(orderEventsByCustomer.success === true, 'Should retrieve events by customer_id');
assert(orderEventsByCustomer.events.length > 0, 'Should find events for customer');

// Test 18: Get order events filtered by status
const orderEventsByStatus = getOrderEvents({ status: 'processing' });
assert(orderEventsByStatus.success === true, 'Should retrieve events by status');

// Test 19: Get order events with multiple filters
const filteredEvents = getOrderEvents({
  order_id: 'ORD-001',
  customer_id: 'CUST-123'
});
assert(filteredEvents.success === true, 'Should retrieve events with multiple filters');

// Test 20: Get order events validation
const invalidGetEvents1 = getOrderEvents([]);
assert(invalidGetEvents1.success === false, 'Should fail when filters is array');

const invalidGetEvents2 = getOrderEvents({ order_id: '' });
assert(invalidGetEvents2.success === false, 'Should fail with empty order_id filter');

// Test 21: Edge case - null/undefined parameters
console.log('\n--- Edge Case Tests ---');
const nullOrder = createOrder(null);
assert(nullOrder.success === false, 'Should fail with null order data');

const undefinedOrder = createOrder(undefined);
assert(undefinedOrder.success === false, 'Should fail with undefined order data');

// Print summary
console.log('\n=== Test Summary ===');
console.log(`Total tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.error('\n✗ Some tests failed!');
  process.exit(1);
}
