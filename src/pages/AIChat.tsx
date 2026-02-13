import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  Send,
  Trash2,
  StopCircle,
  Sparkles,
  Heart,
  Pill,
  Activity,
  Apple,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHealthChat, ChatMessage } from "@/hooks/useHealthChat";

const QUICK_PROMPTS = [
  { icon: Activity, label: "Analyze my vitals", prompt: "Analyze my recent vital signs and let me know if anything needs attention." },
  { icon: Pill, label: "Medication review", prompt: "Review my current medications and check for any potential interactions or concerns." },
  { icon: Heart, label: "Health summary", prompt: "Give me a comprehensive health summary based on all my medical data." },
  { icon: Apple, label: "Diet suggestions", prompt: "Based on my health profile, suggest a diet plan that would benefit me." },
];

export default function AIChat() {
  const { messages, isStreaming, sendMessage, cancelStream, clearChat } = useHealthChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isStreaming) return;
    sendMessage(prompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-6rem)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">AI Health Assistant</h2>
            <p className="text-[10px] text-muted-foreground">Powered by your medical data</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground" onClick={clearChat}>
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card/50 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-base font-semibold text-foreground mb-1">
              Hi! I'm your Health Assistant
            </h3>
            <p className="text-xs text-muted-foreground text-center max-w-xs mb-6">
              I have access to your vitals, medications, medical history, reports, and daily routines. Ask me anything!
            </p>

            {/* Quick prompts */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => handleQuickPrompt(qp.prompt)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/30"
                >
                  <qp.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-xs font-medium text-foreground">{qp.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-4">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} isStreaming={isStreaming && msg === messages[messages.length - 1] && msg.role === "assistant"} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <Input
          className="h-11 text-sm flex-1"
          placeholder="Ask about your health..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
        />
        {isStreaming ? (
          <Button size="icon" variant="secondary" className="h-11 w-11 flex-shrink-0" onClick={cancelStream}>
            <StopCircle className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="icon" className="h-11 w-11 flex-shrink-0" onClick={handleSend} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function ChatBubble({ message, isStreaming }: { message: ChatMessage; isStreaming: boolean }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{message.content || (isStreaming ? "Thinking..." : "")}</ReactMarkdown>
            {isStreaming && message.content && (
              <span className="inline-block w-1.5 h-4 bg-primary animate-pulse rounded-sm ml-0.5 align-text-bottom" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
