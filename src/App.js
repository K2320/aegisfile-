import React, { useState } from 'react';
import './App.css';

function App() {
  const [view, setView] = useState('welcome');
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setScanResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setScanning(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadResponse = await fetch('http://localhost:3000/scan', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload failed');
      }

      const { scanId } = await uploadResponse.json();

      // Simulating a delay for the scanning process
      await new Promise(resolve => setTimeout(resolve, 3000));

      const resultResponse = await fetch(`http://localhost:3000/scan-result/${scanId}`);
      
      if (!resultResponse.ok) {
        throw new Error('Failed to get scan result');
      }

      const result = await resultResponse.json();
      
      if (result.data.attributes) {
        setScanResult(result.data.attributes);
        setView('result');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const renderWelcomeView = () => (
    <div className="welcome-view">
      <h1>AegisFile</h1>
      <p>Secure File Scanning for Peace of Mind</p>
      <button onClick={() => setView('scan')} className="start-button">
        Start Scanning
      </button>
    </div>
  );

  const renderScanView = () => (
    <div className="scan-view">
      <header>
        <span className="how-it-works">How it works</span>
      </header>
      <main>
        <div className="content">
          <div className="text-content">
            <h1>Always Track & Analyze the Integrity of Your Files.</h1>
            <p>
              A powerful antivirus solution that scans and protects your files from malware and viruses. 
              Advanced detection algorithms ensure your digital assets remain secure.
            </p>
            <div className="file_scanner">
              <div className='card'>
                <div className="card-content">
                  <h2>File Scanner</h2>
                  <p className="card-description">
                    Upload your file to scan for potential threats
                  </p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="file-upload-form">
                <label>File</label>
                <div className='file-uploader'>
                  <div className="file-input-wrapper">
                    <label htmlFor="file-upload">Choose file</label>
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      disabled={scanning}
                    />
                    <span className="file-chosen">
                      {file ? file.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
                <button type="submit" disabled={!file || scanning}>
                  <span className="button-icon">
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                      />
                      <path 
                        d="M17 8l-5-5-5 5" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M12 3v12" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  {scanning ? 'Scanning...' : 'Scan File'}
                </button>
              </form>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
          </div>
          <div className="illustration">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="100" cy="90" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </main>
    </div>
  );

  const renderResultView = () => {
    const isSafe = scanResult.stats?.malicious === 0;
    return (
      <div className={`result-view ${isSafe ? 'safe' : 'unsafe'}`}>
        <h2>{isSafe ? 'File is Safe' : 'File is Compromised'}</h2>
        <p>{isSafe 
          ? 'Your file has been scanned and no threats were detected.' 
          : 'Warning: Potential threats have been detected in your file.'}
        </p>
        <button onClick={() => setView('scan')} className="back-button">
          Scan Another File
        </button>
      </div>
    );
  };
  return (
    <div className="app">
      {view === 'welcome' && renderWelcomeView()}
      {view === 'scan' && renderScanView()}
      {view === 'result' && renderResultView()}
    </div>


  );
}

export default App;
