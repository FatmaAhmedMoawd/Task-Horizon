# SPA Specification: Dashboard & Kanban

## 1. Project Overview

A SaaS-style internal dashboard featuring two primary user experiences:
- **Dashboard / Analytics**: At-a-glance business and productivity metrics (tasks created/completed, workload by assignee, overdue trends) leveraging interactive Recharts visuals and summary KPI cards in a Horizon UI–inspired layout.
- **Kanban Board**: Comprehensive task management with **create/edit**, **filter/search**, and **drag-and-drop** across **three columns** (Todo, In Progress, Done).

Data persistence is managed entirely via **localStorage** to support local, session-agnostic continuity. A dedicated **Mock API Adapter layer** simulates backend network latency and failure rates to validate optimistic UI patterns. Expected UX traits include: a highly responsive card-based UI, a sticky sidebar and header, responsive grid scaling, "instant" interactions (via optimistic drag-and-drop), explicit loading/empty/error states, and full keyboard accessibility for both form inputs and drag-and-drop actions.

---

## 2. Project Architecture & Folder Structure

The application strictly adheres to the Next.js App Router paradigm, enforcing a rigid separation of concerns between layout chrome, interactive features, data persistence, and UI primitives.

- `app/`
  - `(dashboard)/` (Route group for the authenticated application shell)
    - `layout.tsx` (Sidebar/header shell, shared layout structure)
    - `page.tsx` (Route redirecting to `/dashboard` or serving as a landing)
    - `dashboard/`
      - `page.tsx` (Analytics view)
      - `_components/` (Page-specific, non-reusable dashboard widget configurations)
    - `kanban/`
      - `page.tsx` (Kanban entry point)
      - `_components/` (Kanban-specific sub-trees to prevent layout pollution)
  - `layout.tsx` (Root Next.js layout, global font configuration, Context Providers)
  - `globals.css` (Tailwind base layers + Horizon-style base tokens)
- `components/` 
  - `ui/` (Agnostic, reusable design system primitives: Button, Card, Badge, Input, Select, Modal/Drawer, Skeleton, Tooltip)
  - `charts/` (Wrappers for Recharts to maintain consistent axes and tooltips)
  - `kanban/` (Core architectural components for the board: KanbanColumn, SortableTaskCard, DragOverlay UI)
- `lib/`
  - `store/` (Redux Toolkit configuration, root reducer setups, slice definitions, and RTK listeners)
  - `schemas/` (Zod validation schemas acting as the single source of truth for runtime validation)
  - `types/` (Strict TypeScript definitions statically inferred from Zod schemas)
  - `api/` (Client-side API interface wrappers implementing the simulated network behavior)
  - `storage/` (localStorage interaction layer handling versioning and data migrations)
  - `utils/` (Pure helper functions: debounce, date formatting, ID generation, class-merging `cn`)
- `hooks/` (Typed React hooks: `useDebounce`, `useHydrated`, `useMediaQuery`)

> **Architectural Resolution on APIs vs localStorage:**
> Original instructions cited both Next.js Route Handlers (`/app/api/...`) and a `localStorage` sync pattern. Because Next.js server-side Route Handlers cannot read or write to a client's `localStorage`, the architecture resolves this by isolating the mock API completely within `lib/api/client.ts`. This client-side module mocks standard fetch/axios signatures and communicates directly with `lib/storage/`, ensuring optimal Next.js deployment flexibility and avoiding server/client state desyncs.

---

## 3. Data Model Specification

### Core `Task` Entity

The `Task` structure relies on Zod as the authoritative source of truth. TypeScript interfaces are derived strictly via `z.infer`.

**Fields (Defined via Zod):**
- **id**: `string` (UUID v4 or stable unique hash)
- **title**: `string` (Non-empty, minimum length 1)
- **description**: `string` (Can be empty. Kept as string rather than nullable to prevent uncontrolled input warnings in React)
- **priority**: `z.enum(['low', 'medium', 'high', 'urgent'])`
- **dueDate**: `string | null` (ISO 8601 UTC string to prevent timezone offset bugs)
- **assignee**: `object`
  - `assigneeId`: `string`
  - `assigneeName`: `string`
  - `avatarUrl`: `string | null`
- **status**: `z.enum(['todo', 'in_progress', 'done'])`
- **createdAt**: `string` (ISO 8601 UTC string)
- **updatedAt**: `string` (ISO 8601 UTC string)
- **order**: `number` (Used for stable positional tracking within columns. Utilizing an integer spaced by 65536 initially allows mathematically finding the midpoint `(prev.order + next.order) / 2` for mid-insertions without immediate recalculations)
- **tags**: `string[]` (Array of tags for filtering)
- **archived**: `boolean` (Soft deletion flag)
- **estimate**: `number | null` (Story points, abstract effort metric)
- **lastMovedAt**: `string` (ISO 8601 UTC string tracking column transition times for flow analytics)

---

## 4. State Management Strategy

### Strategy: Redux Toolkit (RTK)
RTK is utilized over Zustand to ensure robust handling of multi-step async flows (optimistic rollback), deep object tracking via Immer, and clear segregation of normalized local data versus derived analytical data via Reselect. 

### Global State Shape
- `entities`:
  - `tasksById`: `Record<TaskId, Task>` (Primary data dictionary)
  - `taskIdsByStatus`: `Record<Status, TaskId[]>` (Arrays explicitly maintaining correct sequence based on the `order` property)
- `ui`:
  - `filters`: `{ search: string, priority: string | null, assignee: string | null, dueRange: { start: string|null, end: string|null }, tags: string[] }`
  - `kanban`: `{ activeDragTaskId: string | null, isCreateOpen: boolean, editingTaskId: string | null }`
- `network`:
  - `tasks`: `{ fetchStatus: 'idle'|'loading'|'succeeded'|'failed', fetchError: string | null, mutationQueue: Record<TaskId, 'pending'|'error'> }`
- `persistence`:
  - `hasHydratedFromStorage`: `boolean` (Critical to prevent React SSR hydration mismatch)
  - `schemaVersion`: `number` (Matches `lib/storage/` migration version)

### Critical Selectors (Memoized)
- **`selectFilteredNormalizedTasks`**: Chain-applies text search, priority, assignee, and tag filters against `tasksById`.
- **`selectDashboardAggregates`**: Calculates key analytical counts (overdue tasks, completion ratios, assignee capacities) in a single O(N) pass.
- **`selectIsTaskOverdue(taskId)`**: Isolated business logic identifying if `dueDate < new Date()` and `status !== 'done'`.

### Action Flow: Optimistic Drag and Drop
1. **`moveTaskOptimistic`**: Dispatched synchronously on the `dnd-kit` `onDragEnd` event. Immediately updates `taskIdsByStatus`, computes new `order`, and updates the task's `status`.
2. **`moveTaskCommit` (Thunk)**: Initiates the mock API network request mimicking remote persistence. Updates `updatedAt` / `lastMovedAt` on success.
3. **`moveTaskRollback`**: Dispatched if the promise rejects. Restores the exact `order`, `status`, and dictionary state captured before the optimistic move, followed by pushing an error toast to the user.

---

## 5. Mock API & Persistence Design

### Isolated Client-Side Network Adapter
The mock API layer (`lib/api/client.ts`) exclusively serves Promises that resolve or gracefully throw after forced delays. It is cleanly abstracted so the UI components only import standard async calls (e.g., `TaskApi.updateStatus()`).

- **Simulated Latency**: Implemented via `await new Promise(r => setTimeout(r, Math.random() * 600 + 300))` (300ms–900ms delay).
- **Simulated Hard Failures**: A deterministic or random failing interceptor applies a 5% failure rate rejecting with a standard `HttpError` shape for testing optimistic rollbacks.
- **Server-Style Validation**: The mock adapter pipes incoming payloads through the Zod `taskSchema` *before* inserting into storage, replicating standard backend validation boundaries safely avoiding corrupting `localStorage`.

### LocalStorage Adapter (`lib/storage/`)
- Intercepts state serialization efficiently utilizing `rtk-listener-middleware`.
- Includes a schema migration switch block for future updates to the data contour.

---

## 6. UI & Interaction Logic

### Dashboard Analytics Page
**Data Visualization:** Powered by **Recharts**.
- **Metrics (KPI Cards)**: Displays aggregate views (Total tasks, Completed, Overdue, Average Time to Complete).
- **Line Chart**: Tracks tasks completed daily. Incorporates hover tooltips and interactive legends that allow toggling visual series natively.
- **Bar Chart**: workload distribution per active assignee.
- **Donut/Pie**: Priority distribution visualization.

### Kanban Board Interaction
- Built utilizing **dnd-kit** equipped with pointer and keyboard sensors.
- Implements a fixed **DragOverlay** rendering the active card above the DOM layout. This is critical to prevent CSS flex/grid layout thrashing when dragging elements rapidly.
- Columns do not accept the full object. Kanbans consume `tasksIdsByStatus` arrays and map IDs to `SortableTaskCard`s, pulling data directly via `useSelector`.

### Filtering & Search
- Filter actions dispatch updates debounced by `useDebounce` (300ms) to avoid lagging the UI during keystrokes.
- Text matching sanitizes, lowercases, and concatenates `title`, `description`, and `assigneeName`.

### Task Creation and Edit Drawer
- Anchored to the right side of the screen using a **Drawer/Slide-Over** pattern for heavy contexts.
- **Rules of UX Engagement**:
  - Requires **confirm dialog** attempting to close the drawer while the `react-hook-form` is dynamically marked `isDirty`.
  - Input auto-focus activates on the `Title` field when opening the drawer; focus securely restores to the "New Task" triggering button upon closing.
  - Form validation errors appear instantly below fields strictly formatted by the `zodResolver`.
  - A global banner displays safely at the top of the form regarding transient API failures.
  - On successful API confirmation, the drawer auto-closes, and the UI briefly pulses or highlights the newly injected card within the board.

---

## 7. UI Design & Styling Approach

TailwindCSS architecture is optimized around the **Horizon UI** visual themes:
- **Core Layout Structure**: Desktop utilizes a fixed `.w-64` left sidebar featuring styled SVG icons in pills. The `.sticky.top-0` Header carries user profile drop-downs and trailing actions. 
- **Surface Elevation**: Content grids utilize `bg-slate-50/50`. Modals, Drawers and Cards surface as pure `.bg-white` sporting subtle `.shadow-sm` and `.border-slate-200/60` borders.
- **Micro-Interactions**: Predictable scale interactions via `.transition-transform .duration-200 hover:scale-[1.01]` on cards. 
- **Typography Scale**: Deep tracking controls; `text-slate-900` for primary headers, `text-slate-500` for meta-descriptions.
- **Status Semantics (Badges)**: 
  - *Todo*: Slate / Gray
  - *In Progress*: Indigo / Blue
  - *Done*: Emerald / Green
  - *Urgent Priorities*: Rose / Red 

---

## 8. Performance Considerations

- **React Hydration Strategy**: The App requires a `DataHydrator` client component placed near the root layout which reads `localStorage` within a `useEffect`, dispatches the populated payload to Redux, and sets `hasHydratedFromStorage`. Until `true`, Next.js SSR passes render skeleton fallbacks gracefully to prevent checksum mismatch logic.
- **Memoization Strictness**: Redux `createSelector` is required for aggregate metrics; calculations never happen dynamically mapping arrays within raw function render closures.
- **Responsive Dimensions**: Recharts' `ResponsiveContainer` reacts to screen variants, but standard HTML nodes utilize `ResizeObserver` coupled with debounce tools preventing over-firing event queues during continuous resizing instances.

---

## 9. UX States & Visual Feedback

- **Skeletons (Pending Load)**: Initial bootstrapping before hydration uses structure-perfect `animate-pulse` generic boxes tracking exactly the Kanban grids and Dashboard KPIs visually.
- **Global Data Absences**: Boards with 0 tasks entirely show a centralized graphic CTA invoking the "Create Task" logic. Empty filters surface a distinct "No Tasks Found" warning allowing a cascading "Reset Filters" click.
- **Error States / Mutating Fails**: Explicit toast notifications trigger natively identifying Rollbacks ("Task movement failed. Synchronizing original state."). Submissions grey-out actions securely, showing internal loading spinners natively atop the confirmation buttons preventing duplicate calls.

---

## 10. Extensibility Plan

- **Layout Scalability**: Adding additional navigation roots correctly respects the `(dashboard)` routing context dynamically adopting headers and responsive grid structures.
- **Data Shape Revisions**: Augmenting tasks with 'swimlanes', 'checklists', or 'attachments' requires simple appending to the central Zod schema, alongside incrementing the `schemaVersion` tracking flag inside `lib/storage/` ensuring graceful parsing over stale cache architectures natively.
- **Transition to Active Backends**: Swapping the functional operations inside `lib/api/client.ts` for standardized `axios.post` configurations completely removes the mock setup whilst cleanly preserving component stability without touching frontend files.

---

## 11. Quality & Evaluation Criteria

- **Semantic Integrity**: Rigid Typescript compliance with zero manual `any` or loose typings across the state machine.
- **UI Performance Tracking**: Uninterrupted drag states via optimized mapping and overlay logic.
- **Visual Accuracy Check**: Complete Horizon UI translation ensuring high fidelity padding, margin hierarchy, structural consistency, and visual balance.
- **Fault Tolerance**: Hard confirmation of API/Mock failures accurately dispatching structural restorations to the Redux states assuring zero desync between columns and background configurations.
