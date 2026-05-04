import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, alertsRes, activitiesRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/alerts'),
          api.get('/dashboard/recent-activities')
        ]);
        
        setStats(statsRes.data);
        setAlerts(alertsRes.data);
        setActivities(activitiesRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="text-green-500" size={24} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={24} />;
      case 'critical': return <AlertTriangle className="text-red-500" size={24} />;
      default: return <Activity className="text-gray-500" size={24} />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Đang tải dữ liệu dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
          <div className="flex items-baseline gap-1 sm:gap-2 justify-center h-full">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Sản phẩm</p>
            <h3 className="text-xs sm:text-xl font-black text-slate-900">{stats.totalProducts}</h3>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
          <div className="flex items-baseline gap-1 sm:gap-2 justify-center h-full">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Nhập kho</p>
            <h3 className="text-xs sm:text-xl font-black text-emerald-600">+{stats.monthlyImports}</h3>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
          <div className="flex items-baseline gap-1 sm:gap-2 justify-center h-full">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Xuất kho</p>
            <h3 className="text-xs sm:text-xl font-black text-rose-600">-{stats.monthlyExports}</h3>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
          <div className="flex items-baseline gap-1 sm:gap-2 justify-center h-full overflow-hidden">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Giá trị</p>
            <h3 className="text-xs sm:text-xl font-black text-slate-900 truncate">{formatCurrency(stats.totalValue)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Sức khỏe hệ thống
            </h3>
            <div className={`p-4 rounded-xl border-2 ${getHealthColor(alerts.systemHealth)} mb-6`}>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {getHealthIcon(alerts.systemHealth)}
                </div>
                <div>
                  <p className="font-black text-lg">{alerts.systemStatus}</p>
                  <p className="text-xs opacity-80 font-medium">Trạng thái hiện tại</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {alerts.systemDetails.map((detail, index) => (
                <div key={index} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <div className="w-2 h-2 bg-blue-400 rounded-full shadow-sm shadow-blue-200"></div>
                  {detail}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
            <h3 className="font-bold text-lg mb-2 relative z-10">Đơn hàng mới</h3>
            <div className="flex items-end justify-between relative z-10">
              <h4 className="text-5xl font-black">{alerts.newOrders}</h4>
              <button className="flex items-center gap-2 text-sm bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl font-bold transition-all hover:gap-3">
                Xem ngay <ArrowRight size={16} />
              </button>
            </div>
            <p className="text-blue-100 text-xs mt-4 font-medium relative z-10 opacity-80 italic">Cập nhật 24 giờ qua</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              Hoạt động gần đây
            </h3>
            <button className="text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors px-3 py-1 hover:bg-blue-50 rounded-lg">Xem tất cả</button>
          </div>
          <div className="divide-y divide-slate-100">
            {activities.length === 0 ? (
              <div className="p-16 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Clock size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium">Không có hoạt động gần đây</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <div key={index} className="p-5 hover:bg-slate-50 transition-colors flex items-start gap-4 group">
                  <div className={`p-3 rounded-xl mt-1 shadow-sm transition-transform group-hover:scale-110 ${
                    activity.color === 'green' ? 'bg-emerald-50 text-emerald-600' :
                    activity.color === 'red' ? 'bg-rose-50 text-rose-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    <Package size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-slate-900 text-base">{activity.title}</p>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{activity.time}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">{activity.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
