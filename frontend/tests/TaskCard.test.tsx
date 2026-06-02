import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TaskCard } from "../src/components/TaskCard"
import type { Task } from "../src/types"

const mockTask: Task = {
  id: "tsk_001",
  studentId: "stu_001",
  title: "Submit FAFSA application",
  description: "Deadline is approaching. Student has not started the form.",
  status: "todo",
  priority: "urgent",
  dueDate: "2026-06-05",
  createdAt: "2026-05-13T14:00:00Z",
  updatedAt: "2026-05-13T14:00:00Z",
}

const mockDoneTask: Task = {
  ...mockTask,
  id: "tsk_done",
  status: "done",
}

describe("TaskCard", () => {
  let onStatusChange: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onStatusChange = vi.fn()
  })

  it("renders task title and description", () => {
    render(<TaskCard task={mockTask} onStatusChange={onStatusChange} />)
    expect(screen.getByText("Submit FAFSA application")).toBeInTheDocument()
    expect(
      screen.getByText("Deadline is approaching. Student has not started the form.")
    ).toBeInTheDocument()
  })

  it("renders correct priority badge color class for 'urgent'", () => {
    render(<TaskCard task={mockTask} onStatusChange={onStatusChange} />)
    const badge = screen.getByTestId("priority-badge-tsk_001")
    // Urgent tasks have red badge classes
    expect(badge.className).toMatch(/red/)
    expect(badge.textContent).toBe("Urgent")
  })

  it("status dropdown renders all 3 options", () => {
    render(<TaskCard task={mockTask} onStatusChange={onStatusChange} />)
    const select = screen.getByRole("combobox", { name: /status for/i })
    const options = Array.from(select.querySelectorAll("option"))
    const values = options.map((o) => o.value)
    expect(values).toContain("todo")
    expect(values).toContain("in_progress")
    expect(values).toContain("done")
    expect(options).toHaveLength(3)
  })

  it("calls onStatusChange with correct args when dropdown changes", () => {
    render(<TaskCard task={mockTask} onStatusChange={onStatusChange} />)
    const select = screen.getByRole("combobox", { name: /status for/i })
    fireEvent.change(select, { target: { value: "in_progress" } })
    expect(onStatusChange).toHaveBeenCalledOnce()
    expect(onStatusChange).toHaveBeenCalledWith("tsk_001", "in_progress")
  })

  it("applies line-through style when task status is 'done'", () => {
    render(<TaskCard task={mockDoneTask} onStatusChange={onStatusChange} />)
    const title = screen.getByText("Submit FAFSA application")
    expect(title.className).toMatch(/line-through/)
  })
})
