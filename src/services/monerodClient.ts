import axios, { AxiosInstance } from 'axios';

export interface MonerodStats {
  status: string;
  blockHeight: number;
  networkHashrate: string;
  difficulty: number;
  lastBlockTime: string;
  totalSupply: string;
  circulatingSupply: string;
  blockReward: string;
  averageBlockTime: number;
}

export class MonerodClient {
  private client: AxiosInstance;
  private rpcUrl: string;
  private username: string;
  private password: string;

  constructor(rpcUrl: string, username: string = '', password: string = '') {
    this.rpcUrl = rpcUrl;
    this.username = username;
    this.password = password;
    
    this.client = axios.create({
      baseURL: rpcUrl,
      timeout: 10000,
      auth: username && password ? { username, password } : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Make RPC call to Monerod node
   */
  private async rpcCall(method: string, params: any = {}): Promise<any> {
    try {
      const response = await this.client.post('/', {
        jsonrpc: '2.0',
        id: '0',
        method: method,
        params: params,
      });

      if (response.data.error) {
        throw new Error(`RPC Error: ${response.data.error.message}`);
      }

      return response.data.result;
    } catch (error) {
      console.error(`Monerod RPC call failed for method ${method}:`, error);
      throw error;
    }
  }

  /**
   * Get current block height
   */
  async getBlockHeight(): Promise<number> {
    try {
      const result = await this.rpcCall('get_block_count');
      return result.count;
    } catch (error) {
      console.error('Failed to get block height:', error);
      return 0;
    }
  }

  /**
   * Get network hashrate
   */
  async getNetworkHashrate(): Promise<string> {
    try {
      const result = await this.rpcCall('get_difficulty');
      // Convert difficulty to hashrate (approximate)
      const difficulty = result.difficulty;
      const hashrate = difficulty / 120; // Approximate calculation
      return this.formatHashrate(hashrate);
    } catch (error) {
      console.error('Failed to get network hashrate:', error);
      return '0 H/s';
    }
  }

  /**
   * Get current difficulty
   */
  async getDifficulty(): Promise<number> {
    try {
      const result = await this.rpcCall('get_difficulty');
      return result.difficulty;
    } catch (error) {
      console.error('Failed to get difficulty:', error);
      return 0;
    }
  }

  /**
   * Get last block info
   */
  async getLastBlockInfo(): Promise<{ timestamp: string; reward: string }> {
    try {
      const blockHeight = await this.getBlockHeight();
      const result = await this.rpcCall('get_block', { height: blockHeight - 1 });
      
      return {
        timestamp: new Date(result.block_header.timestamp * 1000).toISOString(),
        reward: (result.block_header.reward / 1e12).toFixed(12) // Convert from atomic units
      };
    } catch (error) {
      console.error('Failed to get last block info:', error);
      return {
        timestamp: new Date().toISOString(),
        reward: '0'
      };
    }
  }

  /**
   * Get total supply
   */
  async getTotalSupply(): Promise<string> {
    try {
      const result = await this.rpcCall('get_supply');
      return (result.total_supply / 1e12).toFixed(12); // Convert from atomic units
    } catch (error) {
      console.error('Failed to get total supply:', error);
      return '0';
    }
  }

  /**
   * Get comprehensive Monerod statistics
   */
  async getStats(): Promise<MonerodStats> {
    try {
      const [blockHeight, difficulty, lastBlockInfo, totalSupply] = await Promise.all([
        this.getBlockHeight(),
        this.getDifficulty(),
        this.getLastBlockInfo(),
        this.getTotalSupply()
      ]);

      const networkHashrate = await this.getNetworkHashrate();

      return {
        status: blockHeight > 0 ? 'connected' : 'disconnected',
        blockHeight,
        networkHashrate,
        difficulty,
        lastBlockTime: lastBlockInfo.timestamp,
        totalSupply,
        circulatingSupply: totalSupply, // Same as total supply for Monero
        blockReward: lastBlockInfo.reward,
        averageBlockTime: 120 // Monero target block time
      };
    } catch (error) {
      console.error('Failed to get Monerod stats:', error);
      return {
        status: 'disconnected',
        blockHeight: 0,
        networkHashrate: '0 H/s',
        difficulty: 0,
        lastBlockTime: new Date().toISOString(),
        totalSupply: '0',
        circulatingSupply: '0',
        blockReward: '0',
        averageBlockTime: 120
      };
    }
  }

  /**
   * Test connection to Monerod node
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getBlockHeight();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Format hashrate for display
   */
  private formatHashrate(hashrate: number): string {
    const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s'];
    let unitIndex = 0;
    
    while (hashrate >= 1000 && unitIndex < units.length - 1) {
      hashrate /= 1000;
      unitIndex++;
    }
    
    return `${hashrate.toFixed(2)} ${units[unitIndex]}`;
  }
}
