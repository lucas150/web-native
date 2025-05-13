// import express from "express";
// import cors from "cors";
// import fetch from "node-fetch";
// import multer from "multer";
// import csvParser from "csv-parser";
// import { createObjectCsvWriter } from "csv-writer";
// import fs from "fs";
// import pLimit from "p-limit";
// import { Server } from "socket.io";
// import http from "http";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// const PORT = 5001;
// app.use(cors());
// app.use(express.json());

// const upload = multer({ dest: "uploads/" });

// const MAX_BATCH_SIZE = 1000;
// const MAX_CONCURRENT_REQUESTS = 3;
// const limit = pLimit(MAX_CONCURRENT_REQUESTS);

// const connectedClients = new Map();

// io.on("connection", (socket) => {
//   console.log(`🔗 Client connected: ${socket.id}`);
//   connectedClients.set(socket.id, socket);

//   socket.on("disconnect", () => {
//     console.log(`❌ Client disconnected: ${socket.id}`);
//     connectedClients.delete(socket.id);
//   });
// });

// const fetchObjectIds = async (queryParam, type, socketId, globalProgress, accountId, passcode) => {
//   try {
//     const response = await fetch(`https://api.clevertap.com/1/profile.json?${type}=${encodeURIComponent(queryParam)}`, {
//       method: "GET",
//       headers: {
//         "X-CleverTap-Account-Id": accountId,
//         "X-CleverTap-Passcode": passcode,
//         "Content-Type": "application/json",
//       },
//     });

//     const data = await response.json();
//     const objectIds = data?.record?.platformInfo?.map((p) => p.objectId) || [];

//     globalProgress.processed += 1;
//     const socket = connectedClients.get(socketId);
//     if (socket) {
//       socket.emit("progress", {
//         processed: globalProgress.processed,
//         total: globalProgress.total,
//       });
//     }

//     return objectIds.map((objectId) => ({ Identity: queryParam, ObjectID: objectId }));
//   } catch (error) {
//     console.error(`❌ Error fetching ${type} ${queryParam}:`, error);
//     return [];
//   }
// };

// const processInBatches = async (items, type, socketId, globalProgress, accountId, passcode) => {
//   const results = [];
//   for (let i = 0; i < items.length; i += MAX_BATCH_SIZE) {
//     const batch = items.slice(i, i + MAX_BATCH_SIZE);

//     const batchResults = await Promise.all(
//       batch.map((item) => limit(() => fetchObjectIds(item, type, socketId, globalProgress, accountId, passcode)))
//     );

//     results.push(...batchResults.flat());
//   }

//   return results;
// };

// app.post("/upload", upload.single("file"), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No file uploaded." });

//   const { accountId, passcode } = req.body;
//   if (!accountId || !passcode) return res.status(400).json({ error: "Account ID and Passcode required." });

//   const socketId = req.headers["socket-id"];
//   const socket = connectedClients.get(socketId);

//   const identities = [];
//   const emails = [];
//   const filePath = req.file.path;

//   fs.createReadStream(filePath)
//     .pipe(csvParser())
//     .on("data", (row) => {
//       if (row.Identity?.trim()) identities.push(row.Identity.trim());
//       if (row.Email?.trim()) emails.push(row.Email.trim());
//     })
//     .on("end", async () => {
//       const totalEntries = identities.length + emails.length;
//       const globalProgress = { processed: 0, total: totalEntries };

//       const identityResults = await processInBatches(identities, "identity", socketId, globalProgress, accountId, passcode);
//       const emailResults = await processInBatches(emails, "email", socketId, globalProgress, accountId, passcode);

//       const output = [...identityResults, ...emailResults];

//       const outputFilePath = "output.csv";
//       const csvWriter = createObjectCsvWriter({
//         path: outputFilePath,
//         header: [{ id: "Identity", title: "Identity" }, { id: "ObjectID", title: "Object ID" }],
//       });

//       await csvWriter.writeRecords(output);

//       if (socket) socket.emit("progress", { processed: output.length, total: totalEntries, complete: true });

//       res.download(outputFilePath, "processed_data.csv", () => {
//         fs.unlinkSync(filePath);
//         fs.unlinkSync(outputFilePath);
//       });
//     });
// });

// server.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });






// import express from "express";
// import cors from "cors";
// import fetch from "node-fetch";
// import multer from "multer";
// import csvParser from "csv-parser";
// import { createObjectCsvWriter } from "csv-writer";
// import fs from "fs";
// import pLimit from "p-limit";
// import { Server } from "socket.io";
// import http from "http";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// const PORT = 5001;
// app.use(cors());
// app.use(express.json());

// const upload = multer({ dest: "uploads/" });

// const MAX_BATCH_SIZE = 1000;
// const MAX_CONCURRENT_REQUESTS = 3;
// const limit = pLimit(MAX_CONCURRENT_REQUESTS);

// const connectedClients = new Map();

// io.on("connection", (socket) => {
//   console.log(`🔗 Client connected: ${socket.id}`);
//   connectedClients.set(socket.id, socket);

//   socket.on("disconnect", () => {
//     console.log(`❌ Client disconnected: ${socket.id}`);
//     connectedClients.delete(socket.id);
//   });
// });

// const fetchObjectIds = async (queryParam, type, socketId, globalProgress, accountId, passcode) => {
//   try {
//     const response = await fetch(`https://api.clevertap.com/1/profile.json?${type}=${encodeURIComponent(queryParam)}`, {
//       method: "GET",
//       headers: {
//         "X-CleverTap-Account-Id": accountId,
//         "X-CleverTap-Passcode": passcode,
//         "Content-Type": "application/json",
//       },
//     });

//     const data = await response.json();
//     const objectIds = data?.record?.platformInfo?.map((p) => p.objectId) || [];

//     globalProgress.processed += 1;
//     const socket = connectedClients.get(socketId);
//     if (socket) {
//       socket.emit("progress", {
//         processed: globalProgress.processed,
//         total: globalProgress.total,
//       });
//     }

//     return objectIds.map((objectId) => ({ Identity: queryParam, ObjectID: objectId }));
//   } catch (error) {
//     console.error(`❌ Error fetching ${type} ${queryParam}:`, error);
//     return [];
//   }
// };

// const processInBatches = async (items, type, socketId, globalProgress, accountId, passcode) => {
//   const results = [];
//   for (let i = 0; i < items.length; i += MAX_BATCH_SIZE) {
//     const batch = items.slice(i, i + MAX_BATCH_SIZE);

//     const batchResults = await Promise.all(
//       batch.map((item) => limit(() => fetchObjectIds(item, type, socketId, globalProgress, accountId, passcode)))
//     );

//     results.push(...batchResults.flat());
//   }

//   return results;
// };

// // New function for demerging profiles
// const demergeProfiles = async (identities, socketId, accountId, passcode) => {
//   try {
//     const response = await fetch("https://api.clevertap.com/1/demerge/profiles.json", {
//       method: "POST",
//       headers: {
//         "X-CleverTap-Account-Id": accountId,
//         "X-CleverTap-Passcode": passcode,
//         "Content-Type": "application/json; charset=utf-8",
//       },
//       body: JSON.stringify({ identities }),
//     });

//     const data = await response.json();
    
//     const socket = connectedClients.get(socketId);
//     if (socket) {
//       socket.emit("demergeComplete", { success: true, data });
//     }
    
//     return data;
//   } catch (error) {
//     console.error("❌ Error demerging profiles:", error);
    
//     const socket = connectedClients.get(socketId);
//     if (socket) {
//       socket.emit("demergeComplete", { success: false, error: error.message });
//     }
    
//     return { error: error.message };
//   }
// };

// // Process demerge in batches
// const processDemergeBatches = async (rows, socketId, globalProgress, accountId, passcode) => {
//   const validIdentities = [];
  
//   // Extract valid identities from CSV
//   rows.forEach(row => {
//     if (row.Email && row.Email !== '-') validIdentities.push(row.Email);
//     if (row.Identity && row.Identity !== '-') validIdentities.push(row.Identity);
//   });
  
//   const results = [];
//   for (let i = 0; i < validIdentities.length; i += MAX_BATCH_SIZE) {
//     const batch = validIdentities.slice(i, i + MAX_BATCH_SIZE);
//     const socket = connectedClients.get(socketId);
    
//     if (socket) {
//       socket.emit("demergeProgress", {
//         processed: i,
//         total: validIdentities.length,
//       });
//     }
    
//     const batchResult = await demergeProfiles(batch, socketId, accountId, passcode);
//     results.push(batchResult);
    
//     globalProgress.processed += batch.length;
//   }
  
//   return results;
// };

// app.post("/upload", upload.single("file"), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No file uploaded." });

//   const { accountId, passcode } = req.body;
//   if (!accountId || !passcode) return res.status(400).json({ error: "Account ID and Passcode required." });

//   const socketId = req.headers["socket-id"];
//   const socket = connectedClients.get(socketId);

//   const identities = [];
//   const emails = [];
//   const filePath = req.file.path;

//   fs.createReadStream(filePath)
//     .pipe(csvParser())
//     .on("data", (row) => {
//       if (row.Identity?.trim() && row.Identity !== '-') identities.push(row.Identity.trim());
//       if (row.Email?.trim() && row.Email !== '-') emails.push(row.Email.trim());
//     })
//     .on("end", async () => {
//       const totalEntries = identities.length + emails.length;
//       const globalProgress = { processed: 0, total: totalEntries };

//       const identityResults = await processInBatches(identities, "identity", socketId, globalProgress, accountId, passcode);
//       const emailResults = await processInBatches(emails, "email", socketId, globalProgress, accountId, passcode);

//       const output = [...identityResults, ...emailResults];

//       const outputFilePath = "output.csv";
//       const csvWriter = createObjectCsvWriter({
//         path: outputFilePath,
//         header: [{ id: "Identity", title: "Identity" }, { id: "ObjectID", title: "Object ID" }],
//       });

//       await csvWriter.writeRecords(output);

//       if (socket) socket.emit("progress", { processed: output.length, total: totalEntries, complete: true });

//       res.download(outputFilePath, "processed_data.csv", () => {
//         fs.unlinkSync(filePath);
//         fs.unlinkSync(outputFilePath);
//       });
//     });
// });

// // New endpoint for demerge operation
// app.post("/demerge", upload.single("file"), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No file uploaded." });

//   const { accountId, passcode } = req.body;
//   if (!accountId || !passcode) return res.status(400).json({ error: "Account ID and Passcode required." });

//   const socketId = req.headers["socket-id"];
//   const socket = connectedClients.get(socketId);

//   const filePath = req.file.path;
//   const rows = [];

//   fs.createReadStream(filePath)
//     .pipe(csvParser())
//     .on("data", (row) => {
//       rows.push(row);
//     })
//     .on("end", async () => {
//       const globalProgress = { processed: 0, total: rows.length };
      
//       try {
//         const demergeResults = await processDemergeBatches(rows, socketId, globalProgress, accountId, passcode);
        
//         // Create a results CSV
//         const outputFilePath = "demerge_results.csv";
//         const csvWriter = createObjectCsvWriter({
//           path: outputFilePath,
//           header: [
//             { id: "identity", title: "Identity" },
//             { id: "status", title: "Status" },
//             { id: "message", title: "Message" }
//           ],
//         });

//         // Format results for CSV
//         const resultsForCsv = [];
//         demergeResults.forEach(batchResult => {
//           if (batchResult.status === "success") {
//             batchResult.processed.forEach(item => {
//               resultsForCsv.push({
//                 identity: item.identity,
//                 status: "success",
//                 message: item.message || "Profile demerged successfully"
//               });
//             });
//           } else if (batchResult.unprocessed) {
//             batchResult.unprocessed.forEach(item => {
//               resultsForCsv.push({
//                 identity: item.identity,
//                 status: "failed",
//                 message: item.error || "Demerge operation failed"
//               });
//             });
//           }
//         });

//         await csvWriter.writeRecords(resultsForCsv);

//         if (socket) socket.emit("demergeProgress", { processed: rows.length, total: rows.length, complete: true });

//         res.download(outputFilePath, "demerge_results.csv", () => {
//           fs.unlinkSync(filePath);
//           fs.unlinkSync(outputFilePath);
//         });
//       } catch (error) {
//         console.error("❌ Error in demerge operation:", error);
//         res.status(500).json({ error: "Demerge operation failed" });
//         fs.unlinkSync(filePath);
//       }
//     });
// });

// server.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });


























import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import multer from "multer";
import csvParser from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import pLimit from "p-limit";
import { Server } from "socket.io";
import http from "http";
import winston from "winston";
import path from "path";

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'clevertap-api-server' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ],
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = 5001;
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer with error handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('file');

const MAX_BATCH_SIZE = 100;
const MAX_CONCURRENT_REQUESTS = 3;
const limit = pLimit(MAX_CONCURRENT_REQUESTS);

const connectedClients = new Map();

// Request tracking
const activeRequests = new Map();
const requestStats = {
  total: 0,
  success: 0,
  failed: 0,
  inProgress: 0
};

// Middleware to log all incoming requests
app.use((req, res, next) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  req.requestId = requestId;
  
  const startTime = Date.now();
  
  logger.info({
    message: 'Request received',
    method: req.method,
    url: req.url,
    requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    
    logger[logLevel]({
      message: 'Request completed',
      method: req.method,
      url: req.url,
      requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
});

io.on("connection", (socket) => {
  logger.info({
    message: 'Client connected',
    socketId: socket.id,
    ip: socket.handshake.address
  });
  
  connectedClients.set(socket.id, socket);
  
  // Send current stats to newly connected client
  socket.emit("serverStats", {
    ...requestStats,
    activeClients: connectedClients.size
  });

  socket.on("disconnect", () => {
    logger.info({
      message: 'Client disconnected',
      socketId: socket.id
    });
    connectedClients.delete(socket.id);
  });
});

// Regular stats broadcast
setInterval(() => {
  io.emit("serverStats", {
    ...requestStats,
    activeClients: connectedClients.size,
    timestamp: new Date().toISOString()
  });
}, 5000);

const fetchObjectIds = async (queryParam, type, socketId, globalProgress, accountId, passcode, requestId) => {
  const apiRequestId = `${requestId}-${type}-${queryParam}`;
  activeRequests.set(apiRequestId, { 
    type: 'fetchObjectIds', 
    param: queryParam, 
    paramType: type,
    startTime: Date.now() 
  });
  
  requestStats.total++;
  requestStats.inProgress++;
  
  try {
    logger.info({
      message: 'API request started',
      requestId,
      apiRequestId,
      operation: 'fetchObjectIds',
      type,
      param: queryParam
    });
    
    const response = await fetch(`https://api.clevertap.com/1/profile.json?${type}=${encodeURIComponent(queryParam)}`, {
      method: "GET",
      headers: {
        "X-CleverTap-Account-Id": accountId,
        "X-CleverTap-Passcode": passcode,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    const objectIds = data?.record?.platformInfo?.map((p) => p.objectId) || [];

    // Log response status
    const success = response.ok && Array.isArray(objectIds);
    const duration = Date.now() - activeRequests.get(apiRequestId).startTime;
    
    if (success) {
      logger.info({
        message: 'API request successful',
        requestId,
        apiRequestId,
        operation: 'fetchObjectIds',
        type,
        param: queryParam,
        status: response.status,
        objectIdsFound: objectIds.length,
        duration: `${duration}ms`
      });
      requestStats.success++;
    } else {
      logger.error({
        message: 'API request failed',
        requestId,
        apiRequestId,
        operation: 'fetchObjectIds',
        type,
        param: queryParam,
        status: response.status,
        responseBody: data,
        duration: `${duration}ms`
      });
      requestStats.failed++;
    }

    globalProgress.processed += 1;
    const socket = connectedClients.get(socketId);
    if (socket) {
      socket.emit("progress", {
        processed: globalProgress.processed,
        total: globalProgress.total,
        apiStatus: {
          operation: 'fetchObjectIds',
          type,
          param: queryParam,
          success,
          objectIdsFound: objectIds.length
        }
      });
    }

    activeRequests.delete(apiRequestId);
    requestStats.inProgress--;
    return objectIds.map((objectId) => ({ Identity: queryParam, ObjectID: objectId }));
  } catch (error) {
    const duration = Date.now() - (activeRequests.get(apiRequestId)?.startTime || Date.now());
    logger.error({
      message: 'API request error',
      requestId,
      apiRequestId,
      operation: 'fetchObjectIds',
      type,
      param: queryParam,
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    });
    
    requestStats.failed++;
    requestStats.inProgress--;
    activeRequests.delete(apiRequestId);
    
    const socket = connectedClients.get(socketId);
    if (socket) {
      socket.emit("apiError", {
        operation: 'fetchObjectIds',
        type,
        param: queryParam,
        error: error.message
      });
    }
    
    return [];
  }
};

const processInBatches = async (items, type, socketId, globalProgress, accountId, passcode, requestId) => {
  logger.info({
    message: 'Starting batch processing',
    requestId,
    operation: 'processInBatches',
    type,
    itemCount: items.length,
    batchSize: MAX_BATCH_SIZE,
    concurrency: MAX_CONCURRENT_REQUESTS
  });
  
  const results = [];
  for (let i = 0; i < items.length; i += MAX_BATCH_SIZE) {
    const batch = items.slice(i, i + MAX_BATCH_SIZE);
    const batchId = `batch-${i}-${i+batch.length}`;
    
    logger.info({
      message: 'Processing batch',
      requestId,
      batchId,
      batchStart: i,
      batchEnd: i + batch.length,
      batchSize: batch.length
    });

    const batchResults = await Promise.all(
      batch.map((item) => 
        limit(() => fetchObjectIds(item, type, socketId, globalProgress, accountId, passcode, requestId))
      )
    );

    results.push(...batchResults.flat());
    
    logger.info({
      message: 'Batch completed',
      requestId,
      batchId,
      resultsCount: batchResults.flat().length
    });
  }

  logger.info({
    message: 'Batch processing complete',
    requestId,
    operation: 'processInBatches',
    type,
    totalResults: results.length
  });
  
  return results;
};

// Demerge profiles with detailed logging
const demergeProfiles = async (identities, socketId, accountId, passcode, requestId) => {
  const apiRequestId = `${requestId}-demerge-batch`;
  activeRequests.set(apiRequestId, { 
    type: 'demergeProfiles', 
    identityCount: identities.length,
    startTime: Date.now() 
  });
  
  requestStats.total++;
  requestStats.inProgress++;

  // Log each identity before making the API request
  identities.forEach(identity => {
    logger.info({
      message: 'Processing identity for demerge',
      requestId,
      apiRequestId,
      service: "clevertap-api-server",
      identity
    });
  });

  try {
    logger.info({
      message: 'Demerge API request started',
      requestId,
      apiRequestId,
      operation: 'demergeProfiles',
      identityCount: identities.length
    });
    
    const response = await fetch("https://api.clevertap.com/1/demerge/profiles.json", {
      method: "POST",
      headers: {
        "X-CleverTap-Account-Id": accountId,
        "X-CleverTap-Passcode": passcode,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ identities }),
    });

    const data = await response.json();
    const duration = Date.now() - activeRequests.get(apiRequestId).startTime;
    
    if (response.ok) {
      logger.info({
        message: 'Demerge API request successful',
        requestId,
        apiRequestId,
        operation: 'demergeProfiles',
        status: response.status,
        processed: data.processed?.length || 0,
        unprocessed: data.unprocessed?.length || 0,
        duration: `${duration}ms`
      });
      requestStats.success++;

      // Log each successfully processed identity
      if (data.processed?.length) {
        data.processed.forEach(identity => {
          logger.info({
            message: 'Successfully demerged identity',
            requestId,
            apiRequestId,
            service: "clevertap-api-server",
            identity
          });
        });
      }

    } else {
      logger.error({
        message: 'Demerge API request failed',
        requestId,
        apiRequestId,
        operation: 'demergeProfiles',
        status: response.status,
        responseBody: data,
        duration: `${duration}ms`
      });

      // Log unprocessed identities
      if (data.unprocessed?.length) {
        data.unprocessed.forEach(identity => {
          logger.warn({
            message: 'Failed to demerge identity',
            requestId,
            apiRequestId,
            service: "clevertap-api-server",
            identity
          });
        });
      }

      requestStats.failed++;
    }
    
    const socket = connectedClients.get(socketId);
    if (socket) {
      socket.emit("demergeComplete", { 
        success: response.ok, 
        data,
        requestId,
        duration: `${duration}ms`
      });
    }
    
    activeRequests.delete(apiRequestId);
    requestStats.inProgress--;
    return data;
  } catch (error) {
    const duration = Date.now() - (activeRequests.get(apiRequestId)?.startTime || Date.now());
    logger.error({
      message: 'Demerge API request error',
      requestId,
      apiRequestId,
      operation: 'demergeProfiles',
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    });

    // Log each failed identity
    identities.forEach(identity => {
      logger.error({
        message: 'Error processing identity',
        requestId,
        apiRequestId,
        service: "clevertap-api-server",
        identity
      });
    });
    
    requestStats.failed++;
    requestStats.inProgress--;
    activeRequests.delete(apiRequestId);
    
    const socket = connectedClients.get(socketId);
    if (socket) {
      socket.emit("demergeComplete", { 
        success: false, 
        error: error.message,
        requestId 
      });
    }
    
    return { error: error.message };
  }
};


const processDemergeBatches = async (rows, socketId, globalProgress, accountId, passcode, requestId) => {
  logger.info({
    message: 'Starting demerge batch processing',
    requestId,
    operation: 'processDemergeBatches',
    rowCount: rows.length
  });
  
  const validIdentities = [];
  
  // Extract valid identities from CSV
  rows.forEach(row => {
    if (row.Email && row.Email !== '-') validIdentities.push(row.Email);
    if (row.Identity && row.Identity !== '-') validIdentities.push(row.Identity);
  });
  
  logger.info({
    message: 'Valid identities extracted',
    requestId,
    validIdentitiesCount: validIdentities.length,
    totalRows: rows.length
  });
  
  const results = [];
  for (let i = 0; i < validIdentities.length; i += MAX_BATCH_SIZE) {
    const batch = validIdentities.slice(i, i + MAX_BATCH_SIZE);
    const batchId = `demerge-batch-${i}-${i+batch.length}`;
    
    logger.info({
      message: 'Processing demerge batch',
      requestId,
      batchId,
      batchStart: i,
      batchEnd: i + batch.length,
      batchSize: batch.length
    });
    
    const socket = connectedClients.get(socketId);
    
    if (socket) {
      socket.emit("demergeProgress", {
        processed: i,
        total: validIdentities.length,
        batchId
      });
    }
    
    const batchResult = await demergeProfiles(batch, socketId, accountId, passcode, requestId);
    results.push(batchResult);
    
    logger.info({
      message: 'Demerge batch completed',
      requestId,
      batchId,
      processedCount: batchResult.processed?.length || 0,
      unprocessedCount: batchResult.unprocessed?.length || 0
    });
    
    globalProgress.processed += batch.length;
  }
  
  logger.info({
    message: 'Demerge batch processing complete',
    requestId,
    operation: 'processDemergeBatches',
    totalResults: results.length,
    totalIdentitiesProcessed: globalProgress.processed
  });
  
  return results;
};

app.post("/upload", (req, res) => {
  upload(req, res, async function(err) {
    const requestId = req.requestId;
    
    if (err) {
      logger.error({
        message: 'File upload error',
        requestId,
        error: err.message
      });
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      logger.error({
        message: 'No file uploaded',
        requestId
      });
      return res.status(400).json({ error: "No file uploaded." });
    }

    const { accountId, passcode } = req.body;
    if (!accountId || !passcode) {
      logger.error({
        message: 'Missing credentials',
        requestId,
        hasAccountId: !!accountId,
        hasPasscode: !!passcode
      });
      return res.status(400).json({ error: "Account ID and Passcode required." });
    }

    logger.info({
      message: 'File uploaded successfully',
      requestId,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    const socketId = req.headers["socket-id"];
    const socket = connectedClients.get(socketId);

    const identities = [];
    const emails = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        if (row.Identity?.trim() && row.Identity !== '-') identities.push(row.Identity.trim());
        if (row.Email?.trim() && row.Email !== '-') emails.push(row.Email.trim());
      })
      .on("error", (error) => {
        logger.error({
          message: 'CSV parsing error',
          requestId,
          error: error.message,
          stack: error.stack
        });
        
        return res.status(400).json({ error: "Failed to parse CSV file: " + error.message });
      })
      .on("end", async () => {
        logger.info({
          message: 'CSV parsing complete',
          requestId,
          identitiesCount: identities.length,
          emailsCount: emails.length
        });
        
        const totalEntries = identities.length + emails.length;
        const globalProgress = { processed: 0, total: totalEntries };

        try {
          const identityResults = await processInBatches(identities, "identity", socketId, globalProgress, accountId, passcode, requestId);
          const emailResults = await processInBatches(emails, "email", socketId, globalProgress, accountId, passcode, requestId);

          const output = [...identityResults, ...emailResults];

          logger.info({
            message: 'All processing complete',
            requestId,
            totalResults: output.length,
          });
          
          const outputFilePath = `output-${requestId}.csv`;
          const csvWriter = createObjectCsvWriter({
            path: outputFilePath,
            header: [
              { id: "Identity", title: "Identity" }, 
              { id: "ObjectID", title: "Object ID" }
            ],
          });

          await csvWriter.writeRecords(output);

          logger.info({
            message: 'CSV file created',
            requestId,
            outputPath: outputFilePath,
            recordCount: output.length
          });
          
          if (socket) {
            socket.emit("progress", { 
              processed: output.length, 
              total: totalEntries, 
              complete: true,
              requestId
            });
          }

          res.download(outputFilePath, "processed_data.csv", (err) => {
            if (err) {
              logger.error({
                message: 'File download error',
                requestId,
                error: err.message
              });
            } else {
              logger.info({
                message: 'File download initiated',
                requestId,
                filename: "processed_data.csv"
              });
            }
            
            // Clean up files
            fs.unlink(filePath, (err) => {
              if (err) logger.error({
                message: 'Error deleting input file',
                requestId,
                path: filePath,
                error: err.message
              });
            });
            
            fs.unlink(outputFilePath, (err) => {
              if (err) logger.error({
                message: 'Error deleting output file',
                requestId,
                path: outputFilePath,
                error: err.message
              });
            });
          });
        } catch (error) {
          logger.error({
            message: 'Processing error',
            requestId,
            error: error.message,
            stack: error.stack
          });
          
          if (socket) {
            socket.emit("error", { 
              message: "Processing failed: " + error.message,
              requestId
            });
          }
          
          res.status(500).json({ error: "Processing failed: " + error.message });
          
          fs.unlink(filePath, (err) => {
            if (err) logger.error({
              message: 'Error deleting input file after error',
              requestId,
              path: filePath,
              error: err.message
            });
          });
        }
      });
  });
});

// Demerge endpoint with enhanced error handling and logging
app.post("/demerge", (req, res) => {
  upload(req, res, async function(err) {
    const requestId = req.requestId;
    
    if (err) {
      logger.error({
        message: 'File upload error for demerge',
        requestId,
        error: err.message
      });
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      logger.error({
        message: 'No file uploaded for demerge',
        requestId
      });
      return res.status(400).json({ error: "No file uploaded." });
    }

    const { accountId, passcode } = req.body;
    if (!accountId || !passcode) {
      logger.error({
        message: 'Missing credentials for demerge',
        requestId
      });
      return res.status(400).json({ error: "Account ID and Passcode required." });
    }

    logger.info({
      message: 'File uploaded successfully for demerge',
      requestId,
      filename: req.file.originalname,
      size: req.file.size
    });
    
    const socketId = req.headers["socket-id"];
    const socket = connectedClients.get(socketId);

    const filePath = req.file.path;
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("error", (error) => {
        logger.error({
          message: 'CSV parsing error for demerge',
          requestId,
          error: error.message
        });
        
        return res.status(400).json({ error: "Failed to parse CSV file: " + error.message });
      })
      .on("end", async () => {
        logger.info({
          message: 'CSV parsing complete for demerge',
          requestId,
          rowCount: rows.length
        });
        
        const globalProgress = { processed: 0, total: rows.length };
        
        try {
          const demergeResults = await processDemergeBatches(rows, socketId, globalProgress, accountId, passcode, requestId);
          
          logger.info({
            message: 'Demerge processing complete',
            requestId,
            resultCount: demergeResults.length
          });
          
          // Create a results CSV
          const outputFilePath = `demerge_results-${requestId}.csv`;
          const csvWriter = createObjectCsvWriter({
            path: outputFilePath,
            header: [
              { id: "identity", title: "Identity" },
              { id: "status", title: "Status" },
              { id: "message", title: "Message" }
            ],
          });

          // Format results for CSV
          const resultsForCsv = [];
          demergeResults.forEach(batchResult => {
            if (batchResult.status === "success" && batchResult.processed) {
              batchResult.processed.forEach(item => {
                resultsForCsv.push({
                  identity: item.identity,
                  status: "success",
                  message: item.message || "Profile demerged successfully"
                });
              });
            } else if (batchResult.unprocessed) {
              batchResult.unprocessed.forEach(item => {
                resultsForCsv.push({
                  identity: item.identity,
                  status: "failed",
                  message: item.error || "Demerge operation failed"
                });
              });
            }
          });

          await csvWriter.writeRecords(resultsForCsv);
          
          logger.info({
            message: 'Demerge results CSV created',
            requestId,
            outputPath: outputFilePath,
            successCount: resultsForCsv.filter(r => r.status === "success").length,
            failureCount: resultsForCsv.filter(r => r.status === "failed").length
          });

          if (socket) {
            socket.emit("demergeProgress", { 
              processed: rows.length, 
              total: rows.length, 
              complete: true,
              requestId,
              summary: {
                total: resultsForCsv.length,
                success: resultsForCsv.filter(r => r.status === "success").length,
                failed: resultsForCsv.filter(r => r.status === "failed").length
              }
            });
          }

          res.download(outputFilePath, "demerge_results.csv", (err) => {
            if (err) {
              logger.error({
                message: 'File download error for demerge',
                requestId,
                error: err.message
              });
            } else {
              logger.info({
                message: 'Demerge file download initiated',
                requestId,
                filename: "demerge_results.csv"
              });
            }
            
            // Clean up files
            fs.unlink(filePath, (err) => {
              if (err) logger.error({
                message: 'Error deleting input file after demerge',
                requestId,
                path: filePath,
                error: err.message
              });
            });
            
            fs.unlink(outputFilePath, (err) => {
              if (err) logger.error({
                message: 'Error deleting output file after demerge',
                requestId,
                path: outputFilePath,
                error: err.message
              });
            });
          });
        } catch (error) {
          logger.error({
            message: 'Demerge processing error',
            requestId,
            error: error.message,
            stack: error.stack
          });
          
          if (socket) {
            socket.emit("error", { 
              message: "Demerge operation failed: " + error.message,
              requestId
            });
          }
          
          res.status(500).json({ error: "Demerge operation failed: " + error.message });
          
          fs.unlink(filePath, (err) => {
            if (err) logger.error({
              message: 'Error deleting input file after demerge error',
              requestId,
              path: filePath,
              error: err.message
            });
          });
        }
      });
  });
});


app.post("/api/clevertap-proxy", async (req, res) => {
  const requestId = req.requestId;
  const { accountId, passcode, data } = req.body;
  
  if (!accountId || !passcode || !data) {
    logger.error({
      message: 'Missing required parameters',
      requestId,
      endpoint: '/api/clevertap-proxy'
    });
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  const apiRequestId = `${requestId}-upload`;
  activeRequests.set(apiRequestId, { 
    type: 'upload', 
    startTime: Date.now(),
    recordCount: data.d?.length || 0
  });
  
  requestStats.total++;
  requestStats.inProgress++;
  
  try {
    logger.info({
      message: 'API upload request started',
      requestId,
      apiRequestId,
      operation: 'upload',
      recordCount: data.d?.length || 0
    });
    
    const response = await fetch('https://api.clevertap.com/1/upload', {
      method: 'POST',
      headers: {
        'X-CleverTap-Account-Id': accountId,
        'X-CleverTap-Passcode': passcode,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(data)
    });
    
    const responseData = await response.json();
    const duration = Date.now() - activeRequests.get(apiRequestId).startTime;
    
    if (response.ok) {
      logger.info({
        message: 'API upload successful',
        requestId,
        apiRequestId,
        operation: 'upload',
        status: response.status,
        recordCount: data.d?.length || 0,
        duration: `${duration}ms`,
        response: responseData
      });
      requestStats.success++;
    } else {
      logger.error({
        message: 'API upload failed',
        requestId,
        apiRequestId,
        operation: 'upload',
        status: response.status,
        duration: `${duration}ms`,
        response: JSON.stringify(responseData, null, 2) // ✅ More readable error logs
      });
      requestStats.failed++;
    }
    
    activeRequests.delete(apiRequestId);
    requestStats.inProgress--;
    
    return res.status(response.status).json(responseData);
  } catch (error) {
    const duration = Date.now() - (activeRequests.get(apiRequestId)?.startTime || Date.now());
    
    logger.error({
      message: 'API upload error',
      requestId,
      apiRequestId,
      operation: 'upload',
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    });
    
    requestStats.failed++;
    requestStats.inProgress--;
    activeRequests.delete(apiRequestId);
    
    return res.status(500).json({ error: error.message });
  }
});

// Endpoint to process CSV file and update CleverTap profiles
app.post("/api/process-csv", (req, res) => {
  upload(req, res, async function (err) {
    const requestId = req.requestId;
    
    if (err instanceof multer.MulterError) {
      logger.error({
        message: 'File upload error',
        requestId,
        error: err.message
      });
      return res.status(400).json({ error: err.message });
    } else if (err) {
      logger.error({
        message: 'Unknown upload error',
        requestId,
        error: err.message
      });
      return res.status(500).json({ error: err.message });
    }
    
    if (!req.file) {
      logger.error({
        message: 'No file uploaded',
        requestId
      });
      return res.status(400).json({ error: 'Please upload a CSV file' });
    }
    
    const { accountId, passcode, batchSize = MAX_BATCH_SIZE } = req.body;
    
    if (!accountId || !passcode) {
      logger.error({
        message: 'Missing API credentials',
        requestId
      });
      return res.status(400).json({ error: 'CleverTap Account ID and Passcode are required' });
    }
    
    const socketId = req.body.socketId;
    const socket = socketId ? connectedClients.get(socketId) : null;
    
    try {
      const filePath = req.file.path;
      logger.info({
        message: 'CSV file received',
        requestId,
        file: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
      
      const rows = [];
      let hasIdentityColumn = false;
      let hasObjectIdColumn = false;
      
      // First parse the CSV to validate format and extract data
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on('headers', (headers) => {
            hasIdentityColumn = headers.includes('Identity');
            hasObjectIdColumn = headers.includes('Object ID');
            
            if (!hasIdentityColumn && !hasObjectIdColumn) {
              reject(new Error('CSV must have either "Identity" or "Object ID" columns'));
            }
          })
          .on('data', (row) => {
            // Check if this row has valid data
            if ((hasIdentityColumn && row.Identity) || (hasObjectIdColumn && row['Object ID'])) {
              rows.push(row);
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });
      
      if (rows.length === 0) {
        throw new Error('No valid data found in CSV');
      }
      
      logger.info({
        message: 'CSV parsing complete',
        requestId,
        rowCount: rows.length,
        hasIdentityColumn,
        hasObjectIdColumn
      });
      
      // Process rows based on available columns
      const identities = hasIdentityColumn ? 
        [...new Set(rows.filter(r => r.Identity).map(r => r.Identity))] : 
        [];
      
      const objectIds = hasObjectIdColumn ?
        rows.filter(r => r['Object ID'])
          .map(r => ({
            identity: r.Identity || null, 
            objectId: r['Object ID']
          })) : 
        [];
      
      // Track progress
      const globalProgress = {
        total: identities.length + objectIds.length,
        processed: 0
      };
      
      if (socket) {
        socket.emit("processingStarted", {
          total: globalProgress.total,
          file: req.file.originalname
        });
      }
      
      // Process the profiles based on identities first
      let profileUpdates = [];
      
      if (identities.length > 0) {
        logger.info({
          message: 'Processing identities',
          requestId,
          count: identities.length
        });
        
        // Fetch object IDs for each identity
        const identityResults = await processInBatches(
          identities, 
          'identity', 
          socketId, 
          globalProgress, 
          accountId, 
          passcode,
          requestId
        );
        
        profileUpdates.push(...identityResults);
      }
      
      // Add direct object IDs from CSV
      if (objectIds.length > 0) {
        logger.info({
          message: 'Processing direct object IDs',
          requestId,
          count: objectIds.length
        });
        
        profileUpdates.push(...objectIds.map(item => ({
          Identity: item.identity || '',
          ObjectID: item.objectId
        })));
      }
      
      logger.info({
        message: 'Profile updates prepared',
        requestId,
        count: profileUpdates.length
      });
      
      // Process the updates in batches
      const effectiveBatchSize = Math.min(parseInt(batchSize), MAX_BATCH_SIZE);
      let successCount = 0;
      let failCount = 0;
      const results = [];
      
      // Create batches of profiles to update
      const batches = [];
      for (let i = 0; i < profileUpdates.length; i += effectiveBatchSize) {
        batches.push(profileUpdates.slice(i, i + effectiveBatchSize));
      }
      
      logger.info({
        message: 'Starting profile updates',
        requestId,
        batches: batches.length,
        batchSize: effectiveBatchSize
      });
      
      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchId = `update-batch-${batchIndex}`;
        
        try {
          // Prepare the payload
          console.log("Raw profile updates:", JSON.stringify(profileUpdates, null, 2));

          // Prepare the payload
          const payload = {
            "d": profileUpdates.map(item => ({
              objectId: item.ObjectID,  // Ensure correct key name
              type: "profile",
              profileData: { "identity": item.Identity } // Correctly map Identity
            }))
          };

          console.log("Fixed Profile update payload:", JSON.stringify(payload, null, 2));





          // {"d":[{"objectId":"25b08803c1af4e00839f530264dac6f8","type":"profile","profileData":{"Identity": "93"}}]}

          if (payload.d.length === 0) continue;
          
          logger.info({
            message: 'Processing update batch',
            requestId,
            batchId,
            batchNumber: batchIndex + 1,
            totalBatches: batches.length,
            recordCount: payload.d.length
          });
          
          // Make the API request
          const response = await fetch('https://api.clevertap.com/1/upload', {
            method: 'POST',
            headers: {
              'X-CleverTap-Account-Id': accountId,
              'X-CleverTap-Passcode': passcode,
              'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(payload)
          });
          
          const responseData = await response.json();
          const success = response.ok;
          
          logger.info({
            message: success ? 'Batch update successful' : 'Batch update failed',
            requestId,
            batchId,
            status: response.status,
            response: responseData
          });
          
          // Update counters
          if (success) {
            successCount += payload.d.length;
          } else {
            failCount += payload.d.length;
          }
          
          // Store results for each profile
          batch.forEach(item => {
            results.push({
              identity: item.Identity || '',
              objectId: item.ObjectID,
              status: success ? 'Success' : 'Failed',
              details: success ? 'Processed' : JSON.stringify(responseData)
            });
          });
          
          // Send progress update
          if (socket) {
            socket.emit("batchProgress", {
              batch: batchIndex + 1,
              totalBatches: batches.length,
              success,
              processed: successCount + failCount,
              total: profileUpdates.length,
              currentBatchSize: batch.length
            });
          }
        } catch (error) {
          logger.error({
            message: 'Batch processing error',
            requestId,
            batchId,
            error: error.message,
            stack: error.stack
          });
          
          failCount += batch.length;
          
          // Store error results for each profile in batch
          batch.forEach(item => {
            results.push({
              identity: item.Identity || '',
              objectId: `__${item.ObjectID}`,
              status: 'Error',
              details: error.message
            });
          });
          
          // Send error notification
          if (socket) {
            socket.emit("batchError", {
              batch: batchIndex + 1,
              error: error.message
            });
          }
        }
      }
      
      // Generate a results file
      const resultsFilePath = `uploads/results-${Date.now()}.csv`;
      const csvWriter = createObjectCsvWriter({
        path: resultsFilePath,
        header: [
          { id: 'identity', title: 'Identity' },
          { id: 'objectId', title: 'Object ID' },
          { id: 'status', title: 'Status' },
          { id: 'details', title: 'Details' }
        ]
      });
      
      await csvWriter.writeRecords(results);
      
      logger.info({
        message: 'CSV processing complete',
        requestId,
        success: successCount,
        failed: failCount,
        total: profileUpdates.length,
        resultsFile: resultsFilePath
      });
      
      if (socket) {
        socket.emit("processingComplete", {
          success: successCount,
          failed: failCount,
          total: profileUpdates.length,
          resultsFile: path.basename(resultsFilePath)
        });
      }
      
      // Return results
      res.json({
        status: 'success',
        message: 'File processed successfully',
        results: {
          total: profileUpdates.length,
          success: successCount,
          failed: failCount
        },
        resultsFile: path.basename(resultsFilePath)
      });
      
      // Clean up the file after a delay
      setTimeout(() => {
        try {
          fs.unlinkSync(filePath);
          logger.info({
            message: 'Temporary file deleted',
            requestId,
            file: filePath
          });
        } catch (err) {
          logger.error({
            message: 'Error deleting temporary file',
            requestId,
            file: filePath,
            error: err.message
          });
        }
      }, 60000); // Delete after 1 minute
      
    } catch (error) {
      logger.error({
        message: 'CSV processing error',
        requestId,
        error: error.message,
        stack: error.stack
      });
      
      if (socket) {
        socket.emit("processingError", {
          error: error.message
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  });
});





app.get("/api/download/:filename", (req, res) => {
  const requestId = req.requestId;
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  if (!fs.existsSync(filePath)) {
    logger.error({
      message: 'File not found',
      requestId,
      filename
    });
    return res.status(404).json({ error: 'File not found' });
  }
  
  logger.info({
    message: 'File download requested',
    requestId,
    filename
  });
  
  res.download(filePath, filename, (err) => {
    if (err) {
      logger.error({
        message: 'File download error',
        requestId,
        filename,
        error: err.message
      });
    }
  });
});


























// Add status endpoint
app.get("/status", (req, res) => {
  const status = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    memoryUsage: process.memoryUsage(),
    activeClients: connectedClients.size,
    requestStats,
    activeRequests: Array.from(activeRequests.entries()).map(([id, data]) => ({
      id,
      ...data,
      elapsedMs: Date.now() - data.startTime
    }))
  };
  
  res.json(status);
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error({
    message: 'Unhandled server error',
    requestId: req.requestId,
    error: err.message,
    stack: err.stack
  });
  
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
    requestId: req.requestId
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

server.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});






export default app;