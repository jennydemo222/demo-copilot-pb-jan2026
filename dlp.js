/**
 * DLP (Data Loss Prevention) Scanning Module
 * Detects sensitive data patterns in content to prevent data leaks
 */

/**
 * Patterns for detecting sensitive data types
 * Each pattern includes a regex and a human-readable description
 */
const DLP_PATTERNS = {
  creditCard: {
    pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    description: 'Credit card number'
  },
  ssn: {
    pattern: /\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g,
    description: 'Social Security Number (SSN)'
  },
  email: {
    pattern: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    description: 'Email address'
  },
  phoneNumber: {
    pattern: /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    description: 'Phone number'
  },
  apiKey: {
    pattern: /(?:api[_-]?key|apikey|api[_-]?token|access[_-]?token|auth[_-]?token|secret[_-]?key)["'\s:=]+[a-zA-Z0-9_\-]{20,}/gi,
    description: 'API key or token'
  },
  ipAddress: {
    pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    description: 'IP address'
  }
};

/**
 * Scans a string for sensitive data patterns
 * @param {string} content - The text content to scan
 * @returns {Object} Scan result with success status, findings, and summary
 */
function scanContent(content) {
  try {
    if (typeof content !== 'string') {
      return {
        success: false,
        error: 'Content must be a string'
      };
    }

    const findings = [];

    for (const [type, { pattern, description }] of Object.entries(DLP_PATTERNS)) {
      // Reset lastIndex to ensure the regex starts from the beginning
      pattern.lastIndex = 0;
      const matches = content.match(new RegExp(pattern.source, pattern.flags));
      if (matches && matches.length > 0) {
        findings.push({
          type,
          description,
          count: matches.length
        });
      }
    }

    return {
      success: true,
      safe: findings.length === 0,
      findings,
      summary: {
        totalFindings: findings.length,
        scannedLength: content.length
      }
    };
  } catch (error) {
    console.error('Unexpected error in scanContent:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during DLP scan'
    };
  }
}

/**
 * Recursively scans all string values in an object for sensitive data patterns
 * @param {Object} obj - The object to scan
 * @returns {Object} Scan result with success status, findings per field, and summary
 */
function scanObject(obj) {
  try {
    if (obj === null || obj === undefined) {
      return {
        success: false,
        error: 'Object must not be null or undefined'
      };
    }

    if (typeof obj !== 'object' || Array.isArray(obj)) {
      return {
        success: false,
        error: 'Input must be a non-array object'
      };
    }

    const fieldFindings = [];
    let totalFindings = 0;
    let fieldsScanned = 0;

    /**
     * Recursively walk through an object's properties and scan string values
     * @param {Object} current - The current object being scanned
     * @param {string} path - The dotted-path representing the current location
     */
    function walkObject(current, path) {
      for (const key of Object.keys(current)) {
        const fieldPath = path ? `${path}.${key}` : key;
        const value = current[key];

        if (typeof value === 'string') {
          fieldsScanned++;
          const result = scanContent(value);
          if (result.success && result.findings.length > 0) {
            fieldFindings.push({
              field: fieldPath,
              findings: result.findings
            });
            totalFindings += result.findings.length;
          }
        } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          walkObject(value, fieldPath);
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'string') {
              fieldsScanned++;
              const result = scanContent(item);
              if (result.success && result.findings.length > 0) {
                fieldFindings.push({
                  field: `${fieldPath}[${index}]`,
                  findings: result.findings
                });
                totalFindings += result.findings.length;
              }
            } else if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
              walkObject(item, `${fieldPath}[${index}]`);
            }
          });
        }
      }
    }

    walkObject(obj, '');

    return {
      success: true,
      safe: fieldFindings.length === 0,
      fieldFindings,
      summary: {
        totalFindings,
        fieldsScanned,
        fieldsWithFindings: fieldFindings.length
      }
    };
  } catch (error) {
    console.error('Unexpected error in scanObject:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during DLP object scan'
    };
  }
}

module.exports = { scanContent, scanObject, DLP_PATTERNS };
