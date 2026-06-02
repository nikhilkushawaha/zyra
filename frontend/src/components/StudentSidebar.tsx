import { BookOpen } from "lucide-react"
import { useStudentStore } from "../store/useStudentStore"
import { useStudentsQuery } from "../hooks/useActionCenter"
import type { EnrollmentStatus } from "../types"

// Re-declaring initials helper here. We should extract this to a shared utils folder to keep DRY,
// but keeping it local for simplicity right now.
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Color mapping based on enrollment status. Active uses blue-to-indigo gradients, whereas at-risk uses red-to-orange to draw attention immediately.
const urgencyDotColors: Record<EnrollmentStatus, string> = {
  at_risk: "bg-red-500",
  active: "bg-emerald-500",
}

const avatarColors: Record<EnrollmentStatus, string> = {
  at_risk: "bg-gradient-to-br from-red-400 to-orange-500 text-white",
  active: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
}

export function StudentSidebar() {
  const { selectedStudentId, setSelectedStudentId } = useStudentStore()
  const { data: students, isLoading, isError } = useStudentsQuery()

  return (
    <aside
      className="w-[260px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white h-screen sticky top-0 shadow-sm"
      aria-label="Student navigation sidebar"
    >
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <img
            src="/zyra.png"
            alt="Zyra"
            className="h-8 w-auto object-contain object-left"
          />
        </div>
        <p className="text-slate-500 text-xs mt-1">Counselor Dashboard</p>
      </div>

      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            My Students
          </h2>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
        {isLoading && (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-3 rounded-xl animate-pulse"
              >
                <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </>
        )}

        {isError && (
          <p className="text-xs text-red-500 px-3 py-3">Failed to load students.</p>
        )}

        {students?.map((student) => {
          const isSelected = student.id === selectedStudentId
          const initials = getInitials(student.name)

          return (
            <button
              key={student.id}
              id={`student-btn-${student.id}`}
              onClick={() => setSelectedStudentId(student.id)}
              className={`
                w-full text-left px-3 py-3 rounded-xl transition-all duration-200 group
                flex items-center gap-3
                ${isSelected
                  ? "bg-blue-50 border border-blue-200 shadow-sm"
                  : "border border-transparent hover:bg-slate-50 hover:border-slate-200"
                }
              `}
              aria-current={isSelected ? "page" : undefined}
            >
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${isSelected ? avatarColors[student.enrollmentStatus] : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"}
                `}
              >
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${isSelected ? "text-slate-900" : "text-slate-700"}`}
                >
                  {student.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <BookOpen className="w-3 h-3 text-slate-400" />
                  <p className="text-xs text-slate-400">Grade {student.grade}</p>
                </div>
              </div>

              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${urgencyDotColors[student.enrollmentStatus]}`}
                title={student.enrollmentStatus === "at_risk" ? "At Risk" : "Active"}
              />
            </button>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            At Risk
          </span>
        </div>
      </div>
    </aside>
  )
}
