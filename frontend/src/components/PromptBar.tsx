import { Button } from "@/components/ui/button";
import TextareaAutosize from 'react-textarea-autosize';
import { Loader2, Send } from "lucide-react";

// Define the props the component will accept
interface PromptBarProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleGenerate: () => void;
  isFetching: boolean;
}

export function PromptBar({ prompt, setPrompt, handleGenerate, isFetching }: PromptBarProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleGenerate();
    }
  };

   return (
    // Add transition classes here
    <div className="py-4 transition-all duration-300 ease-in-out"> 
      <div className="mx-auto max-w-3xl bg-muted p-2 rounded-full shadow-lg flex items-center gap-2">
        <TextareaAutosize
          id="ai-prompt"
          placeholder="Describe the data you want..."
          className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base resize-none p-2"
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          minRows={1}
          maxRows={5}
        />
        <Button onClick={handleGenerate} disabled={isFetching} size="icon" className="rounded-full flex-shrink-0 w-10 h-10 self-end">
          {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}