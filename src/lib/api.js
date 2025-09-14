// GitHub API interaction functions extracted from redirect.js

// Function to fetch file content via GitHub API
async function fetchGitHubFile(filename) {
  const url = `${GITHUB_API_BASE}${filename}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    // GitHub API returns content as base64, decode it
    const content = atob(data.content.replace(/\n/g, ''));
    return content;
  } catch (e) {
    console.error('Error fetching from GitHub API:', e);
    return null;
  }
}

// Function to get the correct index file for a name
function getIndexFileForName(name) {
  const firstChar = name[0].toUpperCase();
  if (/\d/.test(firstChar)) {
    return 'index_0-9.txt';
  }
  return `index_${firstChar}.txt`;
}

// Function to fetch and parse the index file for a name
async function fetchAddressForName(name, sanitizeQuery) {
  const indexFile = getIndexFileForName(name);
  const text = await fetchGitHubFile(indexFile);
  if (!text) return null;

  try {
    // Entries are (name,address), separated by commas
    const entries = text.match(/\([^\)]+\)/g) || [];
    const sanitizedInput = sanitizeQuery(name);
    console.log('Sanitized input name:', sanitizedInput);
    for (const entry of entries) {
      const [entryName, entryAddress] = entry.slice(1, -1).split(',');
      const sanitizedEntryName = sanitizeQuery(entryName ? entryName.trim() : '');
      console.log('Comparing:', {
        entryName: entryName ? entryName.trim() : '',
        sanitizedEntryName,
        sanitizedInput
      });
      if (
        entryName &&
        entryAddress &&
        sanitizedEntryName === sanitizedInput
      ) {
        console.log('Match found:', entryName, '->', entryAddress);
        return entryAddress.trim();
      }
    }
    console.log('No match found for:', sanitizedInput);
    return null;
  } catch (e) {
    console.error('Error parsing index file:', e);
    return null;
  }
}