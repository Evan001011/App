import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarEvent, Subject } from "@shared/schema";
import { getEventTypeLabel } from "@/lib/utils";
import { AddEventDialog } from "@/components/add-event-dialog";
import { EditEventDialog } from "@/components/edit-event-dialog";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar", year, month + 1],
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const getSubject = (subjectId: string | null) => {
    if (!subjectId) return null;
    return subjects.find(s => s.id === subjectId);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr);
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2" />);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDate(day);
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    
    days.push(
      <Card
        key={day}
        className={`p-2 min-h-24 hover-elevate cursor-pointer ${isToday ? "ring-2 ring-primary" : ""}`}
        data-testid={`calendar-day-${day}`}
      >
        <div className="text-sm font-medium text-foreground mb-1">{day}</div>
        <div className="space-y-1">
          {dayEvents.map((event) => {
            const subject = getSubject(event.subjectId);
            return (
              <div
                key={event.id}
                className="text-xs p-1 rounded-md border-l-2 bg-accent cursor-pointer hover-elevate"
                style={{ borderLeftColor: subject?.color || "#6b7280" }}
                onClick={() => setSelectedEvent(event)}
                data-testid={`event-${event.id}`}
              >
                <div className="font-medium text-foreground truncate">{event.title}</div>
                <div className="text-muted-foreground">{getEventTypeLabel(event.eventType)}</div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-foreground" data-testid="text-calendar-title">
            Calendar
          </h1>
          <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-event">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              data-testid="button-previous-month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-foreground" data-testid="text-current-month">
              {monthNames[month]} {year}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              data-testid="button-next-month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {isLoading ? (
              <div className="col-span-7 text-center py-12 text-muted-foreground">
                Loading calendar...
              </div>
            ) : (
              days
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Subject Legend</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: subject.color }}
                />
                <span className="text-sm text-foreground">{subject.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <AddEventDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      {selectedEvent && (
        <EditEventDialog
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
