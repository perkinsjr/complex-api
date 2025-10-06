import swaggerJsdoc from "swagger-jsdoc";
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";

// Swagger configuration (same as in src/index.ts)
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
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
        url: process.env["API_URL"] || "/",
        description: "API server",
      },
    ],
    components: {
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            data: {
              oneOf: [{ type: "object" }, { type: "array" }, { type: "null" }],
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
                    page: { type: "integer", example: 1 },
                    limit: { type: "integer", example: 10 },
                    total: { type: "integer", example: 100 },
                    totalPages: { type: "integer", example: 10 },
                    hasNext: { type: "boolean", example: true },
                    hasPrev: { type: "boolean", example: false },
                  },
                },
              },
            },
          ],
        },
        Error: {
          type: "object",
          properties: {
            data: { type: "null" },
            success: { type: "boolean", example: false },
            message: { type: "string", example: "An error occurred" },
          },
        },
      },
    },
    tags: [
      { name: "Health", description: "Health check endpoints" },
      { name: "Users", description: "User management operations" },
      { name: "Products", description: "Product catalog operations" },
      { name: "Orders", description: "Order management operations" },
      { name: "Analytics", description: "Analytics and metrics" },
      {
        name: "Subscriptions",
        description: "Subscription management operations",
      },
      { name: "Teams", description: "Team management operations" },
      { name: "Notifications", description: "Notification management" },
      { name: "Search", description: "Search functionality" },
      { name: "Reports", description: "Report generation and retrieval" },
      { name: "Integrations", description: "Third-party integrations" },
      { name: "Settings", description: "Application settings" },
      { name: "Documentation", description: "API documentation" },
    ],
  },
  apis: ["./src/routes/*.ts"], // Always use source files for generation
};

try {
  console.log("Generating OpenAPI specification...");

  // Generate the OpenAPI specification
  const specs = swaggerJsdoc(swaggerOptions);

  // Convert to YAML
  const yamlString = yaml.dump(specs, {
    indent: 2,
    lineWidth: -1,
    noRefs: false,
    skipInvalid: true,
  });

  // Write to openapi.yaml at project root
  const outputPath = path.join(__dirname, "..", "openapi.yaml");
  fs.writeFileSync(outputPath, yamlString, "utf8");

  console.log(
    "✅ OpenAPI specification generated successfully at openapi.yaml",
  );
  console.log(`📄 File size: ${Buffer.byteLength(yamlString, "utf8")} bytes`);
} catch (error) {
  console.error("❌ Error generating OpenAPI specification:", error);
  process.exit(1);
}
