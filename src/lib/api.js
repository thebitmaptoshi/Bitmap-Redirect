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
    return 'index_0-9.json';
  }
  return `index_${firstChar}.json`;
}

// Function to fetch and parse the index file for a name
async function fetchAddressForName(name, sanitizeQuery) {
  const indexFile = getIndexFileForName(name);
  const text = await fetchGitHubFile(indexFile);
  if (!text) return null;

  try {
    // Parse JSON content
    const jsonData = JSON.parse(text);
    const sanitizedInput = sanitizeQuery(name);
    console.log('Sanitized input name:', sanitizedInput);
    
    // Check if jsonData is an array of objects with the new identifiers
    if (Array.isArray(jsonData)) {
      for (const entry of jsonData) {
        // Look for entries with the new JSON identifiers: block, iD, Bitmap
        const entryName = entry[JSON_IDENTIFIERS.BITMAP] || entry.name; // Fallback to 'name' if Bitmap field not found
        const entryAddress = entry[JSON_IDENTIFIERS.ID] || entry[JSON_IDENTIFIERS.BLOCK] || entry.address; // Try iD first, then block, then fallback
        
        if (entryName && entryAddress) {
          const sanitizedEntryName = sanitizeQuery(entryName.toString().trim());
          console.log('Comparing:', {
            entryName: entryName.toString().trim(),
            sanitizedEntryName,
            sanitizedInput
          });
          
          if (sanitizedEntryName === sanitizedInput) {
            console.log('Match found:', entryName, '->', entryAddress);
            return entryAddress.toString().trim();
          }
        }
      }
    } else {
      // Handle object format where keys are names
      for (const [entryName, entryData] of Object.entries(jsonData)) {
        const sanitizedEntryName = sanitizeQuery(entryName.trim());
        console.log('Comparing:', {
          entryName: entryName.trim(),
          sanitizedEntryName,
          sanitizedInput
        });
        
        if (sanitizedEntryName === sanitizedInput) {
          // Extract address from the entry data object
          const entryAddress = entryData[JSON_IDENTIFIERS.ID] || entryData[JSON_IDENTIFIERS.BLOCK] || entryData.address || entryData;
          console.log('Match found:', entryName, '->', entryAddress);
          return entryAddress.toString().trim();
        }
      }
    }
    
    console.log('No match found for:', sanitizedInput);
    return null;
  } catch (e) {
    console.error('Error parsing index file:', e);
    return null;
  }
}