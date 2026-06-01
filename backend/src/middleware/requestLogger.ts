import morgan from "morgan"
import { Request } from "express"

// Extract the requestId we attached earlier so we can correlate our Express server logs with client-side issues.
morgan.token("requestId", (req: Request) => {
  return (req as Request & { requestId: string }).requestId ?? "-"
})

// Custom format string for morgan. Kept it simple for terminal readability.
// Tradeoff: morgan is standard and simple, but for a real production environment we'd probably want a structured JSON logger (like pino) to make querying easier in Elasticsearch or Datadog.
export const requestLogger = morgan(
  ":method :url :status :response-time ms — reqId::requestId"
)
