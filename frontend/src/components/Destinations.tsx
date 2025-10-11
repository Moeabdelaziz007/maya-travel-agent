import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Star,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Heart,
  Share2,
} from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  rating: number;
  priceRange: string;
  bestTime: string;
  description: string;
  isFavorite: boolean;
}

const Destinations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrice, setFilterPrice] = useState('all');
  const [destinations] = useState<Destination[]>([
    {
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      image:
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
      rating: 4.8,
      priceRange: '$$$',
      bestTime: 'Mar-May, Sep-Nov',
      description:
        'A vibrant metropolis blending traditional culture with cutting-edge technology.',
      isFavorite: false,
    },
    {
      id: '2',
      name: 'Paris',
      country: 'France',
      image:
        'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400',
      rating: 4.9,
      priceRange: '$$$$',
      bestTime: 'Apr-Jun, Sep-Oct',
      description:
        'The City of Light, famous for its art, fashion, and romantic atmosphere.',
      isFavorite: true,
    },
    {
      id: '3',
      name: 'Bali',
      country: 'Indonesia',
      image:
        'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400',
      rating: 4.7,
      priceRange: '$$',
      bestTime: 'Apr-Oct',
      description:
        'Tropical paradise with stunning beaches, temples, and lush landscapes.',
      isFavorite: false,
    },
    {
      id: '4',
      name: 'New York',
      country: 'USA',
      image:
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
      rating: 4.6,
      priceRange: '$$$$',
      bestTime: 'Apr-Jun, Sep-Nov',
      description:
        'The city that never sleeps, offering endless entertainment and culture.',
      isFavorite: false,
    },
    {
      id: '5',
      name: 'Santorini',
      country: 'Greece',
      image:
        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400',
      rating: 4.9,
      priceRange: '$$$',
      bestTime: 'May-Oct',
      description:
        'Breathtaking sunsets, white-washed buildings, and crystal-clear waters.',
      isFavorite: true,
    },
    {
      id: '6',
      name: 'Dubai',
      country: 'UAE',
      image:
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
      rating: 4.5,
      priceRange: '$$$',
      bestTime: 'Nov-Mar',
      description:
        'Ultra-modern city with world-class shopping, dining, and entertainment.',
      isFavorite: false,
    },
  ]);

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice =
      filterPrice === 'all' || dest.priceRange === filterPrice;
    return matchesSearch && matchesPrice;
  });

  const getPriceColor = (priceRange: string) => {
    switch (priceRange) {
      case '$':
        return 'text-green-600 bg-green-100';
      case '$$':
        return 'text-yellow-600 bg-yellow-100';
      case '$$$':
        return 'text-orange-600 bg-orange-100';
      case '$$$$':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          Discover Destinations
        </h2>
        <p className="text-gray-600 mt-1">
          Explore amazing places around the world
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterPrice}
              onChange={e => setFilterPrice(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Prices</option>
              <option value="$">$ Budget</option>
              <option value="$$">$$ Moderate</option>
              <option value="$$$">$$$ Expensive</option>
              <option value="$$$$">$$$$ Luxury</option>
            </select>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map((destination, index) => (
          <motion.div
            key={destination.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <motion.button
                  className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      destination.isFavorite
                        ? 'text-red-500 fill-current'
                        : 'text-gray-400'
                    }`}
                  />
                </motion.button>
                <motion.button
                  className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>
              <div className="absolute bottom-4 left-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getPriceColor(
                    destination.priceRange
                  )}`}
                >
                  {destination.priceRange}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {destination.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{destination.country}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">
                    {destination.rating}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {destination.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Best time: {destination.bestTime}
                  </span>
                </div>
              </div>

              <motion.button
                className="w-full py-3 maya-gradient text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Plan Trip
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDestinations.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No destinations found
          </h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </motion.div>
      )}
    </div>
  );
};

export default Destinations;
