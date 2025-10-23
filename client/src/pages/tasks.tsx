import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, GripVertical, Trash2, Calendar as CalendarIcon } from "lucide-react";
import type { Task, InsertTask } from "@shared/schema";
import { getToday, formatDate } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableTaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
}

function SortableTaskItem({ task, onToggle, onDelete }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-card rounded-lg border hover-elevate"
      data-testid={`task-item-${task.id}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task)}
        data-testid={`checkbox-task-${task.id}`}
      />
      <span className={`flex-1 text-sm text-foreground ${task.completed ? "line-through" : ""}`}>
        {task.title}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(task.id)}
        data-testid={`button-delete-task-${task.id}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function Tasks() {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", selectedDate],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      return await apiRequest("POST", "/api/tasks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", selectedDate] });
      setNewTaskTitle("");
      toast({ title: "Task created successfully" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      return await apiRequest("PATCH", `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", selectedDate] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/tasks/${id}`, {});
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/tasks", selectedDate] });
      
      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(["/api/tasks", selectedDate]);
      
      // Optimistically remove the task
      queryClient.setQueryData<Task[]>(
        ["/api/tasks", selectedDate],
        (old) => old?.filter((t) => t.id !== id) ?? []
      );
      
      // Return context for rollback
      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(["/api/tasks", selectedDate], context.previousTasks);
      }
    },
    onSuccess: () => {
      toast({ title: "Task deleted" });
    },
    onSettled: () => {
      // Refetch to ensure we're in sync with server
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", selectedDate] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = incompleteTasks.findIndex((t) => t.id === active.id);
    const newIndex = incompleteTasks.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedTasks = arrayMove(incompleteTasks, oldIndex, newIndex);
    
    // Update order for all affected tasks
    reorderedTasks.forEach((task, index) => {
      if (task.order !== index) {
        updateTaskMutation.mutate({
          id: task.id,
          data: { order: index },
        });
      }
    });
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order), -1);
    
    createTaskMutation.mutate({
      title: newTaskTitle,
      completed: false,
      date: selectedDate,
      order: maxOrder + 1,
    });
  };

  const handleToggleComplete = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { completed: !task.completed },
    });
  };

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  const incompleteTasks = tasks.filter(t => !t.completed).sort((a, b) => a.order - b.order);
  const completedTasks = tasks.filter(t => t.completed).sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-foreground" data-testid="text-tasks-title">
            Daily Planner
          </h1>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
              data-testid="input-select-date"
            />
          </div>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              data-testid="input-new-task"
            />
            <Button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
              data-testid="button-add-task"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No tasks for {formatDate(selectedDate)}</p>
              <p className="text-sm text-muted-foreground">Add your first task to get started!</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="space-y-6">
                {incompleteTasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Incomplete ({incompleteTasks.length})
                    </h3>
                    <SortableContext
                      items={incompleteTasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {incompleteTasks.map((task) => (
                          <SortableTaskItem
                            key={task.id}
                            task={task}
                            onToggle={handleToggleComplete}
                            onDelete={handleDeleteTask}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </div>
                )}

                {completedTasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Completed ({completedTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {completedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-card rounded-lg border opacity-60"
                          data-testid={`task-item-${task.id}`}
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => handleToggleComplete(task)}
                            data-testid={`checkbox-task-${task.id}`}
                          />
                          <span className="flex-1 text-sm text-foreground line-through">{task.title}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTask(task.id)}
                            data-testid={`button-delete-task-${task.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DndContext>
          )}
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4 bg-accent">
            <p className="text-2xl font-semibold text-foreground" data-testid="text-incomplete-count">
              {incompleteTasks.length}
            </p>
            <p className="text-xs text-muted-foreground">Tasks Remaining</p>
          </Card>
          <Card className="p-4 bg-accent">
            <p className="text-2xl font-semibold text-foreground" data-testid="text-completed-count">
              {completedTasks.length}
            </p>
            <p className="text-xs text-muted-foreground">Tasks Completed</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
