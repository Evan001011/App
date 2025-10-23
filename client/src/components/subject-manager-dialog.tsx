import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import type { Subject } from "@shared/schema";

const AI_CATEGORIES = [
  { value: "math_science", label: "Math & Science" },
  { value: "writing", label: "Writing" },
  { value: "social_studies", label: "Social Studies" },
  { value: "coding", label: "Coding" },
  { value: "general", label: "General" },
];

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#8B5CF6", // Purple
  "#F59E0B", // Orange
  "#EC4899", // Pink
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#F97316", // Deep Orange
  "#84CC16", // Lime
  "#6366F1", // Indigo
];

export function SubjectManagerDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState(PRESET_COLORS[0]);
  const [newSubjectAiCategory, setNewSubjectAiCategory] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editAiCategory, setEditAiCategory] = useState<string>("");
  const { toast } = useToast();

  const { data: subjects, isLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!newSubjectName.trim()) throw new Error("Subject name required");
      return apiRequest("POST", "/api/subjects", {
        name: newSubjectName.trim(),
        color: newSubjectColor,
        aiCategory: newSubjectAiCategory || null,
        createdAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setNewSubjectName("");
      setNewSubjectColor(PRESET_COLORS[0]);
      setNewSubjectAiCategory("");
      toast({
        title: "Subject created",
        description: "Your new subject has been added.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create subject.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Subject> }) => {
      return apiRequest("PATCH", `/api/subjects/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setEditingId(null);
      toast({
        title: "Subject updated",
        description: "Your subject has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subject.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      toast({
        title: "Subject deleted",
        description: "The subject has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete subject. It may be in use.",
        variant: "destructive",
      });
    },
  });

  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditName(subject.name);
    setEditColor(subject.color);
    setEditAiCategory(subject.aiCategory || "");
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    updateMutation.mutate({
      id,
      data: {
        name: editName.trim(),
        color: editColor,
        aiCategory: editAiCategory || null,
      },
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
    setEditAiCategory("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-manage-subjects">
          Manage Subjects
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Subjects</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Subject */}
          <div className="space-y-4 pb-4 border-b">
            <h3 className="font-medium">Create New Subject</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject-name">Subject Name</Label>
                <Input
                  id="subject-name"
                  data-testid="input-subject-name"
                  placeholder="e.g., Biology, Spanish, Art History..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      createMutation.mutate();
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      data-testid={`button-color-${color}`}
                      onClick={() => setNewSubjectColor(color)}
                      className={`w-8 h-8 rounded-md hover-elevate active-elevate-2 ${
                        newSubjectColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <Input
                    type="color"
                    value={newSubjectColor}
                    onChange={(e) => setNewSubjectColor(e.target.value)}
                    className="w-8 h-8 p-0 border-0"
                    data-testid="input-custom-color"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-category">AI Tutor Category (Optional)</Label>
                <Select value={newSubjectAiCategory} onValueChange={setNewSubjectAiCategory}>
                  <SelectTrigger id="ai-category" data-testid="select-ai-category">
                    <SelectValue placeholder="Select AI category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {AI_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Link this subject to an AI tutor for study assistance
                </p>
              </div>

              <Button
                data-testid="button-create-subject"
                onClick={() => createMutation.mutate()}
                disabled={!newSubjectName.trim() || createMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Subject
              </Button>
            </div>
          </div>

          {/* Existing Subjects */}
          <div className="space-y-4">
            <h3 className="font-medium">Your Subjects</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading subjects...</p>
            ) : !subjects || subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No subjects yet. Create your first subject above!
              </p>
            ) : (
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center gap-3 p-3 rounded-md border bg-card"
                    data-testid={`subject-item-${subject.id}`}
                  >
                    {editingId === subject.id ? (
                      <>
                        <Input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-10 h-10 p-0 border-0"
                          data-testid="input-edit-color"
                        />
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1"
                          data-testid="input-edit-name"
                        />
                        <Select value={editAiCategory} onValueChange={setEditAiCategory}>
                          <SelectTrigger className="w-[180px]" data-testid="select-edit-ai-category">
                            <SelectValue placeholder="AI category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {AI_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => saveEdit(subject.id)}
                          disabled={updateMutation.isPending}
                          data-testid="button-save-edit"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={cancelEdit}
                          data-testid="button-cancel-edit"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div
                          className="w-10 h-10 rounded-md"
                          style={{ backgroundColor: subject.color }}
                          data-testid={`color-indicator-${subject.id}`}
                        />
                        <div className="flex-1">
                          <p className="font-medium" data-testid={`text-subject-name-${subject.id}`}>
                            {subject.name}
                          </p>
                          {subject.aiCategory && (
                            <p className="text-xs text-muted-foreground">
                              AI: {AI_CATEGORIES.find((c) => c.value === subject.aiCategory)?.label}
                            </p>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEdit(subject)}
                          data-testid={`button-edit-${subject.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(subject.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${subject.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
