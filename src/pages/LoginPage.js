import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, ShieldAlert } from 'lucide-react';
import api from '../utils/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminExists, setAdminExists] = useState(true);
  const [isSetupMode, setIsSetupMode] = useState(false);
  
  // Setup fields
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { exists } = await api.auth.adminExists();
      setAdminExists(exists);
    } catch (error) {
      console.error('Failed to check admin status:', error);
    }
  };

  useEffect(() => {
    if (user && user !== false) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(email, password);
      toast.success('Login successful!');
      navigate(userData.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.setupAdmin({
        name: setupName,
        email: setupEmail,
        password: setupPassword
      });
      toast.success('Admin account created! Please log in.');
      setAdminExists(true);
      setIsSetupMode(false);
      setEmail(setupEmail);
    } catch (error) {
      toast.error(error.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Third Eye Computer Education
          </h1>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden">
          {/* Admin Setup Toggle */}
          {!adminExists && !isSetupMode && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <p className="text-xs text-amber-500 font-medium">No administrator found in the system.</p>
              </div>
              <button 
                onClick={() => setIsSetupMode(true)}
                className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap"
              >
                Create Admin
              </button>
            </div>
          )}

          {isSetupMode ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-foreground mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Initial Admin Setup
                </h2>
                <p className="text-muted-foreground text-sm">Create the first administrator account</p>
              </div>

              <form onSubmit={handleAdminSetup} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
                  <input
                    type="text"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Admin Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
                  <input
                    type="password"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSetupMode(false)}
                    className="flex-1 bg-secondary text-secondary-foreground font-medium py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-primary text-primary-foreground font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Register Admin'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-foreground mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Welcome Back
                </h2>
                <p className="text-muted-foreground text-sm">Sign in to continue your learning</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-11 pr-12 py-3 text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    'Signing in...'
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
