// Simple Node.js server for Cloudflare R2 integration
// This is for server-side operations only

require('dotenv').config();
const AWS = require('aws-sdk');
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Configure AWS SDK for Cloudflare R2
const s3 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'auto'
});

app.use(cors());
app.use(express.json());

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: req.file.originalname,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    const result = await s3.upload(params).promise();
    res.json({ 
      success: true, 
      url: result.Location,
      key: result.Key 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// List files endpoint
app.get('/files', async (req, res) => {
  try {
    const params = {
      Bucket: process.env.R2_BUCKET_NAME
    };

    const result = await s3.listObjectsV2(params).promise();
    res.json({ 
      success: true, 
      files: result.Contents 
    });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'List failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`R2 server running on port ${PORT}`);
});