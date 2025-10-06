import { Router, Request, Response } from "express";
import { DataGenerator } from "../utils/dataGenerator";

const router = Router();

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get paginated list of articles
 *     tags: [Articles]
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
 *         description: Filter by article category
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured articles only
 *     responses:
 *       200:
 *         description: Paginated list of articles
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
 *                       title:
 *                         type: string
 *                       excerpt:
 *                         type: string
 *                       content:
 *                         type: string
 *                       author:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                       category:
 *                         type: string
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                       featured:
 *                         type: boolean
 *                       publishedAt:
 *                         type: string
 *                         format: date-time
 *                       readTime:
 *                         type: integer
 *                       viewCount:
 *                         type: integer
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
  const featured = req.query["featured"] === "true";

  const articles = DataGenerator.generateArray(
    () => DataGenerator.generateArticle(),
    limit,
  );
  const total = 750; // Mock total count

  let message = "Articles retrieved successfully";
  if (category) {
    message = `Articles in category '${category}' retrieved successfully`;
  }
  if (featured) {
    message = "Featured articles retrieved successfully";
  }
  if (category && featured) {
    message = `Featured articles in category '${category}' retrieved successfully`;
  }

  const response = DataGenerator.createPaginatedResponse(
    articles,
    page,
    limit,
    total,
  );

  response.message = message;

  res.json(response);
});

export default router;
