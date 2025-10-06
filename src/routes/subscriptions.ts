import { Router, Request, Response } from "express";
import { DataGenerator } from "../utils/dataGenerator";

const router = Router();

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get paginated list of subscriptions
 *     tags: [Subscriptions]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, cancelled, expired, trial, past_due]
 *         description: Filter by subscription status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: Paginated list of subscriptions
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
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       planId:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [active, cancelled, expired, trial, past_due]
 *                       currentPeriodStart:
 *                         type: string
 *                         format: date-time
 *                       currentPeriodEnd:
 *                         type: string
 *                         format: date-time
 *                       billingCycle:
 *                         type: string
 *                         enum: [monthly, yearly, weekly]
 *                       amount:
 *                         type: number
 *                         format: float
 *                       currency:
 *                         type: string
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get("/", (req: Request, res: Response) => {
  const page = parseInt(req.query["page"] as string) || 1;
  const limit = parseInt(req.query["limit"] as string) || 10;
  const status = req.query["status"] as string;
  const userId = req.query["userId"] as string;

  const subscriptions = DataGenerator.generateArray(
    () => DataGenerator.generateSubscription(),
    limit,
  );
  const total = 1250; // Mock total count

  const response = DataGenerator.createPaginatedResponse(
    subscriptions,
    page,
    limit,
    total,
  );

  // Add filter information to message
  let message = "Subscriptions retrieved successfully";
  const filters = [];
  if (status) filters.push(`status: ${status}`);
  if (userId) filters.push(`userId: ${userId}`);

  if (filters.length > 0) {
    message += ` (filtered by ${filters.join(", ")})`;
  }

  response.message = message;

  res.json(response);
});

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   get:
 *     summary: Get subscription by ID
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     planId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [active, cancelled, expired, trial, past_due]
 *                     currentPeriodStart:
 *                       type: string
 *                       format: date-time
 *                     currentPeriodEnd:
 *                       type: string
 *                       format: date-time
 *                     billingCycle:
 *                       type: string
 *                       enum: [monthly, yearly, weekly]
 *                     amount:
 *                       type: number
 *                       format: float
 *                     currency:
 *                       type: string
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *                     metadata:
 *                       type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  // Mock subscription lookup
  const subscription = DataGenerator.generateSubscription();
  subscription.id = id as string;

  res.json({
    data: subscription,
    success: true,
    message: "Subscription retrieved successfully",
  });
});

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Create a new subscription
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - planId
 *               - billingCycle
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               planId:
 *                 type: string
 *               billingCycle:
 *                 type: string
 *                 enum: [monthly, yearly, weekly]
 *               trialDays:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 90
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     planId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [active, trial]
 *                     billingCycle:
 *                       type: string
 *                       enum: [monthly, yearly, weekly]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", (req: Request, res: Response) => {
  const { userId, planId, billingCycle, trialDays, metadata } = req.body;

  // Basic validation
  if (!userId || !planId || !billingCycle) {
    return res.status(400).json({
      data: null,
      success: false,
      message: "Missing required fields: userId, planId, billingCycle",
    });
  }

  // Mock subscription creation
  const subscription = DataGenerator.generateSubscription();
  subscription.userId = userId;
  subscription.planId = planId;
  subscription.billingCycle = billingCycle;
  subscription.status = trialDays ? "trial" : "active";
  if (metadata) {
    subscription.metadata = metadata;
  }

  return res.status(201).json({
    data: subscription,
    success: true,
    message: "Subscription created successfully",
  });
});

/**
 * @swagger
 * /api/subscriptions/{id}/cancel:
 *   post:
 *     summary: Cancel a subscription
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subscription ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *               immediateCancel:
 *                 type: boolean
 *                 default: false
 *                 description: Cancel immediately or at period end
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       enum: [cancelled]
 *                     cancelledAt:
 *                       type: string
 *                       format: date-time
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/cancel", (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, immediateCancel } = req.body;

  // Mock cancellation
  const subscription = DataGenerator.generateSubscription();
  subscription.id = id as string;
  subscription.status = "cancelled";
  subscription.cancelledAt = new Date().toISOString();

  res.json({
    data: {
      id: subscription.id,
      status: subscription.status,
      cancelledAt: subscription.cancelledAt,
      reason: reason || null,
      immediateCancel: immediateCancel || false,
    },
    success: true,
    message: immediateCancel
      ? "Subscription cancelled immediately"
      : "Subscription will be cancelled at the end of the current period",
  });
});

export default router;
