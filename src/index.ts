import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { apiRoutes } from './routes';
import config from './config';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = express();
const PORT = config.server.port;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api`);


  const METHOD = "get_info";
  const PARAMS = { height : 912345};

  const rpcUrl = `${config.monerod.rpcUrl}/json_rpc`;
  const body = {
    jsonrpc: "2.0",
    id: "0",
    method: METHOD,
    // params: PARAMS,
  };
  try {
    const res = await axios.post(rpcUrl, body, {
      headers : {
        "Content-Type" : "application/json"
      }
    });

    console.log("RPC response : ", res.data);

  } catch(err) {
    console.error("RPC request failed: ", err);
  }
});

export default app;
