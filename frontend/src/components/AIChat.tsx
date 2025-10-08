import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAIChat } from '@/hooks/useAIChat';

interface AIChatProps {
  tripId?: string;
}

export const AIChat = ({ tripId }: AIChatProps) => {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading } = useAIChat(tripId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  return (
    <Card className="flex flex-col h-[600px] bg-gradient-to-br from-background/95 to-background/80 backdrop-blur border-primary/20">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Maya - Your Travel Companion 🌍</h3>
          <p className="text-sm text-muted-foreground">Chat in Arabic or English - I'm here to help! ✨</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3 max-w-md">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground">Hey there! 👋</h4>
              <p className="text-sm text-muted-foreground">
                I'm Maya, your AI travel companion! I can help you discover amazing destinations, plan unforgettable trips, and find the best experiences within your budget. 
                <br /><br />
                مرحباً! أنا مايا، رفيقتك في السفر! 🌟
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-secondary to-secondary/60' 
                : 'bg-gradient-to-br from-primary/20 to-primary/10'
            }`}>
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-secondary-foreground" />
              ) : (
                <Bot className="w-4 h-4 text-primary" />
              )}
            </div>
            <div
              className={`flex-1 rounded-2xl p-4 max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground'
                  : 'bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 text-foreground'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-primary/20 bg-gradient-to-r from-background/50 to-transparent backdrop-blur">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about travel... / اسألني عن السفر..."
            disabled={isLoading}
            className="flex-1 bg-background/50 border-primary/20 focus:border-primary"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};
