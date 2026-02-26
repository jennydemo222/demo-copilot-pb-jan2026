/**
 * Test file for DLP (Data Loss Prevention) scanning module
 */

const { scanContent, scanObject } = require('./dlp');

// Test counter
let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Run tests
console.log('Running DLP scanning tests...\n');

// ---- scanContent tests ----

// Test 1: Safe content with no sensitive data
test('Should return safe for content with no sensitive data', () => {
  const result = scanContent('Hello, this is a normal message with no sensitive data.');
  assert(result.success === true, 'Scan should succeed');
  assert(result.safe === true, 'Content should be safe');
  assert(result.findings.length === 0, 'Should have no findings');
  assert(result.summary.totalFindings === 0, 'Total findings should be 0');
});

// Test 2: Detect credit card number
test('Should detect a credit card number', () => {
  const result = scanContent('Please charge my Visa card 4111111111111111 for this purchase.');
  assert(result.success === true, 'Scan should succeed');
  assert(result.safe === false, 'Content should not be safe');
  const ccFinding = result.findings.find(f => f.type === 'creditCard');
  assert(ccFinding !== undefined, 'Should find credit card');
  assert(ccFinding.count >= 1, 'Should count at least 1 credit card');
});

// Test 3: Detect SSN
test('Should detect a Social Security Number', () => {
  const result = scanContent('My SSN is 123-45-6789 please keep it safe.');
  assert(result.success === true, 'Scan should succeed');
  assert(result.safe === false, 'Content should not be safe');
  const ssnFinding = result.findings.find(f => f.type === 'ssn');
  assert(ssnFinding !== undefined, 'Should find SSN');
  assert(ssnFinding.count >= 1, 'Should count at least 1 SSN');
});

// Test 4: Detect email address
test('Should detect an email address', () => {
  const result = scanContent('Contact me at john.doe@example.com for details.');
  assert(result.success === true, 'Scan should succeed');
  assert(result.safe === false, 'Content should not be safe');
  const emailFinding = result.findings.find(f => f.type === 'email');
  assert(emailFinding !== undefined, 'Should find email');
  assert(emailFinding.count >= 1, 'Should count at least 1 email');
});

// Test 5: Detect phone number
test('Should detect a phone number', () => {
  const result = scanContent('Call me at 800-555-1234 anytime.');
  assert(result.success === true, 'Scan should succeed');
  assert(result.safe === false, 'Content should not be safe');
  const phoneFinding = result.findings.find(f => f.type === 'phoneNumber');
  assert(phoneFinding !== undefined, 'Should find phone number');
  assert(phoneFinding.count >= 1, 'Should count at least 1 phone number');
});

// Test 6: Detect API key
test('Should detect an API key', () => {
  const result = scanContent('api_key = abcdefghijklmnopqrstuvwxyz1234567890');
  assert(result.success === true, 'Scan should succeed');
  assert(result.safe === false, 'Content should not be safe');
  const apiKeyFinding = result.findings.find(f => f.type === 'apiKey');
  assert(apiKeyFinding !== undefined, 'Should find API key');
});

// Test 7: Detect IP address
test('Should detect an IP address', () => {
  const result = scanContent('Server is running at 192.168.1.100');
  assert(result.success === true, 'Scan should succeed');
  assert(result.safe === false, 'Content should not be safe');
  const ipFinding = result.findings.find(f => f.type === 'ipAddress');
  assert(ipFinding !== undefined, 'Should find IP address');
});

// Test 8: Detect multiple sensitive data types
test('Should detect multiple sensitive data types in one scan', () => {
  const result = scanContent('User john@test.com has SSN 234-56-7890 and called from 800-555-9876.');
  assert(result.success === true, 'Scan should succeed');
  assert(result.safe === false, 'Content should not be safe');
  assert(result.findings.length >= 2, 'Should find multiple types of sensitive data');
});

// Test 9: Multiple occurrences of same type
test('Should count multiple occurrences of the same sensitive data type', () => {
  const result = scanContent('Contact sales@example.com or support@example.com for help.');
  assert(result.success === true, 'Scan should succeed');
  const emailFinding = result.findings.find(f => f.type === 'email');
  assert(emailFinding !== undefined, 'Should find email');
  assert(emailFinding.count === 2, 'Should count 2 email addresses');
});

// Test 10: Fail with non-string content
test('Should fail when content is not a string', () => {
  const result = scanContent(12345);
  assert(result.success === false, 'Scan should fail');
  assert(result.error === 'Content must be a string', 'Should have appropriate error message');
});

// Test 11: Fail with null content
test('Should fail when content is null', () => {
  const result = scanContent(null);
  assert(result.success === false, 'Scan should fail');
  assert(result.error === 'Content must be a string', 'Should have appropriate error message');
});

// Test 12: Handle empty string content
test('Should handle empty string content safely', () => {
  const result = scanContent('');
  assert(result.success === true, 'Scan should succeed');
  assert(result.safe === true, 'Empty content should be safe');
  assert(result.findings.length === 0, 'Should have no findings');
});

// Test 13: Summary includes scanned content length
test('Should include content length in summary', () => {
  const content = 'Normal safe content here.';
  const result = scanContent(content);
  assert(result.success === true, 'Scan should succeed');
  assert(result.summary.scannedLength === content.length, 'Summary should include scanned length');
});

// ---- scanObject tests ----

// Test 14: Safe object with no sensitive data
test('Should return safe for object with no sensitive data', () => {
  const result = scanObject({ username: 'john', role: 'user', status: 'active' });
  assert(result.success === true, 'Scan should succeed');
  assert(result.safe === true, 'Object should be safe');
  assert(result.fieldFindings.length === 0, 'Should have no field findings');
  assert(result.summary.totalFindings === 0, 'Total findings should be 0');
});

// Test 15: Detect sensitive data in object field
test('Should detect sensitive data in an object field', () => {
  const result = scanObject({ username: 'john', email: 'john@example.com' });
  assert(result.success === true, 'Scan should succeed');
  assert(result.safe === false, 'Object should not be safe');
  assert(result.fieldFindings.length >= 1, 'Should have field findings');
  const emailField = result.fieldFindings.find(f => f.field === 'email');
  assert(emailField !== undefined, 'Should find email in email field');
});

// Test 16: Detect sensitive data in nested object field
test('Should detect sensitive data in nested object fields', () => {
  const result = scanObject({
    user: {
      contact: {
        email: 'user@company.com'
      }
    }
  });
  assert(result.success === true, 'Scan should succeed');
  assert(result.safe === false, 'Nested object should not be safe');
  const nestedField = result.fieldFindings.find(f => f.field === 'user.contact.email');
  assert(nestedField !== undefined, 'Should find nested email field');
});

// Test 17: Detect sensitive data in array values
test('Should detect sensitive data in array string values', () => {
  const result = scanObject({
    messages: ['Hello world', 'Contact admin@example.com for support']
  });
  assert(result.success === true, 'Scan should succeed');
  assert(result.safe === false, 'Object with array containing sensitive data should not be safe');
  const arrayField = result.fieldFindings.find(f => f.field === 'messages[1]');
  assert(arrayField !== undefined, 'Should find sensitive data in array element');
});

// Test 18: Summary includes fields scanned (only counts string fields)
test('Should count only string fields in fieldsScanned summary', () => {
  const obj = { name: 'test', count: 42, active: true };
  const result = scanObject(obj);
  assert(result.success === true, 'Scan should succeed');
  // Only "name" is a string field; count and active are non-string
  assert(result.summary.fieldsScanned === 1, 'Summary should count only string fields scanned');
});

// Test 18b: fieldsScanned includes nested string fields
test('Should count nested string fields in fieldsScanned summary', () => {
  const result = scanObject({
    a: 'hello',
    b: { c: 'world', d: 99 }
  });
  assert(result.success === true, 'Scan should succeed');
  // "a" and "b.c" are the string fields
  assert(result.summary.fieldsScanned === 2, 'Summary should count string fields at all depths');
});

// Test 19: Fail with null object
test('Should fail when object is null', () => {
  const result = scanObject(null);
  assert(result.success === false, 'Scan should fail');
  assert(result.error === 'Object must not be null or undefined', 'Should have appropriate error message');
});

// Test 20: Fail with array as input
test('Should fail when input is an array', () => {
  const result = scanObject(['a', 'b']);
  assert(result.success === false, 'Scan should fail');
  assert(result.error === 'Input must be a non-array object', 'Should have appropriate error message');
});

// Test 21: Fail with non-object input
test('Should fail when input is not an object', () => {
  const result = scanObject('a string');
  assert(result.success === false, 'Scan should fail');
  assert(result.error === 'Input must be a non-array object', 'Should have appropriate error message');
});

// Test 22: Non-string fields are ignored without error
test('Should ignore non-string fields without error', () => {
  const result = scanObject({ count: 42, active: true, data: null });
  assert(result.success === true, 'Scan should succeed even with non-string values');
  assert(result.safe === true, 'Object with no string sensitive data should be safe');
});

// Test 23: Summary counts fields with findings correctly
test('Should count fields with findings in summary', () => {
  const result = scanObject({
    email1: 'one@example.com',
    email2: 'two@example.com',
    safe: 'no sensitive data here'
  });
  assert(result.success === true, 'Scan should succeed');
  assert(result.summary.fieldsWithFindings === 2, 'Should count 2 fields with findings');
});

// Print summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
