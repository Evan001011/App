import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  });
}

export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function getSubjectColor(subject: string): string {
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

export function getSubjectLabel(subject: string): string {
  const labels: Record<string, string> = {
    math: "Math",
    science: "Science",
    writing: "Writing",
    social_studies: "Social Studies",
    coding: "Coding",
    other: "Other",
    math_science: "Math & Science",
  };
  return labels[subject] || subject;
}

export function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    assignment: "Assignment",
    quiz: "Quiz",
    test: "Test",
    deadline: "Deadline",
  };
  return labels[type] || type;
}
