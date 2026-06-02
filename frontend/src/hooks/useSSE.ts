import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { SSETaskUpdateEvent } from "../types"

// Derive SSE endpoint from the same env var as the REST client so they always point at the same backend.
const SSE_URL = `${import.meta.env.VITE_API_URL as string}/sse/task-updates`
const MAX_RETRIES = 3

// Establish an EventSource link to backend updates.
// Tradeoff: When a task updates, we invalidate the React Query cache to trigger a clean fetch of the full action center dashboard.
// This is simpler and more reliable than hand-writing deep array mutations on the client, but incurs one extra GET request.
export function useSSE() {
  const queryClient = useQueryClient()
  const retriesRef = useRef(0)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    function connect() {
      const es = new EventSource(SSE_URL)
      esRef.current = es

      es.addEventListener("connected", () => {
        // Clear backoff delay tracking once we establish a healthy handshake.
        retriesRef.current = 0
      })

      es.addEventListener("task_update", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data as string) as SSETaskUpdateEvent
          if (data.type === "TASK_UPDATED") {
            void queryClient.invalidateQueries({
              queryKey: ["actionCenter", data.studentId],
            })
          }
        } catch {
          // If we get an unparseable payload, drop it quietly without disrupting the rest of the application run state.
        }
      })

      es.onerror = () => {
        es.close()
        if (retriesRef.current < MAX_RETRIES) {
          const backoffMs = Math.pow(2, retriesRef.current) * 1000
          retriesRef.current += 1
          timeoutId = setTimeout(connect, backoffMs)
        }
      }
    }

    connect()

    return () => {
      clearTimeout(timeoutId)
      esRef.current?.close()
    }
  }, [queryClient])
}
