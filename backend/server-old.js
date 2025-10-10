'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Calendar, Users, Star, Heart, Globe, Plane, Hotel, Car, Camera, Sparkles, ArrowRight, Menu, X, ChevronDown, Clock, DollarSign, TrendingUp, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('flights')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDestination, setSelectedDestination] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [travelers, setTravelers] = useState(1)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const destinations = [
    { name: 'Paris', country: 'France', price: '$899', rating: 4.8, image: '🗼', trending: true },
    { name: 'Tokyo', country: 'Japan', price: '$1,299', rating: 4.9, image: '🗾', trending: true },
    { name: 'New York', country: 'USA', price: '$699', rating: 4.7, image: '🗽', trending: false },
    { name: 'Bali', country: 'Indonesia', price: '$599', rating: 4.9, image: '🏝️', trending: true },
    { name: 'Dubai', country: 'UAE', price: '$999', rating: 4.6, image: '🏙️', trending: false },
    { name: 'Rome', country: 'Italy', price: '$799', rating: 4.8, image: '🏛️', trending: false }
  ]

  const experiences = [
    { title: 'Adventure Sports', icon: '🏄', description: 'Surfing, diving, hiking & more' },
    { title: 'Cultural Tours', icon: '🏛️', description: 'Museums, landmarks, heritage sites' },
    { title: 'Food & Wine', icon: '🍷', description: 'Culinary experiences & tastings' },
    { title: 'Wellness & Spa', icon: '💆', description: 'Relaxation and rejuvenation' }
  ]

  const stats = [
    { label: 'Happy Travelers', value: '2M+', icon: Users },
    { label: 'Destinations', value: '150+', icon: Globe },
    { label: 'Years Experience', value: '15+', icon: Award },
    { label: 'Satisfaction Rate', value: '98%', icon: TrendingUp }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Maya Travel
              </span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {['Explore', 'Destinations', 'Experiences', 'About', 'Contact'].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hidden md:flex">
                Sign In
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Get Started
              </Button>
              <Button
                variant="ghost"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t"
            >
              <div className="px-4 py-2 space-y-2">
                {['Explore', 'Destinations', 'Experiences', 'About', 'Contact'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 12}%`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Travel Planning
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Discover Your Next
              <br />
              <span className="text-blue-600">Adventure</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Let Maya AI craft your perfect journey with personalized recommendations, 
              instant bookings, and unforgettable experiences.
            </p>
          </motion.div>

          {/* Search Widget */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-4xl mx-auto"
          >
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="flights" className="flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Flights
                </TabsTrigger>
                <TabsTrigger value="hotels" className="flex items-center gap-2">
                  <Hotel className="w-4 h-4" />
                  Hotels
                </TabsTrigger>
                <TabsTrigger value="packages" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Packages
                </TabsTrigger>
                <TabsTrigger value="activities" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Activities
                </TabsTrigger>
              </TabsList>

              <TabsContent value="flights" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="From where?"
                      className="pl-10 h-12 text-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="To where?"
                      className="pl-10 h-12 text-lg"
                      value={selectedDestination}
                      onChange={(e) => setSelectedDestination(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type="date"
                      placeholder="Departure"
                      className="pl-10 h-12"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type="date"
                      placeholder="Return"
                      className="pl-10 h-12"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                  </div>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Select value={travelers.toString()} onValueChange={(v) => setTravelers(parseInt(v))}>
                      <SelectTrigger className="pl-10 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Traveler' : 'Travelers'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Search className="w-5 h-5 mr-2" />
                  Search Flights
                </Button>
              </TabsContent>

              <TabsContent value="hotels" className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Destination or hotel name"
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input type="date" placeholder="Check-in" className="pl-10 h-12" />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input type="date" placeholder="Check-out" className="pl-10 h-12" />
                  </div>
                </div>
                <Button className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Search className="w-5 h-5 mr-2" />
                  Search Hotels
                </Button>
              </TabsContent>

              <TabsContent value="packages" className="space-y-4">
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Where do you want to go?"
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <Button className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Search className="w-5 h-5 mr-2" />
                  Discover Packages
                </Button>
              </TabsContent>

              <TabsContent value="activities" className="space-y-4">
                <div className="relative">
                  <Camera className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="What would you like to do?"
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <Button className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Search className="w-5 h-5 mr-2" />
                  Find Activities
                </Button>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trending
              <span className="text-blue-600"> Destinations</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore the most popular places our travelers are visiting this month
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                    <span className="text-6xl">{destination.image}</span>
                    {destination.trending && (
                      <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold">{destination.name}</h3>
                        <p className="text-gray-600">{destination.country}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{destination.price}</p>
                        <p className="text-sm text-gray-500">per person</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{destination.rating}</span>
                        <span className="text-gray-500">(234 reviews)</span>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                        Explore
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Curated
              <span className="text-blue-600"> Experiences</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked activities and tours for unforgettable memories
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experiences.map((experience, index) => (
              <motion.div
                key={experience.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl">
                  {experience.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{experience.title}</h3>
                <p className="text-gray-600">{experience.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-12 text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join millions of travelers who trust Maya for their perfect journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Planning
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Download App
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Maya Travel</span>
              </div>
              <p className="text-gray-400">
                Your AI-powered travel companion for unforgettable journeys.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Explore</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Destinations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Travel Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Deals</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Insurance</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-800" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Maya Travel. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Camera className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import monitoring modules
const metrics = require('./src/monitoring/metrics');
const HealthChecker = require('./src/monitoring/health-check');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize health checker
const healthChecker = new HealthChecker();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for enhanced requests

// Add metrics middleware for HTTP request monitoring
app.use(metrics.httpMetricsMiddleware);

// Stripe webhook requires raw body; mount raw parser just for that route
app.use('/api/payment/webhook', bodyParser.raw({ type: 'application/json' }));

console.log('✅ Using Supabase as database (MongoDB not required)');

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Amriyy Travel Agent API Server - Enhanced with Boss Agent',
    version: '2.0.0',
    status: 'running',
    features: [
      'Boss Agent Orchestration',
      'Skill Plugin System',
      'Emotional Intelligence',
      'Real-time Price Monitoring',
      'Arabic/English Support'
    ],
    timestamp: new Date().toISOString()
  });
});

// Public API: ping
app.get('/api/public/ping', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// OpenAPI spec
app.get('/api/openapi.json', (req, res) => {
  try {
    const spec = require('./openapi.json');
    res.json(spec);
  } catch (e) {
    res.status(500).json({ error: 'Spec not found' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0'
  });
});

// Comprehensive health check endpoint
app.get('/api/health/detailed', async (req, res) => {
  try {
    const healthReport = await healthChecker.getHealthReport();

    // Update metrics with health status
    metrics.updateSystemHealth(healthReport.overall_status);

    // Update dependency health metrics
    Object.entries(healthReport.checks).forEach(([dependency, check]) => {
      metrics.updateDependencyHealth(dependency, check.status);
    });

    const statusCode = healthReport.overall_status === 'healthy' ? 200 :
      healthReport.overall_status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthReport);
  } catch (error) {
    console.error('Detailed health check error:', error);
    metrics.recordError('health_check_failed', 'monitoring');
    res.status(503).json({
      overall_status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const metricsData = await metrics.getMetrics();
    res.set('Content-Type', metrics.getRegistry().contentType);
    res.end(metricsData);
  } catch (error) {
    console.error('Metrics endpoint error:', error);
    res.status(500).end('# Error generating metrics\n');
  }
});

// Trip routes (legacy - will be replaced by orchestration)
app.get('/api/trips', (req, res) => {
  res.json({
    trips: [],
    message: 'Trips endpoint ready - Use /api/orchestration/plan-trip for enhanced planning',
    legacy: true
  });
});

// Destinations routes
app.get('/api/destinations', (req, res) => {
  res.json({
    destinations: [
      {
        id: 1,
        name: 'Tokyo',
        country: 'Japan',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
        rating: 4.8,
        priceRange: '$$$',
        bestTime: 'Mar-May, Sep-Nov'
      },
      {
        id: 2,
        name: 'Paris',
        country: 'France',
        image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400',
        rating: 4.9,
        priceRange: '$$$$',
        bestTime: 'Apr-Jun, Sep-Oct'
      },
      {
        id: 3,
        name: 'Dubai',
        country: 'UAE',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
        rating: 4.7,
        priceRange: '$$$',
        bestTime: 'Nov-Mar'
      }
    ]
  });
});

// Analytics ingestion (in-memory demo)
const analyticsEvents = [];
app.post('/api/analytics/events', (req, res) => {
  const { type, userId, payload } = req.body || {};
  analyticsEvents.push({
    type: type || 'unknown',
    userId: userId || null,
    payload: payload || {},
    ts: Date.now(),
    ua: req.headers['user-agent'] || ''
  });
  res.json({ success: true });
});

app.get('/api/analytics/summary', (req, res) => {
  const byType = analyticsEvents.reduce((acc, ev) => {
    acc[ev.type] = (acc[ev.type] || 0) + 1;
    return acc;
  }, {});
  const total = analyticsEvents.length;
  res.json({ total, byType, last10: analyticsEvents.slice(-10).reverse() });
});

// Payment routes
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);

// Stripe webhook route
const stripeWebhook = require('./routes/stripe-webhook');
app.use('/api/payment', stripeWebhook);

// Mini App routes
const miniappRoutes = require('./routes/miniapp');
app.use('/api/telegram', miniappRoutes);

// AI routes (Z.ai GLM-4.6) - Enhanced with Boss Agent
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

// Enhanced Orchestration routes (NEW)
const orchestrationRoutes = require('./routes/orchestration');
app.use('/api/orchestration', orchestrationRoutes);

// Fivetran data pipeline routes (NEW)
const fivetranRoutes = require('./routes/fivetran');
app.use('/api/fivetran', fivetranRoutes);

// Fivetran data pipeline routes (NEW)
const fivetranRoutes = require('./routes/fivetran');
app.use('/api/fivetran', fivetranRoutes);

// Advanced Telegram Bot (only start if token is provided and not in test mode)
if (process.env.TELEGRAM_BOT_TOKEN && process.env.NODE_ENV !== 'test') {
  try {
    const advancedTelegramBot = require('./advanced-telegram-bot');
    console.log('🤖 Advanced Maya Telegram Bot integration enabled');
    console.log('🧠 AI Persona: Maya - Professional Travel Agent with Emotional Intelligence');
    console.log('🎯 Boss Agent: Enhanced orchestration with skill plugins');
    console.log('💰 Price Monitoring: Real-time alerts and optimization');
    console.log('🛠️ MCP Tools: Weather, Flights, Hotels, Halal Restaurants, Prayer Times');
    console.log('👤 User Profiling: Advanced personalization and data collection');
  } catch (error) {
    console.log('⚠️ Failed to initialize Telegram Bot:', error.message);
    console.log('📊 Monitoring setup will continue without Telegram Bot');
  }
} else {
  console.log('⚠️ Telegram Bot token not provided or in test mode - Advanced Bot integration disabled');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /api/public/ping',
      'GET /api/health',
      'GET /api/openapi.json',
      'GET /api/destinations',
      'GET /api/trips',
      'POST /api/analytics/events',
      'GET /api/analytics/summary',
      'POST /api/ai/chat',
      'POST /api/ai/travel-recommendations',
      'POST /api/orchestration/plan-trip',
      'POST /api/orchestration/chat',
      'GET /api/orchestration/health',
      'GET /api/orchestration/metrics',
      'POST /api/fivetran/connectors/telegram',
      'POST /api/fivetran/connectors/stripe',
      'POST /api/fivetran/destinations/supabase',
      'GET /api/fivetran/connectors',
      'GET /api/fivetran/connectors/:id/status',
      'POST /api/fivetran/connectors/:id/sync',
      'GET /api/fivetran/connectors/:id/logs',
      'PATCH /api/fivetran/connectors/:id/pause',
      'DELETE /api/fivetran/connectors/:id',
      'POST /api/fivetran/transform/telegram',
      'POST /api/fivetran/transform/stripe'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Amriyy Travel Agent v2.0 - Enhanced Server');
  console.log(`📍 Port: ${PORT}`);
  console.log('🌐 Frontend: http://localhost:3000');
  console.log(`🔧 Backend API: http://localhost:${PORT}`);
  console.log(`🎯 Boss Agent: http://localhost:${PORT}/api/orchestration`);
  console.log('🧠 Skills System: Enabled');
  console.log('💰 Price Monitoring: Ready');
  console.log('📊 Enhanced Analytics: Active');
  console.log('🤖 AI Integration: Z.ai GLM-4.6 + Boss Agent');
});

module.exports = app;
