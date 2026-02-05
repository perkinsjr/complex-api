import { Express } from "express";
import { requireBearerToken } from "../middleware/auth";
import healthRoutes from "./health";
import usersRoutes from "./users";
import productsRoutes from "./products";
import ordersRoutes from "./orders";
import analyticsRoutes from "./analytics";
import articlesRoutes from "./articles";
import notificationsRoutes from "./notifications";
import searchRoutes from "./search";
import reportsRoutes from "./reports";
import integrationsRoutes from "./integrations";
import settingsRoutes from "./settings";
import openapiRoutes from "./openapi";

export function setupRoutes(app: Express): void {
  // Health check route (no /api prefix, no auth required)
  app.use("/health", healthRoutes);

  // OpenAPI spec route (no auth required for documentation)
  app.use("/", openapiRoutes);

  // API routes with /api prefix - all require Bearer token authentication
  app.use("/api/users", requireBearerToken, usersRoutes);
  app.use("/api/products", requireBearerToken, productsRoutes);
  app.use("/api/orders", requireBearerToken, ordersRoutes);
  app.use("/api/analytics", requireBearerToken, analyticsRoutes);
  app.use("/api/articles", requireBearerToken, articlesRoutes);
  app.use("/api/notifications", requireBearerToken, notificationsRoutes);
  app.use("/api/search", requireBearerToken, searchRoutes);
  app.use("/api/reports", requireBearerToken, reportsRoutes);
  app.use("/api/integrations", requireBearerToken, integrationsRoutes);
  app.use("/api/settings", requireBearerToken, settingsRoutes);
}
