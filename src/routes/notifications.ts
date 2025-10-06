import { Router, Request, Response } from "express";
import { DataGenerator } from "../utils/dataGenerator";

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get paginated list of notifications
 *     tags: [Notifications]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [info, warning, error, success]
 *         description: Filter by notification type
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: Filter by unread notifications only
 *     responses:
 *       200:
 *         description: Paginated list of notifications
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
 *                       message:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [info, warning, error, success]
 *                       priority:
 *                         type: string
 *                         enum: [low, medium, high, critical]
 *                       read:
 *                         type: boolean
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       metadata:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       readAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
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
  const type = req.query["type"] as string;
  const unread = req.query["unread"] === "true";

  const notifications = DataGenerator.generateArray(
    () => DataGenerator.generateNotification(),
    limit,
  );
  const total = 300; // Mock total count

  let message = "Notifications retrieved successfully";
  if (type) {
    message = `${type.charAt(0).toUpperCase() + type.slice(1)} notifications retrieved successfully`;
  }
  if (unread) {
    message = "Unread notifications retrieved successfully";
  }
  if (type && unread) {
    message = `Unread ${type} notifications retrieved successfully`;
  }

  const response = DataGenerator.createPaginatedResponse(
    notifications,
    page,
    limit,
    total,
  );

  response.message = message;

  res.json(response);
});

export default router;
