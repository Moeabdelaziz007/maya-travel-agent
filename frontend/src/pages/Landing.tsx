import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Brain,
  Cpu,
  Layers,
  ArrowRight,
  Globe,
  Rocket,
  Shield,
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'Quantum Intelligence',
      description: 'Next-generation AI powered by quantum computing principles',
    },
    {
      icon: Zap,
      title: 'Instant Automation',
      description: 'Automate complex workflows with lightning-fast processing',
    },
    {
      icon: Layers,
      title: 'Multi-Domain Integration',
      description: 'Seamlessly connect and automate across multiple platforms',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and data protection',
    },
  ];

  const currentServices = [
    {
      icon: Globe,
      title: 'Travel Services',
      description: 'AI-powered travel planning and recommendations',
      available: true,
      path: '/app',
    },
    {
      icon: Cpu,
      title: 'Business Automation',
      description: 'Intelligent workflow automation for enterprises',
      available: false,
    },
    {
      icon: Rocket,
      title: 'Data Processing',
      description: 'Advanced analytics and data transformation',
      available: false,
    },
  ];

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

          <motion.button
            onClick={() => navigate('/app')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Get Started
          </motion.button>
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
            <Cpu className="w-4 h-4 text-purple-300" />
            <span className="text-purple-300 text-sm font-medium">
              Powered by Quantum Intelligence
            </span>
          </div>

          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            The Future of
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              AI Automation
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Harness the power of quantum-inspired AI to automate complex
            workflows, make intelligent decisions, and transform your business
            operations at the speed of thought.
          </p>

          <motion.button
            onClick={() => navigate('/app')}
            className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center space-x-2">
              <span>Explore Travel Services</span>
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
          Quantum-Powered Capabilities
        </motion.h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
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
            Available Services
          </h3>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Start with our intelligent travel services, with more automation
            domains coming soon
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {currentServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  className={`p-8 bg-white/5 backdrop-blur-sm border rounded-2xl transition-all duration-300 ${
                    service.available
                      ? 'border-purple-500/50 hover:bg-white/10 cursor-pointer'
                      : 'border-white/10 opacity-60'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: service.available ? 1 : 0.6, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={service.available ? { scale: 1.05 } : {}}
                  onClick={() => service.available && navigate(service.path!)}
                >
                  <div
                    className={`p-3 rounded-xl w-fit mb-4 ${
                      service.available
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gray-700'
                    }`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    {service.title}
                  </h4>
                  <p className="text-gray-400 mb-4">{service.description}</p>
                  {service.available ? (
                    <span className="inline-flex items-center text-purple-400 font-semibold">
                      Available Now <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-gray-500 font-semibold">
                      Coming Soon
                    </span>
                  )}
                </motion.div>
              );
            })}
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
            Ready to Experience Quantum AI?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start your journey with our intelligent travel services today
          </p>
          <motion.button
            onClick={() => navigate('/app')}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Launch Travel Services
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
          <p>
            &copy; 2025 Amrikyy. AI Automation Platform. All rights reserved.
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
