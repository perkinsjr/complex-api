import { Router, Request, Response } from "express";
import { DataGenerator } from "../utils/dataGenerator";

const router = Router();

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
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user, moderator, guest]
 *         description: Filter by user role
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name or email
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
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                         format: email
 *                       role:
 *                         type: string
 *                         enum: [admin, user, moderator, guest]
 *                       isActive:
 *                         type: boolean
 *                       verified:
 *                         type: boolean
 *                       phoneNumber:
 *                         type: string
 *                       dateOfBirth:
 *                         type: string
 *                         format: date
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
  const role = req.query["role"] as string;
  const verified = req.query["verified"] as string;
  const search = req.query["search"] as string;

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

  // Add filter information to message
  let message = "Users retrieved successfully";
  const filters = [];
  if (role) filters.push(`role: ${role}`);
  if (verified) filters.push(`verified: ${verified}`);
  if (search) filters.push(`search: ${search}`);

  if (filters.length > 0) {
    message += ` (filtered by ${filters.join(", ")})`;
  }

  response.message = message;

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
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                       enum: [admin, user, moderator, guest]
 *                     isActive:
 *                       type: boolean
 *                     verified:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  // Mock user lookup
  const user = DataGenerator.generateUser();
  user.id = id as string;

  res.json({
    data: user,
    success: true,
    message: "User retrieved successfully",
  });
});

export default router;
