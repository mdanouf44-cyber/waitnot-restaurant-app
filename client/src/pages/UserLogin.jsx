import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function UserLogin() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // true for login, false for register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/users/login', {
        username,
        password
      });

      if (data.success) {
        // Store token and user info
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Navigate to home
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/users/register', {
        username,
        password,
        name,
        phone
      });

      if (data.success) {
        setSuccess('Registration successful! Please login.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <User size={48} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? 'Login to your account' : 'Register to get started'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
                Username
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-red-600 font-semibold text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
            >
              Continue as Guest
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-primary hover:underline font-semibold"
              >
                Don't have an account? Register
              </button>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
                Username
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-red-600 font-semibold text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                  setSuccess('');
                }}
                className="text-primary hover:underline font-semibold"
              >
                Already have an account? Login
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
