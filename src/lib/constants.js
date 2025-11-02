// Configuration constants for BNS redirect extension
const GITHUB_API_BASE = 'https://api.github.com/repos/Zmakin/BNS/contents/Registry/';

const ORDINALS_URLS = {
  INSCRIPTION: 'https://ordinals.com/inscription/',
  CONTENT: 'https://ordinals.com/content/'
};

const VALIDATION_PATTERNS = {
  ADDRESS: /^[0-9]+(\.[0-9]+)*$/,
  SANITIZE: /[^a-zA-Z0-9.\-_=!]/g
};

// New JSON file structure identifiers
const JSON_IDENTIFIERS = {
  BLOCK: 'block',
  ID: 'iD', 
  BITMAP: 'Bitmap'
};