import { Router, Request, Response } from "express";
import { DataGenerator } from "../utils/dataGenerator";
import { v4 as uuidv4 } from "uuid";

const router = Router();

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search across different content types
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, users, products, articles, orders]
 *           default: all
 *         description: Type of content to search
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
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     query:
 *                       type: string
 *                     type:
 *                       type: string
 *                     totalResults:
 *                       type: integer
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           type:
 *                             type: string
 *                           title:
 *                             type: string
 *                           excerpt:
 *                             type: string
 *                           relevanceScore:
 *                             type: number
 *                             format: float
 *                           url:
 *                             type: string
 *                           metadata:
 *                             type: object
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
 *         description: Bad request - missing search query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Search query is required"
 */
router.get("/", (req: Request, res: Response) => {
  const query = req.query["q"] as string;
  const type = (req.query["type"] as string) || "all";
  const page = parseInt(req.query["page"] as string) || 1;
  const limit = parseInt(req.query["limit"] as string) || 10;

  if (!query) {
    const response = DataGenerator.createApiResponse(
      null,
      false,
      "Search query is required",
    );
    return res.status(400).json(response);
  }

  // Generate mock search results
  const searchResults = DataGenerator.generateArray(
    () => ({
      id: uuidv4(),
      type:
        type === "all"
          ? ["users", "products", "articles", "orders"][
              Math.floor(Math.random() * 4)
            ]
          : type,
      title: `Search result for "${query}"`,
      excerpt: `This is a mock search result excerpt for the query "${query}". It contains relevant information about the search term.`,
      relevanceScore: Math.random(),
      url: `/api/${type}/${uuidv4()}`,
      metadata: {
        category: "general",
        tags: ["search", "result"],
        lastModified: new Date(
          Date.now() - Math.random() * 86400000 * 30,
        ).toISOString(),
      },
    }),
    limit,
  );

  const total = Math.floor(Math.random() * 1000) + 100;
  const response = DataGenerator.createPaginatedResponse(
    searchResults,
    page,
    limit,
    total,
  );

  // Add search metadata to the response
  (response as any).data = {
    query,
    type,
    totalResults: total,
    results: searchResults,
  };

  response.message = `Search completed for "${query}" in ${type} content`;

  return res.json(response);
});

export default router;
