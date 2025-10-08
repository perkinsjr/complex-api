import { Router, Request, Response } from "express";
import { DataGenerator } from "../utils/dataGenerator";

const router = Router();

// No authentication required - removed Bearer Auth

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get paginated list of users
 *     tags: [Users]

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
 *     responses:
 *       200:
 *         description: Paginated list of users
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
 *                       email:
 *                         type: string
 *                         format: email
 *                       role:
 *                         type: string
 *                       status:
 *                         type: string
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
 *       401:
 *         description: Unauthorized - missing or invalid authentication
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", (req: Request, res: Response) => {
  const page = parseInt(req.query["page"] as string) || 1;
  const limit = parseInt(req.query["limit"] as string) || 10;

  const users = DataGenerator.generateArray(
    () => DataGenerator.generateUser(),
    limit,
  );
  const total = 1000; // Mock total count

  const response = DataGenerator.createPaginatedResponse(
    users,
    page,
    limit,
    total,
  );

  response.message = "Users retrieved successfully";

  res.json(response);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
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
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     profile:
 *                       type: object
 *                       properties:
 *                         avatar:
 *                           type: string
 *                         bio:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         address:
 *                           type: object
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - invalid user ID format
 *       404:
 *         description: User not found
 */
router.get("/:id", (req: Request, res: Response): void => {
  const { id } = req.params;

  // Validate UUID format
  if (!id || !DataGenerator.isValidId(id)) {
    res.status(400).json({
      data: null,
      success: false,
      message: "Invalid user ID format",
    });
    return;
  }

  // Mock user lookup - in real implementation, query database
  const user = DataGenerator.generateUser();
  user.id = id;

  // Add additional profile information for individual user view
  const userWithProfile = {
    ...user,
    profile: {
      avatar: user.avatar,
      bio: "This is a sample user biography that provides more details about the user.",
      phone: "+1-555-0123",
      address: {
        street: "123 Main St",
        city: "San Francisco",
        state: "CA",
        zip: "94105",
        country: "US",
      },
    },
  };

  res.json({
    data: userWithProfile,
    success: true,
    message: "User retrieved successfully",
  });
});

export default router;
