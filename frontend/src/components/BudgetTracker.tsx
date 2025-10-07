import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  Target,
  AlertCircle,
  CheckCircle,
  Calendar
} from 'lucide-react';

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'planned' | 'ongoing' | 'completed';
  image: string;
}

interface BudgetTrackerProps {
  trips: Trip[];
}

interface Expense {
  id: string;
  tripId: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ trips }) => {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      tripId: '1',
      category: 'Accommodation',
      amount: 800,
      date: '2024-03-15',
      description: 'Hotel booking'
    },
    {
      id: '2',
      tripId: '1',
      category: 'Food',
      amount: 300,
      date: '2024-03-16',
      description: 'Restaurant meals'
    },
    {
      id: '3',
      tripId: '2',
      category: 'Transportation',
      amount: 400,
      date: '2024-04-10',
      description: 'Flight tickets'
    }
  ]);

  const [selectedTrip, setSelectedTrip] = useState<string>('all');

  const getTotalBudget = () => {
    if (selectedTrip === 'all') {
      return trips.reduce((sum, trip) => sum + trip.budget, 0);
    }
    const trip = trips.find(t => t.id === selectedTrip);
    return trip ? trip.budget : 0;
  };

  const getTotalExpenses = () => {
    if (selectedTrip === 'all') {
      return expenses.reduce((sum, expense) => sum + expense.amount, 0);
    }
    return expenses
      .filter(expense => expense.tripId === selectedTrip)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getRemainingBudget = () => {
    return getTotalBudget() - getTotalExpenses();
  };

  const getBudgetStatus = () => {
    const remaining = getRemainingBudget();
    const total = getTotalBudget();
    const percentage = total > 0 ? (remaining / total) * 100 : 0;
    
    if (percentage > 50) return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage > 25) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'danger', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const getExpensesByCategory = () => {
    const filteredExpenses = selectedTrip === 'all' 
      ? expenses 
      : expenses.filter(expense => expense.tripId === selectedTrip);
    
    const categories = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: getTotalExpenses() > 0 ? (amount / getTotalExpenses()) * 100 : 0
    }));
  };

  const budgetStatus = getBudgetStatus();
  const expensesByCategory = getExpensesByCategory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Budget Tracker</h2>
        <p className="text-gray-600 mt-1">Monitor your travel expenses and stay on budget</p>
      </div>

      {/* Trip Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <label className="block text-sm font-medium text-gray-700 mb-3">Select Trip</label>
        <select
          value={selectedTrip}
          onChange={(e) => setSelectedTrip(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Trips</option>
          {trips.map(trip => (
            <option key={trip.id} value={trip.id}>{trip.destination}</option>
          ))}
        </select>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Total Budget</h3>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">${getTotalBudget().toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Total Spent</h3>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-500">${getTotalExpenses().toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Remaining</h3>
            <Target className="w-8 h-8 text-green-500" />
          </div>
          <p className={`text-3xl font-bold ${budgetStatus.color}`}>
            ${getRemainingBudget().toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Budget Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`bg-white rounded-2xl p-6 shadow-lg ${budgetStatus.bgColor}`}
      >
        <div className="flex items-center space-x-3">
          {budgetStatus.status === 'good' ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : budgetStatus.status === 'warning' ? (
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-600" />
          )}
          <div>
            <h3 className={`text-lg font-semibold ${budgetStatus.color}`}>
              {budgetStatus.status === 'good' ? 'Budget on track!' : 
               budgetStatus.status === 'warning' ? 'Budget getting tight' : 
               'Budget exceeded!'}
            </h3>
            <p className={`text-sm ${budgetStatus.color}`}>
              {budgetStatus.status === 'good' ? 'You\'re doing great with your budget management.' :
               budgetStatus.status === 'warning' ? 'Consider reducing expenses to stay within budget.' :
               'You\'ve exceeded your budget. Review your expenses.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Expenses by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <PieChart className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800">Expenses by Category</h3>
          </div>
          <div className="space-y-4">
            {expensesByCategory.map((item, index) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className="text-sm font-semibold text-gray-800">${item.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="maya-gradient h-2 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-800">Recent Expenses</h3>
          </div>
          <div className="space-y-4">
            {expenses
              .filter(expense => selectedTrip === 'all' || expense.tripId === selectedTrip)
              .slice(0, 5)
              .map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{expense.description}</p>
                    <p className="text-sm text-gray-600">{expense.category} • {expense.date}</p>
                  </div>
                  <span className="font-semibold text-gray-800">${expense.amount}</span>
                </motion.div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BudgetTracker;
