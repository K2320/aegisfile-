require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { scanFile, getScanResult } = require('./virusTotalService');
const cors = require('cors');

const app = express();
app.use(cors());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({ storage: storage });

app.post('/scan', upload.single('file'), async (req, res) => {
  console.log('Received scan request');
  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const filePath = path.resolve(req.file.path);
    console.log('File received:', { path: filePath, name: req.file.originalname });

    if (!fs.existsSync(filePath)) {
      console.log('File does not exist at path:', filePath);
      return res.status(500).json({ error: 'File not found after upload' });
    }

    const scanId = await scanFile(filePath);

    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    res.json({ 
      message: 'File scanned successfully',
      scanId: scanId 
    });
  } catch (error) {
    console.error('Error scanning file:', error);
    res.status(500).json({ 
      error: 'Error scanning file', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.get('/scan-result/:scanId', async (req, res) => {
  try {
    const scanId = req.params.scanId;
    const result = await getScanResult(scanId);
    res.json(result);
  } catch (error) {
    console.error('Error getting scan result:', error);
    res.status(500).json({ 
      error: 'Error getting scan result', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

