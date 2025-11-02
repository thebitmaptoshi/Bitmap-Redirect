// Update declarativeNetRequest rules - lean version
async function updateRules() {
  // Clear existing rules
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: (await chrome.declarativeNetRequest.getDynamicRules()).map(rule => rule.id)
  });

  // Create a single rule to redirect all .bitmap URLs to error.html (which now handles redirection)
  const rules = [{
    id: 1,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        regexSubstitution: chrome.runtime.getURL('src/pages/error.html?query=\\1')
      }
    },
    condition: {
      regexFilter: '^https?://([^/:?#]+?)\\.bitmap(/|$)',
      resourceTypes: ['main_frame']
    }
  }];

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules
    });
    console.log('Updated declarativeNetRequest rules');
  } catch (error) {
    console.error('Failed to update rules:', error);
  }
}

// Handle raw .bitmap navigations
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  const rawUrl = details.url.toLowerCase();
  console.log('DEBUG: Processing URL:', details.url);
  
  // Check for raw .bitmap inputs or search-like inputs
  const queryMatch = rawUrl.match(/^(?:https?:\/\/)?([^:/?#]+)\.bitmap(?:[?/#].*)?$/);
  const searchMatch = rawUrl.match(/[?&]q=([^&]*)\.bitmap(?:[&#].*)?$/);
  
  console.log('DEBUG: queryMatch result:', queryMatch);
  console.log('DEBUG: searchMatch result:', searchMatch);
  
  const query = queryMatch ? queryMatch[1] : (searchMatch ? decodeURIComponent(searchMatch[1]) : '');

  console.log('DEBUG: Final extracted query:', query);

  if (!query) {
    console.log('No valid .bitmap query found in:', rawUrl);
    return; // Let browser handle non-.bitmap or invalid inputs
  }

  console.log('Intercepted .bitmap navigation:', query);
  // Redirect to error.html with query (error.js handles all redirect and error logic)
  chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL(`src/pages/error.html?query=${encodeURIComponent(query)}`) });
}, { url: [{ urlMatches: "^(?:https?://)?[^:/?#]+\\.bitmap.*$" },{ urlMatches: ".*[?&]q=[^&]*\\.bitmap.*$" }] });

// Initialize rules once on startup - no periodic refresh needed
updateRules();