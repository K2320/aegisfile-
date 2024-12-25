const fs = require('node:fs');
const path = require('node:path');
const FormData = require('form-data');
const axios = require('axios');

const VIRUS_TOTAL_API_KEY = process.env.VIRUS_TOTAL_API_KEY;
const VIRUS_TOTAL_API_URL = 'https://www.virustotal.com/api/v3';

async function scanFile(filePath) {
  console.log('Scanning file:', filePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const form = new FormData();
  const fileName = path.basename(filePath);

  try {
    const fileContent = fs.readFileSync(filePath);
    form.append('file', fileContent, {
      filename: fileName,
      contentType: 'application/octet-stream',
    });

    console.log('Form created with headers:', form.getHeaders());

    const response = await axios.post(`${VIRUS_TOTAL_API_URL}/files`, form, {
      headers: {
        ...form.getHeaders(),
        'X-Apikey': VIRUS_TOTAL_API_KEY,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('VirusTotal API response:', response.data);

    if (response.data && response.data.data && response.data.data.id) {
      return response.data.data.id;
    } else {
      throw new Error('Unexpected API response structure');
    }
  } catch (error) {
    console.error('Error in VirusTotal API call:');
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
}

async function getScanResult(scanId) {
  try {
    const response = await axios.get(`${VIRUS_TOTAL_API_URL}/analyses/${scanId}`, {
      headers: {
        'X-Apikey': VIRUS_TOTAL_API_KEY
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting scan result:', error);
    throw error;
  }
}


module.exports = { scanFile, getScanResult };

