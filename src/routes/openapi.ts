import { Router, Request, Response } from "express";
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";

const router = Router();

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
 */
router.get("/openapi.yaml", (req: Request, res: Response) => {
  try {
    // Try to serve the static openapi.yaml file first
    const staticPath = path.join(process.cwd(), "openapi.yaml");

    if (fs.existsSync(staticPath)) {
      const yamlContent = fs.readFileSync(staticPath, "utf8");
      res.setHeader("Content-Type", "application/x-yaml");
      return res.send(yamlContent);
    }

    // Fallback to dynamic generation if static file doesn't exist
    const specs = (req.app as any).swaggerSpecs;

    if (!specs) {
      return res.status(500).json({
        success: false,
        message: "OpenAPI specification not available",
      });
    }

    res.setHeader("Content-Type", "application/x-yaml");
    return res.send(yaml.dump(specs));
  } catch (error) {
    console.error("Error serving OpenAPI spec:", error);
    return res.status(500).json({
      success: false,
      message: "Error loading OpenAPI specification",
    });
  }
});

export default router;
