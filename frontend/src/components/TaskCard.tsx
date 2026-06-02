import { CalendarDays, Loader2, AlertCircle, RotateCcw } from "lucide-react"
import type { Task, TaskStatus } from "../types"

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  isPending?: boolean
  isError?: boolean
  onRetry?: () => void
}

const priorityConfig: Record<
  Task["priority"],
  { label: string; classes: string }
> = {
  urgent: { label: "Urgent", classes: "bg-red-50 text-red-600 border border-red-200" },
  high: { label: "High", classes: "bg-orange-50 text-orange-600 border border-orange-200" },
  medium: { label: "Medium", classes: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  low: { label: "Low", classes: "bg-slate-100 text-slate-500 border border-slate-200" },
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
]

// Simple local date calculations.
// Tradeoff: Not timezone-aware and relies on browser locale. If we add calendar views or timezone constraints, we'll want to pull in date-fns or dayjs.
function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function isDueSoon(dateStr: string): boolean {
  const due = new Date(dateStr)
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= 3
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date()
}

export function TaskCard({ task, onStatusChange, isPending = false, isError = false, onRetry }: TaskCardProps) {
  const isDone = task.status === "done"
  const priorityMeta = priorityConfig[task.priority]
  const dueSoon = isDueSoon(task.dueDate)
  const overdue = isOverdue(task.dueDate) && !isDone
  const dueDateClass = overdue || dueSoon ? "text-red-500" : "text-slate-400"

  return (
    <div
      id={`task-card-${task.id}`}
      className={`
        relative bg-white border rounded-xl p-4 transition-all duration-200
        ${isDone ? "opacity-60" : ""}
        ${isError ? "border-red-300 bg-red-50/30" : "border-slate-200 hover:border-blue-300 hover:shadow-sm"}
      `}
    >
      {isPending && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-2">
        <h3
          className={`text-sm font-semibold leading-snug ${isDone ? "line-through text-slate-400" : "text-slate-900"}`}
        >
          {task.title}
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${priorityMeta.classes}`}
          data-testid={`priority-badge-${task.id}`}
        >
          {priorityMeta.label}
        </span>
      </div>

      <p className="text-xs text-slate-500 line-clamp-2 mb-4">{task.description}</p>

      <div className="flex items-center justify-between gap-3">
        <div className={`flex items-center gap-1.5 text-xs ${dueDateClass}`}>
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{formatDueDate(task.dueDate)}{overdue ? " · Overdue" : dueSoon ? " · Soon" : ""}</span>
        </div>

        {/* Standard HTML <select> dropdown styled with Tailwind. Native dropdowns are accessible and performant out of the box,
            though we lose some custom search/filtering capabilities that a custom Radix select would provide. */}
        <select
          id={`status-select-${task.id}`}
          value={task.status}
          disabled={isPending}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className={`
            text-xs px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors
            bg-white border-slate-200 text-slate-700
            focus:border-blue-500 hover:border-blue-300
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={`Status for ${task.title}`}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isError && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-red-200">
          <div className="flex items-center gap-1.5 text-xs text-red-500">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Update failed</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  )
}
