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

// Process the redirect - orchestrator using modular functions
(async () => {
  const params = new URLSearchParams(window.location.search);
  let query = params.get('query');
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
    window.location.href = chrome.runtime.getURL(`src/pages/error.html?query=unknown`);
    return;
  }

  // Validate query contains only approved characters before processing
  if (!isValidQuery(query)) {
    window.location.href = chrome.runtime.getURL(`src/pages/error.html?query=invalid&type=invalid`);
    return;
  }

  const sanitizedQuery = sanitizeQuery(query);
  let address = null;

  // Check if the sanitized query is an address (only numbers and periods)
  if (isAddress(sanitizedQuery)) {
    address = sanitizedQuery;
  } else {
    // It's a name (any alphanumeric input), look up address
    address = await fetchAddressForName(sanitizedQuery, sanitizeQuery);
    if (!address) {
      window.location.href = chrome.runtime.getURL(`src/pages/error.html?query=${encodeURIComponent(sanitizedQuery)}&type=name`);
      return;
    }
  }

  // Use OCI.js for inscriptionId and isBitmap logic
  // Assume getBitmapInscriptionAndType(address) returns { inscriptionId, isBitmap }
  try {
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
      window.location.href = chrome.runtime.getURL(`src/pages/error.html?query=${encodeURIComponent(address)}&type=address`);
      return;
    }
  } catch (e) {
    window.location.href = chrome.runtime.getURL(`src/pages/error.html?query=${encodeURIComponent(address)}&type=ocierror`);
    return;
  }
})();