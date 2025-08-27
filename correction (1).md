
# Space • Board • Column • Task — Audit & Fix Plan

> Deliverable: step‑by‑step implementation guide to get Space/Board/Column/Task fully functional across backend + frontend, with sockets, Redux data-flow, robust error states, and verification steps.

---

## 0) What I reviewed
- **Backend:** routes + services + socket layer inside the provided file.
- **Frontend:** target is `frontend_Space_Board_Column_Task.ts` (not readable on my side). I include a precise, file-oriented **to‑do plan** for slices, hooks, components, and UI states so you can apply it directly.

> If a path already exists in your repo, use it. If not, create it exactly as defined below.

---

## 1) Critical backend issues to fix first

### 1.1 User routes: `/search` shadowed by `/:id`
**Problem**: In Express, a param route like `/:id` placed before `/search` will capture `/search` as an `id`.  
**Fix**
- **File**: `server/routes/user.routes.ts` (or JS equivalent)
- **Change**: Declare `/search` **before** `/:id`.
```ts
router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);
```
**Verification**
- `GET /api/users/search?q=ali` returns results.
- `GET /api/users/123` still works.

---

### 1.2 SocketService: user room is never joined
**Problem**: `broadcastToUser(userId, ...)` emits to `user:${userId}`, but sockets never join this room.  
**Fix**
- **File**: `server/socket/index.ts`
- **Change**: On connection, join the user room.
```ts
io.on('connection', (socket) => {
  socket.join(`user:${socket.userId}`); // NEW
});
```
**Verification**
- Emit a notification from server; client subscribed to `notification:new` receives it.

---

### 1.3 Authorization on socket “join” events
**Problem**: A valid JWT is required, but there’s **no check** that the user is a member of the **space/board** they attempt to join.  
**Fix**
- **File**: `server/socket/index.ts`
- **Change**: When handling `join:board` and `join:space`, assert membership via DB before `socket.join(...)`.
```ts
socket.on('join:board', async ({ boardId }) => {
  const isMember = await Board.isMember(boardId, socket.userId); // implement
  if (!isMember) return socket.emit('error', { code: 'FORBIDDEN' });
  socket.join(`board:${boardId}`);
});
```
**Verification**
- Try joining a board you’re not a member of → expect an error event.

---

### 1.4 TaskService.moveTask: column automation map + atomicity
**Problems**
1) Uses `settings.automation.statusMapping.has/get` — assumes a `Map`, but persisted Mongo data is usually plain objects.  
2) Moving across columns + reordering should be atomic to avoid inconsistent positions.
**Fix**
- **File**: `server/services/task.service.ts`
- **Change**: Treat mapping as object, not `Map`. Use a **transaction**.
```ts
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  const task = await Task.findById(taskId).session(session);
  const source = await Column.findById(task.column).session(session);
  const target = await Column.findById(targetColumnId).session(session);

  // ... remove from source, insert into target

  const mapping = target.settings?.automation?.statusMapping || {};
  if (target.settings?.automation?.autoUpdateStatus && mapping[target.name]) {
    task.status = mapping[target.name];
  }
  await task.save({ session });
});
session.endSession();
```
**Verification**
- Start two rapid drag-and-drops → DB remains consistent; no duplicates or gaps in positions.

---

### 1.5 TaskService.getFilteredTasks: safe filters, paging, totals
**Problems**
- No `$skip` → pagination not real.
- Sort key not validated → potential injection (`sortBy` must be whitelisted).
- Query should cast ids to ObjectId.
- Return also `total` for pagination UIs.
**Fix**
- **File**: `server/services/task.service.ts`
```ts
const { page = 1, limit = 25 } = filters;
const allowedSort = ['createdAt','updatedAt','priority','dueDate'];
const sortBy = allowedSort.includes(filters.sortBy) ? filters.sortBy : 'createdAt';
const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

const match = { isArchived: { $ne: true } };
if (filters.boardId)   match.board  = new Types.ObjectId(filters.boardId);
if (filters.columnId)  match.column = new Types.ObjectId(filters.columnId);
if (filters.assignee)  match.assignees = new Types.ObjectId(filters.assignee);
// ... other flags

const pipeline = [
  { $match: match },
  // ... lookups
  { $sort: { [sortBy]: sortOrder } },
  { $facet: {
      data: [
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ],
      meta: [{ $count: 'total' }]
  } }
];
const [{ data, meta }] = await Task.aggregate(pipeline);
return { data, total: meta?.[0]?.total ?? 0, page, limit };
```
**Verification**
- UI pagination shows correct page counts and disables “next” on last page.

---

### 1.6 SpaceService.getSpaceWithStats: columns population
**Problem**: `Board.populate('columns')` only works if you store an array of column refs in Board or a virtual. Many schemas don’t; columns live in a separate `columns` collection.  
**Fix**
- **File**: `server/services/space.service.ts`
```ts
const boards = await Board.find({ space: spaceId, isArchived: { $ne: true } }).lean();
const boardIds = boards.map(b => b._id);
const columns = await Column.find({ board: { $in: boardIds } }).lean();
const columnsByBoard = columns.reduce((a,c) => { (a[c.board] ||= []).push(c); return a; }, {});
const boardsWithColumns = boards.map(b => ({ ...b, columns: columnsByBoard[b._id] || [] }));
```
**Verification**
- Space page loads with each board’s columns without extra queries on the client.

---

### 1.7 DB indexes (performance & correctness)
**Add indexes** in your schemas:
```ts
// Task
taskSchema.index({ board: 1, column: 1, position: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text' });

// Column
columnSchema.index({ board: 1, position: 1 });

// Board
boardSchema.index({ space: 1, type: 1 });
```
**Verification**
- Explain plans show indexed scans; filter/sort latency drops on lists.

---

## 2) Frontend: required structure & fixes (apply precisely)

> Paths below assume Vite + React + TS + Redux Toolkit Query (RTKQ). Adjust if your structure differs.

### 2.1 Redux slices & RTK Query services

**Files to create/verify**
- `src/app/store.ts`
- `src/features/spaces/space.slice.ts`
- `src/features/boards/board.slice.ts`
- `src/features/columns/column.slice.ts`
- `src/features/tasks/task.slice.ts`
- `src/services/api.ts` (RTKQ base)
- `src/services/space.api.ts`
- `src/services/board.api.ts`
- `src/services/task.api.ts`
- `src/services/user.api.ts`

**Key endpoints**
```ts
// space.api.ts
getSpacesByWorkspace: builder.query<Space[], string>({ query: (workspaceId) => `/spaces/workspace/${workspaceId}` }),
getSpace: builder.query<Space, string>({ query: id => `/spaces/${id}` }),
createSpace: builder.mutation<Space, NewSpace>({ query: body => ({ url: '/spaces', method: 'POST', body }) }),

// board.api.ts
getBoardsBySpace: builder.query<Board[], string>({ query: spaceId => `/boards/space/${spaceId}` }),
getBoard: builder.query<BoardWithColumns, string>({ query: id => `/boards/${id}` }),
createBoard: builder.mutation(...),
updateBoard: builder.mutation(...),
addColumn: builder.mutation(...),
updateColumn: builder.mutation(...),
deleteColumn: builder.mutation(...),
reorderColumns: builder.mutation(...),

// task.api.ts
getTasks: builder.query<Paged<Task>, TaskFilters>({ query: params => ({ url: '/tasks', params }) }),
getTask: builder.query<Task, string>({ query: id => `/tasks/${id}` }),
createTask: builder.mutation(...),
updateTask: builder.mutation(...),
moveTask: builder.mutation({ query: ({ id, ...body }) => ({ url: `/tasks/${id}/move`, method: 'PUT', body }) }),
deleteTask: builder.mutation(...),
```

**Store wiring**
```ts
// app/store.ts
export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    spaces: spaceReducer,
    boards: boardReducer,
    columns: columnReducer,
    tasks: taskReducer,
  },
  middleware: gDM => gDM().concat(api.middleware),
});
```

**Cache updates (optimistic)**
- On `moveTask`, perform an **optimistic update** to the cached `getBoard` result (reorder arrays), rollback on error.

### 2.2 Hooks

**Files**
- `src/hooks/useSocket.ts` – connect with auth token; expose joins + listeners.
- `src/hooks/useBoardLive.ts` – subscribes to `task:*`, `column:*` and updates RTKQ cache.
- `src/hooks/useDragDrop.ts` – wraps dnd-kit, emits `PUT /tasks/:id/move` and socket `task:move`.

**Example**
```ts
export function useBoardLive(boardId: string) {
  const socket = useSocket();
  const utils = api.util;

  useEffect(() => {
    socket.emit('join:board', { boardId });
    const onMoved = (task: Task) => {
      utils.updateQueryData(getBoard, boardId, draft => {
        const from = draft.columns.find(c => c._id === task.prevColumnId);
        const to   = draft.columns.find(c => c._id === task.column);
        // remove/insert task in arrays ...
      });
    };
    socket.on('task:moved', onMoved);
    return () => {
      socket.emit('leave:board', { boardId });
      socket.off('task:moved', onMoved);
    };
  }, [boardId]);
}
```

### 2.3 Components (minimum set)

**Files**
- `src/pages/SpacePage.tsx` – loads `getSpace`, renders boards grid (counts).
- `src/pages/BoardPage.tsx` – loads `getBoard`, provides DnD context + live hook.
- `src/components/kanban/Column.tsx` – droppable column with header + add task.
- `src/components/kanban/TaskCard.tsx` – draggable card with assignees, due, priority color.
- `src/components/kanban/CreateTaskModal.tsx`
- `src/components/common/ErrorBoundary.tsx`
- `src/components/common/InlineSkeleton.tsx` & `EmptyState.tsx`

**UI states to implement**
- **loading**: skeletons for columns/cards.
- **empty**: helpful CTAs.
- **error**: retry button, toast on mutation failures.
- **optimistic**: ghost card while dragging; revert on server error.

### 2.4 Drag & Drop behavior
- Library: `@dnd-kit/core @dnd-kit/sortable`
- On drag end:
  1. If column changed → call `PUT /tasks/:id/move` with `{ targetColumnId, position }`.
  2. Else → update order inside same column (and optionally call `reorderColumns`/`bulk position` route if present).
- Emit corresponding socket event so other clients update instantly.

### 2.5 Error handling & toasts
- Use a `createAppError` helper to normalize server errors.
- RTKQ `onQueryStarted` to surface toasts on success/error.
- 401/403 → redirect to login or show “no permission” banner.

### 2.6 Access control in UI
- Hide destructive actions for users without permissions (space role’s `permissions` array).
- Guard “Add Column/Task” buttons based on `manage_boards`/`edit` rights.

---

## 3) Contract between FE ⇄ BE (routes)

Make sure the frontend calls these **exact** endpoints/verbs:

- **Spaces**
  - `GET /api/spaces/workspace/:workspaceId` – list
  - `GET /api/spaces/:id` – details with members
  - `POST /api/spaces` – create
  - `PUT /api/spaces/:id` – update
  - `DELETE /api/spaces/:id` – delete
  - `GET /api/spaces/:id/members` / `POST` / `DELETE`

- **Boards**
  - `GET /api/boards/space/:spaceId`
  - `GET /api/boards/:id` – with columns + tasks
  - `POST /api/boards`
  - `PUT /api/boards/:id`
  - `DELETE /api/boards/:id`
  - `POST /api/boards/:id/columns`
  - `PUT /api/boards/:id/columns/:columnId`
  - `DELETE /api/boards/:id/columns/:columnId`
  - `PUT /api/boards/:id/columns/reorder`

- **Tasks**
  - `GET /api/tasks` (filters, paging, sort)
  - `GET /api/tasks/:id`
  - `POST /api/tasks`
  - `PUT /api/tasks/:id`
  - `PUT /api/tasks/:id/move`
  - `DELETE /api/tasks/:id`
  - `POST /api/tasks/:id/comments` (+ PUT/DELETE)

- **Users**
  - `GET /api/users` / `GET /api/users/search` / `GET /api/users/:id`

---

## 4) Color logic for columns & tasks

### 4.1 Column colors (default palette)
- To Do `#e2e8f0`  
- In Progress `#fef3c7`  
- Review `#fbbf24`  
- Done `#d1fae5`  

### 4.2 Task priority colors
- Low `#94a3b8`
- Medium `#60a5fa`
- High `#f59e0b`
- Urgent `#ef4444`

Add a small legend component in `BoardPage` to remain consistent.

---

## 5) Testing & verification

### 5.1 Manual end-to-end
1. Create a space → add a member with `member` role → member can view/edit but not delete space.
2. Create a board (kanban) → see default columns.
3. Create tasks; drag cards across columns → other browser updates in realtime.
4. Apply filters in the tasks list (assignee, status, overdue) → observe server pagination & counts.
5. Try unauthorized actions (delete board as member) → UI hides action; server returns 403 if attempted.

### 5.2 Unit & integration
- **FE**: test reducers and `onQueryStarted` optimistic updates for `moveTask` and `reorderColumns`.
- **BE**: test `TaskService.moveTask` transaction; `SpaceService.getSpaceWithStats` aggregation; route order for `/users/search`.

---

## 6) Example snippets

### 6.1 RTK Query optimistic move
```ts
moveTask: builder.mutation<Task, MoveTaskBody>({
  query: ({ id, ...body }) => ({ url: `/tasks/${id}/move`, method: 'PUT', body }),
  async onQueryStarted({ id, ...body }, { dispatch, queryFulfilled }) {
    const patch = dispatch(api.util.updateQueryData('getBoard', body.boardId, draft => {
      // remove from old column, insert into new at position
    }));
    try {
      await queryFulfilled;
    } catch {
      patch.undo();
    }
  }
})
```

### 6.2 Socket client
```ts
export function useSocket() {
  const token = useAuthToken();
  const [socket] = useState(() => io(import.meta.env.VITE_WS_URL, { auth: { token } }));
  useEffect(() => { return () => socket.disconnect(); }, []);
  return socket;
}
```

---

## 7) Done checklist
- [ ] User routes order fixed.
- [ ] Socket user room join + membership checks.
- [ ] Task filters: safe paging + totals + whitelisted sort.
- [ ] Move task: transaction + object-based mapping.
- [ ] Space stats: columns resolution corrected.
- [ ] Indexes created.
- [ ] FE: services + slices wired, Board live updates, DnD, optimistic UI, robust states.

---

## 8) Notes
- If your schemas or paths differ, keep the **intent** identical.
- If the client uses SWR/React Query instead of RTKQ, mirror the same endpoints, cache updates, and optimistic logic.
