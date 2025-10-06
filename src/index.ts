import express from "express";
import helmet from "helmet";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";
import { setupRoutes } from "./routes";

const app = express();
const PORT = parseInt(process.env["PORT"] || "3000", 10);

// Middleware
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load static OpenAPI specification
const loadOpenAPISpec = () => {
  try {
    const openapiPath = path.join(__dirname, "..", "openapi.yaml");
    const yamlContent = fs.readFileSync(openapiPath, "utf8");
    return yaml.load(yamlContent) as any;
  } catch (error) {
    console.error("Error loading OpenAPI specification:", error);
    // Fallback to a minimal spec if file not found
    return {
      openapi: "3.0.0",
      info: {
        title: "Complex API Demo",
        version: "1.0.0",
        description: "API specification not available",
      },
      paths: {},
    };
  }
};

const specs = loadOpenAPISpec();

// API Documentation
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customSiteTitle: "Complex API Demo - Documentation",
    customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6 }
  `,
    customfavIcon:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMzk4MkY2Ii8+CjxwYXRoIGQ9Ik04IDE2TDE2IDhMMjQgMTZMMTYgMjRMOCAxNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=",
  }),
);

// Setup all routes
setupRoutes(app);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    data: null,
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);

    res.status(500).json({
      data: null,
      success: false,
      message:
        process.env["NODE_ENV"] === "production"
          ? "Internal server error"
          : err.message,
    });
  },
);

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📋 OpenAPI Spec: http://localhost:${PORT}/openapi.yaml`);
  console.log(`🌍 Environment: ${process.env["NODE_ENV"] || "development"}`);
  console.log(`🔧 Process ID: ${process.pid}`);
});

// Handle server startup errors
server.on("error", (error: NodeJS.ErrnoException) => {
  console.error("❌ Server startup error:", error);
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`);
  } else if (error.code === "EACCES") {
    console.error(`❌ Permission denied to bind to port ${PORT}`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📴 SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("💤 Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("📴 SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("💤 Server closed");
    process.exit(0);
  });
});

export default app;
