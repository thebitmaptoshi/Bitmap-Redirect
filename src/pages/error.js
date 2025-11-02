// Combined redirect and error handling functionality

// Round-robin redirect sites for isBitmap = false
const REDIRECT_SITES = [
  'https://ordinals.com/content/',
  'https://ordiscan.com/content/',
  'https://static.unisat.io/preview/'
];

function getNextRedirectSite() {
  let idx = parseInt(localStorage.getItem('obi_redirect_site_index') || '0', 10);
  const site = REDIRECT_SITES[idx];
  idx = (idx + 1) % REDIRECT_SITES.length;
  localStorage.setItem('obi_redirect_site_index', idx.toString());
  return site;
}

// Function to determine if query is likely an address (only numbers and periods)
function isAddress(query) {
  return /^[0-9]+(\.[0-9]+)*$/.test(query);
}

// Function to show error state
function showError(query, type) {
  document.getElementById('loading-content').style.display = 'none';
  document.getElementById('error-content').style.display = 'block';
  
  let message = '';
  let title = '';
  
  if (type === 'name') {
    title = 'Error: Name not found';
    message = `${query} is NOT currently registered. Please validate availability in mempool if attempting to register. Registry may not be up to block yet.`;
  } else if (type === 'address') {
    title = 'Error: Address not found';
    message = `${query} was not found. This extension is currently only tracking the first 907k bitmap districts. Please wait for further updates if not found.`;
  } else if (type === 'invalid') {
    title = 'Error: Invalid input';
    message = `Unable to process the .bitmap request. Input contains invalid characters. Only letters, numbers, periods, dashes, underscores, equals signs, and exclamation marks are allowed.`;
  } else if (type === 'ocierror') {
    title = 'Error: Lookup failed';
    message = `Unable to lookup inscription data for ${query}. Please try again later.`;
  } else {
    // fallback for unknown type - determine based on query content
    if (query === 'unknown') {
      title = 'Error: Not found';
      message = `Unable to process the .bitmap request.`;
    } else if (isAddress(query)) {
      title = 'Error: Address not found';
      message = `${query} is NOT currently registered. Please check current blockheight. Registry may not be up to block yet.`;
    } else {
      title = 'Error: Name not found';
      message = `${query} is NOT currently registered. Please validate availability in mempool if attempting to register. Registry may not be up to block yet.`;
    }
  }
  
  document.getElementById('error-title').innerHTML = title;
  document.getElementById('error-message').innerHTML = message;
}

// Main redirect processing logic
(async () => {
  const params = new URLSearchParams(window.location.search);
  let query = params.get('query');
  const type = params.get('type'); // If type is already provided, this is an error case
  
  // If type is provided, show error immediately
  if (type) {
    showError(query || 'unknown', type);
    return;
  }
  
  // Otherwise, attempt redirect logic
  if (!query) {
    // Fallback: Try to extract from referrer or current URL
    const referrer = document.referrer;
    const url = referrer || window.location.href;
    const match = url.match(/:\/\/([^\/]+)/);
    query = match ? match[1] : '';
  }

  if (query) {
    // Remove the first occurrence of .bitmap (case-insensitive) and everything after it
    query = query.replace(/\.bitmap.*$/i, '');
  }

  if (!query) {
    showError('unknown', 'unknown');
    return;
  }

  // Validate query contains only approved characters before processing
  if (!isValidQuery(query)) {
    showError(query, 'invalid');
    return;
  }

  const sanitizedQuery = sanitizeQuery(query);
  
  // Remove leading zeros from each segment if it's an address
  let cleanedQuery = sanitizedQuery;
  if (isAddress(sanitizedQuery)) {
    cleanedQuery = sanitizedQuery
      .split('.')
      .map((seg) => seg.replace(/^0+(?!$)/, ''))
      .join('.');
  }
  
  let address = null;

  try {
    // Check if the cleaned query is an address (only numbers and periods)
    if (isAddress(cleanedQuery)) {
      address = cleanedQuery;
    } else {
      // It's a name (any alphanumeric input), look up address
      address = await fetchAddressForName(cleanedQuery, sanitizeQuery);
      if (!address) {
        showError(cleanedQuery, 'name');
        return;
      }
    }

    // Use OCI.js for inscriptionId and isBitmap logic
    const { getBitmapInscriptionAndType } = await import('../lib/oci.js');
    const result = await getBitmapInscriptionAndType(address);
    
    if (result && result.inscriptionId) {
      if (result.isBitmap) {
        window.location.href = `https://ordinals.com/inscription/${result.inscriptionId}`;
      } else {
        // Use round robin for actual redirect sites
        const site = getNextRedirectSite();
        window.location.href = `${site}${result.inscriptionId}`;
      }
    } else {
      showError(address, 'address');
      return;
    }
  } catch (e) {
    console.error('Redirect error:', e);
    showError(address || cleanedQuery, 'ocierror');
    return;
  }
})();