import { Router, Request, Response } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import * as yaml from "js-yaml";

const router = Router();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.4",
    info: {
      title: "Complex API Demo",
      version: "1.0.0",
      description:
        "A comprehensive API demonstration for Unkey deployment showcase",
      contact: {
        name: "Unkey Team",
        url: "https://unkey.dev",
        email: "support@unkey.dev",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "/",
        description: "API server",
      },
    ],
    components: {
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            data: {
              oneOf: [
                { type: "object" },
                { type: "array" },
                { type: "string" },
              ],
            },
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
          },
          required: ["data", "success", "message"],
        },
        PaginatedResponse: {
          allOf: [
            { $ref: "#/components/schemas/ApiResponse" },
            {
              type: "object",
              properties: {
                pagination: {
                  type: "object",
                  properties: {
                    page: {
                      type: "integer",
                      example: 1,
                    },
                    limit: {
                      type: "integer",
                      example: 10,
                    },
                    total: {
                      type: "integer",
                      example: 100,
                    },
                    totalPages: {
                      type: "integer",
                      example: 10,
                    },
                  },
                },
              },
            },
          ],
        },
        Error: {
          type: "object",
          properties: {
            data: {
              type: "null",
            },
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "An error occurred",
            },
          },
          required: ["data", "success", "message"],
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john.doe@example.com",
            },
            avatar: {
              type: "string",
              format: "url",
              example: "https://example.com/avatar.jpg",
            },
            role: {
              type: "string",
              enum: ["admin", "user", "moderator"],
              example: "user",
            },
            status: {
              type: "string",
              enum: ["active", "inactive", "pending"],
              example: "active",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2023-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2023-01-01T00:00:00.000Z",
            },
          },
          required: [
            "id",
            "name",
            "email",
            "role",
            "status",
            "createdAt",
            "updatedAt",
          ],
        },
        Product: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            name: {
              type: "string",
              example: "Awesome Product",
            },
            description: {
              type: "string",
              example: "This is an awesome product",
            },
            price: {
              type: "number",
              format: "float",
              example: 29.99,
            },
            category: {
              type: "string",
              example: "Electronics",
            },
            inStock: {
              type: "boolean",
              example: true,
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["electronics", "gadget"],
            },
          },
          required: ["id", "name", "price", "category", "inStock"],
        },
      },
    },
    tags: [
      {
        name: "Documentation",
        description: "API documentation endpoints",
      },
      {
        name: "Health",
        description: "Health check endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints",
      },
      {
        name: "Products",
        description: "Product management endpoints",
      },
      {
        name: "Orders",
        description: "Order management endpoints",
      },
      {
        name: "Analytics",
        description: "Analytics and metrics endpoints",
      },
      {
        name: "Articles",
        description: "Content management endpoints",
      },
      {
        name: "Notifications",
        description: "Notification system endpoints",
      },
      {
        name: "Search",
        description: "Search functionality endpoints",
      },
      {
        name: "Reports",
        description: "Reporting endpoints",
      },
      {
        name: "Integrations",
        description: "Third-party integration endpoints",
      },
      {
        name: "Settings",
        description: "Application settings endpoints",
      },
      {
        name: "Webhooks",
        description: "Webhook management endpoints",
      },
      {
        name: "Admin",
        description: "Administrative endpoints",
      },
    ],
  },
  apis: [
    "./src/routes/*.ts", // Path to the API routes
  ],
};

// Generate OpenAPI specification
const generateOpenAPISpec = () => {
  try {
    return swaggerJSDoc(swaggerOptions);
  } catch (error) {
    console.error("Error generating OpenAPI spec:", error);
    return {
      openapi: "3.0.4",
      info: {
        title: "Complex API Demo",
        version: "1.0.0",
        description: "Error generating API specification",
      },
      paths: {},
    };
  }
};

/**
 * @swagger
 * /openapi.yaml:
 *   get:
 *     summary: Get OpenAPI specification in YAML format
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/x-yaml:
 *             schema:
 *               type: string
 *       500:
 *         description: Error generating specification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/openapi.yaml", (req: Request, res: Response) => {
  try {
    const spec = generateOpenAPISpec();
    const yamlContent = yaml.dump(spec, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      skipInvalid: true,
    });

    res.setHeader("Content-Type", "application/x-yaml");
    res.setHeader("Cache-Control", "no-cache");
    return res.send(yamlContent);
  } catch (error) {
    console.error("Error generating OpenAPI YAML:", error);
    return res.status(500).json({
      data: null,
      success: false,
      message: "Unable to generate OpenAPI specification",
    });
  }
});

/**
 * @swagger
 * /openapi.json:
 *   get:
 *     summary: Get OpenAPI specification in JSON format
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Error generating specification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/openapi.json", (req: Request, res: Response) => {
  try {
    const spec = generateOpenAPISpec();

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    return res.json(spec);
  } catch (error) {
    console.error("Error generating OpenAPI JSON:", error);
    return res.status(500).json({
      data: null,
      success: false,
      message: "Unable to generate OpenAPI specification",
    });
  }
});

export default router;
