import "express-async-errors"
import express from "express"
import cors from "cors"
import { attachRequestId, errorHandler } from "./middleware/errorHandler"
import { requestLogger } from "./middleware/requestLogger"
import studentsRouter from "./routes/students"
import tasksRouter from "./routes/tasks"
import sseRouter from "./routes/sse"

const app = express()
const PORT = 3000

// Need request IDs on the req object early so our morgan logger can tag them correctly.
app.use(attachRequestId)

// Using requestLogger here to get clean HTTP metrics in development without cluttering console.
app.use(requestLogger)

// Vite runs on 5173 by default. We open CORS for it here to avoid annoying preflight blockages during local dev.
// Future consideration: If we deploy this, we should support dynamic origin whitelisting rather than hardcoded string.
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "PATCH", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

// Parse json bodies. Express doesn't do this by default, which is easy to forget and debug.
app.use(express.json())

// Basic ping endpoint for container probes or monitoring tools to verify the server is alive.
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Route mountpoints.
// Tradeoff: Route handlers reference global in-memory arrays directly. Great for mock dev, but obviously no database transaction safety or horizontal scaling.
app.use("/students", studentsRouter)
app.use("/tasks", tasksRouter)
app.use("/sse", sseRouter)

// Error handler goes last so it catches anything unhandled from routes/middleware without crashing the process.
app.use(errorHandler)

// In testing (e.g. vitest), we import 'app' and let supertest handle ephemeral ports. Don't bind 3000 here.
// Tradeoff: Port is hardcoded. Fine for local dev but we should support process.env.PORT when deploying.
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.info(`✅ Zyra Action Center API running on http://localhost:${PORT}`)
  })
}

export default app
