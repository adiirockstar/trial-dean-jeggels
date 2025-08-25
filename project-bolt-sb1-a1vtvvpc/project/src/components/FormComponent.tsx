import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, User, Bot, Loader, Brain, Sparkles, ChevronDown, Menu, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  mode: string;
  timestamp: Date;
}

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'agent',
      content: "Hello! I'm Dean's Personal Codex Agent. I can answer questions about his background, skills, and experience in different conversation styles. Select a mode from the sidebar and ask me anything!",
      mode: 'default',
      timestamp: new Date()
    }
  ]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [selectedMode, setSelectedMode] = useState('default');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate session ID on mount
  useEffect(() => {
    setSessionId(`codex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const conversationModes = {
    'default': 'Conversational & Authentic',
    'interview': 'Interview Mode',
    'storytelling': 'Personal Storytelling', 
    'facts': 'Fast Facts',
    'humble_brag': 'Humble Brag',
    'reflection': 'Self-Reflection'
  };

  const sampleQuestions = [
    "What kind of engineer are you?",
    "What are your strongest technical skills?", 
    "Tell me about your most impressive project",
    "What do you value in team culture?",
    "How do you approach learning new technologies?",
    "What motivates you professionally?",
    "Where do you see yourself growing?"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentQuestion.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentQuestion,
      mode: selectedMode,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion('');
    setIsLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const response = await fetch('https://n8n-uq4a.onrender.com/webhook/codex-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.content,
          mode: selectedMode,
          session_id: sessionId,
          timestamp: new Date().toISOString()
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status}`);
      }

      let webhookResponse;
      try {
        webhookResponse = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse webhook response as JSON:', jsonError);
        throw new Error('Webhook returned invalid or empty response');
      }
      
      let agentContent = 'I received your question but couldn\'t generate a response. Please try rephrasing your question.';
      
      if (webhookResponse && typeof webhookResponse.output === 'string') {
        agentContent = webhookResponse.output;
      } else if (Array.isArray(webhookResponse) && webhookResponse.length > 0 && webhookResponse[0] && typeof webhookResponse[0].output === 'string') {
        agentContent = webhookResponse[0].output;
      } else if (webhookResponse && typeof webhookResponse.answer === 'string') {
        agentContent = webhookResponse.answer;
      } else if (webhookResponse && typeof webhookResponse.response === 'string') {
        agentContent = webhookResponse.response;
      } else if (webhookResponse && typeof webhookResponse.message === 'string') {
        agentContent = webhookResponse.message;
      } else {
        console.log('Webhook response structure:', JSON.stringify(webhookResponse, null, 2));
      }
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: agentContent,
        mode: selectedMode,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
      
    } catch (error) {
      console.error('Error sending question:', error);
      setError('Failed to get response. Please try again.');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        mode: selectedMode,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSampleQuestionClick = (question: string) => {
    setCurrentQuestion(question);
    inputRef.current?.focus();
  };

  const LoadingDots = () => (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Left Sidebar */}
      <div className={`fixed md:relative inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Mobile close button */}
        <div className="md:hidden absolute top-4 right-4">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Brain className="w-8 h-8 text-blue-600" />
              <Sparkles className="w-4 h-4 text-indigo-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Personal Codex</h1>
              <p className="text-sm text-gray-600">AI Assistant</p>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex-shrink-0">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 md:p-4">
            <h3 className="font-semibold text-gray-900 mb-3">About Dean</h3>
            <div className="space-y-2 text-xs md:text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>23-year-old AI Robotics Engineer</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Founder of CH-ISE.co.za</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>n8n & AI Automation Specialist</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Based in Stellenbosch, SA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex-shrink-0">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Conversation Mode
          </label>
          <div className="relative">
            <select 
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 pr-8 md:pr-10 text-xs md:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {Object.entries(conversationModes).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Sample Questions */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Sample Questions</h3>
          <div className="space-y-2 md:space-y-3">
            {sampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSampleQuestionClick(question)}
                disabled={isLoading}
                className="w-full text-left p-2 md:p-3 text-xs md:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors border border-gray-100 hover:border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Right Main Area */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-100 p-4 md:p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Chat with Dean's AI</h2>
                <p className="text-xs md:text-sm text-gray-600">
                Mode: <span className="font-medium text-blue-600">{conversationModes[selectedMode as keyof typeof conversationModes]}</span>
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 hidden md:block">
              Session: {sessionId.slice(-8)}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'agent' && (
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  </div>
                )}
                
                <div className="flex flex-col max-w-2xl">
                  <div
                    className={`rounded-2xl px-4 md:px-6 py-3 md:py-4 shadow-sm ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{message.content}</p>
                  </div>
                  <div className={`flex items-center gap-2 mt-1 md:mt-2 text-xs ${
                    message.type === 'user' 
                      ? 'justify-end text-gray-500' 
                      : 'justify-start text-gray-500'
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    <span>•</span>
                    <span className="capitalize">{conversationModes[message.mode as keyof typeof conversationModes]}</span>
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 md:px-6 py-3 md:py-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <LoadingDots />
                    <span className="text-xs md:text-sm text-gray-600">Thinking in {conversationModes[selectedMode as keyof typeof conversationModes].toLowerCase()} mode...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white border-t border-gray-200 p-4 md:p-6 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-2 md:gap-4">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  placeholder={`Ask about Dean in ${conversationModes[selectedMode as keyof typeof conversationModes].toLowerCase()}...`}
                  disabled={isLoading}
                  className="w-full px-3 md:px-6 py-3 md:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500 text-sm md:text-base"
                  maxLength={500}
                />
              </div>
              <button
                type="submit"
                disabled={!currentQuestion.trim() || isLoading}
                className="bg-blue-600 text-white px-4 md:px-8 py-3 md:py-4 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 md:gap-3 font-medium shadow-sm text-sm md:text-base"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    <span className="hidden md:inline">Send</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden md:inline">Send</span>
                  </>
                )}
              </button>
            </form>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2 md:mt-4 text-center">
              Ask questions about Dean's professional background, technical skills, or experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;