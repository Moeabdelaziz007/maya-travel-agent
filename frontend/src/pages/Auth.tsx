'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Plane,
  Globe,
  MapPin,
  Calendar,
  CreditCard,
  Shield,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Heart,
  Star,
  Users,
  Award,
  ChevronRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    preferences: [] as string[],
  });

  const passwordRequirements = [
    { regex: /.{8,}/, text: 'At least 8 characters' },
    { regex: /[A-Z]/, text: 'One uppercase letter' },
    { regex: /[a-z]/, text: 'One lowercase letter' },
    { regex: /[0-9]/, text: 'One number' },
    { regex: /[^A-Za-z0-9]/, text: 'One special character' },
  ];

  const travelPreferences = [
    { id: 'adventure', label: 'Adventure', icon: '🏔️' },
    { id: 'beach', label: 'Beach', icon: '🏖️' },
    { id: 'cultural', label: 'Cultural', icon: '🏛️' },
    { id: 'food', label: 'Food & Wine', icon: '🍷' },
    { id: 'wellness', label: 'Wellness', icon: '💆' },
    { id: 'luxury', label: 'Luxury', icon: '✨' },
  ];

  useEffect(() => {
    if (formData.password) {
      const strength = passwordRequirements.filter(req =>
        req.regex.test(formData.password)
      ).length;
      setPasswordStrength((strength / passwordRequirements.length) * 100);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceToggle = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 20) return 'bg-red-500';
    if (passwordStrength <= 40) return 'bg-orange-500';
    if (passwordStrength <= 60) return 'bg-yellow-500';
    if (passwordStrength <= 80) return 'bg-green-500';
    return 'bg-green-600';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 20) return 'Very Weak';
    if (passwordStrength <= 40) return 'Weak';
    if (passwordStrength <= 60) return 'Fair';
    if (passwordStrength <= 80) return 'Good';
    return 'Excellent';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-purple-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Brand & Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Plane className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to Amriyy Travel
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Your AI-powered travel companion for unforgettable journeys
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: Sparkles,
                  title: 'AI-Powered Planning',
                  description:
                    'Get personalized recommendations tailored to your preferences',
                  color: 'from-blue-500 to-purple-600',
                },
                {
                  icon: Shield,
                  title: 'Secure & Reliable',
                  description:
                    'Your data is protected with enterprise-grade security',
                  color: 'from-green-500 to-teal-600',
                },
                {
                  icon: Globe,
                  title: 'Global Coverage',
                  description: 'Access to 150+ destinations worldwide',
                  color: 'from-orange-500 to-red-600',
                },
                {
                  icon: Users,
                  title: 'Trusted by Millions',
                  description: 'Join 2M+ travelers who trust Amriyy',
                  color: 'from-purple-500 to-pink-600',
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <Check className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                "Amriyy Travel made planning our honeymoon absolutely seamless.
                The AI recommendations were spot on!"
              </p>
              <p className="text-xs text-gray-500 mt-2">
                - Sarah Johnson, Verified Traveler
              </p>
            </div>
          </motion.div>

          {/* Right Side - Auth Forms */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {isLogin
                    ? 'Sign in to access your travel dashboard'
                    : 'Join millions of travelers exploring the world'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Social Login Options */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-12 border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="w-5 h-5 bg-blue-600 rounded mr-3" />
                    Continue with Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="w-5 h-5 bg-black rounded mr-3" />
                    Continue with Apple
                  </Button>
                </div>

                <div className="relative">
                  <Separator className="my-6" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500">
                    OR
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10 h-12"
                            value={formData.email}
                            onChange={e =>
                              handleInputChange('email', e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 h-12"
                            value={formData.password}
                            onChange={e =>
                              handleInputChange('password', e.target.value)
                            }
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="remember" />
                          <Label htmlFor="remember" className="text-sm">
                            Remember me
                          </Label>
                        </div>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600"
                        >
                          Forgot password?
                        </Button>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Step {currentStep} of 3</span>
                          <span>
                            {Math.round((currentStep / 3) * 100)}% Complete
                          </span>
                        </div>
                        <Progress
                          value={(currentStep / 3) * 100}
                          className="h-2"
                        />
                      </div>

                      {/* Step 1: Basic Info */}
                      {currentStep === 1 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                placeholder="John"
                                className="h-12"
                                value={formData.firstName}
                                onChange={e =>
                                  handleInputChange('firstName', e.target.value)
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                placeholder="Doe"
                                className="h-12"
                                value={formData.lastName}
                                onChange={e =>
                                  handleInputChange('lastName', e.target.value)
                                }
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-email">Email Address</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="you@example.com"
                                className="pl-10 h-12"
                                value={formData.email}
                                onChange={e =>
                                  handleInputChange('email', e.target.value)
                                }
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                              <div className="absolute left-3 top-3 w-5 h-5 text-gray-400">
                                📱
                              </div>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                className="pl-10 h-12"
                                value={formData.phone}
                                onChange={e =>
                                  handleInputChange('phone', e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <Button
                            onClick={() => setCurrentStep(2)}
                            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          >
                            Continue
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </motion.div>
                      )}

                      {/* Step 2: Password & Security */}
                      {currentStep === 2 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                              <Input
                                id="signup-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a strong password"
                                className="pl-10 pr-10 h-12"
                                value={formData.password}
                                onChange={e =>
                                  handleInputChange('password', e.target.value)
                                }
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.password && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Password Strength
                                  </span>
                                  <span
                                    className={`font-medium ${
                                      passwordStrength <= 40
                                        ? 'text-red-600'
                                        : passwordStrength <= 60
                                        ? 'text-yellow-600'
                                        : 'text-green-600'
                                    }`}
                                  >
                                    {getPasswordStrengthText()}
                                  </span>
                                </div>
                                <Progress
                                  value={passwordStrength}
                                  className="h-2"
                                >
                                  <div
                                    className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                                  />
                                </Progress>

                                <div className="space-y-1">
                                  {passwordRequirements.map((req, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center text-xs"
                                    >
                                      {req.regex.test(formData.password) ? (
                                        <Check className="w-3 h-3 text-green-500 mr-2" />
                                      ) : (
                                        <X className="w-3 h-3 text-gray-400 mr-2" />
                                      )}
                                      <span
                                        className={
                                          req.regex.test(formData.password)
                                            ? 'text-green-600'
                                            : 'text-gray-500'
                                        }
                                      >
                                        {req.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                              Confirm Password
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                className="pl-10 pr-10 h-12"
                                value={formData.confirmPassword}
                                onChange={e =>
                                  handleInputChange(
                                    'confirmPassword',
                                    e.target.value
                                  )
                                }
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            {formData.confirmPassword &&
                              formData.password !==
                                formData.confirmPassword && (
                                <Alert className="border-red-200 bg-red-50">
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                  <AlertDescription className="text-red-600">
                                    Passwords do not match
                                  </AlertDescription>
                                </Alert>
                              )}
                          </div>

                          <div className="flex space-x-3">
                            <Button
                              variant="outline"
                              onClick={() => setCurrentStep(1)}
                              className="flex-1 h-12"
                            >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Back
                            </Button>
                            <Button
                              onClick={() => setCurrentStep(3)}
                              className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                              disabled={
                                !formData.password ||
                                formData.password !== formData.confirmPassword
                              }
                            >
                              Continue
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </motion.div>
                      )}

                      {/* Step 3: Preferences */}
                      {currentStep === 3 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-4"
                        >
                          <div className="space-y-3">
                            <Label>
                              Travel Preferences (Select all that apply)
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                              {travelPreferences.map(pref => (
                                <div
                                  key={pref.id}
                                  onClick={() =>
                                    handlePreferenceToggle(pref.id)
                                  }
                                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                    formData.preferences.includes(pref.id)
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="text-2xl">
                                      {pref.icon}
                                    </span>
                                    <span className="font-medium text-sm">
                                      {pref.label}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="nationality">Nationality</Label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                              <Input
                                id="nationality"
                                placeholder="United States"
                                className="pl-10 h-12"
                                value={formData.nationality}
                                onChange={e =>
                                  handleInputChange(
                                    'nationality',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Checkbox id="terms" className="mt-1" />
                            <Label
                              htmlFor="terms"
                              className="text-sm text-gray-600"
                            >
                              I agree to the Terms of Service and Privacy Policy
                            </Label>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Checkbox id="marketing" className="mt-1" />
                            <Label
                              htmlFor="marketing"
                              className="text-sm text-gray-600"
                            >
                              I'd like to receive travel deals and
                              recommendations
                            </Label>
                          </div>

                          <div className="flex space-x-3">
                            <Button
                              variant="outline"
                              onClick={() => setCurrentStep(2)}
                              className="flex-1 h-12"
                            >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Back
                            </Button>
                            <Button
                              type="submit"
                              onClick={handleSubmit}
                              className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Creating Account...
                                </>
                              ) : (
                                <>
                                  Create Account
                                  <ChevronRight className="w-4 h-4 ml-2" />
                                </>
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Toggle between Login/Signup */}
                <div className="text-center pt-6 border-t">
                  <p className="text-gray-600">
                    {isLogin
                      ? "Don't have an account?"
                      : 'Already have an account?'}
                    <Button
                      variant="link"
                      className="p-0 h-auto ml-1 text-blue-600 font-semibold"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setCurrentStep(1);
                        setFormData({
                          email: '',
                          password: '',
                          confirmPassword: '',
                          firstName: '',
                          lastName: '',
                          phone: '',
                          dateOfBirth: '',
                          nationality: '',
                          passportNumber: '',
                          preferences: [],
                        });
                      }}
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="mt-8 flex justify-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-500">
                <Shield className="w-4 h-4" />
                <span className="text-sm">SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <Lock className="w-4 h-4" />
                <span className="text-sm">GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <Award className="w-4 h-4" />
                <span className="text-sm">Award Winning</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
