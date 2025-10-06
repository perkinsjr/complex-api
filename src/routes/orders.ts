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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
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
 *                         enum: [pending, processing, shipped, delivered, cancelled]
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
 */
router.get("/", (req: Request, res: Response) => {
  const page = parseInt(req.query["page"] as string) || 1;
  const limit = parseInt(req.query["limit"] as string) || 10;
  const status = req.query["status"] as string;

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

  response.message = status
    ? `Orders with status '${status}' retrieved successfully`
    : "Orders retrieved successfully";

  res.json(response);
});

export default router;
