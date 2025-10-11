import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  X,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader,
  CreditCard,
  Share2,
} from 'lucide-react';
import { PaymentService } from '../api/paymentService';

interface PaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  description?: string;
  customerEmail?: string;
}

const PaymentLinkModal: React.FC<PaymentLinkModalProps> = ({
  isOpen,
  onClose,
  amount,
  currency = 'USD',
  description = 'Amrikyy Trips Payment',
  customerEmail,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  const createPaymentLink = async () => {
    setIsCreating(true);
    setError('');

    try {
      const result = await PaymentService.createStripePaymentLink(
        amount,
        description,
        customerEmail
      );

      if (result.success && result.paymentLink) {
        setPaymentLink(result.paymentLink.url);
      } else {
        setError(result.error || 'Failed to create payment link');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Amrikyy Trips Payment',
          text: `Complete your payment of $${amount} for ${description}`,
          url: paymentLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  const handleClose = () => {
    onClose();
    setPaymentLink('');
    setError('');
    setIsCopied(false);
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
                  Create Payment Link
                </h2>
                <p className="text-sm text-gray-600">
                  Generate a secure payment link
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Payment Details */}
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

              {/* Create Payment Link Button */}
              {!paymentLink && (
                <motion.button
                  onClick={createPaymentLink}
                  disabled={isCreating}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isCreating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Creating Payment Link...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Create Payment Link</span>
                    </>
                  )}
                </motion.button>
              )}

              {/* Payment Link Display */}
              {paymentLink && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Payment Link Created!
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      Share this link with your customer to complete the
                      payment.
                    </p>
                    <div className="bg-white border border-green-200 rounded-lg p-3 flex items-center space-x-2">
                      <code className="flex-1 text-sm text-gray-800 break-all">
                        {paymentLink}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy link"
                      >
                        {isCopied ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                    <button
                      onClick={shareLink}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Open Link Button */}
                  <button
                    onClick={() => window.open(paymentLink, '_blank')}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Payment Page</span>
                  </button>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 mt-4 p-3 bg-red-50 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </motion.div>
              )}

              {/* Security Notice */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 text-blue-600 mt-0.5">🔒</div>
                  <div className="text-sm text-blue-700">
                    <strong>Secure Payment:</strong> This link is powered by
                    Stripe and is completely secure. Your customers can pay with
                    any major credit card.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentLinkModal;
