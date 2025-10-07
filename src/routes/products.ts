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
  const inStock = req.query["inStock"];
  const minPrice = parseFloat(req.query["minPrice"] as string);
  const maxPrice = parseFloat(req.query["maxPrice"] as string);
  const minRating = parseFloat(req.query["minRating"] as string);
  const sortBy = (req.query["sortBy"] as string) || "createdAt";
  const sortOrder = (req.query["sortOrder"] as string) || "desc";

  let products = DataGenerator.generateArray(
    () => DataGenerator.generateProduct(),
    limit,
  );

  // Apply filters
  products = products.filter((product: any) => {
    if (category && product.category !== category) return false;
    if (inStock !== undefined && product.inStock !== (inStock === "true"))
      return false;
    if (!isNaN(minPrice) && product.price < minPrice) return false;
    if (!isNaN(maxPrice) && product.price > maxPrice) return false;
    if (!isNaN(minRating) && product.rating < minRating) return false;
    return true;
  });

  // Apply sorting
  products.sort((a: any, b: any) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle string comparison for name
    if (sortBy === "name") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // Handle date comparison
    if (sortBy === "createdAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    return sortOrder === "desc" ? -comparison : comparison;
  });

  const total = 5000; // Mock total count

  const response = DataGenerator.createPaginatedResponse(
    products,
    page,
    limit,
    total,
  );

  // Build dynamic message based on applied filters
  const filters = [];
  if (category) filters.push(`category: ${category}`);
  if (inStock !== undefined) filters.push(`inStock: ${inStock}`);
  if (!isNaN(minPrice)) filters.push(`minPrice: ${minPrice}`);
  if (!isNaN(maxPrice)) filters.push(`maxPrice: ${maxPrice}`);
  if (!isNaN(minRating)) filters.push(`minRating: ${minRating}`);

  const filterText =
    filters.length > 0 ? ` with filters (${filters.join(", ")})` : "";
  const sortText = ` sorted by ${sortBy} (${sortOrder})`;

  response.message = `Products retrieved successfully${filterText}${sortText}`;

  res.json(response);
});

export default router;
