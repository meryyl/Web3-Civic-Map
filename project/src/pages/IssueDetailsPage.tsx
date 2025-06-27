import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  ThumbsUp, 
  ThumbsDown,
  MessageCircle,
  Share2,
  Flag,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

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
  updated_at: string;
}

const IssueDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isConnected } = useAccount();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchIssue();
    }
  }, [id]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setIssue(data);
    } catch (error) {
      console.error('Error fetching issue:', error);
      toast.error('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user || !isConnected || !issue) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    if (hasVoted) {
      toast.error('You have already voted on this issue');
      return;
    }

    try {
      const updates = voteType === 'up' 
        ? { votes_up: issue.votes_up + 1 }
        : { votes_down: issue.votes_down + 1 };

      const { error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', issue.id);

      if (error) throw error;

      setIssue({ ...issue, ...updates });
      setHasVoted(true);
      toast.success(`Vote ${voteType === 'up' ? 'up' : 'down'} recorded!`);
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-orange-400 bg-orange-500/20';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20';
      case 'resolved': return 'text-green-400 bg-green-500/20';
      case 'closed': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'urgent': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return AlertTriangle;
      case 'in_progress': return Clock;
      case 'resolved': return CheckCircle;
      case 'closed': return CheckCircle;
      default: return AlertTriangle;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Issue Not Found</h2>
          <p className="text-white/70 mb-6">The issue you're looking for doesn't exist.</p>
          <Link
            to="/map"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Map</span>
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(issue.status);

  return (
    <div className="min-h-screen pt-16 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link
            to="/map"
            className="inline-flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Map</span>
          </Link>
        </motion.div>

        {/* Issue Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-4">{issue.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(issue.status)}`}>
                  <StatusIcon className="h-4 w-4" />
                  <span className="capitalize">{issue.status.replace('_', ' ')}</span>
                </span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getPriorityColor(issue.priority)}`}>
                  {issue.priority.toUpperCase()} Priority
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium text-white">
                  {issue.category}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <Share2 className="h-5 w-5 text-white" />
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <Flag className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Issue Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/70">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{issue.address}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Reported {new Date(issue.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Community Reporter</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
              <p className="text-white/80 leading-relaxed">{issue.description}</p>
            </motion.div>

            {/* Image */}
            {issue.image_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Photo Evidence</h2>
                <img
                  src={issue.image_url}
                  alt="Issue evidence"
                  className="w-full rounded-xl"
                />
              </motion.div>
            )}

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Community Discussion</h2>
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/70">No comments yet</p>
                <p className="text-white/50 text-sm">Be the first to share your thoughts</p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voting */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Community Voting</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleVote('up')}
                  disabled={hasVoted || !isConnected}
                  className="w-full flex items-center justify-between p-4 bg-green-500/20 hover:bg-green-500/30 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <ThumbsUp className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">Support</span>
                  </div>
                  <span className="text-green-400 font-bold">{issue.votes_up}</span>
                </button>
                <button
                  onClick={() => handleVote('down')}
                  disabled={hasVoted || !isConnected}
                  className="w-full flex items-center justify-between p-4 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <ThumbsDown className="h-5 w-5 text-red-400" />
                    <span className="text-red-400 font-medium">Oppose</span>
                  </div>
                  <span className="text-red-400 font-bold">{issue.votes_down}</span>
                </button>
              </div>
              {!isConnected && (
                <p className="text-white/60 text-sm mt-3 text-center">
                  Connect your wallet to vote
                </p>
              )}
            </motion.div>

            {/* Issue Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Issue Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Total Votes:</span>
                  <span className="text-white font-medium">{issue.votes_up + issue.votes_down}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Support Rate:</span>
                  <span className="text-white font-medium">
                    {issue.votes_up + issue.votes_down > 0 
                      ? Math.round((issue.votes_up / (issue.votes_up + issue.votes_down)) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Last Updated:</span>
                  <span className="text-white font-medium">
                    {new Date(issue.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Location</h3>
              <div className="space-y-2 text-sm">
                <p className="text-white/70">Address:</p>
                <p className="text-white">{issue.address}</p>
                <p className="text-white/70 mt-3">Coordinates:</p>
                <p className="text-white font-mono text-xs">
                  {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}
                </p>
              </div>
              <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-xl font-medium transition-all">
                View on Map
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsPage;