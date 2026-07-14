import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  ExternalLink,
  Warehouse
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../services/api';
import StatCard from '../components/ui/StatCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('month');
  const [expandedCard, setExpandedCard] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    monthlyImports: 0,
    monthlyExports: 0,
    totalValue: 0
  });
  const [alerts, setAlerts] = useState({
    newOrders: 0,
    systemStatus: 'Đang kiểm tra...',
    systemHealth: 'healthy',
    systemDetails: []
  });
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async (period = activeTab) => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get(`/dashboard/stats?period=${period}`),
        api.get('/dashboard/alerts'),
        api.get('/dashboard/recent-activities'),
        api.get(`/dashboard/chart-data-v2?period=${period}`)
      ]);

      if (results[0].status === 'fulfilled') setStats(results[0].value.data);
      if (results[1].status === 'fulfilled') setAlerts(results[1].value.data);
      if (results[2].status === 'fulfilled') setActivities(results[2].value.data);

      if (results[3].status === 'fulfilled' && results[3].value.data && results[3].value.data.length > 0) {
        const data = results[3].value.data;
        setChartData({
          labels: data.map(d => d.date),
          datasets: [
            {
              label: 'Nhập kho',
              data: data.map(d => d.nhap),
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Xuất kho',
              data: data.map(d => d.xuat),
              borderColor: 'rgb(225, 29, 72)',
              backgroundColor: 'rgba(225, 29, 72, 0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        });
      } else if (results[3].status === 'fulfilled') {
        setChartData(null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const value = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const periodMap = {
    'week': 'Tuần này',
    'month': 'Tháng này',
    'year': 'Năm nay'
  };

  const getHealthBadge = (status) => {
    switch (status) {
      case 'healthy': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Hoạt động tốt</span>;
      case 'warning': return <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Cảnh báo</span>;
      case 'critical': return <span className="bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Nghiêm trọng</span>;
      default: return null;
    }
  };

  if (loading && !chartData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <RefreshCw className="animate-spin text-[#FF5E3A]" size={32} />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] animate-pulse">Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <h2 className={`text-xl sm:text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Tổng quan vận hành</h2>
          <p className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mt-2 px-3 py-1 rounded-full border w-fit shadow-sm ${isDarkMode ? 'bg-slate-950/40 text-slate-400 border-white/5' : 'bg-white/40 text-slate-500 border-white/50'}`}>
            Cập nhật: {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <div className={`border p-1 rounded-xl flex shadow-sm flex-1 md:flex-none backdrop-blur-xl ${isDarkMode ? 'bg-slate-950/40 border-white/5' : 'bg-white/40 border-white/50'}`}>
            {Object.entries(periodMap).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  fetchData(key);
                }}
                className={`flex-1 md:flex-none px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${activeTab === key ? 'bg-gradient-to-r from-[#FF5E3A] to-[#e04520] text-white shadow-md shadow-[#FF5E3A]/25' : 'text-slate-400 hover:text-[#FF5E3A]'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => fetchData()} className="flex items-center gap-2 bg-[#FF5E3A] px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-white hover:bg-[#e04520] transition-all shadow-lg shadow-[#FF5E3A]/20 shrink-0">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> <span className="hidden xs:inline">Đồng bộ</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* Stat Cards - spans 3 columns each on desktop */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3">
          <StatCard
            label="Sản phẩm"
            value={stats.totalProducts}
            icon={Package}
            color="blue"
            trend="+2.4%"
            detail="Trong kho"
            compact={true}
            isExpanded={expandedCard === 'products'}
            onExpand={() => setExpandedCard(expandedCard === 'products' ? null : 'products')}
          />
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-3">
          <StatCard
            label="Nhập kho"
            value={stats.monthlyImports}
            icon={TrendingUp}
            color="emerald"
            trend="+12.5%"
            detail="Tháng này"
            compact={true}
            isExpanded={expandedCard === 'imports'}
            onExpand={() => setExpandedCard(expandedCard === 'imports' ? null : 'imports')}
          />
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-3">
          <StatCard
            label="Xuất kho"
            value={stats.monthlyExports}
            icon={TrendingDown}
            color="rose"
            trend="-8.2%"
            detail="Tháng này"
            compact={true}
            isExpanded={expandedCard === 'exports'}
            onExpand={() => setExpandedCard(expandedCard === 'exports' ? null : 'exports')}
          />
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-3">
          <StatCard
            label="Giá trị"
            value={formatCurrency(stats.totalValue)}
            icon={DollarSign}
            color="amber"
            trend="+0.5%"
            detail="Định giá"
            compact={true}
            isExpanded={expandedCard === 'value'}
            onExpand={() => setExpandedCard(expandedCard === 'value' ? null : 'value')}
          />
        </div>

        {/* Main Chart Section - spans 8 cols on desktop, 2 cols on tablet */}
        <motion.div 
          variants={item} 
          className={`col-span-1 md:col-span-2 lg:col-span-8 p-4 sm:p-6 rounded-[28px] border shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-[#FF5E3A]/20 ${
            isDarkMode ? 'bg-slate-950/40 border-white/5 shadow-black/40' : 'bg-white/40 border-white/50 shadow-slate-200/30'
          }`}
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 sm:mb-6">
            <h3 className={`font-black flex items-center gap-2 text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Activity size={18} className="text-[#FF5E3A]" />
              Biểu đồ luân chuyển
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div><span className="text-[10px] font-black uppercase text-slate-400">Nhập</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-rose-500 rounded-full"></div><span className="text-[10px] font-black uppercase text-slate-400">Xuất</span></div>
            </div>
          </div>
          <div className="h-[220px] sm:h-[300px]">
            {chartData ? (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      titleColor: isDarkMode ? '#f1f5f9' : '#0f172a',
                      bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      borderWidth: 1,
                      padding: 10,
                      bodyFont: {
                        weight: 'bold'
                      },
                      titleFont: {
                        weight: 'black'
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
                      ticks: {
                        color: isDarkMode ? '#94a3b8' : '#64748b',
                        font: { size: 10, weight: 'bold' }
                      }
                    },
                    x: {
                      grid: { display: false },
                      ticks: {
                        color: isDarkMode ? '#94a3b8' : '#64748b',
                        font: { size: 10, weight: 'bold' }
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-350 font-bold text-sm uppercase tracking-widest">Không có dữ liệu biểu đồ</div>
            )}
          </div>
        </motion.div>

        {/* System Health Status - spans 4 cols on desktop, 1 col on tablet */}
        <motion.div 
          variants={item} 
          className={`col-span-1 md:col-span-1 lg:col-span-4 p-6 rounded-[28px] border shadow-xl flex flex-col justify-between backdrop-blur-xl transition-all duration-300 hover:border-[#FF5E3A]/20 ${
            isDarkMode ? 'bg-slate-950/40 border-white/5 shadow-black/40' : 'bg-white/40 border-white/50 shadow-slate-200/30'
          }`}
        >
          <div className="flex justify-between items-start mb-6">
            <h3 className={`font-black flex items-center gap-2 text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Activity size={18} className="text-[#FF5E3A]" />
              Vận hành hệ thống
            </h3>
            {getHealthBadge(alerts.systemHealth)}
          </div>

          <div className="space-y-4 flex-1">
            {alerts.systemDetails.map((detail, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 rounded-2xl border group transition-all duration-300 ${isDarkMode ? 'bg-slate-900/40 border-white/5 hover:border-[#FF5E3A]/20' : 'bg-slate-50 border-slate-100 hover:border-[#FF5E3A]/20'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-[#FF5E3A]/80 rounded-full shadow-[0_0_8px_rgba(255,94,58,0.5)]"></div>
                  <span className={`text-xs font-bold tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{detail.split(':')[0]}</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg border uppercase ${isDarkMode ? 'text-white bg-slate-900 border-white/5' : 'text-slate-900 bg-white border border-slate-200/50 shadow-md'}`}>{detail.split(':')[1] || 'Active'}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity Table Section - spans 8 cols on desktop, 2 cols on tablet */}
        <motion.div 
          variants={item} 
          className={`col-span-1 md:col-span-2 lg:col-span-8 rounded-[28px] border shadow-xl overflow-hidden backdrop-blur-xl transition-all duration-300 hover:border-[#FF5E3A]/20 ${
            isDarkMode ? 'bg-slate-950/40 border-white/5 shadow-black/40' : 'bg-white/40 border-white/50 shadow-slate-200/30'
          }`}
        >
          <div className={`p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
            <h3 className={`font-black flex items-center gap-3 text-sm sm:text-base tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-[#FF5E3A]/10 text-[#ff8a65]' : 'bg-[#FF5E3A]/10 text-[#FF5E3A]'}`}><Clock size={18} strokeWidth={2.5} /></div>
              Hoạt động gần đây
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50/50'}>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-450 uppercase tracking-widest">Loại giao dịch</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-450 uppercase tracking-widest">Sản phẩm & Chi tiết</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-455 uppercase tracking-widest text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-slate-50'}`}>
                {activities.length === 0 ? (
                  <tr><td colSpan="3" className="py-20 text-center text-slate-350 font-bold text-xs uppercase tracking-widest">Dữ liệu trống</td></tr>
                ) : (
                  activities.map((activity, idx) => (
                    <tr key={idx} className={`transition-colors group ${isDarkMode ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50/40'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            activity.color === 'green' ? (isDarkMode ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/10' : 'bg-emerald-50 text-emerald-600 border border-emerald-100') :
                            activity.color === 'red' ? (isDarkMode ? 'bg-rose-950/30 text-rose-400 border border-rose-500/10' : 'bg-rose-50 text-rose-600 border border-rose-100') :
                            (isDarkMode ? 'bg-[#FF5E3A]/10 text-[#ff8a65]' : 'bg-[#FF5E3A]/10 text-[#FF5E3A]')
                          }`}>
                            <Package size={14} strokeWidth={3} />
                          </div>
                          <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activity.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{activity.description}</p>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${isDarkMode ? 'text-slate-400 bg-slate-900 border border-white/5' : 'text-slate-400 bg-slate-100'}`}>{activity.time}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Warehouse Capacity & Storage Occupancy Widget - spans 4 cols on desktop, 1 col on tablet */}
        <motion.div 
          variants={item} 
          className={`col-span-1 md:col-span-1 lg:col-span-4 p-6 rounded-[28px] border shadow-xl flex flex-col justify-between backdrop-blur-xl transition-all duration-300 hover:border-[#FF5E3A]/20 ${
            isDarkMode ? 'bg-slate-950/40 border-white/5 shadow-black/40' : 'bg-white/40 border-white/50 shadow-slate-200/30'
          }`}
        >
          <h3 className={`font-black flex items-center gap-2 text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Warehouse size={18} className="text-[#FF5E3A]" />
            Sức chứa kho bãi
          </h3>
          
          <div className="space-y-4 my-auto py-2">
            {[
              { name: "Kho Trung Tâm", percent: 84, color: "from-[#FF5E3A] to-[#ff7c5f]", count: "4,200 / 5,000 sp" },
              { name: "Kho Đông Lạnh", percent: 62, color: "from-emerald-500 to-teal-400", count: "1,860 / 3,000 sp" },
              { name: "Kho Ký Gửi", percent: 28, color: "from-blue-500 to-indigo-400", count: "560 / 2,000 sp" }
            ].map((w, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className={isDarkMode ? 'text-slate-350' : 'text-slate-700'}>{w.name}</span>
                  <span className="text-[#FF5E3A] font-black">{w.percent}%</span>
                </div>
                <div className={`w-full h-2.5 rounded-full overflow-hidden p-[2px] ${isDarkMode ? 'bg-slate-900/80 border border-white/5' : 'bg-slate-100 border border-slate-200/50'}`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${w.percent}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${w.color}`}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                  <span>{w.count}</span>
                  <span>Trống {100 - w.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default DashboardPage;
