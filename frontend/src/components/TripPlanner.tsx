import React, { useState, useRef } from 'react';
import { aiService } from '../api/services';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Plane,
  Clock,
  Users,
  Star,
  Upload,
  Image as ImageIcon,
  Video,
  X,
  Loader2
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
  const [mediaUrl, setMediaUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{file: File; preview: string; type: 'image' | 'video'}[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAnalyzeMedia = async () => {
    if (!mediaUrl && !videoUrl) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const { data } = await aiService.analyzeMedia({
        prompt: `Analyze this media for trip planning to ${newTrip.destination || 'the shown place'}.` ,
        imageUrls: mediaUrl ? [mediaUrl] : [],
        videoUrl: videoUrl || null,
        options: {
          enableKvCacheOffload: true,
          attentionImpl: 'flash-attn-3'
        }
      });
      setAnalysis(data?.analysis || 'No analysis available');
    } catch (err) {
      setAnalysis('Failed to analyze media. Please try again.');
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    addFiles(newFiles);
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);

    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        setFilePreviews(prev => [...prev, { 
          file, 
          preview: reader.result as string, 
          type 
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f !== fileToRemove));
    setFilePreviews(prev => prev.filter(p => p.file !== fileToRemove));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleUploadAndAnalyze = async () => {
    if (uploadedFiles.length === 0) return;
    
    setAnalyzing(true);
    setAnalysis(null);
    setUploadProgress(0);

    try {
      const { data } = await aiService.uploadAndAnalyzeFiles(
        uploadedFiles,
        newTrip.destination || undefined,
        `Analyze these ${uploadedFiles.length} file(s) for trip planning insights.`
      );
      
      setUploadProgress(100);
      setAnalysis(data?.analysis || 'No analysis available');
    } catch (err) {
      setAnalysis('Failed to upload and analyze files. Please try again.');
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setAnalyzing(false);
      setTimeout(() => setUploadProgress(0), 1000);
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://...jpg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (optional)</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://...mp4"
              />
            </div>

            {/* File Upload Section - NEW */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📸 Upload Images/Videos (Enhanced Multimodal AI)
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-xs text-gray-500">
                  Images (JPG, PNG, WEBP) and Videos (MP4, MOV) up to 10MB each
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* File Previews */}
            {filePreviews.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Uploaded Files ({filePreviews.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {filePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        {preview.type === 'image' ? (
                          <img
                            src={preview.preview}
                            alt={preview.file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Video className="w-8 h-8 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(preview.file);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {preview.file.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="md:col-span-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <motion.button
              onClick={handleAddTrip}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Trip
            </motion.button>
            
            {/* URL-based analysis */}
            {(mediaUrl || videoUrl) && (
              <motion.button
                onClick={handleAnalyzeMedia}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing URLs...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    Analyze URL Media
                  </>
                )}
              </motion.button>
            )}
            
            {/* File upload analysis */}
            {uploadedFiles.length > 0 && (
              <motion.button
                onClick={handleUploadAndAnalyze}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-60 flex items-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading & Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload & Analyze ({uploadedFiles.length})
                  </>
                )}
              </motion.button>
            )}
            
            <motion.button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          </div>
          {analysis && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-lg text-sm text-purple-900 whitespace-pre-wrap">
              {analysis}
            </div>
          )}
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
