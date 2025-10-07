import { Router, Request, Response } from "express";
import { DataGenerator } from "../utils/dataGenerator";

const router = Router();

interface WebhookPayload {
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  description?: string;
}

/**
 * @swagger
 * /api/webhooks:
 *   get:
 *     summary: Get paginated list of webhooks
 *     tags: [Webhooks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by webhook status
 *     responses:
 *       200:
 *         description: Paginated list of webhooks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       url:
 *                         type: string
 *                         format: uri
 *                       events:
 *                         type: array
 *                         items:
 *                           type: string
 *                       active:
 *                         type: boolean
 *                       description:
 *                         type: string
 *                       lastTriggered:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get("/", (req: Request, res: Response) => {
  const page = parseInt(req.query["page"] as string) || 1;
  const limit = parseInt(req.query["limit"] as string) || 10;
  const activeFilter = req.query["active"];

  let webhooks = DataGenerator.generateArray(
    () => DataGenerator.generateWebhook(),
    limit,
  );

  // Apply active filter if provided
  if (activeFilter !== undefined) {
    const isActive = activeFilter === "true";
    webhooks = webhooks.filter((webhook: any) => webhook.active === isActive);
  }

  const total = 150; // Mock total count

  const response = DataGenerator.createPaginatedResponse(
    webhooks,
    page,
    limit,
    total,
  );

  response.message = "Webhooks retrieved successfully";

  res.json(response);
});

/**
 * @swagger
 * /api/webhooks:
 *   post:
 *     summary: Create a new webhook
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - events
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/webhook"
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user.created", "order.completed"]
 *               secret:
 *                 type: string
 *                 description: Secret for webhook signature verification
 *               active:
 *                 type: boolean
 *                 default: true
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Webhook created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request - invalid webhook data
 */
router.post("/", (req: Request, res: Response): void => {
  const {
    url,
    events,
    secret,
    active = true,
    description,
  } = req.body as WebhookPayload;

  // Basic validation
  if (!url || !events || !Array.isArray(events) || events.length === 0) {
    res.status(400).json({
      data: null,
      success: false,
      message: "URL and events are required",
    });
    return;
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    res.status(400).json({
      data: null,
      success: false,
      message: "Invalid URL format",
    });
    return;
  }

  const newWebhook = {
    id: DataGenerator.generateId(),
    url,
    events,
    secret: secret ? "••••••••" : undefined, // Don't return actual secret
    active,
    description,
    lastTriggered: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  res.status(201).json({
    data: newWebhook,
    success: true,
    message: "Webhook created successfully",
  });
});

/**
 * @swagger
 * /api/webhooks/{id}:
 *   get:
 *     summary: Get webhook by ID
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Webhook details
 *       404:
 *         description: Webhook not found
 */
router.get("/:id", (req: Request, res: Response): void => {
  const { id } = req.params;

  if (!id || !DataGenerator.isValidId(id)) {
    res.status(400).json({
      data: null,
      success: false,
      message: "Invalid webhook ID format",
    });
    return;
  }

  const webhook = DataGenerator.generateWebhook();
  webhook.id = id;

  res.json({
    data: webhook,
    success: true,
    message: "Webhook retrieved successfully",
  });
});

/**
 * @swagger
 * /api/webhooks/{id}:
 *   put:
 *     summary: Update webhook
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *               active:
 *                 type: boolean
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook updated successfully
 *       404:
 *         description: Webhook not found
 */
router.put("/:id", (req: Request, res: Response): void => {
  const { id } = req.params;
  const updates = req.body;

  if (!id || !DataGenerator.isValidId(id)) {
    res.status(400).json({
      data: null,
      success: false,
      message: "Invalid webhook ID format",
    });
    return;
  }

  const updatedWebhook = {
    ...DataGenerator.generateWebhook(),
    id,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    data: updatedWebhook,
    success: true,
    message: "Webhook updated successfully",
  });
});

/**
 * @swagger
 * /api/webhooks/{id}:
 *   delete:
 *     summary: Delete webhook
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Webhook deleted successfully
 *       404:
 *         description: Webhook not found
 */
router.delete("/:id", (req: Request, res: Response): void => {
  const { id } = req.params;

  if (!id || !DataGenerator.isValidId(id)) {
    res.status(400).json({
      data: null,
      success: false,
      message: "Invalid webhook ID format",
    });
    return;
  }

  res.json({
    data: { id },
    success: true,
    message: "Webhook deleted successfully",
  });
});

/**
 * @swagger
 * /api/webhooks/{id}/test:
 *   post:
 *     summary: Test webhook by sending a test payload
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Test webhook sent successfully
 *       404:
 *         description: Webhook not found
 */
router.post("/:id/test", (req: Request, res: Response): void => {
  const { id } = req.params;

  if (!id || !DataGenerator.isValidId(id)) {
    res.status(400).json({
      data: null,
      success: false,
      message: "Invalid webhook ID format",
    });
    return;
  }

  const testResult = {
    webhookId: id,
    testPayload: {
      event: "webhook.test",
      timestamp: new Date().toISOString(),
      data: { message: "This is a test webhook" },
    },
    response: {
      status: 200,
      responseTime: Math.floor(Math.random() * 500) + 100,
      success: true,
    },
  };

  res.json({
    data: testResult,
    success: true,
    message: "Test webhook sent successfully",
  });
});

export default router;
