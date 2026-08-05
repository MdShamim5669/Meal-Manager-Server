import NodeCache from "node-cache";
import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

// Initialize in-memory NodeCache with default TTL of 5 minutes (300 seconds)
export const appCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Express middleware to cache GET requests for a specified duration (in seconds).
 * Key is generated from the request original URL and optional authenticated user ID.
 */
export const cacheMiddleware = (durationInSeconds: number = 300) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const userId = req.user?.memberId || "public";
    const cacheKey = `__express__${userId}__${req.originalUrl || req.url}`;
    const cachedResponse = appCache.get(cacheKey);

    if (cachedResponse) {
      res.setHeader("X-Cache", "HIT");
      return res.json(cachedResponse);
    }

    // Intercept res.json to cache response payload before sending
    const originalJson = res.json.bind(res);
    res.json = (body: any): Response => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        appCache.set(cacheKey, body, durationInSeconds);
      }
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };
};

/**
 * Invalidate specific cache keys or clear entire cache.
 */
export const clearCache = (prefix?: string) => {
  if (!prefix) {
    appCache.flushAll();
    return;
  }

  const keys = appCache.keys();
  const matchingKeys = keys.filter((key) => key.includes(prefix));
  matchingKeys.forEach((key) => appCache.del(key));
};
