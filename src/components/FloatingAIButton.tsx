
import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useAuth } from "@/contexts/AuthContext";
import { useDevice } from "@/hooks/use-device";

const FloatingAIButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useAIAssistant();
  const { isNative } = useDevice();

  // Don't show if AI is disabled
  const aiEnabled = localStorage.getItem("aiAssistant") !== "false";
  if (!aiEnabled || !user) return null;

  const handleSend = async () => {
    if (inputMessage.trim() && !loading) {
      await sendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className={`fixed ${isNative ? 'bottom-24' : 'bottom-20'} right-4 z-50`}>
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:opacity-90"
          >
            <MessageCircle size={24} />
          </Button>
          <div className="absolute -top-8 -left-12 bg-white/5 backdrop-blur border border-white/10 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            💬 Ask AI
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className={`fixed ${isNative ? 'bottom-24' : 'bottom-20'} right-4 w-80 h-96 bg-white/5 backdrop-blur rounded-lg shadow-2xl z-50 flex flex-col border border-white/10 max-w-[calc(100vw-2rem)]`}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-primary text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle size={14} />
              </div>
              <span className="font-medium text-sm">ISave AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.slice(-3).map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    msg.type === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white max-w-[80%] p-2 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                       <div className="w-1 h-1 bg-secondary rounded-full animate-bounce"></div>
                       <div className="w-1 h-1 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                       <div className="w-1 h-1 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-slate-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about savings..."
                className="flex-1 text-sm"
                disabled={loading}
              />
              <Button 
                onClick={handleSend}
                disabled={loading || !inputMessage.trim()}
                className="bg-primary hover:opacity-90 p-2 min-w-[40px]"
                size="sm"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAIButton;
