
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Trash2, Sparkles } from "lucide-react";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useAuth } from "@/contexts/AuthContext";

const Assistant = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState("");
  const { messages, loading, sendMessage, clearConversation } = useAIAssistant();

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

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <Sparkles size={48} className="text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access your AI financial assistant.</p>
          <Button onClick={() => navigate('/auth')} className="bg-orange-500 hover:bg-orange-600">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">SheSaves AI Assistant</div>
            <div className="text-sm text-gray-600">Your Personal Financial Advisor</div>
          </div>
        </div>
        <button
          onClick={clearConversation}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Clear conversation"
        >
          <Trash2 size={20} />
        </button>
      </header>

      {/* Messages */}
      <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                  msg.type === 'user' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white text-gray-900 shadow-sm border'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </div>
                <div className={`text-xs mt-2 ${
                  msg.type === 'user' ? 'text-orange-200' : 'text-gray-500'
                }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 shadow-sm border max-w-xs p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your savings, budgeting, or financial goals..."
              className="flex-1 rounded-full border-gray-300 pr-4"
              disabled={loading}
            />
            <Button 
              onClick={handleSend}
              disabled={loading || !inputMessage.trim()}
              className="bg-orange-500 hover:bg-orange-600 rounded-full p-3 min-w-[48px]"
            >
              <Send size={20} />
            </Button>
          </div>
          
          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => setInputMessage("How can I save more money each month?")}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
              disabled={loading}
            >
              💰 Saving tips
            </button>
            <button
              onClick={() => setInputMessage("What's my current savings progress?")}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
              disabled={loading}
            >
              📊 My progress
            </button>
            <button
              onClick={() => setInputMessage("Help me set a realistic savings goal")}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
              disabled={loading}
            >
              🎯 Set goals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
