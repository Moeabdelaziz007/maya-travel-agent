import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Plane,
  Star,
  MessageCircle,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'مرحباً! أنا Maya، مساعد السفر الذكي الخاص بك. كيف يمكنني مساعدتك في تخطيط رحلتك القادمة؟',
      isUser: false,
      timestamp: new Date(),
      suggestions: [
        'أريد تخطيط رحلة إلى اليابان',
        'ما هي أفضل الأوقات للسفر إلى أوروبا؟',
        'ساعدني في إدارة ميزانيتي للسفر',
        'اقترح علي وجهات مثيرة للاهتمام'
      ]
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `شكراً لك على سؤالك! بناءً على طلبك، يمكنني مساعدتك في تخطيط رحلة رائعة. دعني أقترح عليك بعض الخيارات المثيرة للاهتمام...`,
        isUser: false,
        timestamp: new Date(),
        suggestions: [
          'أخبرني المزيد عن هذا الاقتراح',
          'ما هي التكلفة المتوقعة؟',
          'متى أفضل وقت للزيارة؟',
          'أريد خيارات أخرى'
        ]
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Voice recognition logic would go here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 maya-gradient rounded-xl">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold maya-text">Maya AI Assistant</h2>
          <p className="text-gray-600 mt-1">Your intelligent travel companion</p>
        </div>
      </div>

      {/* AI Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Smart Recommendations</h3>
          </div>
          <p className="text-gray-600 text-sm">Get personalized travel suggestions based on your preferences and budget.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Safety Insights</h3>
          </div>
          <p className="text-gray-600 text-sm">Real-time safety information and travel advisories for your destinations.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Instant Planning</h3>
          </div>
          <p className="text-gray-600 text-sm">Quick itinerary creation and real-time travel assistance.</p>
        </motion.div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.isUser 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
                
                {/* Suggestions */}
                {message.suggestions && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-xs bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm">Maya is typing...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Maya anything about your travel..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <motion.button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-3 maya-gradient text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
