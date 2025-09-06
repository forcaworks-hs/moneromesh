# MoneroMesh

An open source monerod & p2pool stats observer built with TypeScript and Node.js.

## Features

- 🚀 TypeScript Node.js backend
- 📊 Monero and P2Pool statistics monitoring
- 🔒 Secure API with Helmet and CORS
- 📈 Health monitoring endpoints
- 🛠️ Development-friendly with hot reload

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/forcaworks-hs/moneromesh.git
cd moneromesh
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
# Create .env file with the following content:
PORT=3000
NODE_ENV=development
MONEROD_RPC_URL=http://localhost:18081
MONEROD_RPC_USERNAME=
MONEROD_RPC_PASSWORD=
P2POOL_RPC_URL=http://localhost:18083
P2POOL_RPC_USERNAME=
P2POOL_RPC_PASSWORD=
LOG_LEVEL=info
```

4. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## External Services

This backend integrates with two external services:

### Monerod Node
- **Default URL**: `http://localhost:18081`
- **Purpose**: Fetches blockchain data (block height, network hashrate, difficulty, etc.)
- **Authentication**: Optional username/password for RPC calls

### P2Pool API
- **Default URL**: `http://localhost:18083`
- **Purpose**: Fetches mining pool statistics (pool hashrate, miners, workers, shares, etc.)
- **Authentication**: Optional username/password for API access

Make sure both services are running and accessible before starting the backend.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run dev:watch` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (coming soon)

## API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /api/health` - Detailed health information
- `GET /api/health/ping` - Simple ping endpoint

### Statistics
- `GET /api/stats` - Get all aggregated statistics
- `GET /api/stats/monerod` - Get Monero daemon stats (block height, network hashrate, difficulty, etc.)
- `GET /api/stats/p2pool` - Get P2Pool stats (pool hashrate, miners, workers, shares, etc.)
- `GET /api/stats/system` - Get system stats (uptime, memory, CPU usage)
- `GET /api/stats/network-hashrate` - Calculate network hashrate using multiple methods
- `GET /api/stats/connections` - Test connections to Monerod and P2Pool
- `GET /api/stats/cache` - Get cache status
- `POST /api/stats/cache/clear` - Clear statistics cache

## Project Structure

```
src/
├── index.ts              # Main application entry point
├── config/               # Configuration management
│   └── index.ts         # Environment configuration
├── middleware/           # Custom middleware
│   └── errorHandler.ts   # Error handling middleware
├── routes/              # API routes
│   ├── index.ts         # Route aggregator
│   ├── health.ts        # Health check routes
│   └── stats.ts         # Statistics routes
└── services/            # External service clients
    ├── monerodClient.ts  # Monerod RPC client
    ├── p2poolClient.ts   # P2Pool API client
    └── statsService.ts   # Statistics aggregation service
```

## Development

The project uses TypeScript with strict type checking. Make sure to:

1. Follow TypeScript best practices
2. Add proper error handling
3. Include JSDoc comments for complex functions
4. Test your endpoints before committing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

BSD 3-Clause License - see LICENSE file for details
