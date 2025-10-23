import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, CheckCircle2, Brain, TrendingUp } from "lucide-react";
import { getToday, formatDate } from "@/lib/utils";
import type { Task, CalendarEvent } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const today = getToday();
  
  const { data: todayTasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", today],
  });

  const { data: upcomingEvents = [], isLoading: eventsLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/upcoming"],
  });

  const completedCount = todayTasks.filter(t => t.completed).length;
  const totalCount = todayTasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-dashboard-title">
            Welcome to Studently
          </h1>
          <p className="text-sm text-muted-foreground" data-testid="text-current-date">
            {formatDate(today)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Today's Progress</h2>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Tasks Completed</span>
                  <span className="text-2xl font-semibold text-foreground" data-testid="text-completion-rate">
                    {completionRate}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                    data-testid="progress-bar-tasks"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {completedCount} of {totalCount} tasks complete
              </p>
              <Link href="/tasks">
                <Button variant="outline" className="w-full" data-testid="link-view-tasks">
                  View Tasks
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Upcoming Events</h2>
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-3">
              {eventsLoading ? (
                <p className="text-sm text-muted-foreground">Loading events...</p>
              ) : upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              ) : (
                upcomingEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-start gap-2" data-testid={`event-item-${event.id}`}>
                    <div
                      className="w-1 h-12 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getSubjectColor(event.subject) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                    </div>
                  </div>
                ))
              )}
              <Link href="/calendar">
                <Button variant="outline" className="w-full mt-2" data-testid="link-view-calendar">
                  View Calendar
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">AI Study Assistant</h2>
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Get help with Math, Writing, Social Studies, and Coding
            </p>
            <Link href="/study">
              <Button className="w-full" data-testid="link-start-studying">
                Start Studying
              </Button>
            </Link>
          </Card>
        </div>

        <Card className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Your Learning Journey</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Studently helps you stay organized and engaged. Keep tracking your progress and use the AI assistant to deepen your understanding.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-2xl font-semibold text-foreground" data-testid="text-total-tasks">
                {totalCount}
              </p>
              <p className="text-xs text-muted-foreground">Tasks Today</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-2xl font-semibold text-foreground" data-testid="text-upcoming-events">
                {upcomingEvents.length}
              </p>
              <p className="text-xs text-muted-foreground">Upcoming Events</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-2xl font-semibold text-foreground">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    math: "hsl(var(--chart-1))",
    science: "hsl(var(--chart-2))",
    writing: "hsl(var(--chart-3))",
    social_studies: "hsl(var(--chart-4))",
    coding: "hsl(var(--chart-5))",
    other: "hsl(var(--muted-foreground))",
  };
  return colors[subject] || colors.other;
}
