import { Router, Request, Response } from "express";
import * as yaml from "js-yaml";

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
 *           text/yaml:
 *             schema:
 *               type: string
 */
router.get("/openapi.yaml", (req: Request, res: Response) => {
  // This will be populated by the swagger setup in the main app
  const specs = (req.app as any).swaggerSpecs;

  if (!specs) {
    return res.status(500).json({
      success: false,
      message: "OpenAPI specification not available",
    });
  }

  res.setHeader("Content-Type", "text/yaml");
  return res.send(yaml.dump(specs));
});

export default router;
