import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "./ui/checkbox";
import { GripVertical } from "lucide-react";
import { cn } from "../lib/utils";

interface ListItem {
  id: string;
  Name: string;
  Enabled: boolean;
}

interface ReorderableListProps {
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
}

export function ReorderableList({ items, onChange }: ReorderableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      onChange(arrayMove(items, oldIndex, newIndex));
    }
  }

  const handleToggle = (id: string, checked: boolean) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, Enabled: checked } : item
    );
    onChange(newItems);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
              onToggle={(checked) => handleToggle(item.id, checked)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  item,
  onToggle,
}: {
  item: ListItem;
  onToggle: (checked: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-md border bg-card p-3 shadow-sm",
        isDragging && "opacity-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <Checkbox
        checked={item.Enabled}
        onCheckedChange={(checked) => onToggle(checked as boolean)}
        id={`item-${item.id}`}
      />
      <label
        htmlFor={`item-${item.id}`}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
      >
        {item.Name}
      </label>
    </div>
  );
}
