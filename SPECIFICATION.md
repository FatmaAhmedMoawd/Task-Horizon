# SPA Specification Audit & Refined Requirements

## Self-Audit Summary

A detailed evaluation of the original specification was performed against standard React, Next.js, and general SPA architectural standards. The following areas were identified as needing correction or enhancement:

1.  **Missing Details**:
    *   **Timezone Handling**: Dates were specified as ISO strings, but the UI strategy for timezones (e.g., UTC vs. local time display) was omitted, particularly for `dueDate`.
    *   **Assignee Default State**: Did not specify behavior for tasks with no assigned user (nullable assignee vs. "Unassigned" placeholder).
    *   **Data Hydration State**: The strategy for dealing with mismatched initial render (server vs client) due to `localStorage` dependency was incomplete.

2.  **Incorrect or Incomplete Sections**:
    *   **Architectural Contradiction (Mock API vs. Storage)**: Section 5 recommended using Next.js Route Handlers (`app/api/route.ts`) to simulate the Mock API, while Sections 1 and 4 mandated `localStorage` for data persistence. This is a severe contradiction because Next.js Route Handlers run in a Node.js server environment and cannot access the client's browser `localStorage`. 

3.  **Inconsistencies or Contradictions**:
    *   *State Hydration vs. App Router*: Implementing a generic `Provider` in Next.js App Router using a singleton Redux store can lead to state leakage between requests in a full SSR scenario. 

4.  **Shallow or Underdeveloped Explanations**:
    *   **Optimistic Drag-and-Drop (DnD) Rollbacks**: The specification glossed over exactly how the snapshot object would be stored and reverted in the Redux store upon simulated network failure.
    *   **dnd-kit Constraints**: The `dnd-kit` sorting context requires a 1-dimensional array of unique IDs per column, which was not explicitly defined in the state strategy.

5.  **Ambiguous Wording**:
    *   "Mock API layer simulating network latency and failure to validate optimistic UX." It was unclear if this mock layer should intercept at the network level (MSW), Route Handler level, or Client side wrapper layer.

6.  **Fix / Refactor Approach**:
    *   **The Mock API layer must explicitly act as a client-side wrapper**, not actual Route Handlers. The wrapper will use `setTimeout` to mimic network activity and interact seamlessly with `localStorage`.
    *   Strict hydration gating via a bespoke `<DataHydrator>` component that pauses rendering until the Redux store is seeded from `localStorage`.
    *   Store design modified to maintain explicit normalized lists of IDs (`tasksByStatus`) to power the `dnd-kit` UI reliably without deep object mapping.

---

# Refined Project Specification

## 1. Project Overview

A SaaS-style internal dashboard with two primary experiences:

*   **Dashboard / Analytics**: At-a-glance business + productivity metrics (tasks created/completed, workload by assignee, overdue trends) with interactive charts and summary cards in a Horizon UI–inspired layout.
*   **Kanban Board**: Task management with **create/edit**, **filter/search**, and **drag-and-drop** across **three columns** (Todo / In Progress / Done). 

Changes persist via **localStorage**. A client-side mock network layer intercepts persistence operations, simulating network latency and failure to enable testing of optimistic UI and rollback mechanisms. Expected UX includes: card-based UI, sticky sidebar + header, responsive layout, seamless interactions, clear loading/empty/error states, and keyboard-accessible forms.

## 2. Project Architecture & Folder Structure

**Recommended App Router Structure:**

*   `app/`
    *   `(dashboard)/` (Route group for authenticated app shell)
        *   `layout.tsx` (Sidebar/header shell, applies global layout constraints)
        *   `dashboard/page.tsx` (Analytics view)
        *   `kanban/page.tsx` (Kanban board view)
    *   `layout.tsx` (Root layout, fonts, `<StoreProvider>`, `<DataHydrator>`)
    *   `globals.css` (Tailwind base + Horizon-like globals)
*   `components/` (Reusable UI building blocks)
    *   `ui/` (Core UI elements: Button, Card, Badge, Input, Select, Modal, Skeleton)
    *   `dashboard/` (Analytics widgets, KPI definitions)
    *   `kanban/` (Column, Card, DragOverlay, CreateTaskDrawer)
*   `lib/`
    *   `store/` (Redux Toolkit store setup, slice definitions)
    *   `schemas/` (Zod validation schemas)
    *   `types/` (Strict TS types and enums)
    *   `api/` (Client-side mock asynchronous API adapters interacting with localStorage)
    *   `utils/` (Date manipulation formatting, id generation, Tailwind `cn` utility)

**Scale and Maintainability Rationale:**
The Next.js App Router structure enables seamless expansion. Abstracting persistence into `lib/api/` isolates UI from data transportation. Client-only boundaries (`'use client'`) are enforced strictly at the component level to preserve SSR benefits where applicable, and the entire app is wrapped in a Hydration gate to prevent localized localStorage mismatches.

## 3. Data Model Specification

### Core `Task` Entity (Strictly Typed)

Fields:
*   **id**: string (stable unique identifier, e.g., timestamp-based).
*   **title**: string (minimum length 1).
*   **description**: string (empty string `""` preferred over `null` to simplify UI).
*   **priority**: union enum: `'low' | 'medium' | 'high' | 'urgent'`.
*   **dueDate**: string | null (ISO 8601 string in UTC, explicitly nullable).
*   **assignee**: object:
    *   `assigneeId`: string
    *   `assigneeName`: string
    *   `avatarUrl`: string | null
*   **status**: union enum: `'todo' | 'in_progress' | 'done'`.
*   **createdAt**: string (ISO Date).
*   **updatedAt**: string (ISO Date).
*   **order**: number (Relative ordering weight within a status column).
*   **tags**: string[] (Keywords for filtering).
*   **archived**: boolean (Defaults to `false`, drives soft deletion).
*   **estimate**: number | null (Story points or hours).
*   **lastMovedAt**: string (ISO Date for velocity metrics).

Typing Alignment: `lib/schemas/task.ts` (Zod schema) acts as the single source of truth. TypeScript interfaces are generated directly via `z.infer`.

## 4. State Management Strategy

### Choice: Redux Toolkit (RTK)

RTK is selected to handle multi-step interactions (optimistic drag/drop with exact snapshot rollbacks) predictably. The Redux footprint reduces edge cases found in standard local state scaling.

### State Shape

*   `items`: `Record<TaskId, Task>` (Normalized entity dictionary).
*   `columns`: `Record<Status, TaskId[]>` (Ordered array of IDs explicitly structured to feed `dnd-kit`).
*   `ui`:
    *   `filters`: `{ search: string, priority: string[], assigneeIds: string[] }`
    *   `status`: `'idle' | 'loading' | 'failed'`
    *   `error`: `string | null`

### Key Selectors
*   **Hydrated Board State**: Selects ID lists mapped to rich `Task` entities for rendering Kanban columns.
*   **Dashboard Aggregates**: Selects derived values (completion percentage grouping, workload by user).

### Actions & Flows (Optimistic DnD Strategy)
1. **Move Initiated (`moveTaskOptimistically`)**: Immediately remove the task ID from the source column array and insert it into the destination column array. Change the item's internal `status`.
2. **Network Phase (`persistMoveAsync`)**: Intercept the move via `lib/api/client.ts`. A simulated delay runs with a defined failure probability.
3. **Commit or Rollback**:
    *   *Success*: Do nothing to the list state. Dispatch `commitTaskUpdate` to update the `updatedAt` / `lastMovedAt` metadata.
    *   *Failure*: Dispatch `rollbackTaskMove` utilizing the cached previous column arrays and task state object, immediately reverting the view. Display an error Toast.

## 5. Mock API & Persistence Design

### Strategy: Client-Side Wrapper Layer
To satisfy the dual requirements of simulated network latency/errors alongside `.localStorage` permanence, we explicitly DO NOT use Next.js server-side Route Handlers (`app/api`). Instead, we implement an Async Client Adapter.

*   `fetchTasks()`: Resolves a Promise after global `$LATENCY` ms. Reads `localStorage` payload, or seeds default data if completely empty.
*   `createTask(input)`: Validates via Zod constraint, creates structural entity, updates `localStorage`, and Promise resolves after `$LATENCY`.
*   `updateTask(id, input)`: Merges partial changes, executes `$ERROR_RATE` check, throws exception mimicking an 500 Network failure if hit, otherwise resolves securely to storage.
*   `deleteTask(id)`: Removes entity, rewrites localStorage payload.

## 6. UI & Interaction Logic

### Dashboard Analytics Page
*   **Charting Library**: Recharts (Responsive, clean aesthetics).
*   **Widgets**: Top KPI cards (Total, Completed, Overdue, Average Time in Progress). Main area holds a line chart (velocity over time) and bar chart (assignee distribution).

### Kanban Board Page
*   **DnD Library**: `@dnd-kit/core` & `@dnd-kit/sortable`.
*   **Mechanics**:
    *   Intra-column sorting utilizes `KeyboardSensor` and `PointerSensor`.
    *   Inter-column movements track over targets and utilize a `DragOverlay` component strictly to render the moving card, preventing DOM layout shifts on the backend array modification.
    *   Minimal Re-rendering: Columns consume purely `TaskId` arrays. Individual cards grab deeply nested state directly via selectors connected to the Redux context, ignoring irrelevant state dispatches.

### Searching and Layout
*   A centralized `Search` header filters results based on matching a generalized string payload (`title + description`). Throttled and debounced to prevent stutters.
*   `CreateTaskDrawer`: Absolute positioned off-canvas drawer controlled via Zustand or RTK local `ui/` state. Validated tightly bounding to `CreateTaskInput` Zod object schemas.

## 7. UI Design & Styling Approach 

*   **System**: Tailwind CSS utilizing deep hierarchy rules to mirror Horizon UI.
*   **Theme Layout**: 
    *   Sidebar fixed left with hover states. App Header fixed top with User Circle, Search, Notifications.
    *   Body uses `bg-slate-50` / `bg-gray-50`. Cards use `bg-white`, `border-slate-200`, `rounded-xl`, generic spacing metric standard to `p-5`.
    *   Typography: Space Grotesk header hierarchy (`display`), Inter body text (`sans`).

## 8. Performance Considerations

*   **Debounced Reserving**: Inputs directly bound to state maps (search filters) have 300ms reaction constraints.
*   **Client Boundaries**: Components dependent on `dnd-kit` and local storage wrapped in explicit `"use client"` blocks.
*   **Hydration Control**: A global wrapper `<DataHydrator>` runs `useEffect` on global mount tracking readiness. Before it evaluates, the initial application layout renders skeletal load states, ensuring `localStorage` initialization never conflicts with Next.js SSR checksums.

## 9. UX States & Visual Feedback

*   **Skeletons**: Layout matches exactly to actual sizes preventing 'flash of content'.
*   **Error Barriers**: Failed Mock API calls surface through transient Toast notifications containing actionable text (e.g. "Simulated network failure. Try again.").
*   **Transitions**: Action buttons disable gracefully accompanied by circular loaders. Cards scale up dynamically `scale-105` inside Drag Overlays.

## 10. Extensibility Plan

*   Structure bounds support seamless addition of complex objects by purely extending Zod typing rules in `lib/schemas/task.ts`.
*   `lib/api/` handles generic Promise endpoints. Future integration of real backend databases entails deleting the `localStorage` logic entirely inside `client.ts` and replacing it with literal `fetch()` configurations, resulting in identically smooth functionality.

## 11. Quality & Evaluation Criteria

An excellent implementation will strictly pass:
*   Absolute Zero `any` exceptions throughout the codebase execution. Extracted mapping to Redux entities exclusively adheres to Zod typing.
*   SSR and DOM consistency maintained via standard hydration handling.
*   Drag and Drops do not drop 60FPS tracking, and handle aggressive mouse interactions smoothly via overlays without snapping errors.
*   UI implements a cohesive, airy, Horizon-like spacing scale consistently without ad-hoc magic padding numbers.
