import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Filter, 
  Search, 
  MapPin, 
  Camera,
  X,
  Send,
  ThumbsUp,
  ThumbsDown,
  Eye
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Issue {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  image_url?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  votes_up: number;
  votes_down: number;
  created_at: string;
}

interface ReportFormData {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  image?: FileList;
}

const MapPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filter, setFilter] = useState({
    status: '',
    category: '',
    priority: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();
  const { isConnected } = useAccount();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReportFormData>();

  const categories = [
    'Road Infrastructure',
    'Public Safety',
    'Utilities',
    'Environment',
    'Public Transport',
    'Housing',
    'Healthcare',
    'Education',
    'Other'
  ];

  const statusColors = {
    open: '#ef4444',
    in_progress: '#f97316',
    resolved: '#22c55e',
    closed: '#6b7280'
  };

  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    urgent: '#dc2626'
  };

  useEffect(() => {
    fetchIssues();
    getUserLocation();
  }, []);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to load issues');
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default to a central location (e.g., New York City)
          setUserLocation([40.7128, -74.0060]);
        }
      );
    } else {
      setUserLocation([40.7128, -74.0060]);
    }
  };

  const LocationMarker: React.FC = () => {
    useMapEvents({
      click(e) {
        if (user) {
          setSelectedPosition([e.latlng.lat, e.latlng.lng]);
          setShowReportForm(true);
        } else {
          toast.error('Please sign in to report issues');
        }
      },
    });

    return selectedPosition ? (
      <Marker position={selectedPosition}>
        <Popup>
          <div className="text-center">
            <p className="font-medium">New Issue Location</p>
            <p className="text-sm text-gray-600">Click "Report Issue" to continue</p>
          </div>
        </Popup>
      </Marker>
    ) : null;
  };

  const onSubmitReport = async (data: ReportFormData) => {
    if (!selectedPosition || !user) return;

    try {
      const [lat, lng] = selectedPosition;
      
      // Get address from coordinates (mock implementation)
      const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

      const issueData = {
        title: data.title,
        description: data.description,
        latitude: lat,
        longitude: lng,
        address,
        category: data.category,
        priority: data.priority,
        reporter_id: user.id,
        status: 'open' as const,
        votes_up: 0,
        votes_down: 0
      };

      const { error } = await supabase
        .from('issues')
        .insert([issueData]);

      if (error) throw error;

      toast.success('Issue reported successfully!');
      setShowReportForm(false);
      setSelectedPosition(null);
      reset();
      fetchIssues();
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error('Failed to report issue');
    }
  };

  const handleVote = async (issueId: string, voteType: 'up' | 'down') => {
    if (!user || !isConnected) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    try {
      const issue = issues.find(i => i.id === issueId);
      if (!issue) return;

      const updates = voteType === 'up' 
        ? { votes_up: issue.votes_up + 1 }
        : { votes_down: issue.votes_down + 1 };

      const { error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', issueId);

      if (error) throw error;

      toast.success(`Vote ${voteType === 'up' ? 'up' : 'down'} recorded!`);
      fetchIssues();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filter.status || issue.status === filter.status;
    const matchesCategory = !filter.category || issue.category === filter.category;
    const matchesPriority = !filter.priority || issue.priority === filter.priority;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  if (!userLocation) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 relative">
      {/* Controls */}
      <div className="absolute top-20 left-4 right-4 z-[1000] pointer-events-none">
        <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search issues..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
              className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filter.category}
              onChange={(e) => setFilter({...filter, category: e.target.value})}
              className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={userLocation}
        zoom={13}
        className="h-screen w-full"
        style={{ height: '100vh' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LocationMarker />

        {filteredIssues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
            icon={L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color: ${statusColors[issue.status]}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-2">{issue.title}</h3>
                <p className="text-gray-600 mb-2">{issue.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium text-white`} style={{backgroundColor: statusColors[issue.status]}}>
                    {issue.status}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium text-white`} style={{backgroundColor: priorityColors[issue.priority]}}>
                    {issue.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVote(issue.id, 'up')}
                      className="flex items-center space-x-1 text-green-600 hover:bg-green-50 px-2 py-1 rounded text-sm"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{issue.votes_up}</span>
                    </button>
                    <button
                      onClick={() => handleVote(issue.id, 'down')}
                      className="flex items-center space-x-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>{issue.votes_down}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedIssue(issue)}
                    className="flex items-center space-x-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Action Button */}
      {user && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (userLocation) {
              setSelectedPosition(userLocation);
              setShowReportForm(true);
            }
          }}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg z-[1000] hover:shadow-xl transition-all"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      )}

      {/* Report Form Modal */}
      <AnimatePresence>
        {showReportForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[2000]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Report Issue</h2>
                <button
                  onClick={() => {
                    setShowReportForm(false);
                    setSelectedPosition(null);
                  }}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmitReport)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Title
                  </label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    type="text"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Brief title for the issue"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Detailed description of the issue"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Category
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-400">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Priority
                  </label>
                  <select
                    {...register('priority', { required: 'Priority is required' })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  {errors.priority && (
                    <p className="mt-1 text-sm text-red-400">{errors.priority.message}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportForm(false);
                      setSelectedPosition(null);
                    }}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issue Details Modal */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[2000]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Issue Details</h2>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{selectedIssue.title}</h3>
                  <p className="text-white/70">{selectedIssue.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span 
                    className="px-3 py-1 rounded-lg text-sm font-medium text-white"
                    style={{backgroundColor: statusColors[selectedIssue.status]}}
                  >
                    {selectedIssue.status}
                  </span>
                  <span 
                    className="px-3 py-1 rounded-lg text-sm font-medium text-white"
                    style={{backgroundColor: priorityColors[selectedIssue.priority]}}
                  >
                    {selectedIssue.priority}
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium text-white">
                    {selectedIssue.category}
                  </span>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <p className="text-white/70 text-sm mb-2">Location: {selectedIssue.address}</p>
                  <p className="text-white/70 text-sm">
                    Reported: {new Date(selectedIssue.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVote(selectedIssue.id, 'up')}
                      className="flex items-center space-x-2 text-green-400 hover:bg-green-500/20 px-3 py-2 rounded-lg transition-colors"
                    >
                      <ThumbsUp className="h-5 w-5" />
                      <span>{selectedIssue.votes_up}</span>
                    </button>
                    <button
                      onClick={() => handleVote(selectedIssue.id, 'down')}
                      className="flex items-center space-x-2 text-red-400 hover:bg-red-500/20 px-3 py-2 rounded-lg transition-colors"
                    >
                      <ThumbsDown className="h-5 w-5" />
                      <span>{selectedIssue.votes_down}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapPage;