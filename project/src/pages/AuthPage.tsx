import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import toast from 'react-hot-toast';

interface AuthFormData {
  email: string;
  password: string;
  username?: string;
}

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, loading } = useAuth();
  const { connected, connect } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthFormData>();

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data: AuthFormData) => {
    try {
      if (isLogin) {
        await signIn(data.email, data.password);
        navigate(from, { replace: true });
      } else {
        if (!data.username) {
          toast.error('Username is required for registration');
          return;
        }
        await signUp(data.email, data.password, data.username);
      }
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'user') => {
    const credentials = {
      admin: { email: 'admin@civic-map.com', password: 'AdminPass123!' },
      user: { email: 'demo@civic-map.com', password: 'UserDemo456!' }
    };

    try {
      await signIn(credentials[role].email, credentials[role].password);
      navigate(from, { replace: true });
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl w-fit mx-auto mb-4"
            >
              <MapPin className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Join CivicMap'}
            </h1>
            <p className="text-white/70">
              {isLogin 
                ? 'Sign in to your account to continue' 
                : 'Create an account to start reporting issues'
              }
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mb-6 space-y-2">
            <p className="text-white/70 text-sm text-center mb-3">Quick Demo Access:</p>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 px-3 py-2 rounded-lg text-sm font-medium hover:from-purple-500/30 hover:to-pink-500/30 transition-all disabled:opacity-50"
              >
                Admin Demo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDemoLogin('user')}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 px-3 py-2 rounded-lg text-sm font-medium hover:from-blue-500/30 hover:to-cyan-500/30 transition-all disabled:opacity-50"
              >
                User Demo
              </motion.button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/70">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username (Sign Up Only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    {...register('username', { 
                      required: !isLogin ? 'Username is required' : false,
                      minLength: { value: 3, message: 'Username must be at least 3 characters' }
                    })}
                    type="text"
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Wallet Connection Notice */}
            {!connected && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <p className="text-orange-300 text-sm">
                  💡 Connect your wallet after authentication for full Web3 features.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </motion.button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-white/70">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleMode}
                className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;