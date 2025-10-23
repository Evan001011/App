import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Code, PenTool, Globe, Send, Loader2, Plus, Trash2, MessageSquare, Settings } from "lucide-react";
import type { AISubject, ChatMessage as DBChatMessage, Conversation } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LearningPreferencesDialog } from "@/components/learning-preferences-dialog";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Study() {
  const [selectedSubject, setSelectedSubject] = useState<AISubject>("math_science");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations for the selected subject
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/study/conversations", selectedSubject],
    enabled: !!selectedSubject,
  });

  // Fetch messages for the active conversation
  const { data: chatHistory = [], isLoading: messagesLoading } = useQuery<DBChatMessage[]>({
    queryKey: ["/api/study/messages", activeConversationId],
    enabled: !!activeConversationId,
  });

  const messages: ChatMessage[] = chatHistory.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  // Set active conversation when conversations load or subject changes
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    } else if (conversations.length === 0) {
      setActiveConversationId(null);
    }
  }, [conversations, activeConversationId]);

  // Create new conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      const title = `Chat ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`;
      return await apiRequest<Conversation>("POST", "/api/study/conversations", {
        subject: selectedSubject,
        title,
        createdAt: now,
      });
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/study/conversations", selectedSubject] });
      setActiveConversationId(newConversation.id);
    },
  });

  // Delete conversation mutation with optimistic update
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await apiRequest("DELETE", `/api/study/conversations/${conversationId}`);
      return conversationId;
    },
    onMutate: async (conversationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/study/conversations", selectedSubject] });
      
      // Snapshot the previous value
      const previousConversations = queryClient.getQueryData<Conversation[]>(["/api/study/conversations", selectedSubject]);
      
      // Optimistically update to the new value
      queryClient.setQueryData<Conversation[]>(
        ["/api/study/conversations", selectedSubject],
        (old) => old?.filter((c) => c.id !== conversationId) ?? []
      );
      
      // If we deleted the active conversation, clear it immediately
      if (conversationId === activeConversationId) {
        setActiveConversationId(null);
      }
      
      // Return context with the previous data for rollback
      return { previousConversations };
    },
    onError: (_err, _conversationId, context) => {
      // Rollback on error
      if (context?.previousConversations) {
        queryClient.setQueryData(["/api/study/conversations", selectedSubject], context.previousConversations);
      }
    },
    onSettled: () => {
      // Refetch to ensure we're in sync with server
      queryClient.invalidateQueries({ queryKey: ["/api/study/conversations", selectedSubject] });
    },
  });

  // Send chat message mutation
  const chatMutation = useMutation({
    mutationFn: async (data: { conversationId: string; subject: AISubject; message: string; history: ChatMessage[] }) => {
      const response = await apiRequest<{ reply: string }>("POST", "/api/study/chat", {
        conversationId: data.conversationId,
        subject: data.subject,
        message: data.message,
        history: data.history,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study/messages", activeConversationId] });
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim() || chatMutation.isPending || !activeConversationId) return;

    const userMessage: ChatMessage = { role: "user", content: inputMessage };
    const messageToSend = inputMessage;
    setInputMessage("");

    chatMutation.mutate({
      conversationId: activeConversationId,
      subject: selectedSubject,
      message: messageToSend,
      history: [...messages, userMessage],
    });
  };

  const handleSubjectChange = (subject: AISubject) => {
    setSelectedSubject(subject);
    setActiveConversationId(null);
  };

  const handleNewChat = () => {
    createConversationMutation.mutate();
  };

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversationMutation.mutate(conversationId);
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-foreground" data-testid="text-study-title">
            AI Study Assistant
          </h1>
          <Button
            variant="outline"
            onClick={() => setShowPreferencesDialog(true)}
            data-testid="button-learning-preferences"
          >
            <Settings className="h-4 w-4 mr-2" />
            Customize Learning
          </Button>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversations Sidebar */}
          <Card className="lg:col-span-1 p-4 h-fit max-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Conversations</h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleNewChat}
                disabled={createConversationMutation.isPending}
                data-testid="button-new-chat"
              >
                {createConversationMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {conversationsLoading ? (
                <div className="text-xs text-muted-foreground">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-8">
                  No conversations yet. Click + to start a new chat!
                </div>
              ) : (
                conversations.map((convo) => (
                  <div
                    key={convo.id}
                    className={`flex items-center justify-between gap-2 p-3 rounded-lg cursor-pointer hover-elevate ${
                      activeConversationId === convo.id ? "bg-accent" : ""
                    }`}
                    onClick={() => setActiveConversationId(convo.id)}
                    data-testid={`conversation-item-${convo.id}`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="text-sm text-foreground truncate">{convo.title}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(convo.id);
                      }}
                      disabled={deleteConversationMutation.isPending}
                      data-testid={`button-delete-conversation-${convo.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col h-[600px]">
            {!activeConversationId ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md p-6">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Select a conversation or start a new chat to begin
                  </p>
                  <Button onClick={handleNewChat} data-testid="button-start-new-chat">
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </Card>
        </div>
      </div>

      <LearningPreferencesDialog
        subject={selectedSubject}
        open={showPreferencesDialog}
        onOpenChange={setShowPreferencesDialog}
      />
    </div>
  );
}
