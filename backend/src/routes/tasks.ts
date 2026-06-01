import { Router, Request, Response, NextFunction } from "express"
import { tasks } from "../data/mockData"
import { broadcastTaskUpdate } from "./sse"

const router = Router()

const VALID_STATUSES = ["todo", "in_progress", "done"] as const
type TaskStatus = (typeof VALID_STATUSES)[number]

// PATCH handler to modify a task's status and trigger live updates on the frontend.
router.patch("/:taskId/status", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params
    const { status } = req.body as { status: TaskStatus }

    if (!status || !VALID_STATUSES.includes(status)) {
      const err = Object.assign(new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`), { status: 400 })
      return next(err)
    }

    const taskIndex = tasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) {
      const err = Object.assign(new Error(`Task with id "${taskId}" not found`), { status: 404 })
      return next(err)
    }

    // Mutating our mock data array directly. Obviously not transaction-safe or persistent, but fits the current prototype.
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      status,
      updatedAt: new Date().toISOString(),
    }

    const updatedTask = tasks[taskIndex]

    // Push changes instantly to the SSE channel so counselor UI updates without requiring manual refresh.
    // Tradeoff: Broadcasting state directly on PATCH. If we receive high concurrent updates, this could overwhelm clients. Future consideration: debouncing/batching broadcasts.
    broadcastTaskUpdate({
      type: "TASK_UPDATED",
      taskId: updatedTask.id,
      studentId: updatedTask.studentId,
      status: updatedTask.status,
    })

    return res.json({ task: updatedTask })
  } catch (error) {
    return next(error)
  }
})

export default router
