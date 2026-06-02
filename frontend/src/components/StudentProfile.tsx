import { Mail } from "lucide-react"
import type { Student, ActionCenterSummary } from "../types"

interface StudentProfileProps {
  student: Student
  summary: ActionCenterSummary
}

// Quick helper to split names and grab initials.
// Tradeoff: Doesn't handle complex multi-part last names or hyphenations perfectly, but works for the current schema.
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function StudentProfile({ student, summary }: StudentProfileProps) {
  const completionPercent =
    summary.totalTasks > 0
      ? Math.round((summary.completedTasks / summary.totalTasks) * 100)
      : 0

  const isAtRisk = student.enrollmentStatus === "at_risk"

  return (
    <div
      id="student-profile-card"
      className="bg-white border border-slate-200 rounded-2xl p-6 mb-5 shadow-sm"
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-white font-bold text-xl">{getInitials(student.name)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{student.name}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm text-slate-500">{student.email}</span>
              </div>
            </div>

            <span
              className={`
                px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0
                ${isAtRisk
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }
              `}
            >
              {isAtRisk ? "⚠ At Risk" : "✓ Active"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <StatChip label="Grade" value={String(student.grade)} />
        <StatChip label="GPA" value={student.gpa.toFixed(1)} />
        <StatChip label="Counselor" value={student.counselorId} />
        <StatChip label="Tasks Done" value={`${summary.completedTasks}/${summary.totalTasks}`} />
        {summary.urgentTasks > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {summary.urgentTasks} Urgent
          </span>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-500">Task Completion</span>
          <span className="text-xs font-semibold text-blue-600">{completionPercent}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          {/* Using simple Tailwind transitions for the progress bar. Transition duration is set to 700ms to feel smooth and modern on student switch. */}
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-700"
            style={{ width: `${completionPercent}%` }}
            role="progressbar"
            aria-valuenow={completionPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 font-semibold">{value}</span>
    </span>
  )
}
