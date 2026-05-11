'use client';
import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { Status } from '@/lib/types';
import { moveTaskOptimistic, moveTaskCommit } from '@/lib/store/kanbanSlice';

export function KanbanBoard() {
  const dispatch = useAppDispatch();
  const { tasks, taskIdsByStatus, activeDragTaskId, hasHydratedFromStorage } = useAppSelector(state => state.kanban);
  const previousState = useAppSelector(state => state.kanban); // snapshot for rollback

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [activeTask, setActiveTask] = useState<any>(null);

  if (!hasHydratedFromStorage) {
    return (
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {[1, 2, 3].map(i => (
           <div key={i} className="w-[320px] shrink-0 bg-slate-100 rounded-xl h-full animate-pulse border border-slate-200 p-4" />
        ))}
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveTask(tasks[active.id as string]);
  };

  const handleDragOver = (event: DragOverEvent) => {
     // No op for now, logic handled on dragEnd to avoid thrashing, or we can add preview logic here.
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskData = tasks[activeId];
    if (!activeTaskData) return;

    const activeStatus = activeTaskData.status;
    let overStatus = (overId === 'todo' || overId === 'in_progress' || overId === 'done') ? overId as Status : null;

    if (!overStatus) {
      const overTaskData = tasks[overId];
      if (overTaskData) {
        overStatus = overTaskData.status;
      } else {
        return;
      }
    }

    const activeItems = taskIdsByStatus[activeStatus];
    const overItems = taskIdsByStatus[overStatus];
    const activeIndex = activeItems.indexOf(activeId);
    let overIndex = overItems.indexOf(overId);

    if (activeStatus === overStatus) {
      if (activeIndex === overIndex || overIndex === -1) return;
    } else {
      if (overIndex === -1) {
        overIndex = overItems.length;
      } else {
        const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        overIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }
    }

    // Dispatch optimistic update
    dispatch(moveTaskOptimistic({ taskId: activeId, toStatus: overStatus, toIndex: overIndex }));
    
    // Commit to mocked API taking full batch synchronization into account
    dispatch(moveTaskCommit({
       taskId: activeId, 
       fromStatus: activeStatus,
       toStatus: overStatus,
       previousState
    }));
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 sm:gap-6 h-full overflow-x-auto pb-4 px-1 items-stretch snap-x snap-mandatory">
        <KanbanColumn id="todo" title="To Do" items={taskIdsByStatus.todo} tasks={tasks} />
        <KanbanColumn id="in_progress" title="In Progress" items={taskIdsByStatus.in_progress} tasks={tasks} />
        <KanbanColumn id="done" title="Done" items={taskIdsByStatus.done} tasks={tasks} />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="transform rotate-2 opacity-80 cursor-grabbing">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
