"use client";

import React, { useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5001");

export default function CleverTapUploader() {
  const [file, setFile] = useState(null);
  const [batchSize, setBatchSize] = useState(3);
  const [accountId, setAccountId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [downloadMessage, setDownloadMessage] = useState("");

  socket.on("progress", ({ processed, total, complete }) => {
    setProgress({ processed, total });
    if (complete) setDownloadMessage("✅ Processed CSV downloaded!");
  });

  const handleFileUpload = async () => {
    if (!file || !accountId || !passcode) {
      alert("⚠️ Please provide a file, Account ID, and Passcode!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", accountId);
    formData.append("passcode", passcode);

    try {
      console.log("📤 Uploading file...");

      const response = await fetch(`http://localhost:5001/upload`, {
        method: "POST",
        headers: { "socket-id": socket.id },
        body: formData,
      });

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

      // Handle CSV download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "processed_data.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("✅ File downloaded successfully.");
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">CleverTap Object ID Extractor</h2>

      <input
        type="text"
        placeholder="CleverTap Account ID"
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        className="block mb-2 p-2 border rounded w-full"
      />
      <input
        type="text"
        placeholder="CleverTap Passcode"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
        className="block mb-2 p-2 border rounded w-full"
      />
      <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="mb-2" />
      <input
        type="number"
        value={batchSize}
        onChange={(e) => setBatchSize(Number(e.target.value))}
        className="mb-2 p-2 border rounded"
        min="1"
      />
      <button onClick={handleFileUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
        Upload & Fetch
      </button>

      {progress.total > 0 && (
        <p className="text-blue-500 mt-2">
          Processing: {progress.processed} / {progress.total}
        </p>
      )}
      {downloadMessage && <p className="text-green-500">{downloadMessage}</p>}
    </div>
  );
}
