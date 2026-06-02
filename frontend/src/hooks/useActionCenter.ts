import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query"
import { fetchStudents, fetchActionCenter, updateTaskStatus } from "../api/client"
import { useStudentStore } from "../store/useStudentStore"
import type { ActionCenterResponse, StudentSummary, Task, TaskStatus } from "../types"

// Keep sidebar student listings cached.
// Tradeoff: staleTime is set to 60s, which is fine since student registers rarely change.
export function useStudentsQuery() {
  return useQuery<StudentSummary[], Error>({
    queryKey: ["students"] as QueryKey,
    queryFn: fetchStudents,
    staleTime: 60_000,
    retry: 2,
  })
}



// Pull full action dashboard state.
// Tradeoff: 30s staleTime prevents aggressive refetch triggers on tab refocus, which saves network requests but might slightly delay dashboard state checks.
export function useActionCenterQuery(studentId: string) {
  return useQuery<ActionCenterResponse, Error>({
    queryKey: ["actionCenter", studentId] as QueryKey,
    queryFn: () => fetchActionCenter(studentId),
    staleTime: 30_000,
    retry: 2,
  })
}

// Optimistic mutation for seamless task toggle response.
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  const selectedStudentId = useStudentStore((s) => s.selectedStudentId)

  return useMutation<
    { task: Task },
    Error,
    { taskId: string; status: TaskStatus },
    { previousData: ActionCenterResponse | undefined }
  >({
    mutationFn: ({ taskId, status }) => updateTaskStatus(taskId, status),

    onMutate: async ({ taskId, status }) => {
      const queryKey: QueryKey = ["actionCenter", selectedStudentId]

      // Cancel outbound request traffic so a slow GET doesn't resolve mid-mutation and clobber our optimistic UI state.
      await queryClient.cancelQueries({ queryKey })

      // Save current cache state as a recovery point in case the network request fails.
      const previousData = queryClient.getQueryData<ActionCenterResponse>(queryKey)

      // Instantly flip status in local state to make the checkbox transition snappy for counselors.
      queryClient.setQueryData<ActionCenterResponse>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          tasks: old.tasks.map((task) =>
            task.id === taskId ? { ...task, status } : task
          ),
        }
      })

      return { previousData }
    },

    onError: (_err, _vars, context) => {
      // Revert local UI state to what it was prior to checking the box if the backend rejected the update.
      if (context?.previousData) {
        queryClient.setQueryData(["actionCenter", selectedStudentId], context.previousData)
      }
    },

    onSettled: () => {
      // Force refetch from backend after resolving or failing, just to be sure local state hasn't drifted from server reality.
      void queryClient.invalidateQueries({
        queryKey: ["actionCenter", selectedStudentId],
      })
    },
  })
}
