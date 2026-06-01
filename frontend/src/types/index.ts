export type TaskStatus = "todo" | "in_progress" | "done"
export type Priority = "urgent" | "high" | "medium" | "low"
export type UrgencyLevel = "critical" | "high" | "moderate" | "low"
export type EnrollmentStatus = "at_risk" | "active"

export interface StudentSummary {
  id: string
  name: string
  grade: number
  enrollmentStatus: EnrollmentStatus
}


export interface Student {
  id: string
  name: string
  email: string
  grade: number
  gpa: number
  counselorId: string
  enrollmentStatus: EnrollmentStatus
}

export interface Task {
  id: string
  studentId: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  dueDate: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  studentId: string
  from: string
  subject: string
  preview: string
  read: boolean
  receivedAt: string
}

export interface ActionCenterSummary {
  totalTasks: number
  completedTasks: number
  urgentTasks: number
  unreadMessages: number
  urgencyLevel: UrgencyLevel
}

export interface ActionCenterResponse {
  student: Student
  tasks: Task[]
  messages: Message[]
  summary: ActionCenterSummary
}

export interface SSETaskUpdateEvent {
  type: "TASK_UPDATED"
  taskId: string
  studentId: string
  status: TaskStatus
}
