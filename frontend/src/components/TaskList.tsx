import { CheckSquare, ListTodo } from "lucide-react"
import { TaskCard } from "./TaskCard"
import { TaskCardSkeleton } from "./Skeletons"
import { useUpdateTaskStatus } from "../hooks/useActionCenter"
import type { Task, TaskStatus } from "../types"

interface TaskListProps {
  tasks: Task[]
  totalTasks: number
  completedTasks: number
  isLoading?: boolean
}

const PRIORITY_ORDER: Record<Task["priority"], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

// Sorting tasks by priority first, then due date.
// Tradeoff: Sorted on the client side on every render. Extremely fast for small lists of student tasks,
// but we should memoize (useMemo) or run on the backend if arrays grow to hundreds of tasks.
function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
}

export function TaskList({ tasks, totalTasks, completedTasks, isLoading }: TaskListProps) {
  const { mutate, isPending, isError, variables, reset } = useUpdateTaskStatus()

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    mutate({ taskId, status })
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="h-5 bg-slate-100 rounded w-36 mb-4 animate-pulse" />
        <div className="space-y-3">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      </div>
    )
  }

  const sorted = sortTasks(tasks)

  return (
    <div id="task-list-panel" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-slate-900">
            Tasks
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-normal">
              {totalTasks}
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
          <span>{completedTasks}/{totalTasks} completed</span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <CheckSquare className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">No tasks assigned</p>
          <p className="text-xs text-slate-400 mt-1">Tasks will appear here when created</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((task) => {
            const taskIsPending = isPending && variables?.taskId === task.id
            const taskIsError = isError && variables?.taskId === task.id

            return (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                isPending={taskIsPending}
                isError={taskIsError}
                onRetry={taskIsError ? () => reset() : undefined}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
