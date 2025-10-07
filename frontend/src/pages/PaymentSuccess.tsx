import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, Home, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Get payment details from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('payment_intent');
    const amount = urlParams.get('amount');
    const currency = urlParams.get('currency');

    if (paymentId) {
      setPaymentDetails({
        id: paymentId,
        amount: amount ? parseFloat(amount) : 0,
        currency: currency || 'USD',
        status: 'succeeded'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-600" />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your payment. Your transaction has been completed successfully.
          </p>
        </motion.div>

        {/* Payment Details */}
        {paymentDetails && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 rounded-xl p-4 mb-6"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Amount Paid</span>
              <span className="text-lg font-semibold text-gray-800">
                ${paymentDetails.amount.toFixed(2)} {paymentDetails.currency}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Payment ID</span>
              <span className="text-sm font-mono text-gray-800">
                {paymentDetails.id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <span className="text-sm font-semibold text-green-600 capitalize">
                {paymentDetails.status}
              </span>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 bg-blue-50 rounded-lg"
        >
          <div className="flex items-start space-x-2">
            <Receipt className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <strong>Receipt:</strong> A confirmation email has been sent to your email address. 
              You can also download your receipt from your account.
            </div>
          </div>
        </motion.div>

        {/* Support Information */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-sm text-gray-500"
        >
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:support@mayatrips.com" className="text-blue-600 hover:underline">
              support@mayatrips.com
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
