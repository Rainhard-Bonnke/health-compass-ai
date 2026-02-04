import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { 
  Send, 
  AlertTriangle, 
  Loader2, 
  Phone,
  Activity,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function SymptomChecker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm MediAssist AI, your health guidance assistant. I'm here to help you understand your symptoms and provide recommendations.

**Please describe what you're experiencing** - you can tell me about your symptoms in your own words. Include details like:
- When did the symptoms start?
- How severe are they (mild, moderate, severe)?
- Any other relevant information

⚠️ **Important:** If you're experiencing a medical emergency (chest pain, difficulty breathing, severe bleeding, or stroke symptoms), please call emergency services immediately.`
        }
      ]);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // If user is logged in and this is first message, create consultation
      if (user && !consultationId && messages.length <= 1) {
        const { data: consultation, error } = await supabase
          .from('consultations')
          .insert({
            patient_id: user.id,
            chief_complaint: input.trim(),
            symptoms: [],
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;
        setConsultationId(consultation.id);
      }

      // Call AI endpoint
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content
            })),
            consultationId
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast({
            variant: 'destructive',
            title: 'Rate limit exceeded',
            description: 'Please try again in a moment.',
          });
          return;
        }
        if (response.status === 402) {
          toast({
            variant: 'destructive',
            title: 'Service unavailable',
            description: 'Please try again later.',
          });
          return;
        }
        throw new Error(errorData.error || 'Failed to get response');
      }

      // Stream response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';

      if (!reader) throw new Error('No response body');

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage?.role === 'assistant') {
                  newMessages[newMessages.length - 1] = {
                    ...lastMessage,
                    content: assistantContent
                  };
                }
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save messages to database if logged in
      if (user && consultationId) {
        await supabase.from('consultation_messages').insert([
          { consultation_id: consultationId, role: 'user', content: userMessage.content },
          { consultation_id: consultationId, role: 'assistant', content: assistantContent }
        ]);
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get response. Please try again.',
      });
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(m => m.content !== ''));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Layout hideFooter>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Emergency Banner */}
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2">
          <div className="container flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-destructive" />
            <span className="text-destructive font-medium">Emergency?</span>
            <span className="text-muted-foreground">
              If you're experiencing a medical emergency, call emergency services immediately.
            </span>
          </div>
        </div>

        <div className="flex-1 container py-4 flex flex-col max-w-4xl">
          {/* Chat Header */}
          <Card className="mb-4">
            <CardHeader className="py-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">MediAssist AI</CardTitle>
                  <CardDescription className="text-xs">
                    AI-powered symptom assessment • Not a substitute for professional medical advice
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 pb-4" ref={scrollAreaRef}>
              {messages.map((message, index) => (
                <ChatMessage 
                  key={index} 
                  role={message.role} 
                  content={message.content} 
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                  <div className="chat-bubble-assistant flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing your symptoms...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t pt-4 mt-auto">
            {!user && (
              <div className="mb-3 p-3 bg-accent rounded-lg flex items-start gap-2 text-sm">
                <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  <button
                    onClick={() => navigate('/auth?mode=signup')}
                    className="text-primary hover:underline font-medium"
                  >
                    Create an account
                  </button>
                  {' '}to save your symptom history and receive follow-up care.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your symptoms..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              This is for informational purposes only. Always consult a healthcare professional.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
