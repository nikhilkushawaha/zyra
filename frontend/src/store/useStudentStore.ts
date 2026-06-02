import { create } from "zustand"

interface StudentStore {
  selectedStudentId: string
  setSelectedStudentId: (id: string) => void
}

// Zustand store for client-only UI state.
// Tradeoff: Transient state. Since it's client-only and not stored in localStorage, refreshing the page resets selected student selection back to the default 'stu_001'.
// Consideration: if counselors want their page context restored, we could drop in the persist middleware here easily.
export const useStudentStore = create<StudentStore>((set) => ({
  selectedStudentId: "stu_001",
  setSelectedStudentId: (id: string) => set({ selectedStudentId: id }),
}))
