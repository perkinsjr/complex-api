import { Router, Request, Response } from "express";
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
    const openapiPath = path.join(__dirname, "..", "..", "openapi.yaml");

    if (!fs.existsSync(openapiPath)) {
      return res.status(404).json({
        success: false,
        message: "OpenAPI specification file not found",
      });
    }

    const yamlContent = fs.readFileSync(openapiPath, "utf8");
    res.setHeader("Content-Type", "application/x-yaml");
    return res.send(yamlContent);
  } catch (error) {
    console.error("Error reading OpenAPI file:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to read OpenAPI specification",
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
 *         description: OpenAPI specification in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: OpenAPI specification file not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: OpenAPI specification file not found
 */
router.get("/openapi.json", (req: Request, res: Response) => {
  try {
    const openapiPath = path.join(__dirname, "..", "..", "openapi.yaml");

    if (!fs.existsSync(openapiPath)) {
      return res.status(404).json({
        success: false,
        message: "OpenAPI specification file not found",
      });
    }

    const yamlContent = fs.readFileSync(openapiPath, "utf8");
    const yaml = require("js-yaml");
    const jsonSpec = yaml.load(yamlContent);

    res.setHeader("Content-Type", "application/json");
    return res.json(jsonSpec);
  } catch (error) {
    console.error("Error reading OpenAPI file:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to read OpenAPI specification",
    });
  }
});

export default router;
