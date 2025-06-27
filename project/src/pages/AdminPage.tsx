import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  BarChart3, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  todayReports: number;
  avgResolutionTime: string;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    todayReports: 0,
    avgResolutionTime: '0h',
  });
  const [issues, setIssues] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch issues
      const { data: issuesData } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (issuesData) {
        setIssues(issuesData);
        
        const today = new Date().toDateString();
        const todayReports = issuesData.filter(
          issue => new Date(issue.created_at).toDateString() === today
        ).length;

        setStats({
          totalUsers: usersData?.length || 0,
          totalIssues: issuesData.length,
          openIssues: issuesData.filter(i => i.status === 'open').length,
          resolvedIssues: issuesData.filter(i => i.status === 'resolved').length,
          todayReports,
          avgResolutionTime: '24h', // Mock calculation
        });
      }

      if (usersData) {
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', issueId);

      if (error) throw error;

      toast.success('Issue status updated successfully');
      fetchAdminData();
    } catch (error) {
      console.error('Error updating issue status:', error);
      toast.error('Failed to update issue status');
    }
  };

  const deleteIssue = async (issueId: string) => {
    if (!confirm('Are you sure you want to delete this issue?')) return;

    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issueId);

      if (error) throw error;

      toast.success('Issue deleted successfully');
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting issue:', error);
      toast.error('Failed to delete issue');
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'issues', name: 'Issues', icon: MapPin },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      title: 'Total Issues',
      value: stats.totalIssues.toLocaleString(),
      icon: MapPin,
      color: 'from-purple-500 to-purple-600',
      change: '+8%'
    },
    {
      title: 'Open Issues',
      value: stats.openIssues.toLocaleString(),
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
      change: '-3%'
    },
    {
      title: 'Resolved Today',
      value: stats.todayReports.toLocaleString(),
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      change: '+15%'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading admin panel...</p>
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
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/70">Manage your civic platform</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`bg-gradient-to-r ${card.color} p-3 rounded-xl`}>
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

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {issues.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        issue.status === 'resolved' 
                          ? 'bg-green-500/20 text-green-400'
                          : issue.status === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {issue.status === 'resolved' ? <CheckCircle className="h-4 w-4" /> :
                         issue.status === 'in_progress' ? <Clock className="h-4 w-4" /> :
                         <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{issue.title}</p>
                        <p className="text-sm text-white/60">{issue.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/70">{new Date(issue.created_at).toLocaleDateString()}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        issue.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                        issue.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {issue.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Issues Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Issue</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Priority</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredIssues.map((issue) => (
                      <tr key={issue.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-white">{issue.title}</p>
                            <p className="text-sm text-white/60 truncate max-w-xs">{issue.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={issue.status}
                            onChange={(e) => updateIssueStatus(issue.id, e.target.value)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              issue.status === 'resolved' 
                                ? 'bg-green-500/20 text-green-400'
                                : issue.status === 'in_progress'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-orange-500/20 text-orange-400'
                            }`}
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            issue.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                            issue.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {issue.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/70">{issue.category}</td>
                        <td className="px-6 py-4 text-white/70 text-sm">
                          {new Date(issue.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-orange-400 hover:bg-orange-500/20 rounded-lg transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => deleteIssue(issue.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">User Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div key={user.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.username ? user.username[0].toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.username || 'Anonymous'}</p>
                      <p className="text-sm text-white/60">{user.role}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-white/70">
                    <div className="flex justify-between">
                      <span>Issues Reported:</span>
                      <span>{user.issues_reported || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reputation:</span>
                      <span>{user.reputation_score || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Joined:</span>
                      <span>{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-semibold text-white mb-8">Platform Settings</h3>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">General Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="text-white font-medium">Auto-approve reports</p>
                        <p className="text-white/60 text-sm">Automatically approve new issue reports</p>
                      </div>
                      <input type="checkbox" className="toggle" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="text-white font-medium">Email notifications</p>
                        <p className="text-white/60 text-sm">Send email updates to users</p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Blockchain Settings</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <label className="block text-white font-medium mb-2">Network</label>
                      <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                        <option>Base Mainnet</option>
                        <option>Base Testnet</option>
                        <option>Ethereum Mainnet</option>
                      </select>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl">
                      <label className="block text-white font-medium mb-2">Contract Address</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        placeholder="0x..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/20">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all">
                  Save Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;