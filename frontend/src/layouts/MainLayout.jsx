import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Box,
  Warehouse,
  Users,
  Truck,
  ClipboardList,
  LogOut,
  Package,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Sản phẩm', path: '/products', icon: <Box size={18} /> },
    { name: 'Kho bãi', path: '/warehouses', icon: <Warehouse size={18} /> },
    { name: 'Nhà cung cấp', path: '/suppliers', icon: <Truck size={18} /> },
    { name: 'Nhập xuất tồn', path: '/inventory', icon: <Package size={18} /> },
    { name: 'Kiểm kê báo cáo', path: '/reports', icon: <ClipboardList size={18} /> },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Người dùng', path: '/users', icon: <Users size={18} /> });
  }

  const currentPageName = navItems.find(item => item.path === location.pathname)?.name || 'Trang chủ';

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden font-sans selection:bg-[#FF5E3A]/12 selection:text-[#FF5E3A] transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} bg-transparent`}>
      
      {/* Top Header */}
      <header className={`${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200/60'} backdrop-blur-xl border-b fixed w-full top-0 left-0 z-50 transition-colors duration-300 shadow-sm`}>
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <Menu size={20} />
            </button>

            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#FF5E3A] to-[#e04520] p-2.5 rounded-xl shadow-lg shadow-[#FF5E3A]/20">
                <Package size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <span className={`font-black text-xl tracking-tighter whitespace-nowrap hidden sm:block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                QL KHO <span className="text-[#FF5E3A]">PRO</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 flex-1 justify-center px-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                    ? 'bg-[#FF5E3A] text-white shadow-md shadow-[#FF5E3A]/20'
                    : isDarkMode
                      ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#FF5E3A] transition-colors'}`}>
                    {item.icon}
                  </div>
                  <span className="ml-2.5 font-bold tracking-tight text-sm whitespace-nowrap">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-[#FF5E3A]/10 text-[#FF5E3A] hover:bg-[#FF5E3A]/20'}`}
              title={isDarkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="hidden sm:flex items-center gap-3 group">
              <div className="text-right">
                <p className={`text-sm font-black leading-none group-hover:text-[#FF5E3A] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.username}</p>
                <p className={`text-[10px] mt-1 font-black uppercase tracking-tighter px-1.5 py-0.5 rounded inline-block ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF5E3A] to-[#e04520] rounded-xl flex items-center justify-center text-white font-black shadow-md ring-2 ring-white/50">
                {user?.username?.[0].toUpperCase()}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'text-slate-400 hover:bg-rose-900/30 hover:text-rose-400' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'}`}
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed top-0 left-0 h-screen w-72 z-50 flex flex-col shadow-2xl ${isDarkMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-slate-200'}`}
            >
              <div className={`h-20 flex items-center justify-between px-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={`font-black text-xl tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>QL KHO <span className="text-[#FF5E3A]">PRO</span></span>
                <button onClick={closeMobileMenu} className="p-2 text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FF5E3A] to-[#e04520] rounded-xl flex items-center justify-center text-white text-lg font-black shadow-md">
                    {user?.username?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.username}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase">{user?.role}</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                        isActive
                        ? 'bg-[#FF5E3A] text-white shadow-md'
                        : isDarkMode
                          ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className={`${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {item.icon}
                      </div>
                      <span className="ml-3 font-bold">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col relative pt-20">
        {/* Page Header (Title + Status) */}
        <div className="px-4 sm:px-6 lg:px-10 pt-6 pb-2 max-w-[1500px] w-full mx-auto">
          <div className="flex flex-col">
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {currentPageName}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <p className="text-xs text-slate-400 font-black uppercase tracking-[0.15em]">Hệ thống trực tuyến</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-10 transition-colors duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-[1500px] w-full mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
};

export default MainLayout;
