import { Router, Request, Response } from 'express';
import { DataGenerator } from '../utils/dataGenerator';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get system health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     uptime:
 *                       type: number
 *                       example: 12345.67
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: number
 *                         total:
 *                           type: number
 *                     cpu:
 *                       type: object
 *                       properties:
 *                         usage:
 *                           type: number
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "System health retrieved successfully"
 */
router.get('/', (req: Request, res: Response) => {
  const healthData = DataGenerator.generateSystemHealth();
  const response = DataGenerator.createApiResponse(
    healthData,
    true,
    'System health retrieved successfully'
  );
  res.json(response);
});

export default router;
