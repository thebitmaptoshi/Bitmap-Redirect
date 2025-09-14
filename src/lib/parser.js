// Query parsing and validation functions extracted from redirect.js

// Function to validate query contains only approved characters
function isValidQuery(query) {
  // Only allow a-z, A-Z, 0-9, period, dash, underscore
  return /^[a-zA-Z0-9.\-_]+$/.test(query);
}

// Function to sanitize query (only used after validation passes)
function sanitizeQuery(query) {
  // Allow a-z, A-Z, 0-9, period, dash, underscore
  return query.replace(/[^a-zA-Z0-9.\-_]/g, '').toLowerCase();
}

// Function to determine if query is likely an address (only numbers and periods)
function isAddress(query) {
  // Only numbers and periods, at least one digit, no letters, no other symbols
  return /^[0-9]+(\.[0-9]+)*$/.test(query);
}