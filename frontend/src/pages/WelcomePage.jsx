import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ArrowRight, ShieldCheck, Warehouse, BarChart3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const WelcomePage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen relative overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-slate-900'} bg-transparent`}>
      
      {/* Background radial gradient glow (similar to horizon_dynamic_vibrant_glassmorphism_1 style) */}
      <div 
        className="absolute inset-0 -z-10 opacity-70 transition-all duration-700"
        style={{
          background: isDarkMode 
            ? 'radial-gradient(circle at 50% 30%, rgba(255, 94, 58, 0.15) 0%, rgba(192, 132, 252, 0.08) 35%, rgba(56, 189, 248, 0.03) 70%, transparent 100%)'
            : 'radial-gradient(circle at 50% 30%, rgba(255, 94, 58, 0.1) 0%, rgba(192, 132, 252, 0.06) 40%, rgba(56, 189, 248, 0.02) 80%, transparent 100%)'
        }}
      />

      {/* Floating abstract decorative objects */}
      <div className={`absolute top-[10%] left-[-5%] w-[35%] h-[35%] rounded-full blur-[140px] animate-pulse pointer-events-none ${isDarkMode ? 'bg-[#000000]/10' : 'bg-[#000000]/5'}`} />
      <div className={`absolute bottom-[5%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[140px] animate-pulse pointer-events-none ${isDarkMode ? 'bg-[#000000]/8' : 'bg-[#000000]/3'}`} style={{ animationDelay: '2s' }} />

      {/* Header / Navbar */}
      <header className="sticky top-4 z-50 px-4 sm:px-6">
        <div className={`max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border backdrop-blur-md rounded-2xl transition-all duration-300 ${isDarkMode ? 'border-white/5 bg-black/40' : 'border-slate-200/60 bg-white/80'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#000000] to-[#000000] p-2.5 rounded-2xl shadow-lg shadow-[#000000]/20">
              <Package size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-black text-xl tracking-tighter">QL KHO <span className="text-[#000000]">PRO</span></span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 text-yellow-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#000000] hover:bg-[#000000] text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#000000]/20 hover:scale-[1.02] active:scale-95"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24 flex flex-col items-center justify-center text-center relative">
        
        {/* Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tighter max-w-4xl mb-6 leading-tight"
        >
          Vận hành kho hàng <span className="bg-gradient-to-r from-[#000000] to-[#6b7280] bg-clip-text text-transparent">thông minh & tối ưu</span>
        </motion.h1>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-20"
        >
          <button 
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#000000] to-[#000000] text-white font-bold px-8 py-4 rounded-full hover:scale-105 transition-all shadow-lg shadow-[#000000]/30 group"
          >
            Bắt đầu sử dụng
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button 
            onClick={() => navigate('/register')}
            className={`font-bold px-8 py-4 rounded-full border transition-all hover:bg-[#000000]/5 hover:border-[#000000]/50 ${isDarkMode ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-700 shadow-sm'}`}
          >
            Yêu cầu tài khoản
          </button>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl text-left"
        >
          {[
            {
              icon: Warehouse,
              title: "Quản lý Đa Kho Hàng",
              desc: "Giám sát thông tin, tình trạng hàng hóa luân chuyển qua lại giữa nhiều chi nhánh kho khác nhau một cách trực quan."
            },
            {
              icon: ShieldCheck,
              title: "Giao dịch Đảm bảo",
              desc: "Thiết lập cơ chế chuyển trạng thái phiếu an toàn. Ngăn chặn triệt để lỗi double-spending gây thất thoát hàng hóa."
            },
            {
              icon: BarChart3,
              title: "Báo cáo Thông minh",
              desc: "Phân tích số liệu xuất nhập tồn, trực quan hóa biểu đồ hoạt động trực tuyến giúp doanh nghiệp đưa ra quyết định nhanh."
            }
          ].map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div 
                key={index}
                className={`p-8 rounded-3xl border transition-all hover:scale-[1.02] duration-300 ${
                  isDarkMode 
                    ? 'bg-white/[0.02] border-white/5 hover:border-[#000000]/20 hover:bg-white/[0.04]' 
                    : 'bg-white/85 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-slate-200/50 shadow-sm hover:border-[#000000]/20 hover:shadow-md'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#000000]/10 text-[#000000] flex items-center justify-center mb-6">
                  <Icon size={24} strokeWidth={2} />
                </div>
                <h3 className="font-extrabold text-lg mb-2">{feat.title}</h3>
                <p className="text-sm opacity-70 leading-relaxed font-medium">{feat.desc}</p>
              </div>
            );
          })}
        </motion.div>

      </main>

      {/* Footer */}
      <footer className={`border-t py-12 text-center text-xs font-bold uppercase tracking-widest opacity-60 transition-colors ${isDarkMode ? 'border-white/5 bg-black/40' : 'border-slate-200/60 bg-white/40'}`}>
        <p>© 2026 QL Kho Pro. Tất cả các quyền được bảo lưu.</p>
      </footer>

    </div>
  );
};

export default WelcomePage;
