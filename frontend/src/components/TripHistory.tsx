import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Star, 
  DollarSign,
  Clock,
  Users,
  Camera,
  Share2,
  Download,
  Filter
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

interface TripHistoryProps {
  trips: Trip[];
}

const TripHistory: React.FC<TripHistoryProps> = ({ trips }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  const filteredTrips = trips.filter(trip => {
    if (filterStatus === 'all') return true;
    return trip.status === filterStatus;
  });

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case 'destination':
        return a.destination.localeCompare(b.destination);
      case 'budget':
        return b.budget - a.budget;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ongoing': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Clock className="w-4 h-4" />;
      case 'ongoing': return <Calendar className="w-4 h-4" />;
      case 'completed': return <Star className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTripDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Trip History</h2>
        <p className="text-gray-600 mt-1">View and manage your travel history</p>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Trips</option>
              <option value="planned">Planned</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="destination">Destination</option>
              <option value="budget">Budget</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trip Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{trips.length}</p>
          <p className="text-sm text-gray-600">Total Trips</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg text-center"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {trips.filter(trip => trip.status === 'completed').length}
          </p>
          <p className="text-sm text-gray-600">Completed</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg text-center"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {trips.filter(trip => trip.status === 'planned').length}
          </p>
          <p className="text-sm text-gray-600">Planned</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg text-center"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            ${trips.reduce((sum, trip) => sum + trip.budget, 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Budget</p>
        </motion.div>
      </div>

      {/* Trips List */}
      <div className="space-y-6">
        {sortedTrips.map((trip, index) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 h-48 md:h-auto">
                <img
                  src={trip.image}
                  alt={trip.destination}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{trip.destination}</h3>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{trip.startDate} - {trip.endDate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{getTripDuration(trip.startDate, trip.endDate)} days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(trip.status)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(trip.status)}
                        <span className="capitalize">{trip.status}</span>
                      </div>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <span className="text-lg font-semibold text-gray-800">${trip.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">4.8</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <motion.button
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Camera className="w-4 h-4 text-gray-600" />
                    </motion.button>
                    <motion.button
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </motion.button>
                    <motion.button
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <motion.button
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Details
                  </motion.button>
                  <motion.button
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Edit Trip
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {sortedTrips.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No trips found</h3>
          <p className="text-gray-500">Try adjusting your filters or add a new trip</p>
        </motion.div>
      )}
    </div>
  );
};

export default TripHistory;
