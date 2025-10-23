import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Code, PenTool, Globe, Send, Loader2 } from "lucide-react";
import type { AISubject } from "@shared/schema";
import { getSubjectLabel } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Study() {
  const [selectedSubject, setSelectedSubject] = useState<AISubject>("math_science");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: async (data: { subject: AISubject; message: string; history: ChatMessage[] }) => {
      const response = await apiRequest<{ reply: string }>("POST", "/api/study/chat", {
        subject: data.subject,
        message: data.message,
        history: data.history,
      });
      return response;
    },
    onSuccess: (data) => {
      if (data && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = { role: "user", content: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    chatMutation.mutate({
      subject: selectedSubject,
      message: inputMessage,
      history: [...messages, userMessage],
    });
  };

  const handleSubjectChange = (subject: AISubject) => {
    setSelectedSubject(subject);
    setMessages([]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const subjects: { value: AISubject; label: string; icon: any; color: string }[] = [
    { value: "math_science", label: "Math & Science", icon: BookOpen, color: "hsl(var(--chart-1))" },
    { value: "writing", label: "Writing", icon: PenTool, color: "hsl(var(--chart-3))" },
    { value: "social_studies", label: "Social Studies", icon: Globe, color: "hsl(var(--chart-4))" },
    { value: "coding", label: "Coding", icon: Code, color: "hsl(var(--chart-5))" },
  ];

  const welcomeMessages: Record<AISubject, string> = {
    math_science: "Hi! I'm here to help you with Math and Science. Share a problem or concept you're working on, and I'll guide you through it step-by-step.",
    writing: "Hello! I can help you brainstorm ideas, outline essays, and revise your writing. What are you working on today?",
    social_studies: "Welcome! Let's explore history, geography, and social concepts together. What topic are you studying?",
    coding: "Hey! I'm here to help you understand programming concepts, debug code, and think through algorithms. What are you working on?",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-foreground mb-6" data-testid="text-study-title">
          AI Study Assistant
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <Card
                key={subject.value}
                className={`p-4 cursor-pointer hover-elevate ${
                  selectedSubject === subject.value ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleSubjectChange(subject.value)}
                data-testid={`button-subject-${subject.value}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: subject.color, opacity: 0.2 }}
                  >
                    <Icon className="h-5 w-5" style={{ color: subject.color }} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{subject.label}</span>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{
                      backgroundColor: subjects.find((s) => s.value === selectedSubject)?.color,
                      opacity: 0.2,
                    }}
                  >
                    {(() => {
                      const Icon = subjects.find((s) => s.value === selectedSubject)?.icon;
                      return Icon ? (
                        <Icon
                          className="h-8 w-8"
                          style={{
                            color: subjects.find((s) => s.value === selectedSubject)?.color,
                          }}
                        />
                      ) : null;
                    })()}
                  </div>
                  <p className="text-muted-foreground" data-testid="text-welcome-message">
                    {welcomeMessages[selectedSubject]}
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`message-${idx}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-accent text-accent-foreground p-4 rounded-lg flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask a question or share what you're working on..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="resize-none min-h-12"
                disabled={chatMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || chatMutation.isPending}
                size="icon"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
