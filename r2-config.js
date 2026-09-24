// Cloudflare R2 Configuration
// NOTE: This is for server-side use only. Do not expose these credentials in client-side code.

const r2Config = {
  bucketName: process.env.R2_BUCKET_NAME || '3d-mart-assets',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || 'YOUR_ACCESS_KEY_ID',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'YOUR_SECRET_ACCESS_KEY',
  endpoint: process.env.R2_ENDPOINT || 'https://b689aebfde9481216c0e085f3ac7de7a.r2.cloudflarestorage.com'
};

// For development/testing (remove in production)
if (typeof window !== 'undefined') {
  console.warn('R2 config loaded in browser - this should only be used server-side');
}

module.exports = r2Config;