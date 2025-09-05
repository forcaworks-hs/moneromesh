import { Router } from 'express';
import { statsRoutes } from './stats';
import { healthRoutes } from './health';

const router = Router();

// Mount route modules
router.use('/stats', statsRoutes);
router.use('/health', healthRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'MoneroMesh API',
    version: '1.0.0',
    endpoints: {
      stats: '/api/stats',
      health: '/api/health'
    }
  });
});

export { router as apiRoutes };
