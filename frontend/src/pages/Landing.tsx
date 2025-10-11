import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Globe,
  Shield,
  Heart,
  ArrowRight,
  Languages,
} from 'lucide-react';

const Landing: React.FC = () => {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  const content = {
    ar: {
      title: 'منصة الأتمتة بالذكاء الاصطناعي',
      subtitle: 'قوة الذكاء الاصطناعي الكمي لتخطيط رحلاتك وإدارة ميزانيتك واكتشاف وجهات جديدة',
      cta: 'ابدأ رحلتك الآن',
      features: [
        {
          icon: Zap,
          title: 'ذكاء اصطناعي متقدم',
          description: 'مساعد سفر ذكي يفهم احتياجاتك ويقدم توصيات شخصية',
        },
        {
          icon: Globe,
          title: 'وجهات عالمية',
          description: 'اكتشف أكثر من 150 وجهة حول العالم مع معلومات ثقافية',
        },
        {
          icon: Shield,
          title: 'آمن وموثوق',
          description: 'حماية كاملة لبياناتك ومدفوعاتك مع تشفير من الدرجة البنكية',
        },
        {
          icon: Heart,
          title: 'تخصيص شخصي',
          description: 'رحلات مصممة خصيصاً لاهتماماتك وميزانيتك',
        },
      ],
      services: {
        title: 'الخدمات المتاحة',
        subtitle: 'ابدأ بخدمات السفر الذكية، مع المزيد من مجالات الأتمتة قريباً',
        service: {
          title: 'خدمات السفر',
          description: 'تخطيط رحلات ذكي بالذكاء الاصطناعي وتوصيات مخصصة',
          available: 'متاح الآن',
        },
      },
      ctaSection: {
        title: 'جاهز لتجربة الذكاء الاصطناعي؟',
        subtitle: 'ابدأ رحلتك مع خدمات السفر الذكية اليوم',
        button: 'ابدأ الآن',
      },
      footer: '© 2025 Amrikyy. منصة الأتمتة بالذكاء الاصطناعي. جميع الحقوق محفوظة.',
    },
    en: {
      title: 'AI Automation Platform',
      subtitle: 'Quantum AI power for planning your trips, managing budgets, and discovering new destinations',
      cta: 'Start Your Journey Now',
      features: [
        {
          icon: Zap,
          title: 'Advanced AI',
          description: 'Smart travel assistant that understands your needs and provides personalized recommendations',
        },
        {
          icon: Globe,
          title: 'Global Destinations',
          description: 'Discover over 150 destinations worldwide with cultural insights',
        },
        {
          icon: Shield,
          title: 'Secure & Reliable',
          description: 'Complete protection for your data and payments with bank-grade encryption',
        },
        {
          icon: Heart,
          title: 'Personalized',
          description: 'Trips designed specifically for your interests and budget',
        },
      ],
      services: {
        title: 'Available Services',
        subtitle: 'Start with intelligent travel services, with more automation domains coming soon',
        service: {
          title: 'Travel Services',
          description: 'AI-powered trip planning and personalized recommendations',
          available: 'Available Now',
        },
      },
      ctaSection: {
        title: 'Ready to Experience AI?',
        subtitle: 'Start your journey with intelligent travel services today',
        button: 'Get Started',
      },
      footer: '© 2025 Amrikyy. AI Automation Platform. All rights reserved.',
    },
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Amrikyy</h1>
              <p className="text-purple-300 text-sm">Quantum AI Platform</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <motion.button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Languages className="w-5 h-5 text-white" />
            </motion.button>

            <motion.button
              onClick={() => window.location.href = '/app'}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span className="text-purple-300 text-sm font-medium">
              {language === 'ar' ? 'مدعوم بالذكاء الاصطناعي الكمي' : 'Powered by Quantum Intelligence'}
            </span>
          </div>

          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {language === 'ar' ? 'مستقبل' : 'The Future of'}
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {language === 'ar' ? 'الأتمتة بالذكاء الاصطناعي' : 'AI Automation'}
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            {currentContent.subtitle}
          </p>

          <motion.button
            onClick={() => window.location.href = '/app'}
            className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center space-x-2">
              <span>{currentContent.cta}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.h3
          className="text-3xl font-bold text-white text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {language === 'ar' ? 'إمكانيات مدعومة بالذكاء الاصطناعي الكمي' : 'Quantum-Powered Capabilities'}
        </motion.h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentContent.features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  borderColor: 'rgba(168, 85, 247, 0.5)',
                }}
              >
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-fit mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Current Services */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-white text-center mb-4">
            {currentContent.services.title}
          </h3>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            {currentContent.services.subtitle}
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              className="p-8 bg-white/5 backdrop-blur-sm border border-purple-500/50 hover:bg-white/10 cursor-pointer transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              onClick={() => window.location.href = '/app'}
            >
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-fit mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                {currentContent.services.service.title}
              </h4>
              <p className="text-gray-400 mb-4">{currentContent.services.service.description}</p>
              <span className="inline-flex items-center text-purple-400 font-semibold">
                {currentContent.services.service.available} <ArrowRight className="w-4 h-4 ml-2" />
              </span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          className="p-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-3xl text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-4xl font-bold text-white mb-4">
            {currentContent.ctaSection.title}
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {currentContent.ctaSection.subtitle}
          </p>
          <motion.button
            onClick={() => window.location.href = '/app'}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {currentContent.ctaSection.button}
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
          <p>
            {currentContent.footer}
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

    </div>
  );
};

export default Landing;
