import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  X
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col z-30`}>
        <div className="p-8 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                <Package size={22} className="text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-900">QL KHO</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-all active:scale-90"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-3.5 rounded-2xl transition-all duration-300 group relative ${
                location.pathname === item.path
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-1'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center">
                <span className={`${location.pathname === item.path ? 'text-white' : 'text-slate-400 group-hover:text-blue-500 transition-colors'}`}>
                  {item.icon}
                </span>
                {isSidebarOpen && <span className="ml-4 font-bold tracking-tight">{item.name}</span>}
              </div>
              {location.pathname === item.path && isSidebarOpen && (
                <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-4 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all duration-300 font-bold group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="ml-4">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex justify-between items-center px-10 z-20 sticky top-0">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {navItems.find(item => item.path === location.pathname)?.name || 'Trang chủ'}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Hệ thống quản lý kho hàng v2.0</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors">{user?.username}</p>
                <p className="text-[10px] text-slate-400 mt-1.5 font-black uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded-md inline-block">{user?.role}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100 ring-4 ring-white group-hover:scale-105 transition-all">
                {user?.username?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
