import axios, { AxiosInstance } from 'axios';

export interface P2PoolStats {
  status: string;
  poolHashrate: string;
  networkHashrate: string;
  liveHashrate: string;
  miners: number;
  workers: number;
  shares: number;
  lastShareTime: string;
  uptime: number;
  poolFee: number;
  minPayout: string;
  totalPaid: string;
  averageEffort: number;
  currentEffort: number;
}

export class P2PoolClient {
  private client: AxiosInstance;
  private apiUrl: string;
  private username: string;
  private password: string;

  constructor(apiUrl: string, username: string = '', password: string = '') {
    this.apiUrl = apiUrl;
    this.username = username;
    this.password = password;
    
    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 10000,
      auth: username && password ? { username, password } : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get pool statistics
   */
  async getPoolStats(): Promise<any> {
    try {
      const response = await this.client.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to get P2Pool stats:', error);
      throw error;
    }
  }

  /**
   * Get miner statistics
   */
  async getMinerStats(): Promise<any> {
    try {
      const response = await this.client.get('/miners');
      return response.data;
    } catch (error) {
      console.error('Failed to get P2Pool miner stats:', error);
      throw error;
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<any> {
    try {
      const response = await this.client.get('/network');
      return response.data;
    } catch (error) {
      console.error('Failed to get P2Pool network stats:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive P2Pool statistics
   */
  async getStats(): Promise<P2PoolStats> {
    try {
      const [poolStats, minerStats, networkStats] = await Promise.all([
        this.getPoolStats().catch(() => null),
        this.getMinerStats().catch(() => null),
        this.getNetworkStats().catch(() => null)
      ]);

      // Extract data with fallbacks
      const poolHashrate = poolStats?.pool_hashrate || 0;
      const networkHashrate = networkStats?.network_hashrate || poolStats?.network_hashrate || 0;
      const liveHashrate = poolStats?.live_hashrate || poolHashrate;
      const miners = minerStats?.miners?.length || poolStats?.miners || 0;
      const workers = minerStats?.workers || poolStats?.workers || 0;
      const shares = poolStats?.shares || 0;
      const uptime = poolStats?.uptime || 0;
      const poolFee = poolStats?.pool_fee || 0;
      const minPayout = poolStats?.min_payout || '0';
      const totalPaid = poolStats?.total_paid || '0';
      const averageEffort = poolStats?.average_effort || 0;
      const currentEffort = poolStats?.current_effort || 0;

      // Get last share time
      let lastShareTime = new Date().toISOString();
      if (minerStats?.miners && minerStats.miners.length > 0) {
        const lastShare = Math.max(...minerStats.miners.map((m: any) => m.last_share_time || 0));
        if (lastShare > 0) {
          lastShareTime = new Date(lastShare * 1000).toISOString();
        }
      }

      return {
        status: poolStats ? 'active' : 'inactive',
        poolHashrate: this.formatHashrate(poolHashrate),
        networkHashrate: this.formatHashrate(networkHashrate),
        liveHashrate: this.formatHashrate(liveHashrate),
        miners,
        workers,
        shares,
        lastShareTime,
        uptime,
        poolFee,
        minPayout: (parseFloat(minPayout) / 1e12).toFixed(12), // Convert from atomic units
        totalPaid: (parseFloat(totalPaid) / 1e12).toFixed(12), // Convert from atomic units
        averageEffort,
        currentEffort
      };
    } catch (error) {
      console.error('Failed to get P2Pool stats:', error);
      return {
        status: 'inactive',
        poolHashrate: '0 H/s',
        networkHashrate: '0 H/s',
        liveHashrate: '0 H/s',
        miners: 0,
        workers: 0,
        shares: 0,
        lastShareTime: new Date().toISOString(),
        uptime: 0,
        poolFee: 0,
        minPayout: '0',
        totalPaid: '0',
        averageEffort: 0,
        currentEffort: 0
      };
    }
  }

  /**
   * Test connection to P2Pool API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getPoolStats();
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
