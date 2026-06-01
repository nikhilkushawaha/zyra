import { Request, Response, NextFunction } from "express"
import { v4 as uuidv4 } from "uuid"

// Need to generate/forward a request ID immediately so any downstream logs (errors, request logger) can be grouped together.
// Tradeoff: Using standard UUIDs. If log volume grows massively, we might want to switch to a faster ID generator like nanoid or hyperid.
export function attachRequestId(req: Request, _res: Response, next: NextFunction): void {
  req.headers["x-request-id"] = req.headers["x-request-id"] ?? uuidv4()
  // Express req type definitions are strict, so casting is the easiest way to append custom correlation IDs without a heavy declaration merge.
  ;(req as Request & { requestId: string }).requestId = req.headers["x-request-id"] as string
  next()
}

interface AppError extends Error {
  status?: number
}

// Centralized safety net. Catching everything here ensures we don't leak raw stack traces to the client while keeping error structure uniform.
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const requestId = (req as Request & { requestId: string }).requestId ?? "unknown"
  const status = err.status ?? 500
  const message = err.message ?? "Internal Server Error"

  // Tradeoff: Returning error.message directly. Safe for mock/dev environment, but in production we should scrub 500 errors to avoid leaking database internals.
  res.status(status).json({
    error: message,
    requestId,
    timestamp: new Date().toISOString(),
  })
}
