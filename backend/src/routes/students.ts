import { Router, Request, Response, NextFunction } from "express"
import { students, tasks, messages } from "../data/mockData"

const router = Router()

type UrgencyLevel = "critical" | "high" | "moderate" | "low"

// Tradeoff: We are mapping students to a lighter payload to save bandwidth, but this is done on every request. Consider caching student lists if the registry doesn't change frequently.
router.get("/", (_req: Request, res: Response) => {
  const studentList = students.map(({ id, name, grade, enrollmentStatus }) => ({
    id,
    name,
    grade,
    enrollmentStatus,
  }))
  return res.json(studentList)
})


// Tradeoff: Computing urgency in-memory here couples business logic directly to this router. If other endpoints need urgency, we should extract this to a shared service.
function computeUrgencyLevel(
  enrollmentStatus: string,
  urgentTaskCount: number,
  hasHighPriorityTask: boolean
): UrgencyLevel {
  if (enrollmentStatus === "at_risk" && urgentTaskCount > 0) return "critical"
  if (enrollmentStatus === "at_risk" || urgentTaskCount > 0) return "high"
  if (hasHighPriorityTask) return "moderate"
  return "low"
}

// Consolidate all relevant data for a single student into a unified dashboard view.
router.get("/:id/action-center", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // Quick check if the student exists before doing heavy filtrations on tasks and messages.
    const student = students.find((s) => s.id === id)
    if (!student) {
      const err = Object.assign(new Error(`Student with id "${id}" not found`), { status: 404 })
      return next(err)
    }

    const studentTasks = tasks.filter((t) => t.studentId === id)
    const studentMessages = messages.filter((m) => m.studentId === id)

    // Aggregate metrics for the dashboard. This is currently calculated on-the-fly, which works fine with mock data but will need indexing/database group-by queries later.
    const totalTasks = studentTasks.length
    const completedTasks = studentTasks.filter((t) => t.status === "done").length
    const urgentTasks = studentTasks.filter(
      (t) => t.priority === "urgent" && t.status !== "done"
    ).length
    const unreadMessages = studentMessages.filter((m) => !m.read).length
    const hasHighPriorityTask = studentTasks.some((t) => t.priority === "high")

    const urgencyLevel = computeUrgencyLevel(
      student.enrollmentStatus,
      urgentTasks,
      hasHighPriorityTask
    )

    const summary = {
      totalTasks,
      completedTasks,
      urgentTasks,
      unreadMessages,
      urgencyLevel,
    }

    return res.json({ student, tasks: studentTasks, messages: studentMessages, summary })
  } catch (error) {
    return next(error)
  }
})

export default router
