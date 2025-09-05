export interface Config {
  server: {
    port: number;
    nodeEnv: string;
  };
  monerod: {
    rpcUrl: string;
    username: string;
    password: string;
  };
  p2pool: {
    apiUrl: string;
    username: string;
    password: string;
  };
  logging: {
    level: string;
  };
}

export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  monerod: {
    rpcUrl: process.env.MONEROD_RPC_URL || 'http://localhost:18081',
    username: process.env.MONEROD_RPC_USERNAME || '',
    password: process.env.MONEROD_RPC_PASSWORD || '',
  },
  p2pool: {
    apiUrl: process.env.P2POOL_RPC_URL || 'http://localhost:18083',
    username: process.env.P2POOL_RPC_USERNAME || '',
    password: process.env.P2POOL_RPC_PASSWORD || '',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
