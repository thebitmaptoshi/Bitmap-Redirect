// Configuration constants for BNS redirect extension
const GITHUB_API_BASE = 'https://api.github.com/repos/thebitmaptoshi/BNS/contents/Registry/';

const ORDINALS_URLS = {
  INSCRIPTION: 'https://ordinals.com/inscription/',
  CONTENT: 'https://ordinals.com/content/'
};

const VALIDATION_PATTERNS = {
  ADDRESS: /^[0-9]+(\.[0-9]+)*$/,
  SANITIZE: /[^a-zA-Z0-9.\-_=!]/g
};