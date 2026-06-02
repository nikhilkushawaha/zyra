import type { ActionCenterResponse, StudentSummary, Task, TaskStatus } from "../types"

// VITE_API_URL is injected by Vite at build time from the .env file.
// Locally this points to localhost:3000; on Vercel it will be set to the Render backend URL.
const BASE_URL = import.meta.env.VITE_API_URL as string

// Using standard fetch API instead of axios to keep the bundle size small.
// Tradeoff: We have to handle non-2xx statuses manually and read JSON error objects ourselves.
export async function fetchStudents(): Promise<StudentSummary[]> {
  const res = await fetch(`${BASE_URL}/students`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(body.error ?? `Request failed with status ${res.status}`)
  }
  return res.json() as Promise<StudentSummary[]>
}


// Pulls the consolidated state (student profile info, tasks, messages, action count summary) in one trip.
export async function fetchActionCenter(studentId: string): Promise<ActionCenterResponse> {
  const res = await fetch(`${BASE_URL}/students/${studentId}/action-center`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(body.error ?? `Request failed with status ${res.status}`)
  }
  return res.json() as Promise<ActionCenterResponse>
}

// Sends partial status updates back to the backend.
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<{ task: Task }> {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(body.error ?? `Request failed with status ${res.status}`)
  }
  return res.json() as Promise<{ task: Task }>
}
