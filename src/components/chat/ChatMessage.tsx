import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] chat-bubble-user">
          <p>{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] chat-bubble-assistant">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{content || '...'}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
