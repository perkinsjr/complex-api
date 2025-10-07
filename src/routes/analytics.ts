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
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month]
 *           default: day
 *         description: Data granularity for time series
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
 *                     granularity:
 *                       type: string
 *                       example: "day"
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                           example: 12500
 *                         activeUsers:
 *                           type: integer
 *                           example: 8750
 *                         newUsers:
 *                           type: integer
 *                           example: 2100
 *                         totalRevenue:
 *                           type: number
 *                           format: float
 *                           example: 156789.50
 *                         totalOrders:
 *                           type: integer
 *                           example: 3420
 *                         conversionRate:
 *                           type: number
 *                           format: float
 *                           example: 0.0275
 *                         avgOrderValue:
 *                           type: number
 *                           format: float
 *                           example: 45.85
 *                     timeSeries:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           users:
 *                             type: integer
 *                           revenue:
 *                             type: number
 *                             format: float
 *                           orders:
 *                             type: integer
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
 *                           revenue:
 *                             type: number
 *                             format: float
 *                     trafficSources:
 *                       type: object
 *                       properties:
 *                         organic:
 *                           type: object
 *                           properties:
 *                             users:
 *                               type: integer
 *                             percentage:
 *                               type: number
 *                               format: float
 *                         direct:
 *                           type: object
 *                           properties:
 *                             users:
 *                               type: integer
 *                             percentage:
 *                               type: number
 *                               format: float
 *                         social:
 *                           type: object
 *                           properties:
 *                             users:
 *                               type: integer
 *                             percentage:
 *                               type: number
 *                               format: float
 *                         referral:
 *                           type: object
 *                           properties:
 *                             users:
 *                               type: integer
 *                             percentage:
 *                               type: number
 *                               format: float
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Analytics data retrieved successfully"
 */
router.get("/", (req: Request, res: Response) => {
  const period = (req.query["period"] as string) || "last_30_days";
  const granularity = (req.query["granularity"] as string) || "day";

  const analytics = DataGenerator.generateAnalytics();

  // Restructure the analytics data to new format (BREAKING CHANGE)
  const restructuredAnalytics = {
    period,
    granularity,
    summary: {
      totalUsers: analytics.metrics.totalUsers,
      activeUsers: analytics.metrics.activeUsers,
      newUsers: analytics.metrics.newUsers,
      totalRevenue: analytics.metrics.totalRevenue,
      totalOrders: analytics.metrics.totalOrders,
      conversionRate: analytics.metrics.conversionRate,
      avgOrderValue:
        analytics.metrics.totalRevenue / analytics.metrics.totalOrders,
    },
    timeSeries: DataGenerator.generateTimeSeries(period, granularity),
    topProducts: analytics.topProducts.map((product: any) => ({
      ...product,
      revenue: product.sales * (50 + Math.random() * 200), // Mock revenue calculation
    })),
    trafficSources: {
      organic: {
        users: Math.floor(
          analytics.trafficSources.find((s) => s.source === "organic")
            ?.percentage || 0.4 * analytics.metrics.totalUsers,
        ),
        percentage:
          analytics.trafficSources.find((s) => s.source === "organic")
            ?.percentage || 0.4,
      },
      direct: {
        users: Math.floor(
          analytics.trafficSources.find((s) => s.source === "direct")
            ?.percentage || 0.3 * analytics.metrics.totalUsers,
        ),
        percentage:
          analytics.trafficSources.find((s) => s.source === "direct")
            ?.percentage || 0.3,
      },
      social: {
        users: Math.floor(
          analytics.trafficSources.find((s) => s.source === "social")
            ?.percentage || 0.2 * analytics.metrics.totalUsers,
        ),
        percentage:
          analytics.trafficSources.find((s) => s.source === "social")
            ?.percentage || 0.2,
      },
      referral: {
        users: Math.floor(
          analytics.trafficSources.find((s) => s.source === "referral")
            ?.percentage || 0.1 * analytics.metrics.totalUsers,
        ),
        percentage:
          analytics.trafficSources.find((s) => s.source === "referral")
            ?.percentage || 0.1,
      },
    },
  };

  const response = DataGenerator.createApiResponse(
    restructuredAnalytics,
    true,
    "Analytics data retrieved successfully",
  );

  res.json(response);
});

export default router;
