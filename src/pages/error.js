// Read query parameter and update error message
const params = new URLSearchParams(window.location.search);
const query = params.get('query');
const type = params.get('type');

// Function to determine if query is likely an address (only numbers and periods)
function isAddress(query) {
  return /^[0-9]+(\.[0-9]+)*$/.test(query);
}

if (query) {
  let message = '';
  let title = '';
  
  if (type === 'name') {
    title = 'Error: Name not found';
    message = `${query} is NOT currently registered. Please validate availability in mempool if attempting to register. Registry may not be up to block yet.`;
  } else if (type === 'address') {
    title = 'Error: Address not found';
    message = `${query} is NOT currently registered. Please check current blockheight. Registry may not be up to block yet.`;
  } else if (type === 'invalid') {
    title = 'Error: Invalid input';
    message = `Unable to process the .bitmap request. Input contains invalid characters. Only letters, numbers, periods, dashes, and underscores are allowed.`;
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