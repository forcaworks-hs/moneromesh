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
   * Get network hashrate (basic calculation from difficulty)
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
   * Calculate network hashrate from multiple blocks (more accurate)
   */
  async calculateNetworkHashrate(blockCount: number = 10): Promise<{
    hashrate: string;
    hashrateNumber: number;
    method: string;
  }> {
    try {
      const currentHeight = await this.getBlockHeight();
      const blocks = [];
      
      // Get last N blocks
      for (let i = 0; i < blockCount; i++) {
        const height = currentHeight - i - 1;
        if (height < 0) break;
        
        const block = await this.rpcCall('get_block', { height });
        blocks.push({
          height: block.block_header.height,
          timestamp: block.block_header.timestamp,
          difficulty: block.block_header.difficulty
        });
      }

      if (blocks.length < 2) {
        throw new Error('Not enough blocks for calculation');
      }

      // Calculate hashrate using different methods
      const methods = {
        simple: this.calculateSimpleHashrate(blocks),
        weighted: this.calculateWeightedHashrate(blocks),
        timeBased: this.calculateTimeBasedHashrate(blocks)
      };

      // Use weighted average as it's most accurate
      const hashrateNumber = methods.weighted;
      
      return {
        hashrate: this.formatHashrate(hashrateNumber),
        hashrateNumber,
        method: 'weighted_average'
      };
    } catch (error) {
      console.error('Failed to calculate network hashrate:', error);
      // Fallback to simple difficulty-based calculation
      const difficulty = await this.getDifficulty();
      const hashrateNumber = difficulty / 120;
      return {
        hashrate: this.formatHashrate(hashrateNumber),
        hashrateNumber,
        method: 'difficulty_fallback'
      };
    }
  }

  /**
   * Simple hashrate calculation (difficulty / target_time)
   */
  private calculateSimpleHashrate(blocks: any[]): number {
    const latestBlock = blocks[0];
    return latestBlock.difficulty / 120; // 120 seconds target
  }

  /**
   * Weighted hashrate calculation (more accurate)
   */
  private calculateWeightedHashrate(blocks: any[]): number {
    if (blocks.length < 2) return 0;

    let totalWeightedHashrate = 0;
    let totalWeight = 0;

    for (let i = 0; i < blocks.length - 1; i++) {
      const currentBlock = blocks[i];
      const previousBlock = blocks[i + 1];
      
      const timeDiff = currentBlock.timestamp - previousBlock.timestamp;
      if (timeDiff <= 0) continue;

      const weight = 1 / (i + 1); // More weight to recent blocks
      const hashrate = currentBlock.difficulty / timeDiff;
      
      totalWeightedHashrate += hashrate * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalWeightedHashrate / totalWeight : 0;
  }

  /**
   * Time-based hashrate calculation
   */
  private calculateTimeBasedHashrate(blocks: any[]): number {
    if (blocks.length < 2) return 0;

    const firstBlock = blocks[blocks.length - 1];
    const lastBlock = blocks[0];
    
    const timeDiff = lastBlock.timestamp - firstBlock.timestamp;
    if (timeDiff <= 0) return 0;

    // Average difficulty over the time period
    const avgDifficulty = blocks.reduce((sum, block) => sum + block.difficulty, 0) / blocks.length;
    
    return avgDifficulty / timeDiff;
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
