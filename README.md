# Zyra — Counselor Student Action Center

> Take-home assessment submission for Zyra (zyra-ai.com) — a full-stack Counselor Action Center feature for an ed-tech SaaS platform.

---

## 🚀 Live Demo

**Frontend (Vercel):** [https://zyra-lilac.vercel.app/](https://zyra-lilac.vercel.app/)

The backend is deployed on Render and connected automatically. You don't need to run anything locally to see the app in action. Open the link, click through the students in the sidebar, update a task status — if you open two tabs, both will update in real time via SSE.

---

## 📸 UI Preview

![Zyra Counselor Action Center](./screenshots/zyraCounselor.png)

> **Student sidebar** (left) — lists caseload with enrollment status dots. **Main panel** (right) — urgency banner, student profile with task completion progress bar, task list sorted by priority, and messages panel. All in one request.

---

## 1. Project Overview

The **Counselor Student Action Center** is a unified dashboard that lets school counselors:

- **Select a student** from their caseload in the sidebar
- **See urgency at a glance** — the banner at the top is computed server-side and reflects the student's real risk level (Critical → High → Moderate → Low)
- **Manage tasks** — view tasks sorted by priority + due date, and change status (`todo` → `in_progress` → `done`) with optimistic UI
- **Review messages** — from teachers, parents, and other staff — with unread highlighting and relative timestamps

Real-time updates via **Server-Sent Events** mean task changes propagate to every open tab without polling.

> This project is split into two parts as specified in the assessment:
> - **Task 1 — Backend:** Node.js + Express REST API with SSE
> - **Task 2 — Frontend:** React + TypeScript dashboard consuming the API

---

## 2. Tech Stack

### Task 1 — Backend

| Library | Version | Why I chose it |
|---|---|---|
| Node.js | 18+ | LTS, native fetch, broad ecosystem support |
| Express | `^4.19` | Minimal, battle-tested HTTP framework — no magic, easy to trace |
| TypeScript | `^5.4` | Same type discipline as the frontend; catches contract mismatches early |
| tsx | `^4.15` | Zero-config TypeScript execution for dev — no `tsc` watch needed |
| dotenv | `^16` | Environment variable injection from `.env.local` for local dev |
| Morgan | `^1.10` | Clean HTTP request logging with a custom `requestId` token |
| UUID | `^9.0` | Unique request IDs for log correlation across the middleware chain |
| express-async-errors | `^3.1` | Patches Express so `async` route handlers propagate errors correctly — otherwise unhandled promise rejections just hang |

### Task 2 — Frontend

| Library | Version | Why I chose it |
|---|---|---|
| React 18 | `^18.3` | Concurrent features, stable component model |
| TypeScript | `^5.4` | Shared type contracts with the backend shape |
| Vite | `^5.3` | Instant HMR, native ESM, no webpack config rabbit holes |
| TanStack React Query v5 | `^5.40` | Server state: caching, deduplication, optimistic updates, background refetch — I didn't want to manage loading/error/stale states manually |
| Zustand | `^4.5` | Client-only UI state for selected student. One tiny store, no boilerplate |
| Tailwind CSS | `^3.4` | Utility-first styling — fast to iterate, consistent spacing |
| Radix UI / shadcn | latest | Accessible unstyled primitives |
| Lucide React | `^0.383` | Consistent, tree-shakeable icon set |

### Testing

| Library | Reason |
|---|---|
| Vitest | Fast, Vite-native test runner — shares config with the dev build |
| Supertest | HTTP integration testing for Express without spinning up a real server |
| @testing-library/react | DOM-first React testing — tests what the user sees, not implementation details |
| @testing-library/jest-dom | Semantic matchers like `toBeInTheDocument`, `toHaveClass` |

---

## 3. Folder Structure

```
root/
├── backend/
│   ├── src/
│   │   ├── data/mockData.ts          # In-memory data store (students, tasks, messages)
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts       # Request ID attachment + unified JSON error responses
│   │   │   └── requestLogger.ts      # Morgan logger with custom requestId token
│   │   ├── routes/
│   │   │   ├── students.ts           # GET /students  +  GET /students/:id/action-center
│   │   │   ├── tasks.ts              # PATCH /tasks/:taskId/status
│   │   │   └── sse.ts                # GET /sse/task-updates + broadcastTaskUpdate()
│   │   └── index.ts                  # App bootstrap, CORS, middleware registration
│   └── tests/
│       └── actionCenter.test.ts      # 7 Vitest + Supertest integration tests
├── frontend/
│   ├── src/
│   │   ├── api/client.ts             # Typed fetch wrappers for all endpoints
│   │   ├── components/
│   │   │   ├── StudentSidebar.tsx    # Caseload nav with enrollment status indicators
│   │   │   ├── UrgencyBanner.tsx     # Color-coded urgency alert at top of panel
│   │   │   ├── StudentProfile.tsx    # Profile card with GPA, task completion progress bar
│   │   │   ├── TaskList.tsx          # Sorted task list with optimistic status mutations
│   │   │   ├── TaskCard.tsx          # Individual task card with status dropdown
│   │   │   ├── MessagesSummary.tsx   # Inbox panel with unread highlighting
│   │   │   └── Skeletons.tsx         # Loading skeleton components
│   │   ├── hooks/
│   │   │   ├── useActionCenter.ts    # React Query hooks: students, action center, update
│   │   │   └── useSSE.ts             # EventSource hook with exponential backoff
│   │   ├── store/useStudentStore.ts  # Zustand store: selectedStudentId
│   │   ├── types/index.ts            # Shared TypeScript interfaces
│   │   ├── App.tsx                   # Two-panel layout + SSE subscription
│   │   └── main.tsx                  # QueryClient config + React root
│   └── tests/
│       └── TaskCard.test.tsx         # 5 Vitest + Testing Library component tests
├── screenshots/
│   ├── zyraCounselor.png             # UI preview
│   ├── backendTest.png               # Backend test run output
│   └── frontendTest.png              # Frontend test run output
└── README.md
```

---

## 4. Setup & Run Instructions

### Prerequisites
- **Node.js 18+** (`node -v` to check)
- **npm** (comes with Node)

### Task 1 — Backend (port 3000)

```bash
cd backend
npm install
npm run dev
```

Expect: `Zyra Action Center API running on port 3000`

The backend reads from `.env.local` for local dev. In production (Render), env vars are injected by the platform directly and the file is ignored.

### Task 2 — Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **No database setup required.** All data lives in memory and resets on server restart. Students, tasks, and messages are seeded in `backend/src/data/mockData.ts`.

### Environment Variables

**Backend** (`backend/.env.local`):
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
```

In production, `FRONTEND_URL` is set to the Vercel deployment URL so CORS passes correctly.

**Frontend** (`frontend/.env.local`):
```env
VITE_API_URL=http://localhost:3000
```

In production on Vercel, `VITE_API_URL` is set to the Render backend URL.

### Running Tests

```bash
# Task 1 — Backend tests (7 tests)
cd backend && npm test

# Task 2 — Frontend tests (5 tests)
cd frontend && npm test
```

---

## 5. Task 1 — Backend: How It Works

This is a standard Express REST API with one extra feature: a Server-Sent Events endpoint for real-time task update broadcasting.

### Urgency Level Algorithm

The urgency level is computed per-request in `students.ts` using a simple priority matrix:

```typescript
function computeUrgencyLevel(
  enrollmentStatus: string,
  urgentTaskCount: number,
  hasHighPriorityTask: boolean
): UrgencyLevel {
  if (enrollmentStatus === "at_risk" && urgentTaskCount > 0) return "critical"
  if (enrollmentStatus === "at_risk" || urgentTaskCount > 0) return "high"
  if (hasHighPriorityTask) return "moderate"
  return "low"
}
```

The logic is: a student is only `critical` when they are already `at_risk` AND have at least one urgent, incomplete task. Either condition alone is `high`. Just a high-priority task (not urgent) gives `moderate`. Otherwise `low`. It's intentionally simple and deterministic — easy to test and easy to explain to a counselor.

> **Future enhancement:** This could be fed into a rule engine or made configurable per school district, so admins can tune thresholds without touching code.

### The `/students/:id/action-center` Endpoint

This is the main data endpoint. It returns everything the dashboard needs in a single HTTP round-trip:

```
GET /students/stu_001/action-center
→ { student, tasks[], messages[], summary: { totalTasks, completedTasks, urgentTasks, unreadMessages, urgencyLevel } }
```

The decision to aggregate everything server-side was deliberate. The alternative — separate `/tasks`, `/messages` endpoints — would mean 3 parallel requests on page load. For a dashboard context switch (clicking a student in the sidebar), one consolidated response keeps the experience snappy and simpler to reason about.

> **Future enhancement:** If tasks and messages grow large, we'd add pagination via `?page=` and `?limit=` query params, or move to cursor-based pagination.

### Server-Sent Events — Real-Time Task Updates

The SSE endpoint in `sse.ts` keeps an in-memory `Set<Response>` of all currently connected clients:

```typescript
const clients = new Set<Response>()

export function broadcastTaskUpdate(payload) {
  const data = JSON.stringify(payload)
  clients.forEach((client) => {
    client.write(`event: task_update\ndata: ${data}\n\n`)
  })
}
```

When the `PATCH /tasks/:taskId/status` route updates a task, it immediately calls `broadcastTaskUpdate()`. Every connected browser tab receives the event within milliseconds — no polling, no WebSocket handshake, no extra infrastructure.

SSE connections are cleaned up properly on `req.on("close")` — both the keepalive interval and the client reference are removed, preventing memory leaks.

The `X-Accel-Buffering: no` header is important: Nginx buffers responses by default, which breaks SSE because frames never reach the browser in real time.

> **Scaling consideration:** This works perfectly for a single-process server (which is what Render free tier gives us). For horizontal scaling with multiple instances, each pod has its own in-memory `clients` Set, so a PATCH to pod A won't notify a client connected to pod B. The fix is a **Redis Pub/Sub backplane** — when any pod processes a PATCH, it publishes to Redis, and all pods consume the event and broadcast to their local clients.

### Request ID Middleware

Every request gets a UUID attached by `attachRequestId` before any other middleware runs:

```typescript
req.headers["x-request-id"] = req.headers["x-request-id"] ?? uuidv4()
```

This ID flows through Morgan's log format (`reqId::requestId`) and into every error JSON response (`{ error, requestId, timestamp }`). In practice, if a user reports an error and pastes the `requestId` from the browser console, you can `grep` your server logs for that exact chain. Essential for debugging distributed systems — or even just a two-tier app in production.

### Error Handling

`express-async-errors` patches Express so errors thrown inside `async` route handlers automatically propagate to the centralized `errorHandler` middleware. Without it, unhandled promise rejections in async routes just hang the connection.

The error shape is always consistent:

```json
{
  "error": "Student with id \"xyz\" not found",
  "requestId": "uuid-v4",
  "timestamp": "2026-06-01T12:00:00.000Z"
}
```

> **Production note:** For 500 errors, we should scrub the raw `error.message` and return a generic "Internal Server Error" to avoid leaking database internals or stack traces. The current behavior is fine for a demo/dev environment.

---

## 6. Task 2 — Frontend: How It Works

### Data Flow Overview

```
Zustand (selectedStudentId)
    ↓
useActionCenterQuery(studentId)  ← React Query cache
    ↓
GET /students/:id/action-center
    ↓
App renders: UrgencyBanner + StudentProfile + TaskList + MessagesSummary
    ↑
useSSE() listens for task_update events → invalidates React Query cache → triggers refetch
```

### Zustand for Selected Student

The only true client state in this app is which student is currently selected. Zustand is the right call here — it's a single string with one setter:

```typescript
export const useStudentStore = create<StudentStore>((set) => ({
  selectedStudentId: "stu_001",
  setSelectedStudentId: (id) => set({ selectedStudentId: id }),
}))
```

No providers, no reducers, no selectors boilerplate. Redux would be massive overkill for this. I could also have used `useState` lifted up in `App.tsx`, but Zustand makes it accessible from any component without prop drilling — `StudentSidebar` and `TaskList` both read it independently.

> **Future enhancement:** Add Zustand's `persist` middleware to save `selectedStudentId` in `localStorage`. Right now, refreshing the page resets to `stu_001`. One-liner fix when needed.

### React Query for Server State

The `QueryClient` is configured globally in `main.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
})
```

`staleTime: 30s` means React Query won't re-fetch on tab focus unless the data is older than 30 seconds. For a counselor dashboard that updates primarily via SSE events (not constant polling), this is the right balance — it prevents a flood of GET requests when counselors switch browser tabs, while still getting fresh data periodically.

The `useActionCenterQuery` hook:

```typescript
export function useActionCenterQuery(studentId: string) {
  return useQuery<ActionCenterResponse, Error>({
    queryKey: ["actionCenter", studentId],
    queryFn: () => fetchActionCenter(studentId),
    staleTime: 30_000,
    retry: 2,
  })
}
```

The `queryKey` includes `studentId`, so React Query maintains a separate cache entry per student. Switching students instantly shows cached data if available, then silently refreshes in the background.

### Optimistic Task Status Updates

When a counselor changes a task's status, the UI updates instantly without waiting for the server response:

```typescript
onMutate: async ({ taskId, status }) => {
  await queryClient.cancelQueries({ queryKey })
  const previousData = queryClient.getQueryData<ActionCenterResponse>(queryKey)

  // Instantly flip the task in local cache
  queryClient.setQueryData<ActionCenterResponse>(queryKey, (old) => ({
    ...old!,
    tasks: old!.tasks.map((task) =>
      task.id === taskId ? { ...task, status } : task
    ),
  }))

  return { previousData }
},

onError: (_err, _vars, context) => {
  // Roll back to the state before the optimistic update
  if (context?.previousData) {
    queryClient.setQueryData([...], context.previousData)
  }
},
```

The `cancelQueries` call is important — it prevents a slow in-flight GET from resolving after the optimistic update and clobbering the local state we just set.

The `TaskList` component tracks pending state per task using `variables.taskId` from the mutation result:

```typescript
const taskIsPending = isPending && variables?.taskId === task.id
```

This shows a spinner only on the specific card being updated, not the entire list. Much better UX than disabling the whole panel.

### Real-Time SSE Integration

The `useSSE` hook establishes an `EventSource` connection and listens for `task_update` events:

```typescript
es.addEventListener("task_update", (event) => {
  const data = JSON.parse(event.data) as SSETaskUpdateEvent
  if (data.type === "TASK_UPDATED") {
    void queryClient.invalidateQueries({
      queryKey: ["actionCenter", data.studentId],
    })
  }
})
```

On each event, it invalidates the relevant React Query cache key — this triggers a background refetch. The choice to invalidate-and-refetch rather than manually patching the cache was deliberate: it's simpler, more reliable, and ensures the client and server are always in sync. The tradeoff is one extra GET request per SSE event, which is perfectly acceptable for a counselor dashboard.

Reconnection uses exponential backoff (1s → 2s → 4s, max 3 retries) to avoid thundering-herd reconnections if the server restarts.

### Skeleton Loading States

Instead of spinners, the app shows skeleton components that match the shape of the real content:

```tsx
{isLoading ? <StudentProfileSkeleton /> : data && <StudentProfile student={data.student} summary={data.summary} />}
```

This reduces **Cumulative Layout Shift (CLS)** — the page doesn't jump when data loads because the placeholder occupies the same space as the real content. It also feels faster subjectively, since the user can see the layout before data arrives.

### Task Sorting

Tasks are sorted client-side by priority first, then due date:

```typescript
const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 }

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
}
```

This runs on the client on every render. For the typical counselor caseload (5–15 tasks per student), this is extremely fast and keeps the backend simple. If task counts grew to hundreds, I'd `useMemo` this or move the sort to the backend with a SQL `ORDER BY`.

---

## 7. API Contract

### `GET /students`

Returns a lightweight student list for the sidebar (no task/message data, just enough to render the nav).

**Response `200`:**
```json
[
  { "id": "stu_001", "name": "Maya Patel", "grade": 11, "enrollmentStatus": "at_risk" },
  { "id": "stu_002", "name": "Jordan Lee", "grade": 12, "enrollmentStatus": "active" }
]
```

---

### `GET /students/:id/action-center`

Returns the full counselor action center for a student — all data in one round trip.

**Request:**
```
GET /students/stu_001/action-center
```

**Response `200`:**
```json
{
  "student": {
    "id": "stu_001",
    "name": "Maya Patel",
    "email": "maya.patel@school.edu",
    "grade": 11,
    "gpa": 3.2,
    "counselorId": "csl_001",
    "enrollmentStatus": "at_risk"
  },
  "tasks": [ /* Task[] filtered by studentId, sorted by priority */ ],
  "messages": [ /* Message[] filtered by studentId */ ],
  "summary": {
    "totalTasks": 5,
    "completedTasks": 0,
    "urgentTasks": 2,
    "unreadMessages": 2,
    "urgencyLevel": "critical"
  }
}
```

**Response `404`:**
```json
{
  "error": "Student with id \"invalid_id\" not found",
  "requestId": "uuid-v4-here",
  "timestamp": "2026-06-01T12:00:00.000Z"
}
```

---

### `PATCH /tasks/:taskId/status`

Updates a task's status and broadcasts the change to all SSE-connected clients.

**Request:**
```
PATCH /tasks/tsk_001/status
Content-Type: application/json

{ "status": "done" }
```

Valid statuses: `"todo"` | `"in_progress"` | `"done"`

**Response `200`:**
```json
{
  "task": {
    "id": "tsk_001",
    "studentId": "stu_001",
    "status": "done",
    "updatedAt": "2026-06-01T12:00:00.000Z"
  }
}
```

**Response `400` (invalid status):**
```json
{
  "error": "Invalid status. Must be one of: todo, in_progress, done",
  "requestId": "uuid",
  "timestamp": "..."
}
```

**Response `404`:**
```json
{ "error": "Task with id \"invalid_id\" not found", "requestId": "...", "timestamp": "..." }
```

---

### `GET /sse/task-updates`

Server-Sent Events stream. The frontend connects once on mount and keeps this open indefinitely.

**Connection:** `EventSource("https://your-backend.com/sse/task-updates")`

**Events:**

```
event: connected
data: {"message":"Connected to SSE stream"}

event: task_update
data: {"type":"TASK_UPDATED","taskId":"tsk_001","studentId":"stu_001","status":"done"}

: keepalive    (every 30 seconds — prevents proxies from closing idle connections)
```

---

## 8. Architecture Decisions

### Why SSE instead of WebSockets?

Task updates are **server → client** only. SSE is a better fit:
- It's HTTP-native — works through existing proxies and load balancers without special config
- Automatic reconnection is built into the browser's `EventSource` API
- No separate upgrade handshake or binary framing to deal with
- Server-side implementation is literally `res.write()` on a kept-alive response

WebSockets would make sense if counselors needed to send messages back to the server in real time (e.g., a live chat feature). For unidirectional status updates, SSE is the right tool.

### Why not polling?

With 30-second polling and 50 counselors online, that's 100 GET requests per minute hitting the backend constantly — even when nothing has changed. SSE sends data only when something actually happens. Much more efficient.

### In-Memory Data Tradeoff

Acceptable for a demo with zero infrastructure overhead. In production, this would be **MongoDB with Mongoose**:
- Indexes on `studentId` for fast task/message lookups
- Atomic `findOneAndUpdate` for task status changes
- The route handler logic is already abstracted from the data layer (each route imports from `mockData` as a named import) — swapping it for a repository class would be minimal work

### CORS in Production

The CORS config accepts an array of allowed origins:

```typescript
const allowedOrigins: (string | RegExp)[] = [
  /^http:\/\/localhost(:\d+)?$/,   // any local port
  /^https:\/\/.*\.vercel\.app$/,   // any Vercel deployment (including preview URLs)
]
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL) // explicit production domain
}
```

The regex for `*.vercel.app` means Vercel preview deployments (created on every PR) work automatically without updating env vars.

### Why consolidated `action-center` endpoint instead of separate APIs?

Every time a counselor clicks a student in the sidebar, the dashboard needs the student profile, their tasks, and their messages. If those were three separate endpoints, the frontend would need to orchestrate three parallel fetches. One consolidated endpoint means one round-trip, one loading state to manage, and the urgency calculation (which depends on both enrollment status and task data) happens server-side where it has access to everything.

---

## 9. Performance Decisions & Tradeoffs

| Decision | Rationale |
|---|---|
| `staleTime: 30s` on queries | Prevents redundant refetches on tab focus — counselors don't need millisecond-fresh data between clicks |
| Optimistic task updates | Instant UI feedback; rollback is transparent on error |
| SSE keepalive every 30s | Prevents intermediate proxies/load balancers from closing idle connections |
| Skeletons over spinners | Reduces cumulative layout shift (CLS), makes load feel faster |
| Per-task pending tracking | `variables.taskId` lets us show a spinner only on the affected card, not the whole list |
| Exponential backoff on SSE | Prevents thundering-herd reconnections if server restarts (max 3 retries: 1s → 2s → 4s) |
| Client-side task sorting | Fast for small lists; easy to move to `ORDER BY` in a real DB query if lists grow |
| Hand-rolled `timeAgo()` | Avoids importing `date-fns` or `moment` just for one format — keeps bundle size small |

---

## 10. Test Output

### Task 1 — Backend Tests (7 tests)

![Backend Test Output](./screenshots/backendTest.png)

Tests cover:
- `GET /students/stu_001/action-center` → 200 with student, tasks, messages, summary
- Correct `unreadMessages` count (2) for stu_001
- `urgencyLevel === "critical"` for stu_001 (at_risk + urgent task)
- `GET /students/invalid_id/action-center` → 404 with error field
- `PATCH /tasks/tsk_001/status { status: "done" }` → 200, `task.status === "done"`
- `PATCH /tasks/tsk_001/status { status: "invalid" }` → 400 with error field
- `PATCH /tasks/invalid_id/status` → 404 with error field

Test isolation is handled with `afterEach` that resets `tsk_001` status to `"todo"` after each test group, ensuring tests don't bleed state into each other.

---

### Task 2 — Frontend Tests (5 tests)

![Frontend Test Output](./screenshots/frontendTest.png)

Tests cover `TaskCard` — the most interactive component in the UI:
- Renders task title and description correctly
- Priority badge has correct color class for `"urgent"` (red CSS classes)
- Status dropdown renders all 3 options (`todo`, `in_progress`, `done`)
- `onStatusChange` callback is called with correct `(taskId, status)` args on dropdown change
- Line-through style applied to title when `status === "done"`

The `data-testid="priority-badge-{task.id}"` attribute on the priority badge was added specifically to make it easy to target in tests without relying on fragile CSS class selectors.

---

## 11. Future Enhancements

If I were to continue building this out for production, here's what I'd tackle next:

- **Database** — swap `mockData.ts` for MongoDB. The route-level logic is already cleanly separated, so it'd be a targeted swap with minimal risk.
- **Authentication** — JWT-based auth so counselors only see their own caseload. `counselorId` is already on every student record, just not enforced yet.
- **Pagination** — tasks and messages endpoints need `?page=&limit=` for large caseloads.
- **Redis Pub/Sub for SSE** — for horizontal scaling across multiple backend pods, so SSE events broadcast across all instances.
- **Zustand persist middleware** — restore `selectedStudentId` from localStorage so a page refresh lands the counselor on the same student they were viewing.
- **Structured logging** — replace Morgan with `pino` for JSON logs queryable in Datadog or Elasticsearch. The `requestId` infrastructure is already in place — just need a different transport.
- **Urgency rule engine** — make the urgency algorithm configurable by school district admins, not hardcoded.
- **Read/unread message mutation** — currently read status is static in mock data. Add `PATCH /messages/:id/read` and update the UI optimistically.
- **Task creation** — add a `POST /tasks` endpoint and a modal form in the frontend so counselors can create new tasks from the dashboard.
- **Due date timezone handling** — currently `formatDueDate` and `isDueSoon` use the browser's local timezone. For a school platform used across time zones, we'd want explicit timezone support (pull in `date-fns-tz` or `dayjs`).
