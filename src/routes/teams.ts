import { Router, Request, Response } from "express";
import { DataGenerator } from "../utils/dataGenerator";

const router = Router();

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get paginated list of teams
 *     tags: [Teams]
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
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [private, public]
 *         description: Filter by team visibility
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by team owner ID
 *     responses:
 *       200:
 *         description: Paginated list of teams
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
 *                       slug:
 *                         type: string
 *                       description:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                       ownerId:
 *                         type: string
 *                         format: uuid
 *                       memberCount:
 *                         type: integer
 *                       settings:
 *                         type: object
 *                         properties:
 *                           visibility:
 *                             type: string
 *                             enum: [private, public]
 *                           allowInvites:
 *                             type: boolean
 *                           requireApproval:
 *                             type: boolean
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
  const visibility = req.query["visibility"] as string;
  const ownerId = req.query["ownerId"] as string;

  const teams = DataGenerator.generateArray(
    () => DataGenerator.generateTeam(),
    limit,
  );
  const total = 350; // Mock total count

  const response = DataGenerator.createPaginatedResponse(
    teams,
    page,
    limit,
    total,
  );

  // Add filter information to message
  let message = "Teams retrieved successfully";
  const filters = [];
  if (visibility) filters.push(`visibility: ${visibility}`);
  if (ownerId) filters.push(`ownerId: ${ownerId}`);

  if (filters.length > 0) {
    message += ` (filtered by ${filters.join(", ")})`;
  }

  response.message = message;

  res.json(response);
});

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get team by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Team details
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
 *                     slug:
 *                       type: string
 *                     description:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     ownerId:
 *                       type: string
 *                       format: uuid
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             format: uuid
 *                           role:
 *                             type: string
 *                             enum: [owner, admin, member, viewer]
 *                           joinedAt:
 *                             type: string
 *                             format: date-time
 *                           permissions:
 *                             type: array
 *                             items:
 *                               type: string
 *                     settings:
 *                       type: object
 *                       properties:
 *                         visibility:
 *                           type: string
 *                           enum: [private, public]
 *                         allowInvites:
 *                           type: boolean
 *                         requireApproval:
 *                           type: boolean
 *                     plan:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         limits:
 *                           type: object
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
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  // Mock team lookup
  const team = DataGenerator.generateTeam();
  team.id = id as string;

  res.json({
    data: team,
    success: true,
    message: "Team retrieved successfully",
  });
});

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - ownerId
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               ownerId:
 *                 type: string
 *                 format: uuid
 *               visibility:
 *                 type: string
 *                 enum: [private, public]
 *                 default: private
 *               allowInvites:
 *                 type: boolean
 *                 default: true
 *               requireApproval:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Team created successfully
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
 *                     slug:
 *                       type: string
 *                     ownerId:
 *                       type: string
 *                       format: uuid
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
  const {
    name,
    description,
    ownerId,
    visibility,
    allowInvites,
    requireApproval,
  } = req.body;

  // Basic validation
  if (!name || !ownerId) {
    return res.status(400).json({
      data: null,
      success: false,
      message: "Missing required fields: name, ownerId",
    });
  }

  // Mock team creation
  const team = DataGenerator.generateTeam();
  team.name = name;
  team.description = description || "";
  team.ownerId = ownerId;
  team.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  team.settings.visibility = visibility || "private";
  team.settings.allowInvites = allowInvites !== undefined ? allowInvites : true;
  team.settings.requireApproval =
    requireApproval !== undefined ? requireApproval : false;

  return res.status(201).json({
    data: {
      id: team.id,
      name: team.name,
      slug: team.slug,
      ownerId: team.ownerId,
      createdAt: team.createdAt,
    },
    success: true,
    message: "Team created successfully",
  });
});

/**
 * @swagger
 * /api/teams/{id}/members:
 *   get:
 *     summary: Get team members
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Team ID
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [owner, admin, member, viewer]
 *         description: Filter by member role
 *     responses:
 *       200:
 *         description: Team members
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
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       role:
 *                         type: string
 *                         enum: [owner, admin, member, viewer]
 *                       joinedAt:
 *                         type: string
 *                         format: date-time
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: string
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id/members", (req: Request, res: Response) => {
  const { id } = req.params;
  const role = req.query["role"] as string;

  // Mock team lookup
  const team = DataGenerator.generateTeam();
  team.id = id as string;

  let members = team.members;
  if (role) {
    members = members.filter((member) => member.role === role);
  }

  res.json({
    data: members,
    success: true,
    message: role
      ? `Team members with role '${role}' retrieved successfully`
      : "Team members retrieved successfully",
  });
});

/**
 * @swagger
 * /api/teams/{id}/members:
 *   post:
 *     summary: Add member to team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Team ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               role:
 *                 type: string
 *                 enum: [admin, member, viewer]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     role:
 *                       type: string
 *                     joinedAt:
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
router.post("/:id/members", (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role, permissions } = req.body;

  // Basic validation
  if (!userId || !role) {
    return res.status(400).json({
      data: null,
      success: false,
      message: "Missing required fields: userId, role",
    });
  }

  if (!["admin", "member", "viewer"].includes(role)) {
    return res.status(400).json({
      data: null,
      success: false,
      message: "Invalid role. Must be one of: admin, member, viewer",
    });
  }

  // Mock member addition
  const member = {
    userId,
    role,
    joinedAt: new Date().toISOString(),
    permissions: permissions || [],
  };

  return res.status(201).json({
    data: member,
    success: true,
    message: "Member added to team successfully",
  });
});

export default router;
