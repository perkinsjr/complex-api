import { Router, Request, Response } from "express";
import { DataGenerator } from "../utils/dataGenerator";

const router = Router();

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get paginated list of orders
 *     tags: [Orders]
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
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Customer ID (required)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [created, confirmed, in_fulfillment, shipped, completed, cancelled, returned]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: Paginated list of orders
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
 *                       orderNumber:
 *                         type: string
 *                       customerId:
 *                         type: string
 *                         format: uuid
 *                       status:
 *                         type: string
 *                         enum: [created, confirmed, in_fulfillment, shipped, completed, cancelled, returned]
 *                       total:
 *                         type: number
 *                         format: float
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                       shippingAddress:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
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
 *       400:
 *         description: Bad request - missing required customerId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", (req: Request, res: Response) => {
  const page = parseInt(req.query["page"] as string) || 1;
  const limit = parseInt(req.query["limit"] as string) || 10;
  const customerId = req.query["customerId"] as string;
  const status = req.query["status"] as string;

  // Breaking change: customerId is now required
  if (!customerId) {
    return res.status(400).json({
      data: null,
      success: false,
      message: "customerId parameter is required",
    });
  }

  const orders = DataGenerator.generateArray(
    () => DataGenerator.generateOrder(),
    limit,
  );
  const total = 2500; // Mock total count

  const response = DataGenerator.createPaginatedResponse(
    orders,
    page,
    limit,
    total,
  );

  // Add filter information to message
  let message = `Orders for customer ${customerId} retrieved successfully`;
  if (status) {
    message += ` (filtered by status: ${status})`;
  }

  response.message = message;

  return res.json(response);
});

export default router;
