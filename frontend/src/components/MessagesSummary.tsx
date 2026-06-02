import { Inbox } from "lucide-react"
import type { Message } from "../types"

interface MessagesSummaryProps {
  messages: Message[]
  unreadCount: number
}

// Hand-rolled time-ago formatter. Good for reducing bundle size by not installing moment/date-fns.
// Tradeoff: Doesn't auto-update in real-time unless the component re-renders from state changes.
function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days ago`
}

export function MessagesSummary({ messages, unreadCount }: MessagesSummaryProps) {
  return (
    <div id="messages-summary-panel" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Inbox className="w-4 h-4 text-blue-600" />
        <h2 className="text-sm font-semibold text-slate-900">
          {unreadCount > 0 ? (
            <>
              <span className="text-blue-600">{unreadCount}</span> Unread Messages
            </>
          ) : (
            "Messages"
          )}
        </h2>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
            <Inbox className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">No messages</p>
        </div>
      ) : (
        <div className="space-y-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`
                flex gap-3 py-3 px-3 rounded-xl transition-colors
                ${!msg.read ? "bg-blue-50 border border-blue-100" : "hover:bg-slate-50 border border-transparent"}
              `}
            >
              {/* Highlight unread messages with a soft blue background and left indicator border to guide the counselor's focus. */}
              <div
                className={`w-0.5 rounded-full flex-shrink-0 self-stretch my-0.5 ${
                  !msg.read ? "bg-blue-500" : "bg-transparent"
                }`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span
                    className={`text-xs truncate ${!msg.read ? "font-semibold text-slate-900" : "font-medium text-slate-500"}`}
                  >
                    {msg.from}
                  </span>
                  <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(msg.receivedAt)}</span>
                </div>

                <p
                  className={`text-xs truncate mb-0.5 ${!msg.read ? "font-medium text-slate-800" : "text-slate-500"}`}
                >
                  {msg.subject}
                </p>

                <p className="text-xs text-slate-400 truncate">{msg.preview}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
