import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Lock, User, ArrowRight, AlertCircle, Loader2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) { setError('Tên đăng nhập không được để trống'); return; }
    if (!password) { setError('Mật khẩu không được để trống'); return; }
    if (password.length <= 8) { setError('Độ dài mật khẩu phải lớn hơn 8 ký tự'); return; }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!passwordRegex.test(password)) { setError('Mật khẩu phải chứa cả chữ và số'); return; }
    if (!confirmPassword) { setError('Xác nhận mật khẩu không được để trống'); return; }
    if (password !== confirmPassword) { setError('Mật khẩu xác nhận không trùng khớp'); return; }

    setLoading(true);
    try {
      await api.post('/auth/register', { username, password, confirmPassword });
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden font-sans transition-colors duration-300 bg-transparent`}>
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-2xl transition-all duration-300 ${isDarkMode ? 'bg-white/5 text-yellow-400 hover:bg-white/10' : 'bg-white text-[#000000] hover:bg-[#000000]/10 shadow-md'}`}
          title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Background blobs */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse ${isDarkMode ? 'bg-[#000000]/15' : 'bg-[#000000]/8'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse ${isDarkMode ? 'bg-[#000000]/15' : 'bg-[#000000]/6'}`} style={{ animationDelay: '1s' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-md w-full relative z-10 p-4"
      >
        <div className={`backdrop-blur-xl border rounded-[2.5rem] shadow-2xl p-10 overflow-hidden relative group transition-colors duration-300 ${isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-white/85 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-slate-200/50'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#000000]/5 to-transparent pointer-events-none"></div>

          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#000000] to-[#000000] rounded-3xl shadow-xl shadow-[#000000]/20 mb-6 group-hover:rotate-6 transition-transform duration-500"
            >
              <Package size={40} className="text-white" strokeWidth={2.5} />
            </motion.div>
            <h1 className={`text-3xl font-black tracking-tighter mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>ĐĂNG KÝ</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'} font-medium`}>Tạo tài khoản mới</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Tài khoản', value: username, setter: setUsername, type: 'text', placeholder: 'Nhập tên đăng nhập', Icon: User },
              { label: 'Mật khẩu', value: password, setter: setPassword, type: 'password', placeholder: 'Nhập mật khẩu', Icon: Lock },
              { label: 'Xác nhận mật khẩu', value: confirmPassword, setter: setConfirmPassword, type: 'password', placeholder: 'Nhập lại mật khẩu', Icon: Lock },
            ].map(({ label, value, setter, type, placeholder, Icon }) => (
              <div key={label} className="space-y-2">
                <label className="text-[11px] font-black text-[#000000] uppercase tracking-[0.2em] ml-2">{label}</label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#000000] transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                    <Icon size={18} />
                  </div>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className={`w-full border rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-[#000000]/50 focus:border-[#000000] outline-none transition-all font-medium placeholder:text-gray-600 ${isDarkMode ? 'bg-white/[0.05] border-white/10 text-white focus:bg-white/[0.08]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                    placeholder={placeholder}
                    required
                  />
                </div>
              </div>
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full relative group mt-4 overflow-hidden rounded-2xl font-black text-sm tracking-widest text-white h-14 shadow-lg shadow-[#000000]/20 ${loading ? 'cursor-not-allowed' : ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#000000] to-[#000000] group-hover:scale-110 transition-transform duration-500"></div>
              <span className="relative flex items-center justify-center gap-2 uppercase">
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>ĐĂNG KÝ <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className={`${isDarkMode ? 'text-gray-500' : 'text-slate-500'} text-sm font-medium`}>
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-[#000000] font-bold hover:text-[#000000] transition-colors decoration-2 underline-offset-4">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>

        <p className={`text-center text-[10px] font-black uppercase tracking-[0.3em] mt-8 opacity-50 ${isDarkMode ? 'text-gray-600' : 'text-slate-400'}`}>
          © 2026 Warehouse Management System
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
