import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden font-sans">
      {/* Background Animated Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full relative z-10 p-4"
      >
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl p-10 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>

          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-xl shadow-blue-900/20 mb-6 group-hover:rotate-6 transition-transform duration-500"
            >
              <Package size={40} className="text-white" strokeWidth={2.5} />
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">QUẢN LÝ KHO</h1>
            <p className="text-gray-400 font-medium">Hệ thống vận hành thông minh</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3 text-red-400 text-sm font-semibold"
              >
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] ml-2">
                Tài khoản
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white/[0.08] outline-none transition-all text-white font-medium placeholder:text-gray-600"
                  placeholder="admin_qlk"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] ml-2">
                Mật khẩu
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white/[0.08] outline-none transition-all text-white font-medium placeholder:text-gray-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full relative group mt-4 overflow-hidden rounded-2xl font-black text-sm tracking-widest text-white h-14 shadow-lg shadow-blue-900/20 ${
                loading ? 'cursor-not-allowed' : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:scale-110 transition-transform duration-500"></div>
              <span className="relative flex items-center justify-center gap-2 uppercase">
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>ĐĂNG NHẬP <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
            </motion.button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-500 text-sm font-medium">
              Chưa có quyền truy cập?{' '}
              <Link to="/register" className="text-blue-500 font-bold hover:text-blue-400 transition-colors decoration-2 underline-offset-4">
                Yêu cầu tài khoản
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mt-8 opacity-50">
          © 2026 Warehouse Management System
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
