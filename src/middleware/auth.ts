import { Request, Response, NextFunction } from "express";

/**
 * Authentication middleware that validates Bearer tokens.
 *
 * This middleware checks for the presence of a valid Bearer token
 * in the Authorization header. If the token is missing or malformed,
 * the request is rejected with a 401 Unauthorized response.
 *
 * Note: This middleware only validates the presence and format of the token.
 * Actual token verification (e.g., JWT validation, database lookup)
 * should be implemented based on your authentication strategy.
 */
export function requireBearerToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists
  if (!authHeader) {
    res.status(401).json({
      data: null,
      success: false,
      message: "Authorization header is required",
    });
    return;
  }

  // Check if it's a Bearer token
  if (!authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      data: null,
      success: false,
      message: "Authorization header must use Bearer scheme",
    });
    return;
  }

  // Extract the token
  const token = authHeader.slice(7); // Remove "Bearer " prefix

  // Check if token is not empty
  if (!token || token.trim() === "") {
    res.status(401).json({
      data: null,
      success: false,
      message: "Bearer token is required",
    });
    return;
  }

  // TODO: Implement actual token verification here
  // Examples:
  // - JWT verification: jwt.verify(token, secretKey)
  // - Database lookup: await TokenService.validate(token)
  // - External auth service: await authService.verifyToken(token)

  // Attach token to request for downstream use (optional)
  (req as any).token = token;

  // Token is present and properly formatted, proceed to the next middleware
  next();
}

export default requireBearerToken;
