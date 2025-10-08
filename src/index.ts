import express from "express";
import helmet from "helmet";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { setupRoutes } from "./routes";

const app = express();
const PORT = parseInt(process.env["PORT"] || "3000", 10);

// Middleware
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Generate dynamic OpenAPI specification
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
  },
  apis: ["./src/routes/*.ts"],
};

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

const specs = generateOpenAPISpec();

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
  console.log(`📋 OpenAPI Spec (YAML): http://localhost:${PORT}/openapi.yaml`);
  console.log(`📋 OpenAPI Spec (JSON): http://localhost:${PORT}/openapi.json`);
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
