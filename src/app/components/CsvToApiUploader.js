"use client"
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const CsvToApiUploader = () => {
  const [file, setFile] = useState(null);
  const [accountId, setAccountId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [batchSize, setBatchSize] = useState(20);
  const [progress, setProgress] = useState(0);
  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [serverStats, setServerStats] = useState({});
  const [processingStats, setProcessingStats] = useState({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    batches: {
      total: 0,
      current: 0
    }
  });

  // Server URL - change this to match your server address
  const SERVER_URL = 'http://localhost:5001';

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SERVER_URL);
    
    newSocket.on('connect', () => {
      console.log('Connected to server with ID:', newSocket.id);
      setSocketId(newSocket.id);
    });
    
    newSocket.on('serverStats', (stats) => {
      setServerStats(stats);
    });
    
    newSocket.on('processingStarted', (data) => {
      setProcessingStats(prev => ({
        ...prev,
        total: data.total,
        processed: 0,
        file: data.file
      }));
      setProgress(0);
    });
    
    newSocket.on('progress', (data) => {
      setProcessingStats(prev => ({
        ...prev,
        processed: data.processed,
        total: data.total
      }));
      setProgress(Math.round((data.processed / data.total) * 100));
    });
    
    newSocket.on('batchProgress', (data) => {
      setProcessingStats(prev => ({
        ...prev,
        processed: data.processed,
        total: data.total,
        batches: {
          total: data.totalBatches,
          current: data.batch
        }
      }));
      setProgress(Math.round((data.processed / data.total) * 100));
    });
    
    newSocket.on('processingComplete', (data) => {
      setProcessingStats(prev => ({
        ...prev,
        success: data.success,
        failed: data.failed,
        total: data.total,
        resultsFile: data.resultsFile
      }));
      setProgress(100);
      setIsLoading(false);
    });
    
    newSocket.on('apiError', (data) => {
      console.error('API Error:', data);
      setError(`API Error: ${data.error}`);
    });
    
    newSocket.on('processingError', (data) => {
      setError(`Processing Error: ${data.error}`);
      setIsLoading(false);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a CSV file');
      return;
    }
    
    if (!accountId || !passcode) {
      setError('Account ID and Passcode are required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setResults([]);
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('accountId', accountId);
      formData.append('passcode', passcode);
      formData.append('batchSize', batchSize);
      formData.append('socketId', socketId);
      
      const response = await fetch(`${SERVER_URL}/api/process-csv`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'An error occurred');
      }
      
      // Results will be updated via socket events
      console.log('CSV processing initiated:', data);
    } catch (err) {
      setError(err.message || 'An error occurred while processing the CSV');
      setIsLoading(false);
    }
  };

  const downloadResults = () => {
    if (processingStats.resultsFile) {
      window.open(`${SERVER_URL}/api/download/${processingStats.resultsFile}`, '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">CleverTap Profile Updater</h1>
      
      {serverStats.activeClients > 0 && (
        <div className="mb-4 text-sm bg-blue-50 p-3 rounded">
          <p className="font-medium">Server Status</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
            <div>Active clients: {serverStats.activeClients}</div>
            <div>Total requests: {serverStats.total}</div>
            <div className="text-green-600">Success: {serverStats.success}</div>
            <div className="text-red-600">Failed: {serverStats.failed}</div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">CSV File (with Identity and Object ID columns)</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">CleverTap Account ID</label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your Account ID"
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">CleverTap Passcode</label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your Passcode"
              disabled={isLoading}
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Batch Size</label>
          <input
            type="number"
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Number of records per API call"
            min="1"
            max="100"
            disabled={isLoading}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Larger batch sizes are more efficient but might fail if too large. Recommended: 20-50.
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Processing...' : 'Update Profiles'}
        </button>
      </form>
      
      {isLoading && (
        <div className="mt-4">
          <div className="flex justify-between mb-1 text-sm">
            <span>Processing {processingStats.file}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {processingStats.batches.total > 0 && (
            <p className="text-center text-sm mt-1">
              Batch {processingStats.batches.current} of {processingStats.batches.total}
            </p>
          )}
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {processingStats.processed > 0 && processingStats.processed === processingStats.total && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-medium text-green-800">Processing Complete</h3>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="text-center border rounded p-2">
              <div className="text-xl font-bold">{processingStats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center border rounded p-2 bg-green-50">
              <div className="text-xl font-bold text-green-600">{processingStats.success}</div>
              <div className="text-sm text-gray-600">Success</div>
            </div>
            <div className="text-center border rounded p-2 bg-red-50">
              <div className="text-xl font-bold text-red-600">{processingStats.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
          {processingStats.resultsFile && (
            <button
              onClick={downloadResults}
              className="mt-3 w-full py-2 px-4 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Download Results CSV
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CsvToApiUploader;