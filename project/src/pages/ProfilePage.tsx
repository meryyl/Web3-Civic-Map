import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Wallet, 
  Award, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface ProfileFormData {
  username: string;
  bio?: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { address, isConnected } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      username: user?.profile?.username || '',
      bio: user?.profile?.bio || '',
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({
        username: data.username,
        bio: data.bio,
        wallet_address: isConnected ? address : undefined,
      });
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const stats = [
    {
      label: 'Issues Reported',
      value: user?.profile?.issues_reported || 0,
      icon: MapPin,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Issues Resolved',
      value: user?.profile?.issues_resolved || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Reputation Score',
      value: user?.profile?.reputation_score || 0,
      icon: Award,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Community Rank',
      value: '#42',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const achievements = [
    {
      title: 'First Reporter',
      description: 'Reported your first civic issue',
      icon: MapPin,
      earned: true,
      date: '2024-01-15'
    },
    {
      title: 'Community Helper',
      description: 'Helped resolve 5 community issues',
      icon: CheckCircle,
      earned: user?.profile?.issues_resolved >= 5,
      date: user?.profile?.issues_resolved >= 5 ? '2024-02-20' : null
    },
    {
      title: 'Reputation Builder',
      description: 'Reached 100 reputation points',
      icon: Award,
      earned: (user?.profile?.reputation_score || 0) >= 100,
      date: (user?.profile?.reputation_score || 0) >= 100 ? '2024-03-10' : null
    },
    {
      title: 'Blockchain Pioneer',
      description: 'Connected wallet and made first transaction',
      icon: Wallet,
      earned: isConnected,
      date: isConnected ? '2024-01-20' : null
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'activity', name: 'Activity' },
    { id: 'achievements', name: 'Achievements' },
    { id: 'settings', name: 'Settings' }
  ];

  return (
    <div className="min-h-screen pt-16 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                {user?.profile?.username ? user.profile.username[0].toUpperCase() : user?.email[0].toUpperCase()}
              </div>
              <button className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {!isEditing ? (
                <>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {user?.profile?.username || 'Anonymous User'}
                  </h1>
                  <p className="text-white/70 mb-4">{user?.email}</p>
                  {user?.profile?.bio && (
                    <p className="text-white/80 mb-4">{user.profile.bio}</p>
                  )}
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-white/60">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Joined January 2024</span>
                    </div>
                    {isConnected && (
                      <div className="flex items-center space-x-2">
                        <Wallet className="h-4 w-4" />
                        <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <input
                      {...register('username', { required: 'Username is required' })}
                      type="text"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Username"
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                    )}
                  </div>
                  <div>
                    <textarea
                      {...register('bio')}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              )}

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center"
              >
                <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl w-fit mx-auto mb-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Profile Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Account Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                    <Mail className="h-5 w-5 text-white/60" />
                    <div>
                      <p className="text-white/70 text-sm">Email</p>
                      <p className="text-white">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                    <User className="h-5 w-5 text-white/60" />
                    <div>
                      <p className="text-white/70 text-sm">Role</p>
                      <p className="text-white capitalize">{user?.role}</p>
                    </div>
                  </div>
                  {isConnected && (
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <Wallet className="h-5 w-5 text-white/60" />
                      <div>
                        <p className="text-white/70 text-sm">Wallet</p>
                        <p className="text-white font-mono">{address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-white text-sm">Reported a pothole on Main Street</p>
                    <p className="text-white/60 text-xs">2 days ago</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-white text-sm">Voted on traffic light issue</p>
                    <p className="text-white/60 text-xs">1 week ago</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-white text-sm">Connected wallet</p>
                    <p className="text-white/60 text-xs">2 weeks ago</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.title}
                    className={`p-4 rounded-xl border transition-all ${
                      achievement.earned
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${
                        achievement.earned
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                          : 'bg-white/20'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          achievement.earned ? 'text-white' : 'text-white/60'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-1 ${
                          achievement.earned ? 'text-white' : 'text-white/60'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-sm mb-2 ${
                          achievement.earned ? 'text-white/80' : 'text-white/50'
                        }`}>
                          {achievement.description}
                        </p>
                        {achievement.earned && achievement.date && (
                          <p className="text-xs text-white/60">
                            Earned on {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Account Settings</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Email notifications</p>
                      <p className="text-white/60 text-sm">Receive updates via email</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Push notifications</p>
                      <p className="text-white/60 text-sm">Get notified about issue updates</p>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-white mb-4">Privacy</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Public profile</p>
                      <p className="text-white/60 text-sm">Make your profile visible to others</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Show wallet address</p>
                      <p className="text-white/60 text-sm">Display your wallet address publicly</p>
                    </div>
                    <input type="checkbox" className="toggle" />
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

export default ProfilePage;