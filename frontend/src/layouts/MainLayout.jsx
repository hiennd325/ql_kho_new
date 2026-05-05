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
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: isSidebarOpen ? 300 : 96 }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="bg-white border-r border-slate-200 flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] sticky top-0 h-screen"
      >
        <div className="h-20 flex items-center px-6 justify-between border-b border-slate-50/50">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
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
                <span className="font-black text-xl tracking-tighter text-slate-900 whitespace-nowrap">QL KHO <span className="text-blue-600">PRO</span></span>
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
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center rounded-2xl transition-all duration-200 ${
                  isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-1'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                } ${isSidebarOpen ? 'p-3.5 px-4' : 'p-3.5 justify-center'}`}
              >
                <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500 transition-colors'}`}>
                  {item.icon}
                </div>

                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-4 font-bold tracking-tight whitespace-nowrap flex-1"
                  >
                    {item.name}
                  </motion.span>
                )}

                {isActive && isSidebarOpen && (
                  <motion.div layoutId="active-indicator">
                    <ChevronRight size={14} className="text-white/70" />
                  </motion.div>
                )}

                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center w-full p-3.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all font-bold group mb-2"
          >
            <div className="group-hover:rotate-180 transition-transform duration-500">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </div>
            {isSidebarOpen && <span className="ml-4">Thu gọn</span>}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all font-bold group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="ml-4">Đăng xuất</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/60 h-20 flex justify-between items-center px-10 z-20 sticky top-0">
          <div className="flex items-center gap-10 flex-1">
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                {navItems.find(item => item.path === location.pathname)?.name || 'Trang chủ'}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">Hệ thống trực tuyến</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center relative max-w-md w-full ml-4">
              <Search size={18} className="absolute left-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, đơn hàng..."
                className="w-full bg-slate-100/50 border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 py-2.5 pl-12 pr-4 rounded-2xl outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

            <div className="flex items-center gap-4 group cursor-pointer pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors">{user?.username}</p>
                <p className="text-[10px] text-slate-400 mt-1.5 font-black uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded-md inline-block">{user?.role}</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/20 ring-4 ring-white group-hover:ring-blue-50 transition-all"
              >
                {user?.username?.[0].toUpperCase()}
              </motion.div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-10 custom-scrollbar">
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
