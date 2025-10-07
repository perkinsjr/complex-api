import { Router, Request, Response } from "express";
import { DataGenerator } from "../utils/dataGenerator";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

const router = Router();

// Admin authentication middleware (stricter than regular auth)
const requireAdminAuth = (req: Request, res: Response, next: any): void => {
  const authHeader = req.headers.authorization;
  const adminKey = req.headers["x-admin-key"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      data: null,
      success: false,
      message: "Authorization header with Bearer token is required",
    });
    return;
  }

  if (!adminKey || adminKey !== "admin-secret-key") {
    res.status(403).json({
      data: null,
      success: false,
      message: "Admin access key is required",
    });
    return;
  }

  const token = authHeader.substring(7);
  if (!token || token.length < 10) {
    res.status(401).json({
      data: null,
      success: false,
      message: "Invalid or missing authentication token",
    });
    return;
  }

  // Mock admin token validation
  if (!token.startsWith("admin_")) {
    res.status(403).json({
      data: null,
      success: false,
      message: "Admin privileges required",
    });
    return;
  }

  next();
};

/**
 * @swagger
 * /api/admin/system-metrics:
 *   get:
 *     summary: Get comprehensive system metrics and diagnostics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-admin-key
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin access key
 *       - in: query
 *         name: detailed
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include detailed process and system information
 *     responses:
 *       200:
 *         description: System metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     system:
 *                       type: object
 *                       properties:
 *                         hostname:
 *                           type: string
 *                         platform:
 *                           type: string
 *                         arch:
 *                           type: string
 *                         nodeVersion:
 *                           type: string
 *                         uptime:
 *                           type: number
 *                         loadAverage:
 *                           type: array
 *                           items:
 *                             type: number
 *                     memory:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         free:
 *                           type: number
 *                         used:
 *                           type: number
 *                         usagePercent:
 *                           type: number
 *                         heap:
 *                           type: object
 *                     cpu:
 *                       type: object
 *                       properties:
 *                         model:
 *                           type: string
 *                         cores:
 *                           type: integer
 *                         speed:
 *                           type: number
 *                         usage:
 *                           type: number
 *                     process:
 *                       type: object
 *                       properties:
 *                         pid:
 *                           type: integer
 *                         ppid:
 *                           type: integer
 *                         memoryUsage:
 *                           type: object
 *                         cpuUsage:
 *                           type: object
 *                     database:
 *                       type: object
 *                       properties:
 *                         connections:
 *                           type: object
 *                         queries:
 *                           type: object
 *                         performance:
 *                           type: object
 *                     api:
 *                       type: object
 *                       properties:
 *                         requests:
 *                           type: object
 *                         responses:
 *                           type: object
 *                         errors:
 *                           type: object
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get(
  "/system-metrics",
  requireAdminAuth,
  (req: Request, res: Response) => {
    const detailed = req.query["detailed"] === "true";

    // Gather system information
    const systemInfo = {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
    };

    // Memory information
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryInfo = {
      total: totalMem,
      free: freeMem,
      used: usedMem,
      usagePercent: ((usedMem / totalMem) * 100).toFixed(2),
      heap: process.memoryUsage(),
    };

    // CPU information
    const cpus = os.cpus();
    const cpuInfo = {
      model: cpus[0]?.model || "Unknown",
      cores: cpus.length,
      speed: cpus[0]?.speed || 0,
      usage: Math.random() * 100, // Mock CPU usage
    };

    // Process information
    const processInfo = {
      pid: process.pid,
      ppid: process.ppid || 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      version: process.version,
      versions: detailed ? process.versions : undefined,
      env: detailed
        ? {
            nodeEnv: process.env["NODE_ENV"] || "development",
            port: process.env["PORT"] || "3000",
          }
        : undefined,
    };

    // Mock database metrics
    const databaseInfo = {
      connections: {
        active: Math.floor(Math.random() * 50) + 10,
        idle: Math.floor(Math.random() * 20) + 5,
        total: Math.floor(Math.random() * 100) + 50,
        maxConnections: 200,
      },
      queries: {
        total: Math.floor(Math.random() * 10000) + 5000,
        slow: Math.floor(Math.random() * 50) + 10,
        failed: Math.floor(Math.random() * 25) + 2,
        avgResponseTime: (Math.random() * 100 + 10).toFixed(2),
      },
      performance: {
        cacheHitRatio: (Math.random() * 0.3 + 0.7).toFixed(3),
        indexUsage: (Math.random() * 0.2 + 0.8).toFixed(3),
        diskIO: {
          reads: Math.floor(Math.random() * 1000) + 500,
          writes: Math.floor(Math.random() * 800) + 300,
        },
      },
    };

    // Mock API metrics
    const apiInfo = {
      requests: {
        total: Math.floor(Math.random() * 50000) + 25000,
        perMinute: Math.floor(Math.random() * 500) + 100,
        perHour: Math.floor(Math.random() * 10000) + 5000,
      },
      responses: {
        "2xx": Math.floor(Math.random() * 40000) + 20000,
        "4xx": Math.floor(Math.random() * 5000) + 1000,
        "5xx": Math.floor(Math.random() * 500) + 50,
        avgResponseTime: (Math.random() * 200 + 50).toFixed(2),
      },
      errors: {
        total: Math.floor(Math.random() * 100) + 25,
        rate: (Math.random() * 0.05).toFixed(4),
        lastError: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      },
      endpoints: detailed
        ? {
            mostUsed: "/api/products",
            slowest: "/api/reports",
            errorProne: "/api/analytics",
          }
        : undefined,
    };

    // Additional detailed metrics
    const detailedMetrics = detailed
      ? {
          network: {
            interfaces: Object.keys(os.networkInterfaces()),
            connections: Math.floor(Math.random() * 1000) + 500,
          },
          filesystem: {
            diskUsage: {
              total: "500GB",
              used: "320GB",
              available: "180GB",
              percentage: "64%",
            },
            openFiles: Math.floor(Math.random() * 200) + 50,
          },
          security: {
            activeTokens: Math.floor(Math.random() * 1000) + 500,
            failedLogins: Math.floor(Math.random() * 50) + 5,
            lastSecurityEvent: new Date(
              Date.now() - Math.random() * 7200000,
            ).toISOString(),
          },
        }
      : undefined;

    const metrics = {
      system: systemInfo,
      memory: memoryInfo,
      cpu: cpuInfo,
      process: processInfo,
      database: databaseInfo,
      api: apiInfo,
      timestamp: new Date().toISOString(),
      ...(detailed && { detailed: detailedMetrics }),
    };

    res.json({
      data: metrics,
      success: true,
      message: `System metrics retrieved successfully${detailed ? " (detailed)" : ""}`,
    });
  },
);

/**
 * @swagger
 * /api/admin/health-check:
 *   get:
 *     summary: Comprehensive admin health check
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-admin-key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Health check completed
 */
router.get("/health-check", requireAdminAuth, (req: Request, res: Response) => {
  const healthChecks = {
    api: {
      status: "healthy",
      responseTime: Math.floor(Math.random() * 50) + 10,
    },
    database: {
      status: "healthy",
      connectionTime: Math.floor(Math.random() * 100) + 20,
    },
    redis: { status: "healthy", ping: Math.floor(Math.random() * 10) + 1 },
    externalServices: {
      emailService: { status: "healthy", lastCheck: new Date().toISOString() },
      paymentGateway: {
        status: "healthy",
        lastCheck: new Date().toISOString(),
      },
      cdn: { status: "healthy", lastCheck: new Date().toISOString() },
    },
    security: {
      certificates: { status: "valid", expiresIn: "89 days" },
      firewall: { status: "active", rules: 45 },
    },
  };

  const overallStatus = Object.values(healthChecks).every((check: any) =>
    typeof check.status === "string" ? check.status === "healthy" : true,
  )
    ? "healthy"
    : "degraded";

  res.json({
    data: {
      overall: overallStatus,
      checks: healthChecks,
      timestamp: new Date().toISOString(),
    },
    success: true,
    message: `Health check completed - system is ${overallStatus}`,
  });
});

export default router;
