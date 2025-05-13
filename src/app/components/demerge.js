"use client";
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const SERVER_URL = "http://localhost:5001";

const CleverTapDemerge = () => {
  const [file, setFile] = useState(null);
  const [accountId, setAccountId] = useState("TEST-4R8-7ZK-6K7Z");
  const [passcode, setPasscode] = useState("AOE-BOB-OLEL");
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);

  // Connect to socket.io server
  useEffect(() => {
    const newSocket = io(SERVER_URL);
    
    newSocket.on("connect", () => {
      setSocketId(newSocket.id);
      logMessage(`🔗 Connected to server with ID: ${newSocket.id}`);
    });

    // Updated to match server event naming and data structure
    newSocket.on("progress", (data) => {
      if (data.complete) {
        logMessage(`🎉 Processing complete!`);
        setProcessing(false);
      } else {
        const percentComplete = Math.floor((data.processed / data.total) * 100);
        setProgress(percentComplete);
        logMessage(`📊 Progress: ${data.processed}/${data.total} (${percentComplete}%)`);
      }
    });

    newSocket.on("demergeProgress", (data) => {
      if (data.complete) {
        logMessage(`🎉 Demerge processing complete!`);
        if (data.summary) {
          logMessage(`📊 Summary: ${data.summary.success} succeeded, ${data.summary.failed} failed`);
        }
        setProcessing(false);
      } else {
        const percentComplete = Math.floor((data.processed / data.total) * 100);
        setProgress(percentComplete);
        logMessage(`📊 Progress: ${data.processed}/${data.total} (${percentComplete}%)`);
      }
    });

    newSocket.on("demergeComplete", (data) => {
      if (data.success) {
        logMessage(`✅ Demerge request completed successfully in ${data.duration}`);
      } else {
        logMessage(`❌ Demerge request failed: ${data.error}`);
      }
    });

    // New handlers for additional server events
    newSocket.on("apiError", (data) => {
      logMessage(`❌ API Error: ${data.operation} failed - ${data.error}`);
    });

    newSocket.on("error", (data) => {
      logMessage(`❌ Error: ${data.message}`);
      setProcessing(false);
    });

    newSocket.on("serverStats", (data) => {
      setServerStatus(data);
      logMessage(`📈 Server stats: ${data.success} successful, ${data.failed} failed requests`);
    });

    newSocket.on("disconnect", () => {
      logMessage(`❌ Disconnected from server`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const validateCSV = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');
        if (lines.length < 2) {
          reject('CSV file must contain at least a header row and one data row');
          return;
        }
        
        const headers = lines[0].toLowerCase().split(',');
        const requiredColumns = ['email', 'identity'];
        const missingColumns = requiredColumns.filter(
          col => !headers.some(header => header.trim() === col)
        );
        
        if (missingColumns.length > 0) {
          reject(`CSV is missing required columns: ${missingColumns.join(', ')}`);
          return;
        }
        
        resolve(true);
      };
      reader.onerror = () => reject('Error reading file');
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    
    if (!selectedFile) return;
    
    // Check file size (10MB limit on server)
    if (selectedFile.size > 10 * 1024 * 1024) {
      logMessage(`❌ File too large: ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB. Maximum size is 10MB.`);
      alert("File too large. Maximum size is 10MB.");
      return;
    }
    
    try {
      await validateCSV(selectedFile);
      setFile(selectedFile);
      logMessage(`📁 File selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)}KB)`);
    } catch (error) {
      setFile(null);
      logMessage(`❌ File validation failed: ${error}`);
      alert(`Invalid CSV file: ${error}`);
    }
  };

  const logMessage = (message) => {
    setLogs((prevLogs) => [...prevLogs, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const handleDemerge = async () => {
    if (!file) {
      logMessage(`⚠️ No file uploaded. Please select a CSV file.`);
      alert("Please upload a CSV file");
      return;
    }
  
    if (!accountId || !passcode) {
      logMessage(`⚠️ Missing credentials. Please enter Account ID and Passcode.`);
      alert("Please enter your CleverTap Account ID and Passcode");
      return;
    }
  
    setProcessing(true);
    setProgress(0);
    setDownloadUrl(null);
    logMessage(`🔄 Starting demerge process...`);
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", accountId);
    formData.append("passcode", passcode);
  
    logMessage(`📡 Sending API request to ${SERVER_URL}/demerge`);
  
    try {
      const response = await axios.post(`${SERVER_URL}/demerge`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Socket-Id": socketId,
        },
        responseType: "blob",
      });
  
      // Check if the response is an error (the server returns JSON for errors)
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        // Convert blob to JSON to read the error
        const errorText = await response.data.text();
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || 'Unknown error occurred');
      }
  
      logMessage(`✅ API request successful. Received response.`);
  
      // Create download URL
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
      logMessage(`✅ Processing complete! Results are ready for download.`);
    } catch (error) {
      let errorMessage = 'API request failed';
      
      if (error.response) {
        // The server responded with an error status
        errorMessage = `Server error: ${error.response.status}`;
        if (error.response.data instanceof Blob) {
          try {
            const textData = await error.response.data.text();
            const jsonData = JSON.parse(textData);
            errorMessage = jsonData.error || errorMessage;
          } catch (e) {
            // If we can't parse the blob as JSON, use the status
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      logMessage(`❌ API request failed: ${errorMessage}`);
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setLogs([]);
    setProgress(0);
    setDownloadUrl(null);
    setProcessing(false);
    logMessage('🔄 Reset complete');
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">CleverTap Demerge Tool</h2>

      {serverStatus && (
        <div className="mb-4 p-2 text-xs bg-gray-100 rounded">
          <p>Server status: {serverStatus.activeClients} active clients | 
          {serverStatus.success} successful / {serverStatus.failed} failed requests</p>
        </div>
      )}

      <div className="mb-4 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Account ID</label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={processing}
            />
          </div>
          <div>
            <label className="block mb-1">Passcode</label>
            <input
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={processing}
            />
          </div>
        </div>
      </div>

      <div className="mb-4 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Upload CSV</h3>
        <p className="text-sm text-gray-600 mb-2">
          Your CSV should contain columns for Email, Identity, and CleverTap Id.
          Maximum file size: 10MB
        </p>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          className="mb-2 block"
          disabled={processing}
        />
        <div className="flex space-x-2">
          <button
            onClick={handleDemerge}
            disabled={processing || !file || !socketId}
            className={`px-4 py-2 rounded ${processing || !file || !socketId ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            {processing ? "Processing..." : "Start Demerge"}
          </button>
          <button
            onClick={handleReset}
            disabled={processing}
            className={`px-4 py-2 rounded ${processing ? 'bg-gray-400' : 'bg-gray-500 hover:bg-gray-600'} text-white`}
          >
            Reset
          </button>
        </div>
      </div>

      {processing && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span>Progress:</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {downloadUrl && (
        <div className="mb-4 p-4 border rounded bg-green-50">
          <h3 className="text-lg font-semibold mb-2">Results Ready</h3>
          <a
            href={downloadUrl}
            download="demerge_results.csv"
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded inline-block"
          >
            Download Results
          </a>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Process Log</h3>
        <div className="p-3 border bg-gray-50 rounded max-h-60 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No activity yet</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-sm mb-1 font-mono">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CleverTapDemerge;