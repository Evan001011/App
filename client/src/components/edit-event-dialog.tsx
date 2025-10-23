import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CalendarEvent } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EditEventDialogProps {
  event: CalendarEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEventDialog({ event, open, onOpenChange }: EditEventDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || "",
    date: event.date,
    subject: event.subject,
    eventType: event.eventType,
  });

  useEffect(() => {
    setFormData({
      title: event.title,
      description: event.description || "",
      date: event.date,
      subject: event.subject,
      eventType: event.eventType,
    });
  }, [event]);

  const updateEventMutation = useMutation({
    mutationFn: async (data: Partial<CalendarEvent>) => {
      return await apiRequest("PATCH", `/api/calendar/${event.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/upcoming"] });
      toast({ title: "Event updated successfully" });
      onOpenChange(false);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/calendar/${event.id}`, {});
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/calendar"] });
      
      // Snapshot the previous values
      const previousCalendar = queryClient.getQueriesData({ queryKey: ["/api/calendar"] });
      const previousUpcoming = queryClient.getQueryData(["/api/calendar/upcoming"]);
      
      // Optimistically remove the event from all calendar queries
      queryClient.setQueriesData<CalendarEvent[]>(
        { queryKey: ["/api/calendar"] },
        (old) => old?.filter((e) => e.id !== event.id) ?? []
      );
      
      // Optimistically remove from upcoming events
      queryClient.setQueryData<CalendarEvent[]>(
        ["/api/calendar/upcoming"],
        (old) => old?.filter((e) => e.id !== event.id) ?? []
      );
      
      // Return context for rollback
      return { previousCalendar, previousUpcoming };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousCalendar) {
        context.previousCalendar.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousUpcoming) {
        queryClient.setQueryData(["/api/calendar/upcoming"], context.previousUpcoming);
      }
    },
    onSuccess: () => {
      toast({ title: "Event deleted" });
      onOpenChange(false);
    },
    onSettled: () => {
      // Refetch to ensure we're in sync with server
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/upcoming"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    updateEventMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-edit-event">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="input-edit-event-title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-edit-event-description"
              />
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                data-testid="input-edit-event-date"
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
              >
                <SelectTrigger data-testid="select-edit-event-subject">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Math</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="social_studies">Social Studies</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => setFormData({ ...formData, eventType: value })}
              >
                <SelectTrigger data-testid="select-edit-event-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteEventMutation.isPending}
              data-testid="button-delete-event"
            >
              Delete
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.title.trim() || updateEventMutation.isPending}
              data-testid="button-update-event"
            >
              {updateEventMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
