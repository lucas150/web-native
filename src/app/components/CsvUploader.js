"use client";

import { useState } from "react";
import Papa from "papaparse";

export default function CsvUploader() {
  const [validData, setValidData] = useState([]);
  const [invalidData, setInvalidData] = useState([]);
  const [error, setError] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setError(null);
    setValidData([]);
    setInvalidData([]);

    if (file) {
      Papa.parse(file, {
        skipEmptyLines: true,
        delimiter: ',',
        complete: (result) => {
          // Find header row
          const headerRowIndex = result.data.findIndex((row) => 
            row.some((col) => col && col.toLowerCase().includes("email"))
          );

          if (headerRowIndex === -1) {
            setError("Could not find header row!");
            return;
          }

          // Normalize headers
          const headers = result.data[headerRowIndex].map((h) => 
            h ? h.trim().toLowerCase() : ""
          );

          // Find column indexes
          const emailIndex = headers.indexOf("email");
          const identityIndex = headers.indexOf("identity");
          const cleverTapIndex = headers.indexOf("clevertap id");

          // Validate required columns
          if (emailIndex === -1 || identityIndex === -1 || cleverTapIndex === -1) {
            setError("Missing required columns: Email, Identity, or CleverTap ID");
            return;
          }

          // Process data
          const validExtractedData = [];
          const invalidExtractedData = [];

          result.data.slice(headerRowIndex + 1).forEach((row) => {
            // Ensure row has enough columns
            if (row.length <= Math.max(emailIndex, identityIndex, cleverTapIndex)) {
              return;
            }

            // Extract base values
            const email = row[emailIndex] ? row[emailIndex].trim() : "-";
            const cleverTapId = row[cleverTapIndex] ? row[cleverTapIndex].trim() : "-";
            const identity = row[identityIndex] ? row[identityIndex].trim() : "-";
            
            // Determine if row is valid or invalid
            if (email !== "-" || identity !== "-") {
              // Handle multiple identities for valid rows
              const identities = identity !== "-"
                ? identity.split(/[,;]/).map(id => id.trim())
                : ["-"];

              // Create separate rows for each identity
              identities.forEach((id) => {
                validExtractedData.push({
                  Email: email,
                  Identity: id || "-",
                  "CleverTap Id": cleverTapId
                });
              });
            } else {
              // Add to invalid data if both email and identity are missing
              invalidExtractedData.push({
                Email: email,
                Identity: identity,
                "CleverTap Id": cleverTapId
              });
            }
          });

          setValidData(validExtractedData);
          setInvalidData(invalidExtractedData);
        },
        error: (err) => {
          console.error("Parsing error:", err);
          setError("Error parsing CSV file");
        }
      });
    }
  };

  const downloadCSV = (data, filename) => {
    if (data.length === 0) return;

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <input 
        type="file" 
        accept=".csv" 
        onChange={handleFileUpload} 
        className="mb-4" 
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {(validData.length > 0 || invalidData.length > 0) && (
        <div className="space-y-4">
          {validData.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Valid Data (With Email or Identity)</h2>
              <div className="overflow-auto max-h-96 border border-gray-300 rounded-lg">
                <table className="table-auto w-full border-collapse border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2">Email</th>
                      <th className="border px-4 py-2">Identity</th>
                      <th className="border px-4 py-2">CleverTap Id</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border px-4 py-2">{row.Email}</td>
                        <td className="border px-4 py-2">{row.Identity}</td>
                        <td className="border px-4 py-2">{row["CleverTap Id"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => downloadCSV(validData, "valid_data.csv")}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Download Valid Data CSV
              </button>
            </div>
          )}

          {invalidData.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Invalid Data (Missing Email and Identity)</h2>
              <div className="overflow-auto max-h-96 border border-gray-300 rounded-lg">
                <table className="table-auto w-full border-collapse border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2">Email</th>
                      <th className="border px-4 py-2">Identity</th>
                      <th className="border px-4 py-2">CleverTap Id</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invalidData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border px-4 py-2">{row.Email}</td>
                        <td className="border px-4 py-2">{row.Identity}</td>
                        <td className="border px-4 py-2">{row["CleverTap Id"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => downloadCSV(invalidData, "invalid_data.csv")}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Download Invalid Data CSV
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}