import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { KanbanHeader } from '@/components/kanban/KanbanHeader';

export default function KanbanPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <KanbanHeader />
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
