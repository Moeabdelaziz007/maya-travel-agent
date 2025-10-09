import React, { useState, useEffect } from 'react';
import { aiService, analyticsService } from '../api/services';
import { motion, AnimatePresence } from 'framer-motion';
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
  Zap,
  Brain,
  User,
  Settings,
  History,
  Target,
  TrendingUp,
  BookOpen,
  Users
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
  reasoningTrace?: any;
  metadata?: any;
  type?: 'text' | 'reasoning' | 'travel_plan' | 'knowledge';
}

interface UserProfile {
  travel_style?: string[];
  preferred_destinations?: string[];
  budget_range?: string;
  personas?: Array<{
    user_personas: {
      name: string;
      description: string;
      characteristics: any;
    };
    confidence_score: number;
  }>;
}

interface ReasoningStep {
  step: number;
  type: string;
  thought: string;
  evidence: string[];
  confidence: number;
  timestamp: string;
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'مرحباً! أنا Maya، مساعد السفر الذكي المتطور الخاص بك. أستخدم الذكاء الاصطناعي المتقدم لتخطيط رحلات مخصصة وتقديم توصيات ذكية بناءً على تفضيلاتك الشخصية.',
      isUser: false,
      timestamp: new Date(),
      type: 'text',
      suggestions: [
        'أريد تخطيط رحلة مخصصة إلى اليابان',
        'ما هي أفضل الوجهات حسب تفضيلاتي؟',
        'ساعدني في إنشاء خطة سفر ذكية',
        'أريد معرفة المزيد عن ثقافة وجهة معينة'
      ]
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [mediaReply, setMediaReply] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [useTools, setUseTools] = useState(true);

  // Enhanced AI features state
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [showReasoning, setShowReasoning] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'profile' | 'knowledge' | 'planning'>('chat');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [useReasoning, setUseReasoning] = useState(true);
  const [includeKnowledge, setIncludeKnowledge] = useState(true);

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      // This would typically get the current user ID from auth context
      const currentUserId = 'user_123'; // Placeholder - get from auth context

      const response = await fetch(`/api/enhanced-ai/user/profile/${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserProfile(data.profile);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    try {
      await analyticsService.track({
        type: 'enhanced_chat_message',
        payload: { length: inputMessage.length, useReasoning, includeKnowledge }
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }

    setInputMessage('');
    setIsTyping(true);

    try {
      // Use enhanced AI endpoint
      const response = await fetch('/api/enhanced-ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          userId: 'user_123', // Get from auth context
          conversationId: currentConversationId,
          useReasoning,
          includeKnowledge,
          region: 'ar'
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.reply,
          isUser: false,
          timestamp: new Date(),
          type: 'text',
          suggestions: data.suggestions,
          reasoningTrace: data.reasoningTrace,
          metadata: data.metadata
        };

        setMessages(prev => [...prev, aiResponse]);
        setCurrentConversationId(data.conversationId);

        try {
          await analyticsService.track({
            type: 'enhanced_chat_reply',
            payload: { success: true, hasReasoning: !!data.reasoningTrace }
          });
        } catch (error) {
          console.error('Analytics error:', error);
        }
      } else {
        throw new Error(data.error || 'AI service error');
      }

    } catch (error) {
      console.error('Enhanced AI Chat Error:', error);

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'عذراً، حدث خطأ في الاتصال مع نظام الذكاء الاصطناعي المتطور. يرجى المحاولة مرة أخرى.',
        isUser: false,
        timestamp: new Date(),
        type: 'text',
        suggestions: [
          'حاول مرة أخرى',
          'تحقق من الاتصال',
          'استخدم الوضع العادي للدردشة'
        ]
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Voice recognition logic would go here
  };

  const handleAnalyzeMedia = async () => {
    if (!mediaUrl && !videoUrl) return;
    setAnalyzing(true);
    setMediaReply(null);
    try {
      const { data } = await aiService.analyzeMedia({
        prompt: inputMessage || 'Analyze this media for trip planning.',
        imageUrls: mediaUrl ? [mediaUrl] : [],
        videoUrl: videoUrl || null,
        options: { enableKvCacheOffload: true, attentionImpl: 'flash-attn-3' }
      });
      setMediaReply(data?.analysis || 'No analysis available');
    } catch (e) {
      setMediaReply('Failed to analyze media.');
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  // Enhanced AI functions
  const generateTravelPlan = async (destination: string, duration: string, budget: string) => {
    try {
      setIsTyping(true);
      const response = await fetch('/api/enhanced-ai/travel-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user_123', // Get from auth context
          destination,
          duration,
          budget,
          preferences: userProfile?.travel_style || []
        })
      });

      const data = await response.json();

      if (data.success) {
        const planMessage: Message = {
          id: Date.now().toString(),
          text: `تم إنشاء خطة سفر مخصصة لـ ${destination}!\n\n${data.travelPlan.itinerary_data.finalRecommendation || 'تفاصيل الخطة متاحة في قسم التخطيط.'}`,
          isUser: false,
          timestamp: new Date(),
          type: 'travel_plan',
          metadata: data.travelPlan
        };

        setMessages(prev => [...prev, planMessage]);
        setActiveTab('planning');
      }
    } catch (error) {
      console.error('Error generating travel plan:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const searchKnowledgeBase = async (query: string) => {
    try {
      const response = await fetch('/api/enhanced-ai/knowledge/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          language: 'ar',
          limit: 5
        })
      });

      const data = await response.json();

      if (data.success && data.results.length > 0) {
        const knowledgeMessage: Message = {
          id: Date.now().toString(),
          text: `وجدت ${data.results.length} نتيجة في قاعدة المعرفة:\n\n${data.results.map((r: any) => `• ${r.title}: ${r.summary || r.content.substring(0, 100)}...`).join('\n')}`,
          isUser: false,
          timestamp: new Date(),
          type: 'knowledge',
          metadata: data.results
        };

        setMessages(prev => [...prev, knowledgeMessage]);
      }
    } catch (error) {
      console.error('Error searching knowledge base:', error);
    }
  };

  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };

  const renderReasoningTrace = (trace: any) => {
    if (!trace || !trace.reasoningSteps) return null;

    return (
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">مسار التفكير</span>
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {trace.reasoningSteps.slice(0, 3).map((step: ReasoningStep, index: number) => (
            <div key={index} className="text-xs text-blue-700 p-2 bg-white rounded border">
              <div className="font-medium">خطوة {step.step}:</div>
              <div>{step.thought}</div>
              {step.evidence && step.evidence.length > 0 && (
                <div className="mt-1 text-blue-600">
                  الأدلة: {step.evidence.slice(0, 2).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
        {trace.reasoningSteps.length > 3 && (
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-2"
          >
            {showReasoning ? 'إخفاء التفاصيل' : 'عرض المزيد...'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 maya-gradient rounded-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold maya-text">Maya Enhanced AI</h2>
            <p className="text-gray-600 mt-1">مساعد السفر الذكي المتطور مع التعلم والتخصيص</p>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          onClick={toggleAdvancedOptions}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="خيارات متقدمة"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Advanced Options Panel */}
      <AnimatePresence>
        {showAdvancedOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <h3 className="text-sm font-medium text-gray-800 mb-3">خيارات الذكاء الاصطناعي المتقدمة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useReasoning}
                  onChange={(e) => setUseReasoning(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">التفكير المنظم</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeKnowledge}
                  onChange={(e) => setIncludeKnowledge(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">قاعدة المعرفة</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showReasoning}
                  onChange={(e) => setShowReasoning(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">عرض مسار التفكير</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'chat', label: 'الدردشة', icon: MessageCircle },
          { id: 'profile', label: 'الملف الشخصي', icon: User },
          { id: 'knowledge', label: 'المعرفة', icon: BookOpen },
          { id: 'planning', label: 'التخطيط', icon: Target }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && (
        <>
          {/* AI Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">التفكير المنظم</h3>
              </div>
              <p className="text-gray-600 text-xs">تحليل منهجي للاستعلامات المعقدة</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">الملف الشخصي</h3>
              </div>
              <p className="text-gray-600 text-xs">تخصيص الاستجابات حسب تفضيلاتك</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">قاعدة المعرفة</h3>
              </div>
              <p className="text-gray-600 text-xs">بحث ذكي في معلومات السفر</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">التخطيط الذكي</h3>
              </div>
              <p className="text-gray-600 text-xs">إنشاء خطط سفر مخصصة</p>
            </motion.div>
          </div>
        </>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">ملفك الشخصي</h3>
          {isLoadingProfile ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : userProfile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">أسلوب السفر</label>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.travel_style?.map((style, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {style}
                      </span>
                    )) || <span className="text-gray-500 text-sm">لم يتم تحديد</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوجهات المفضلة</label>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.preferred_destinations?.map((dest, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {dest}
                      </span>
                    )) || <span className="text-gray-500 text-sm">لم يتم تحديد</span>}
                  </div>
                </div>
              </div>

              {userProfile.personas && userProfile.personas.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">شخصياتك</label>
                  <div className="space-y-2">
                    {userProfile.personas.map((persona, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">
                            {persona.user_personas.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {Math.round(persona.confidence_score * 100)}% تطابق
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {persona.user_personas.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">لم يتم العثور على ملف شخصي</p>
          )}
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">البحث في قاعدة المعرفة</h3>
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              placeholder="ابحث عن معلومات السفر..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchKnowledgeBase((e.target as HTMLInputElement).value);
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector('input[placeholder*="معلومات السفر"]') as HTMLInputElement;
                if (input?.value) searchKnowledgeBase(input.value);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              بحث
            </button>
          </div>
          <p className="text-sm text-gray-600">
            ابحث في قاعدة معرفة شاملة تحتوي على معلومات عن الوجهات، الثقافات، والنصائح السياحية
          </p>
        </div>
      )}

      {activeTab === 'planning' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">تخطيط الرحلات الذكي</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="الوجهة"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="المدة (بالأيام)"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="الميزانية"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              const inputs = document.querySelectorAll('input[placeholder*="الوجهة"], input[placeholder*="المدة"], input[placeholder*="الميزانية"]');
              const [destination, duration, budget] = Array.from(inputs).map(input => (input as HTMLInputElement).value);
              if (destination && duration && budget) {
                generateTravelPlan(destination, duration, budget);
              }
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            إنشاء خطة سفر
          </button>
        </div>
      )}

      {/* Chat Interface - Only show for chat tab */}
      {activeTab === 'chat' && (
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
                  <div className="flex items-center space-x-2 mb-2">
                    {!message.isUser && <Brain className="w-4 h-4 text-blue-600" />}
                    <span className={`text-xs ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.type === 'reasoning' ? 'تفكير منظم' :
                       message.type === 'travel_plan' ? 'خطة سفر' :
                       message.type === 'knowledge' ? 'معرفة' : 'رسالة'}
                    </span>
                  </div>

                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>

                  {/* Reasoning Trace */}
                  {message.reasoningTrace && showReasoning && renderReasoningTrace(message.reasoningTrace)}

                  {/* Metadata */}
                  {message.metadata && (
                    <div className="mt-2 text-xs opacity-60">
                      {message.metadata.processingTime && (
                        <span>زمن المعالجة: {message.metadata.processingTime}ms</span>
                      )}
                      {message.metadata.confidence && (
                        <span className="ml-2">
                          الثقة: {Math.round(message.metadata.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`block w-full text-left text-xs rounded-lg px-3 py-2 transition-colors ${
                            message.isUser
                              ? 'bg-white/20 hover:bg-white/30 text-white'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                          }`}
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
                    <Brain className="w-4 h-4 text-blue-600 animate-pulse" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                  <span className="text-sm">Maya تفكر...</span>
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
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="Image URL (optional)"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Video URL (optional)"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <motion.button
            onClick={handleAnalyzeMedia}
            disabled={analyzing || (!mediaUrl && !videoUrl)}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {analyzing ? 'Analyzing…' : 'Analyze Media'}
          </motion.button>
        </div>
        {mediaReply && (
          <div className="mt-3 p-3 bg-purple-50 border border-purple-100 rounded-lg text-sm text-purple-900 whitespace-pre-wrap">
            {mediaReply}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
