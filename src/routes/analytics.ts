import { Router, Request, Response } from "express";
import { DataGenerator } from "../utils/dataGenerator";

const router = Router();

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Get analytics data
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [last_7_days, last_30_days, last_90_days, last_year]
 *           default: last_30_days
 *         description: Time period for analytics data
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: "last_30_days"
 *                     totalUsers:
 *                       type: integer
 *                       example: 12500
 *                     activeUsers:
 *                       type: integer
 *                       example: 8750
 *                     newUsers:
 *                       type: integer
 *                       example: 2100
 *                     totalRevenue:
 *                       type: number
 *                       format: float
 *                       example: 156789.50
 *                     totalOrders:
 *                       type: integer
 *                       example: 3420
 *                     conversionRate:
 *                       type: number
 *                       format: float
 *                       example: 0.0275
 *                     topProducts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           sales:
 *                             type: integer
 *                     trafficSources:
 *                       type: object
 *                       properties:
 *                         organic:
 *                           type: number
 *                         direct:
 *                           type: number
 *                         social:
 *                           type: number
 *                         referral:
 *                           type: number
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Analytics data retrieved successfully"
 */
router.get("/", (req: Request, res: Response) => {
  const period = (req.query["period"] as string) || "last_30_days";

  const analytics = DataGenerator.generateAnalytics();
  analytics.period = period;

  const response = DataGenerator.createApiResponse(
    analytics,
    true,
    "Analytics data retrieved successfully",
  );

  res.json(response);
});

export default router;
