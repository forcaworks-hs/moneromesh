import { MonerodClient, MonerodStats } from './monerodClient';
import { P2PoolClient, P2PoolStats } from './p2poolClient';
import config from '../config';

export interface SystemStats {
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    external: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
  timestamp: string;
}

export interface AggregatedStats {
  monerod: MonerodStats;
  p2pool: P2PoolStats;
  system: SystemStats;
  lastUpdated: string;
}

export class StatsService {
  private monerodClient: MonerodClient;
  private p2poolClient: P2PoolClient;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 30000; // 30 seconds cache

  constructor() {
    this.monerodClient = new MonerodClient(
      config.monerod.rpcUrl,
      config.monerod.username,
      config.monerod.password
    );
    
    this.p2poolClient = new P2PoolClient(
      config.p2pool.apiUrl,
      config.p2pool.username,
      config.p2pool.password
    );
  }

  /**
   * Get cached data or fetch new data if cache is expired
   */
  private async getCachedData<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const data = await fetchFn();
      this.cache.set(key, { data, timestamp: now });
      return data;
    } catch (error) {
      // Return cached data if available, even if expired
      if (cached) {
        console.warn(`Using stale cache for ${key} due to fetch error:`, error);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Get Monerod statistics
   */
  async getMonerodStats(): Promise<MonerodStats> {
    return this.getCachedData('monerod', () => this.monerodClient.getStats());
  }

  /**
   * Get P2Pool statistics
   */
  async getP2PoolStats(): Promise<P2PoolStats> {
    return this.getCachedData('p2pool', () => this.p2poolClient.getStats());
  }

  /**
   * Get system statistics
   */
  getSystemStats(): SystemStats {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      uptime: process.uptime(),
      memoryUsage: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
      cpuUsage: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get all aggregated statistics
   */
  async getAllStats(): Promise<AggregatedStats> {
    try {
      const [monerodStats, p2poolStats] = await Promise.all([
        this.getMonerodStats(),
        this.getP2PoolStats(),
      ]);

      const systemStats = this.getSystemStats();

      return {
        monerod: monerodStats,
        p2pool: p2poolStats,
        system: systemStats,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get aggregated stats:', error);
      throw error;
    }
  }

  /**
   * Test connections to external services
   */
  async testConnections(): Promise<{
    monerod: boolean;
    p2pool: boolean;
  }> {
    const [monerodConnected, p2poolConnected] = await Promise.all([
      this.monerodClient.testConnection(),
      this.p2poolClient.testConnection(),
    ]);

    return {
      monerod: monerodConnected,
      p2pool: p2poolConnected,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache status
   */
  getCacheStatus(): { [key: string]: { age: number; valid: boolean } } {
    const now = Date.now();
    const status: { [key: string]: { age: number; valid: boolean } } = {};

    for (const [key, value] of this.cache.entries()) {
      const age = now - value.timestamp;
      status[key] = {
        age,
        valid: age < this.cacheTimeout,
      };
    }

    return status;
  }
}
