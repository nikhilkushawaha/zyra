import { AlertCircle, RefreshCw } from "lucide-react"
import { useStudentStore } from "./store/useStudentStore"
import { useActionCenterQuery } from "./hooks/useActionCenter"
import { useSSE } from "./hooks/useSSE"
import { StudentSidebar } from "./components/StudentSidebar"
import { UrgencyBanner } from "./components/UrgencyBanner"
import { StudentProfile } from "./components/StudentProfile"
import { TaskList } from "./components/TaskList"
import { MessagesSummary } from "./components/MessagesSummary"
import {
  StudentProfileSkeleton,
  MessagesSummarySkeleton,
} from "./components/Skeletons"
import "./index.css"

function MainContent() {
  const selectedStudentId = useStudentStore((s) => s.selectedStudentId)
  const { data, isLoading, isError, error, refetch } = useActionCenterQuery(selectedStudentId)

  // Subscribing to Server-Sent Events to keep client UI in sync without polling the backend.
  useSSE()

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-slate-900 font-semibold mb-2">Failed to load data</h2>
          <p className="text-sm text-slate-500 mb-5">
            {error?.message ?? "An unexpected error occurred"}
          </p>
          <button
            id="retry-button"
            onClick={() => void refetch()}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-medium transition-all shadow-md hover:shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Tradeoff: Placing MainContent and App in a single file is simple for this layout,
  // but if we add routing or complex sub-views later, we should extract MainContent to a separate page/component.
  return (
    <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
      {isLoading ? (
        <div className="h-12 bg-slate-200/60 rounded-xl mb-5 animate-pulse" />
      ) : (
        data && <UrgencyBanner urgencyLevel={data.summary.urgencyLevel} />
      )}

      {isLoading ? (
        <StudentProfileSkeleton />
      ) : (
        data && <StudentProfile student={data.student} summary={data.summary} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
        <TaskList
          tasks={data?.tasks ?? []}
          totalTasks={data?.summary.totalTasks ?? 0}
          completedTasks={data?.summary.completedTasks ?? 0}
          isLoading={isLoading}
        />

        {isLoading ? (
          <MessagesSummarySkeleton />
        ) : (
          data && (
            <MessagesSummary
              messages={data.messages}
              unreadCount={data.summary.unreadMessages}
            />
          )
        )}
      </div>
    </main>
  )
}

export default function App() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <StudentSidebar />
      <MainContent />
    </div>
  )
}
