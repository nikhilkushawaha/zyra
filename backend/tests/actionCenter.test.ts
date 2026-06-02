import { describe, it, expect, beforeAll, afterEach } from "vitest"
import request from "supertest"
import app from "../src/index"
import { tasks } from "../src/data/mockData"

// Reset tsk_001 status before each test group to ensure idempotency
afterEach(() => {
  const task = tasks.find((t) => t.id === "tsk_001")
  if (task) {
    task.status = "todo"
    task.priority = "urgent"
  }
})

describe("GET /students/:id/action-center", () => {
  it("returns 200 with student, tasks, messages, summary for stu_001", async () => {
    const res = await request(app).get("/students/stu_001/action-center")
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty("student")
    expect(res.body).toHaveProperty("tasks")
    expect(res.body).toHaveProperty("messages")
    expect(res.body).toHaveProperty("summary")
  })

  it("returns correct unreadMessages count for stu_001", async () => {
    const res = await request(app).get("/students/stu_001/action-center")
    expect(res.status).toBe(200)
    // msg_001 and msg_002 are unread; msg_003 is read
    expect(res.body.summary.unreadMessages).toBe(2)
  })

  it("returns urgencyLevel === 'critical' for stu_001 (at_risk + urgent task)", async () => {
    const res = await request(app).get("/students/stu_001/action-center")
    expect(res.status).toBe(200)
    expect(res.body.summary.urgencyLevel).toBe("critical")
  })
})

describe("GET /students/:id/action-center — not found", () => {
  it("returns 404 with error field for invalid student id", async () => {
    const res = await request(app).get("/students/invalid_id/action-center")
    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty("error")
  })
})

describe("PATCH /tasks/:taskId/status", () => {
  it("returns 200 and updated task with status 'done'", async () => {
    const res = await request(app)
      .patch("/tasks/tsk_001/status")
      .send({ status: "done" })
    expect(res.status).toBe(200)
    expect(res.body.task.status).toBe("done")
  })

  it("returns 400 with error field for invalid status", async () => {
    const res = await request(app)
      .patch("/tasks/tsk_001/status")
      .send({ status: "invalid" })
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty("error")
  })

  it("returns 404 with error field for invalid task id", async () => {
    const res = await request(app)
      .patch("/tasks/invalid_id/status")
      .send({ status: "done" })
    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty("error")
  })
})
