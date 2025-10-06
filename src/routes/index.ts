import { Express } from "express";
import healthRoutes from "./health";
import usersRoutes from "./users";
import productsRoutes from "./products";
import ordersRoutes from "./orders";
import analyticsRoutes from "./analytics";
import subscriptionsRoutes from "./subscriptions";
import teamsRoutes from "./teams";
import notificationsRoutes from "./notifications";
import searchRoutes from "./search";
import reportsRoutes from "./reports";
import integrationsRoutes from "./integrations";
import settingsRoutes from "./settings";
import openapiRoutes from "./openapi";

export function setupRoutes(app: Express): void {
  // Health check route (no /api prefix)
  app.use("/health", healthRoutes);

  // API routes with /api prefix
  app.use("/api/users", usersRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/orders", ordersRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/subscriptions", subscriptionsRoutes);
  app.use("/api/teams", teamsRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api/reports", reportsRoutes);
  app.use("/api/integrations", integrationsRoutes);
  app.use("/api/settings", settingsRoutes);

  // OpenAPI spec route
  app.use("/api", openapiRoutes);
}
