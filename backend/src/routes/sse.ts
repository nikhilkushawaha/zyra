import { Router, Request, Response } from "express"

const router = Router()

// Tradeoff: Keeping client connections in an in-memory Set works great for a single container/process.
// If we scale to multiple instances, we'll need a Redis Pub/Sub backplane to broadcast across nodes.
// Another consideration: SSE holds a TCP slot open per client. If client count spikes, we could run out of file descriptors.
const clients = new Set<Response>()

// Loop through connected responses and write the SSE frame directly. Simple broadcast pattern.
export function broadcastTaskUpdate(payload: {
  type: string
  taskId: string
  studentId: string
  status: string
}): void {
  const data = JSON.stringify(payload)
  clients.forEach((client) => {
    client.write(`event: task_update\ndata: ${data}\n\n`)
  })
}

// SSE channel for push notifications. EventSource in the frontend listens to this for instant task changes.
router.get("/task-updates", (req: Request, res: Response) => {
  // SSE requires keeping the connection open indefinitely with specific headers to prevent the browser/proxies from caching or buffering.
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")
  res.setHeader("X-Accel-Buffering", "no") // Nginx will aggressively buffer responses by default. Disabling it ensures real-time frame delivery.
  res.flushHeaders()

  clients.add(res)

  // Flush initial payload so the client-side EventSource fires its 'open' event immediately and we know the handshake succeeded.
  res.write(`event: connected\ndata: ${JSON.stringify({ message: "Connected to SSE stream" })}\n\n`)

  // Heroku/AWS load balancers cut idle connections after ~30-60s. Sending regular empty comments keeps the pipe warm.
  const keepaliveInterval = setInterval(() => {
    res.write(`: keepalive\n\n`)
  }, 30_000)

  // Critical: must clear the interval and delete the client reference to prevent memory leaks and dangling sockets when users close the tab.
  req.on("close", () => {
    clearInterval(keepaliveInterval)
    clients.delete(res)
  })
})

export default router
