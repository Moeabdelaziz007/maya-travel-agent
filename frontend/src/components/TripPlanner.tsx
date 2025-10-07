import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Plane,
  Clock,
  Users,
  Star
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

interface TripPlannerProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

const TripPlanner: React.FC<TripPlannerProps> = ({ trips, setTrips }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTrip, setNewTrip] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 0
  });

  const handleAddTrip = () => {
    if (newTrip.destination && newTrip.startDate && newTrip.endDate) {
      const trip: Trip = {
        id: Date.now().toString(),
        destination: newTrip.destination,
        startDate: newTrip.startDate,
        endDate: newTrip.endDate,
        budget: newTrip.budget,
        status: 'planned',
        image: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400`
      };
      setTrips([...trips, trip]);
      setNewTrip({ destination: '', startDate: '', endDate: '', budget: 0 });
      setShowAddForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Trip Planner</h2>
          <p className="text-gray-600 mt-1">Plan and manage your travel adventures</p>
        </div>
        <motion.button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 maya-gradient text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          <span>Add Trip</span>
        </motion.button>
      </div>

      {/* Add Trip Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Trip</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <input
                type="text"
                value={newTrip.destination}
                onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Where do you want to go?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
              <input
                type="number"
                value={newTrip.budget}
                onChange={(e) => setNewTrip({ ...newTrip, budget: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Budget in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={newTrip.startDate}
                onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={newTrip.endDate}
                onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <motion.button
              onClick={handleAddTrip}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Trip
            </motion.button>
            <motion.button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip, index) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={trip.image}
                alt={trip.destination}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                  {trip.status}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-500" />
                <h3 className="text-xl font-semibold text-gray-800">{trip.destination}</h3>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{trip.startDate} - {trip.endDate}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">${trip.budget.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <motion.button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Details
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {trips.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No trips planned yet</h3>
          <p className="text-gray-500">Start planning your next adventure!</p>
        </motion.div>
      )}
    </div>
  );
};

export default TripPlanner;
