const swaggerJsdoc = require("swagger-jsdoc");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

// Swagger configuration - updated to match the new auth-free configuration
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
        url: process.env.API_URL || "/",
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
              type: "string",
              nullable: true,
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
  apis: ["./src/routes/*.ts"],
};

try {
  console.log("🔄 Generating OpenAPI specification...");

  // Generate the OpenAPI spec
  const specs = swaggerJsdoc(swaggerOptions);

  // Convert to YAML
  const yamlString = yaml.dump(specs, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    skipInvalid: true,
  });

  // Write to openapi.yaml in the root directory
  const outputPath = path.join(__dirname, "..", "openapi.yaml");
  fs.writeFileSync(outputPath, yamlString, "utf8");

  console.log("✅ OpenAPI specification generated successfully!");
  console.log(`📁 File saved to: ${outputPath}`);
  console.log(
    `📊 Generated spec contains ${Object.keys(specs.paths || {}).length} endpoints`,
  );

  // Also generate a JSON version
  const jsonOutputPath = path.join(__dirname, "..", "openapi.json");
  fs.writeFileSync(jsonOutputPath, JSON.stringify(specs, null, 2), "utf8");
  console.log(`📁 JSON version saved to: ${jsonOutputPath}`);
} catch (error) {
  console.error("❌ Error generating OpenAPI specification:", error);
  console.error("Stack trace:", error.stack);
  process.exit(1);
}
