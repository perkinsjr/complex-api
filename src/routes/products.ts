import { Router, Request, Response } from "express";
import { DataGenerator } from "../utils/dataGenerator";

const router = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get paginated list of products
 *     tags: [Products]
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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by product category
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter by stock availability
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by product brand
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: string
 *         description: Filter by warehouse location
 *     responses:
 *       200:
 *         description: Paginated list of products
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
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                         format: float
 *                       category:
 *                         type: string
 *                       inStock:
 *                         type: boolean
 *                       sku:
 *                         type: string
 *                       brand:
 *                         type: string
 *                       warehouse:
 *                         type: string
 *                       rating:
 *                         type: number
 *                         format: float
 *                       reviewCount:
 *                         type: integer
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
  const category = req.query["category"] as string;
  const inStock = req.query["inStock"] as string;
  const brand = req.query["brand"] as string;
  const warehouse = req.query["warehouse"] as string;

  const products = DataGenerator.generateArray(
    () => DataGenerator.generateProduct(),
    limit,
  );
  const total = 5000; // Mock total count

  const response = DataGenerator.createPaginatedResponse(
    products,
    page,
    limit,
    total,
  );

  // Add filter information to message
  let message = "Products retrieved successfully";
  const filters = [];
  if (category) filters.push(`category: ${category}`);
  if (inStock) filters.push(`inStock: ${inStock}`);
  if (brand) filters.push(`brand: ${brand}`);
  if (warehouse) filters.push(`warehouse: ${warehouse}`);

  if (filters.length > 0) {
    message += ` (filtered by ${filters.join(", ")})`;
  }

  response.message = message;

  res.json(response);
});

export default router;
