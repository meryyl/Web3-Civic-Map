import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Users, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Award
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalIssues: number;
  resolvedIssues: number;
  openIssues: number;
  inProgressIssues: number;
  reputationScore: number;
  issuesReported: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalIssues: 0,
    resolvedIssues: 0,
    openIssues: 0,
    inProgressIssues: 0,
    reputationScore: 0,
    issuesReported: 0,
  });
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch all issues
      const { data: allIssues } = await supabase
        .from('issues')
        .select('*');

      // Fetch user's issues
      const { data: userIssues } = await supabase
        .from('issues')
        .select('*')
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (allIssues) {
        const totalIssues = allIssues.length;
        const resolvedIssues = allIssues.filter(issue => issue.status === 'resolved').length;
        const openIssues = allIssues.filter(issue => issue.status === 'open').length;
        const inProgressIssues = allIssues.filter(issue => issue.status === 'in_progress').length;
        const issuesReported = userIssues?.length || 0;

        setStats({
          totalIssues,
          resolvedIssues,
          openIssues,
          inProgressIssues,
          reputationScore: user.profile?.reputation_score || 0,
          issuesReported,
        });

        // Create chart data for issues by category
        const categoryData = allIssues.reduce((acc: any, issue) => {
          acc[issue.category] = (acc[issue.category] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(categoryData).map(([category, count]) => ({
          category,
          count,
        }));

        setChartData(chartData);
      }

      setRecentIssues(userIssues || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Issues',
      value: stats.totalIssues.toLocaleString(),
      icon: MapPin,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      title: 'Resolved Issues',
      value: stats.resolvedIssues.toLocaleString(),
      icon: CheckCircle,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      change: '+8%'
    },
    {
      title: 'Open Issues',
      value: stats.openIssues.toLocaleString(),
      icon: AlertTriangle,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      change: '-3%'
    },
    {
      title: 'Reputation Score',
      value: stats.reputationScore.toLocaleString(),
      icon: Award,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      change: '+15%'
    }
  ];

  const pieData = [
    { name: 'Open', value: stats.openIssues, color: '#f59e0b' },
    { name: 'In Progress', value: stats.inProgressIssues, color: '#3b82f6' },
    { name: 'Resolved', value: stats.resolvedIssues, color: '#10b981' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.profile?.username || user?.email}
            </h1>
            <p className="text-white/70">
              Here's what's happening in your community today
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.color} p-3 rounded-xl`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-lg ${
                    card.change.startsWith('+') 
                      ? 'text-green-400 bg-green-500/20' 
                      : 'text-red-400 bg-red-500/20'
                  }`}>
                    {card.change}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
                  <p className="text-white/70 text-sm">{card.title}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Issues by Category */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Issues by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="category" 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Status Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Your Recent Issues</h3>
          
          {recentIssues.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/70">No issues reported yet</p>
              <p className="text-white/50 text-sm">Start by reporting your first civic issue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-white">{issue.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        issue.status === 'resolved' 
                          ? 'bg-green-500/20 text-green-400'
                          : issue.status === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {issue.status}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        issue.priority === 'urgent'
                          ? 'bg-red-500/20 text-red-400'
                          : issue.priority === 'high'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {issue.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-3">{issue.description}</p>
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>{issue.category}</span>
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;