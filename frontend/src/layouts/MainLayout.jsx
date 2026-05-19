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
  Search,
  ChevronRight,
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
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 1024);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth > 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
        setIsMobileMenuOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Sản phẩm', path: '/products', icon: <Box size={20} /> },
    { name: 'Kho bãi', path: '/warehouses', icon: <Warehouse size={20} /> },
    { name: 'Nhà cung cấp', path: '/suppliers', icon: <Truck size={20} /> },
    { name: 'Nhập xuất tồn', path: '/inventory', icon: <Package size={20} /> },
    { name: 'Kiểm kê báo cáo', path: '/reports', icon: <ClipboardList size={20} /> },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Người dùng', path: '/users', icon: <Users size={20} /> });
  }

  // On mobile: sidebar is fixed overlay, width always 300, hidden via translateX
  // On desktop: sidebar is sticky, width 300 or 96 based on isSidebarOpen
  const sidebarWidth = isMobile ? 300 : (isSidebarOpen ? 300 : 96);
  const sidebarX = (isMobile && !isMobileMenuOpen) ? -300 : 0;
  const isOpen = isSidebarOpen || isMobileMenuOpen;

  return (
    <div className={`min-h-screen flex overflow-x-hidden font-sans selection:bg-blue-100 selection:text-blue-700 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth, x: sidebarX }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className={`${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-[4px_0_24px_rgba(0,0,0,0.2)]' : 'bg-white border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)]'} border-r flex flex-col z-50 ${isMobile ? 'fixed' : 'sticky'} top-0 h-screen transition-colors duration-300 shrink-0`}
      >
        <div className={`h-20 flex items-center px-6 justify-between border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-50/50'}`}>
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 overflow-hidden"
              >
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                  <Package size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <span className={`font-black text-xl tracking-tighter whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>QL KHO <span className="text-blue-600">PRO</span></span>
              </motion.div>
            ) : (
              <motion.div
                key="logo-mini"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-200 mx-auto"
              >
                <Package size={20} className="text-white" strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
          {isMobileMenuOpen && (
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`group relative flex items-center rounded-2xl transition-all duration-200 ${
                  isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-1'
                  : isDarkMode
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                } ${isOpen ? 'p-3.5 px-4' : 'p-3.5 justify-center'}`}
              >
                <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500 transition-colors'}`}>
                  {item.icon}
                </div>

                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-4 font-bold tracking-tight whitespace-nowrap flex-1"
                  >
                    {item.name}
                  </motion.span>
                )}

                {isActive && isOpen && (
                  <motion.div layoutId="active-indicator">
                    <ChevronRight size={14} className="text-white/70" />
                  </motion.div>
                )}

                {!isOpen && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-50 dark:border-slate-800">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`hidden lg:flex items-center w-full p-3.5 rounded-2xl transition-all font-bold group mb-2 ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <div className="group-hover:rotate-180 transition-transform duration-500">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </div>
            {isSidebarOpen && <span className="ml-4">Thu gọn</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`flex items-center w-full p-3.5 rounded-2xl transition-all font-bold group ${isDarkMode ? 'text-slate-400 hover:bg-rose-900/20 hover:text-rose-400' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'}`}
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="ml-4">Đăng xuất</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className={`${isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white/70 border-slate-200/60'} backdrop-blur-md border-b h-20 flex justify-between items-center px-4 sm:px-6 lg:px-10 z-20 sticky top-0 transition-colors duration-300`}>
          <div className="flex items-center gap-4 sm:gap-10 flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <Menu size={20} />
            </button>

            <div className="flex flex-col">
              <h1 className={`text-lg sm:text-xl font-black tracking-tight leading-none uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {navItems.find(item => item.path === location.pathname)?.name || 'Trang chủ'}
              </h1>
              <div className="hidden xs:flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Hệ thống trực tuyến</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center relative max-w-md w-full ml-4">
              <Search size={18} className="absolute left-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, đơn hàng..."
                className={`w-full border border-transparent focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 py-2.5 pl-12 pr-4 rounded-2xl outline-none transition-all text-sm font-medium ${isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-slate-100/50 text-slate-900'}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-5">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              title={isDarkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="flex items-center gap-3 sm:gap-4 group cursor-pointer">
              <div className="text-right hidden md:block">
                <p className={`text-sm font-black leading-none group-hover:text-blue-600 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.username}</p>
                <p className={`text-[10px] mt-1.5 font-black uppercase tracking-tighter px-2 py-0.5 rounded-md inline-block ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>{user?.role}</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/20 ring-4 ring-white group-hover:ring-blue-50 transition-all"
              >
                {user?.username?.[0].toUpperCase()}
              </motion.div>
            </div>
          </div>
        </header>

        <div className={`flex-1 overflow-auto p-4 sm:p-6 lg:p-10 custom-scrollbar transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-[#f8fafc]'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "circOut" }}
              className="max-w-[1500px] mx-auto"
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
