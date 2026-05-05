import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  ExternalLink
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, alertsRes, activitiesRes, chartRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/alerts'),
        api.get('/dashboard/recent-activities'),
        api.get('/dashboard/chart-data')
      ]);

      setStats(statsRes.data);
      setAlerts(alertsRes.data);
      setActivities(activitiesRes.data);

      if (chartRes.data && chartRes.data.length > 0) {
        setChartData({
          labels: chartRes.data.map(d => d.date),
          datasets: [
            {
              label: 'Nhập kho',
              data: chartRes.data.map(d => d.nhap),
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Xuất kho',
              data: chartRes.data.map(d => d.xuat),
              borderColor: 'rgb(225, 29, 72)',
              backgroundColor: 'rgba(225, 29, 72, 0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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
        <RefreshCw className="animate-spin text-blue-600" size={32} />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] animate-pulse">Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tổng quan vận hành</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Cập nhật thời gian thực: {new Date().toLocaleTimeString()}</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Main Grid Layout - 4-column desktop optimization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Sản phẩm', value: stats.totalProducts, icon: Package, color: 'blue', trend: '+2.4%' },
          { label: 'Nhập kho', value: stats.monthlyImports, icon: TrendingUp, color: 'emerald', trend: '+12.5%' },
          { label: 'Xuất kho', value: stats.monthlyExports, icon: TrendingDown, color: 'rose', trend: '-8.2%' },
          { label: 'Giá trị', value: formatCurrency(stats.totalValue), icon: DollarSign, color: 'amber', trend: '+0.5%' },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={item} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:border-blue-500/20 transition-all group">
            <div className={`p-4 rounded-2xl ${
              stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              stat.color === 'rose' ? 'bg-rose-50 text-rose-600' :
              'bg-amber-50 text-amber-600'
            }`}>
              <stat.icon size={22} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter truncate">{stat.value}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{stat.trend}</span>
                <span className="text-[10px] text-slate-300 font-bold uppercase whitespace-nowrap">vs tháng trước</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chart & Recent Activity (Table) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Chart Section */}
          <motion.div variants={item} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Activity size={18} className="text-blue-600" />
                Biểu đồ luân chuyển hàng hóa (7 ngày)
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div><span className="text-[10px] font-black uppercase text-slate-400">Nhập</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-rose-500 rounded-full"></div><span className="text-[10px] font-black uppercase text-slate-400">Xuất</span></div>
              </div>
            </div>
            <div className="h-[300px]">
              {chartData ? (
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                    scales: {
                      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 10, weight: 'bold' } } },
                      x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300 font-bold text-sm uppercase tracking-widest">Không có dữ liệu biểu đồ</div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity Section - Desktop Table Optimization */}
          <motion.div variants={item} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-900 flex items-center gap-2 text-base">
                <Clock size={18} className="text-blue-600" />
                Lịch sử hoạt động chi tiết
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Tìm nhanh..." className="bg-slate-50 border-none text-[10px] font-bold pl-9 pr-4 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 w-40" />
                </div>
                <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Xem tất cả</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại giao dịch</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm & Chi tiết</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thời gian</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activities.length === 0 ? (
                    <tr><td colSpan="4" className="py-20 text-center text-slate-300 font-bold text-xs uppercase tracking-widest">Dữ liệu trống</td></tr>
                  ) : (
                    activities.map((activity, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              activity.color === 'green' ? 'bg-emerald-50 text-emerald-600' :
                              activity.color === 'red' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              <Package size={14} strokeWidth={3} />
                            </div>
                            <span className="text-sm font-black text-slate-900">{activity.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600 font-bold tracking-tight">{activity.description}</p>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{activity.time}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="text-slate-300 hover:text-blue-600 transition-colors"><ExternalLink size={14} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Right Column: System Status & Alerts */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div variants={item} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Activity size={18} className="text-blue-600" />
                Vận hành hệ thống
              </h3>
              {getHealthBadge(alerts.systemHealth)}
            </div>

            <div className="space-y-4 flex-1">
              {alerts.systemDetails.map((detail, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-blue-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    <span className="text-xs text-slate-600 font-bold tracking-tight">{detail.split(':')[0]}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-100 uppercase">{detail.split(':')[1] || 'Active'}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl group-hover:bg-blue-600/40 transition-colors"></div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Đơn hàng mới</p>
              <div className="flex items-end justify-between relative z-10">
                <h4 className="text-6xl font-black tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{alerts.newOrders}</h4>
                <button className="bg-white/10 hover:bg-blue-600 p-3 rounded-2xl transition-all group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
