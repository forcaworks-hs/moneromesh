import { Router, Request, Response } from 'express';
import { createError } from '../middleware/errorHandler';
import { StatsService } from '../services/statsService';

const router = Router();
const statsService = new StatsService();

// Get all stats
router.get('/', async (req: Request, res: Response) => {
  try {
    const stats = await statsService.getAllStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Failed to fetch all stats:', error);
    throw createError('Failed to fetch stats', 500);
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
    const stats = await statsService.getP2PoolStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Failed to fetch p2pool stats:', error);
    throw createError('Failed to fetch p2pool stats', 500);
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

export { router as statsRoutes };
