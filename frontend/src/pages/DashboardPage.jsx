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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Package size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Sản phẩm</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.totalProducts}</h3>
          <p className="text-sm text-gray-500 mt-1">Tổng số loại hàng</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Nhập kho</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">+{stats.monthlyImports}</h3>
          <p className="text-sm text-gray-500 mt-1">Số lượng trong tháng</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-2 rounded-lg text-red-600">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Xuất kho</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">-{stats.monthlyExports}</h3>
          <p className="text-sm text-gray-500 mt-1">Số lượng trong tháng</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Giá trị</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 truncate">{formatCurrency(stats.totalValue)}</h3>
          <p className="text-sm text-gray-500 mt-1">Ước tính tồn kho</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Sức khỏe hệ thống
            </h3>
            <div className={`p-4 rounded-lg border ${getHealthColor(alerts.systemHealth)} mb-4`}>
              <div className="flex items-center gap-3">
                {getHealthIcon(alerts.systemHealth)}
                <div>
                  <p className="font-bold">{alerts.systemStatus}</p>
                  <p className="text-xs opacity-80">Trạng thái hiện tại</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {alerts.systemDetails.map((detail, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                  {detail}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 p-6 rounded-xl shadow-lg text-white">
            <h3 className="font-bold mb-2">Đơn hàng mới</h3>
            <div className="flex items-end justify-between">
              <h4 className="text-4xl font-bold">{alerts.newOrders}</h4>
              <button className="flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
                Xem ngay <ArrowRight size={14} />
              </button>
            </div>
            <p className="text-blue-100 text-xs mt-2">Trong vòng 24 giờ qua</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              Hoạt động gần đây
            </h3>
            <button className="text-blue-600 text-sm font-semibold hover:underline">Xem tất cả</button>
          </div>
          <div className="divide-y divide-gray-50">
            {activities.length === 0 ? (
              <div className="p-10 text-center text-gray-400">Không có hoạt động gần đây</div>
            ) : (
              activities.map((activity, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
                  <div className={`p-2 rounded-full mt-1 ${
                    activity.color === 'green' ? 'bg-green-100 text-green-600' : 
                    activity.color === 'red' ? 'bg-red-100 text-red-600' : 
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <Package size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-semibold text-gray-800">{activity.title}</p>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
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
