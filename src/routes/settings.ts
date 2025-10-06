import { Router, Request, Response } from "express";
import { DataGenerator } from "../utils/dataGenerator";

const router = Router();

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get application settings
 *     tags: [Settings]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [general, security, notifications, api, integrations, billing]
 *         description: Filter settings by category
 *     responses:
 *       200:
 *         description: Application settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     general:
 *                       type: object
 *                       properties:
 *                         applicationName:
 *                           type: string
 *                         timezone:
 *                           type: string
 *                         defaultLanguage:
 *                           type: string
 *                         dateFormat:
 *                           type: string
 *                         timeFormat:
 *                           type: string
 *                         currency:
 *                           type: string
 *                     security:
 *                       type: object
 *                       properties:
 *                         passwordPolicy:
 *                           type: object
 *                         sessionTimeout:
 *                           type: integer
 *                         twoFactorAuth:
 *                           type: boolean
 *                         allowedDomains:
 *                           type: array
 *                           items:
 *                             type: string
 *                     notifications:
 *                       type: object
 *                       properties:
 *                         emailNotifications:
 *                           type: boolean
 *                         pushNotifications:
 *                           type: boolean
 *                         smsNotifications:
 *                           type: boolean
 *                         notificationTypes:
 *                           type: object
 *                     api:
 *                       type: object
 *                       properties:
 *                         rateLimiting:
 *                           type: object
 *                         cors:
 *                           type: object
 *                         versioning:
 *                           type: object
 *                     integrations:
 *                       type: object
 *                       properties:
 *                         enabledIntegrations:
 *                           type: array
 *                           items:
 *                             type: string
 *                         webhookRetries:
 *                           type: integer
 *                         webhookTimeout:
 *                           type: integer
 *                     billing:
 *                       type: object
 *                       properties:
 *                         plan:
 *                           type: string
 *                         billingCycle:
 *                           type: string
 *                         autoRenewal:
 *                           type: boolean
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 */
router.get("/", (req: Request, res: Response) => {
  const category = req.query["category"] as string;

  const allSettings = {
    general: {
      applicationName: "Complex API Demo",
      timezone: "UTC",
      defaultLanguage: "en",
      dateFormat: "YYYY-MM-DD",
      timeFormat: "24h",
      currency: "USD",
      theme: "light",
      companyName: "Unkey",
      supportEmail: "support@unkey.dev",
      maintenanceMode: false,
      debugMode: false,
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
        preventReuse: 5,
      },
      sessionTimeout: 3600,
      twoFactorAuth: true,
      allowedDomains: ["unkey.dev", "localhost"],
      loginAttempts: {
        maxAttempts: 5,
        lockoutDuration: 900,
      },
      encryption: {
        algorithm: "AES-256-GCM",
        keyRotation: "quarterly",
      },
      auditLogging: true,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      notificationTypes: {
        security: true,
        system: true,
        billing: true,
        marketing: false,
        updates: true,
      },
      deliveryMethods: {
        urgent: ["email", "push"],
        normal: ["email"],
        low: ["email"],
      },
      quietHours: {
        enabled: true,
        start: "22:00",
        end: "08:00",
      },
    },
    api: {
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 1000,
        burstLimit: 100,
        strategy: "sliding-window",
      },
      cors: {
        enabled: false,
        allowedOrigins: [],
        allowedMethods: ["GET", "POST", "PUT", "DELETE"],
        allowCredentials: false,
      },
      versioning: {
        strategy: "header",
        defaultVersion: "v1",
        deprecationPolicy: "6 months",
        supportedVersions: ["v1"],
      },
      documentation: {
        enabled: true,
        path: "/docs",
        authentication: false,
      },
    },
    integrations: {
      enabledIntegrations: ["stripe", "sendgrid", "google-analytics", "aws-s3"],
      webhookRetries: 3,
      webhookTimeout: 30,
      webhookSecurity: {
        signatureValidation: true,
        ipWhitelisting: false,
        ssl: true,
      },
      thirdPartyApis: {
        timeout: 10,
        retryPolicy: "exponential-backoff",
        circuitBreaker: true,
      },
    },
    billing: {
      plan: "pro",
      billingCycle: "monthly",
      autoRenewal: true,
      currency: "USD",
      taxCalculation: true,
      invoiceGeneration: "automatic",
      paymentMethods: ["credit_card", "bank_transfer"],
      gracePeriod: 7,
      usage: {
        tracking: true,
        alerts: {
          80: true,
          90: true,
          100: true,
        },
      },
    },
  };

  let settingsData;
  let message;

  if (category && allSettings[category as keyof typeof allSettings]) {
    settingsData = {
      [category]: allSettings[category as keyof typeof allSettings],
    };
    message = `${category.charAt(0).toUpperCase() + category.slice(1)} settings retrieved successfully`;
  } else if (category) {
    const response = DataGenerator.createApiResponse(
      null,
      false,
      `Invalid category: ${category}. Available categories: ${Object.keys(allSettings).join(", ")}`,
    );
    return res.status(400).json(response);
  } else {
    settingsData = allSettings;
    message = "All settings retrieved successfully";
  }

  // Add metadata
  const responseData = {
    ...settingsData,
    metadata: {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      environment: process.env["NODE_ENV"] || "development",
      region: process.env["AWS_REGION"] || "us-east-1",
      buildNumber: process.env["BUILD_NUMBER"] || "local",
    },
  };

  const response = DataGenerator.createApiResponse(responseData, true, message);

  return res.json(response);
});

export default router;
