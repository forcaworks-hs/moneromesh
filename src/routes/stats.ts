import { Router, Request, Response } from 'express';
import { createError } from '../middleware/errorHandler';
import { getNetworkHashrate, StatsService } from '../services/statsService';
import axios from 'axios';
import { statsInfoApiUrl } from '../config/index'

const router = Router();
const statsService = new StatsService();

export interface P2PoolStats {
  hashRate: number,
  miners: number,
  totalHashes : number,
  lastBlockFoundTime : number,
  lastBlockFound: number,
  totalBlocksFound : number,
  pplnsWeight : number,
  pplnsWindowSize : number,
  sidechainDifficulty : number,
  sidechainHeight : number
}


// Get all stats
router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(statsInfoApiUrl);
    const stats : P2PoolStats = {
     ...response.data.pool_statistics
    };
    console.log("stats ===>", stats);
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.json({
      success: false,
      error: "Getting all statistics error",
      details: (err instanceof Error ? err.message : String(err))
    });
  }
});

// Get monerod stats
router.get('/monerod', async (req: Request, res: Response) => {
  try {
    const stats = await statsService.getMonerodStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Failed to fetch monerod stats:', error);
    throw createError('Failed to fetch monerod stats', 500);
  }
});

// Get p2pool stats
router.get('/p2pool', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(statsInfoApiUrl);
    const stats : P2PoolStats = {
     ...response.data.pool_statistics
    };
    console.log("stats ===>", stats);
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.json({
      success: false,
      error: "Getting all statistics error",
      details: (err instanceof Error ? err.message : String(err))
    });
  }
});

// Get system stats
router.get('/system', (req: Request, res: Response) => {
  try {
    const stats = statsService.getSystemStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Failed to fetch system stats:', error);
    throw createError('Failed to fetch system stats', 500);
  }
});

// Test connections to external services
router.get('/connections', async (req: Request, res: Response) => {
  try {
    const connections = await statsService.testConnections();
    res.json({
      success: true,
      data: connections
    });
  } catch (error) {
    console.error('Failed to test connections:', error);
    throw createError('Failed to test connections', 500);
  }
});

// Get cache status
router.get('/cache', (req: Request, res: Response) => {
  try {
    const cacheStatus = statsService.getCacheStatus();
    res.json({
      success: true,
      data: cacheStatus
    });
  } catch (error) {
    console.error('Failed to get cache status:', error);
    throw createError('Failed to get cache status', 500);
  }
});

// Clear cache
router.post('/cache/clear', (req: Request, res: Response) => {
  try {
    statsService.clearCache();
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    throw createError('Failed to clear cache', 500);
  }
});

// Calculate network hashrate
router.get('/network-hashrate', async (req: Request, res: Response) => {
  try {
    const blockCount = parseInt(req.query.blocks as string) || 10;
    const hashrateData = await getNetworkHashrate();
    
    res.json({
      success: true,
      data: {
        hashRate : hashrateData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to calculate network hashrate:', error);
    res.json({
      success: false,
      error: 'Failed to calculate network hashrate',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export { router as statsRoutes };
