
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";

const Assistant = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'You should boost your emergency fund this week.'
    }
  ]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        { id: Date.now(), type: 'user', content: message }
      ]);
      setMessage("");
      
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { 
            id: Date.now() + 1, 
            type: 'assistant', 
            content: 'That\'s a great question! Based on your current savings pattern, I recommend focusing on building your emergency fund to cover 3-6 months of expenses.' 
          }
        ]);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">💡</span>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">SheSaves</div>
            <div className="text-sm text-gray-600">Smart Assistant</div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${
                msg.type === 'user' 
                  ? 'ml-auto bg-orange-500 text-white' 
                  : 'mr-auto bg-gray-100 text-gray-900'
              } max-w-xs p-3 rounded-lg`}
            >
              {msg.content}
            </div>
          ))}
        </div>
      </main>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="max-w-md mx-auto flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border-gray-300"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button 
            onClick={handleSend}
            className="bg-orange-500 hover:bg-orange-600 rounded-full p-3"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
