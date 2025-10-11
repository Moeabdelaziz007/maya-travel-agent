import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  Shield,
  Lock,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  description?: string;
  onSuccess?: (paymentId: string) => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  currency = 'USD',
  description = 'Amrikyy Trips Payment',
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    'idle' | 'processing' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: 'Credit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Pay with Visa, Mastercard, or American Express',
      available: true,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: (
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
          PP
        </div>
      ),
      description: 'Pay with your PayPal account',
      available: true,
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: (
        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-xs">
          TG
        </div>
      ),
      description: 'Pay through Telegram Bot',
      available: true,
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const response = await fetch('/api/payment/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          paymentMethod: selectedMethod,
          description,
          chatId: 'telegram_chat_id', // This would come from Telegram context
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentStatus('success');
        if (onSuccess) {
          onSuccess(data.payment.id);
        }

        // Auto close after success
        setTimeout(() => {
          onClose();
          setPaymentStatus('idle');
          setSelectedMethod('');
        }, 2000);
      } else {
        setPaymentStatus('error');
        setErrorMessage(data.error || 'Payment failed');
      }
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      setPaymentStatus('idle');
      setSelectedMethod('');
      setErrorMessage('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Complete Payment
                </h2>
                <p className="text-sm text-gray-600">
                  Secure payment processing
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Details */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-2xl font-bold text-gray-800">
                    ${amount.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Description</span>
                  <span className="text-sm text-gray-800">{description}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Choose Payment Method
                </h3>
                {paymentMethods.map(method => (
                  <motion.button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    disabled={!method.available}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${
                      !method.available
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }`}
                    whileHover={{ scale: method.available ? 1.02 : 1 }}
                    whileTap={{ scale: method.available ? 0.98 : 1 }}
                  >
                    <div className="flex items-center space-x-3">
                      {method.icon}
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800">
                          {method.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {method.description}
                        </div>
                      </div>
                      {selectedMethod === method.id && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Security Notice */}
              <div className="flex items-center space-x-2 mb-6 p-3 bg-green-50 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
                <div className="text-sm text-green-700">
                  <strong>Secure Payment:</strong> Your payment information is
                  encrypted and secure.
                </div>
              </div>

              {/* Error Message */}
              {paymentStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 mb-4 p-3 bg-red-50 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-700">{errorMessage}</span>
                </motion.div>
              )}

              {/* Success Message */}
              {paymentStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 mb-4 p-3 bg-green-50 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">
                    Payment successful!
                  </span>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={!selectedMethod || isProcessing}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
