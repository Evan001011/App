import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AISubject, LearningPreference } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

interface LearningPreferencesDialogProps {
  subject: AISubject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LearningPreferencesDialog({
  subject,
  open,
  onOpenChange,
}: LearningPreferencesDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    explanationStyle: "",
    complexityLevel: "",
    customInstructions: "",
  });

  // Fetch existing preferences
  const { data: preference } = useQuery<LearningPreference | null>({
    queryKey: ["/api/preferences", subject],
    enabled: open && !!subject,
  });

  // Update form when preferences load
  useEffect(() => {
    if (preference) {
      setFormData({
        explanationStyle: preference.explanationStyle || "",
        complexityLevel: preference.complexityLevel || "",
        customInstructions: preference.customInstructions || "",
      });
    }
  }, [preference]);

  const savePreferencesMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest<LearningPreference>("PUT", "/api/preferences", {
        subject,
        explanationStyle: data.explanationStyle || null,
        complexityLevel: data.complexityLevel || null,
        customInstructions: data.customInstructions || null,
        updatedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences", subject] });
      toast({ 
        title: "Learning preferences saved!",
        description: "The AI will now adapt to your learning style."
      });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePreferencesMutation.mutate(formData);
  };

  const subjectLabels: Record<AISubject, string> = {
    math_science: "Math & Science",
    writing: "Writing",
    social_studies: "Social Studies",
    coding: "Coding",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-learning-preferences">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>Customize Your Learning Experience</DialogTitle>
          </div>
          <DialogDescription>
            Tell the AI how you learn best for {subjectLabels[subject]}. These preferences will personalize all your future conversations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="explanationStyle" className="text-base font-semibold">
                How do you learn best?
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Choose the teaching style that works best for you
              </p>
              <Select
                value={formData.explanationStyle}
                onValueChange={(value) => setFormData({ ...formData, explanationStyle: value })}
              >
                <SelectTrigger data-testid="select-explanation-style">
                  <SelectValue placeholder="Choose a teaching style..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default (Balanced approach)</SelectItem>
                  <SelectItem value="step_by_step">Step-by-Step - Break everything into small steps</SelectItem>
                  <SelectItem value="analogies">Analogies - Use real-world examples and metaphors</SelectItem>
                  <SelectItem value="visual_examples">Visual Examples - Describe diagrams and concrete examples</SelectItem>
                  <SelectItem value="concise">Concise - Get to the point quickly</SelectItem>
                  <SelectItem value="socratic">Socratic - Guide me with questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="complexityLevel" className="text-base font-semibold">
                What's your experience level?
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                This helps the AI use appropriate vocabulary and concepts
              </p>
              <Select
                value={formData.complexityLevel}
                onValueChange={(value) => setFormData({ ...formData, complexityLevel: value })}
              >
                <SelectTrigger data-testid="select-complexity-level">
                  <SelectValue placeholder="Choose your level..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default (Adaptive)</SelectItem>
                  <SelectItem value="beginner">Beginner - I'm just starting out</SelectItem>
                  <SelectItem value="intermediate">Intermediate - I have some experience</SelectItem>
                  <SelectItem value="advanced">Advanced - I want in-depth explanations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="customInstructions" className="text-base font-semibold">
                Any other preferences? (Optional)
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Tell the AI anything else about how you like to learn
              </p>
              <Textarea
                id="customInstructions"
                value={formData.customInstructions}
                onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
                placeholder="Example: I prefer lots of practice problems, or I learn better with humor, or Please explain things like I'm 10 years old..."
                className="min-h-24 resize-none"
                data-testid="input-custom-instructions"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-preferences"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={savePreferencesMutation.isPending}
              data-testid="button-save-preferences"
            >
              {savePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
