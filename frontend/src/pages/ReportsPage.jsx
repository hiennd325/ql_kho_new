import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Plus, 
  Eye, 
  Trash2, 
  X,
  Calendar,
  Warehouse as WarehouseIcon,
  CheckCircle,
  FileText,
  TrendingUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Package,
  BrainCircuit,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportsPage = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('audits'); // 'audits', 'inventory', 'analytics'
  const [audits, setAudits] = useState([]);
  const [inventoryReport, setInventoryReport] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Analysis states
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Modal states
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  
  // Audit Form state
  const [auditForm, setAuditForm] = useState({
    code: '',
    date: new Date().toISOString().split('T')[0],
    warehouse_id: '',
    checker: '',
    notes: '',
    items: []
  });

  const fetchWarehousesAndProducts = useCallback(async () => {
    try {
      const [whRes, prodRes] = await Promise.all([
        api.get('/warehouses'),
        api.get('/products')
      ]);
      setWarehouses(whRes.data);
      setProducts(prodRes.data.products || []);
    } catch (error) {
      console.error('Error fetching base data:', error);
    }
  }, []);

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        search: searchTerm,
        warehouse: warehouseFilter,
        startDate: dateRange.start,
        endDate: dateRange.end
      };
      const response = await api.get('/reports/audits', { params });
      setAudits(response.data.audits);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching audits:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, warehouseFilter, dateRange]);

  const fetchInventoryReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { warehouse: warehouseFilter };
      const response = await api.get('/reports/inventory', { params });
      setInventoryReport(response.data);
    } catch (error) {
      console.error('Error fetching inventory report:', error);
    } finally {
      setLoading(false);
    }
  }, [warehouseFilter]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const response = await api.get('/inventory/transactions', { params: { limit: 1000 } });
      const transactions = response.data.transactions || [];

      const monthlyData = transactions.reduce((acc, t) => {
        const date = new Date(t.transaction_date);
        if (date.getFullYear() !== currentYear) return acc;

        const month = date.getMonth();
        acc[month] = acc[month] || { imports: 0, exports: 0 };
        if (t.type === 'nhap') acc[month].imports += t.quantity;
        else acc[month].exports += t.quantity;
        return acc;
      }, {});

      const labels = Array.from({ length: 12 }, (_, i) => `T${i + 1}/${currentYear}`);
      setChartData({
        labels,
        datasets: [
          {
            label: 'Nhập kho',
            data: labels.map((_, i) => monthlyData[i]?.imports || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          },
          {
            label: 'Xuất kho',
            data: labels.map((_, i) => monthlyData[i]?.exports || 0),
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAIAnalysis = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await api.post('/ai/analyze-system');
      setAiAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      setAiError(error.response?.data?.error || 'Không thể kết nối với AI OpenRouter');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehousesAndProducts();
  }, [fetchWarehousesAndProducts]);

  useEffect(() => {
    if (activeTab === 'audits') fetchAudits();
    else if (activeTab === 'inventory') fetchInventoryReport();
    else if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab, fetchAudits, fetchInventoryReport, fetchAnalytics]);

  const generateAuditCode = () => {
    const date = new Date();
    return `KK${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  };

  const openAddAudit = () => {
    setAuditForm({
      code: generateAuditCode(),
      date: new Date().toISOString().split('T')[0],
      warehouse_id: '',
      checker: '',
      notes: '',
      items: []
    });
    setIsAuditModalOpen(true);
  };

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (auditForm.items.length === 0) return alert('Vui lòng thêm ít nhất một sản phẩm');
    try {
      await api.post('/inventory/audits', auditForm);
      setIsAuditModalOpen(false);
      fetchAudits();
      alert('Tạo phiếu kiểm kê thành công');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const addAuditItem = (productId) => {
    if (!productId) return;
    if (auditForm.items.find(item => item.product_id === productId)) return alert('Sản phẩm đã có trong danh sách');
    
    const product = products.find(p => p.custom_id === productId);
    const newItem = {
      product_id: productId,
      product_name: product.name,
      system_quantity: product.quantity,
      actual_quantity: product.quantity,
      discrepancy: 0
    };
    setAuditForm({ ...auditForm, items: [...auditForm.items, newItem] });
  };

  const updateAuditItem = (idx, actual) => {
    const newItems = [...auditForm.items];
    newItems[idx].actual_quantity = parseInt(actual) || 0;
    newItems[idx].discrepancy = newItems[idx].system_quantity - newItems[idx].actual_quantity;
    setAuditForm({ ...auditForm, items: newItems });
  };

  const removeAuditItem = (idx) => {
    setAuditForm({ ...auditForm, items: auditForm.items.filter((_, i) => i !== idx) });
  };

  const deleteAudit = async (id) => {
    if (window.confirm('Xác nhận xóa phiếu kiểm kê này?')) {
      try {
        await api.delete(`/inventory/audits/${id}`);
        fetchAudits();
      } catch (error) {
        alert('Lỗi xóa phiếu');
      }
    }
  };

  const downloadAuditPDF = async (id) => {
    try {
      const response = await api.get(`/reports/audits/${id}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `phieu-kiem-ke-${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Lỗi tải file');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-800 w-full sm:w-fit shadow-sm overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('audits')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'audits' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
        >
          <ClipboardList size={16} /> <span className="hidden xs:inline">Phiếu</span> Kiểm kê
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
        >
          <FileText size={16} /> Tồn kho
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
        >
          <BarChart3 size={16} /> Phân tích
        </button>
      </div>

      {/* Filters (only for audits and inventory) */}
      {activeTab !== 'analytics' && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Mã phiếu, người tạo..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 dark:text-slate-100 transition-all"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Kho bãi</label>
            <select
              className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 min-w-[150px] transition-all"
              value={warehouseFilter}
              onChange={(e) => { setWarehouseFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="" className="dark:bg-slate-800">Tất cả kho</option>
              {warehouses.map(w => <option key={w.custom_id} value={w.custom_id} className="dark:bg-slate-800">{w.name}</option>)}
            </select>
          </div>

          {activeTab === 'audits' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Khoảng ngày</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  max={dateRange.end || new Date().toISOString().split('T')[0]}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
                <span className="text-gray-400">→</span>
                <input
                  type="date"
                  min={dateRange.start}
                  max={new Date().toISOString().split('T')[0]}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
                {(dateRange.start || dateRange.end) && (
                  <button
                    onClick={() => setDateRange({ start: '', end: '' })}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                    title="Xóa bộ lọc ngày"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            {activeTab === 'audits' && (
              <button onClick={openAddAudit} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold text-sm flex items-center gap-2 shadow-md shadow-blue-100 dark:shadow-blue-900/20 active:scale-95 transition-all">
                <Plus size={18} /> Lập phiếu kiểm
              </button>
            )}
            <button
              onClick={() => {
                const baseURL = api.defaults.baseURL;
                if (activeTab === 'audits') {
                  window.open(`${baseURL}/reports/audits/export?startDate=${dateRange.start}&endDate=${dateRange.end}&warehouse=${warehouseFilter}`, '_blank');
                } else if (activeTab === 'inventory') {
                  window.open(`${baseURL}/reports/inventory/export`, '_blank');
                }
              }}
              className="border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Download size={18} /> Xuất CSV
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400 italic dark:text-slate-500">Đang tải báo cáo...</div>
        ) : activeTab === 'audits' ? (
          <div className="flex flex-col h-full">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Mã phiếu</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Ngày kiểm</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Kho bãi</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Người thực hiện</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Chênh lệch</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {audits.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-400 dark:text-slate-500 italic">Không có phiếu kiểm kê nào</td></tr>
                  ) : (
                    audits.map(audit => (
                      <tr key={audit.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-bold text-blue-600 dark:text-blue-400">{audit.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{new Date(audit.date).toLocaleDateString('vi-VN')}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300 font-medium">{audit.warehouse_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{audit.created_by_username}</td>
                        <td className={`px-6 py-4 text-sm text-right font-bold ${audit.discrepancy === 0 ? 'text-gray-400 dark:text-slate-500' : (audit.discrepancy > 0 ? 'text-green-600 dark:text-emerald-500' : 'text-red-600 dark:text-rose-500')}`}>
                          {audit.discrepancy > 0 ? '+' : ''}{audit.discrepancy}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => downloadAuditPDF(audit.id)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all" title="Tải PDF"><Download size={16} /></button>
                            <button onClick={() => deleteAudit(audit.id)} className="p-1.5 text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-900/20 rounded transition-all" title="Xóa"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/30 dark:bg-slate-800/30">
              <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Trang {currentPage} trên {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 shadow-sm transition-all"><ChevronLeft size={16} /></button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 shadow-sm transition-all"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        ) : activeTab === 'inventory' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Mã SP</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Tên sản phẩm</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Số lượng</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Đơn giá</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {inventoryReport.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400 dark:text-slate-500 italic">Không có dữ liệu tồn kho</td></tr>
                ) : (
                  inventoryReport.map(item => (
                    <tr key={item.product_id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-slate-400">{item.product_id}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-slate-100">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-blue-600 dark:text-blue-400">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-slate-400">{formatCurrency(item.price)}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-slate-100 font-bold">{formatCurrency(item.quantity * item.price)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 bg-white dark:bg-slate-900">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Chart Section */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">Xu hướng Nhập & Xuất kho</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Thống kê số lượng hàng hóa lưu thông theo tháng</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-bold text-gray-600 dark:text-slate-300">Nhập</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-bold text-gray-600 dark:text-slate-300">Xuất</span>
                    </div>
                  </div>
                </div>
                <div className="h-[400px] w-full relative">
                  {!chartData || chartData.datasets[0].data.every(v => v === 0) && chartData.datasets[1].data.every(v => v === 0) ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
                      <BarChart3 size={48} className="mb-4 opacity-50" />
                      <p>Không có dữ liệu nhập/xuất trong năm nay</p>
                    </div>
                  ) : (
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                            titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
                            bodyColor: isDarkMode ? '#f1f5f9' : '#1e293b',
                            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                            borderWidth: 1
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              borderDash: [5, 5],
                              color: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                            },
                            ticks: {
                              color: isDarkMode ? '#94a3b8' : '#64748b'
                            }
                          },
                          x: {
                            grid: { display: false },
                            ticks: {
                              color: isDarkMode ? '#94a3b8' : '#64748b'
                            }
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              {/* AI Analysis Sidebar */}
              <div className="w-full lg:w-96 space-y-4">
                <div className={`p-6 rounded-2xl border transition-all duration-300 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-blue-50/50 border-blue-100'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      <Sparkles size={18} /> Phân tích AI
                    </h4>
                    <button
                      onClick={fetchAIAnalysis}
                      disabled={aiLoading}
                      className={`p-2 rounded-xl transition-all active:scale-95 ${aiLoading ? 'bg-gray-200 dark:bg-slate-700' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700'}`}
                    >
                      <BrainCircuit size={18} className={aiLoading ? 'animate-pulse' : ''} />
                    </button>
                  </div>

                  {aiLoading ? (
                    <div className="space-y-4 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse w-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse w-[90%]"></div>
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse w-[95%]"></div>
                      <p className="text-center text-xs text-gray-500 dark:text-slate-400 font-medium italic mt-4">AI đang phân tích dữ liệu kho...</p>
                    </div>
                  ) : aiError ? (
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/20 flex gap-3 items-start">
                      <AlertCircle className="text-rose-500 shrink-0" size={18} />
                      <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed font-medium">{aiError}</p>
                    </div>
                  ) : aiAnalysis ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className={`text-xs leading-relaxed font-medium whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {aiAnalysis}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-3">
                      <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-blue-100 text-blue-600'}`}>
                        <BrainCircuit size={24} />
                      </div>
                      <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Bấm để bắt đầu phân tích hệ thống</p>
                    </div>
                  )}
                </div>

                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-100'} shadow-sm`}>
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Mô hình sử dụng</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white leading-none">Tencent HY3 Preview</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">OpenRouter Free Tier</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Audit Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b dark:border-slate-800 bg-blue-50/50 dark:bg-blue-900/20">
              <h3 className="text-xl font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                <ClipboardList size={24} /> Lập phiếu kiểm kê hàng hóa
              </h3>
              <button onClick={() => setIsAuditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAuditSubmit} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 overflow-y-auto space-y-6 bg-white dark:bg-slate-900">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1">Mã phiếu</label>
                    <input type="text" readOnly className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-500 dark:text-slate-400 font-bold" value={auditForm.code} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1">Ngày lập *</label>
                    <input type="date" required className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 transition-all" value={auditForm.date} onChange={e => setAuditForm({...auditForm, date: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1">Kho kiểm kê *</label>
                    <select required className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all" value={auditForm.warehouse_id} onChange={e => setAuditForm({...auditForm, warehouse_id: e.target.value})}>
                      <option value="" className="dark:bg-slate-800">-- Chọn kho --</option>
                      {warehouses.map(w => <option key={w.custom_id} value={w.custom_id} className="dark:bg-slate-800">{w.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1">Người kiểm kê *</label>
                    <input type="text" required placeholder="Nhập tên người kiểm" className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 transition-all" value={auditForm.checker} onChange={e => setAuditForm({...auditForm, checker: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1">Ghi chú</label>
                    <input type="text" placeholder="Ghi chú thêm (nếu có)" className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 transition-all" value={auditForm.notes} onChange={e => setAuditForm({...auditForm, notes: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
                    <h4 className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2"><Package size={18} className="text-blue-600 dark:text-blue-400" /> Chi tiết hàng hóa</h4>
                    <div className="flex gap-2">
                      <select
                        className="text-sm border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-w-[200px] transition-all"
                        onChange={(e) => { addAuditItem(e.target.value); e.target.value = ''; }}
                        value=""
                      >
                        <option value="" className="dark:bg-slate-800">+ Thêm sản phẩm kiểm</option>
                        {products.map(p => <option key={p.id} value={p.custom_id} className="dark:bg-slate-800">{p.custom_id} - {p.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50/80 dark:bg-slate-800 border-b dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-3 font-bold text-gray-600 dark:text-slate-400">Sản phẩm</th>
                          <th className="px-4 py-3 font-bold text-gray-600 dark:text-slate-400 text-center">Hệ thống</th>
                          <th className="px-4 py-3 font-bold text-gray-600 dark:text-slate-400 text-center">Thực tế</th>
                          <th className="px-4 py-3 font-bold text-gray-600 dark:text-slate-400 text-center">Chênh lệch</th>
                          <th className="px-4 py-3 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {auditForm.items.length === 0 ? (
                          <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400 dark:text-slate-500 italic">Chưa có sản phẩm nào được chọn</td></tr>
                        ) : (
                          auditForm.items.map((item, idx) => (
                            <tr key={item.product_id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-bold text-gray-800 dark:text-slate-100">{item.product_name}</p>
                                <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase tracking-wider">{item.product_id}</p>
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-gray-500 dark:text-slate-400">{item.system_quantity}</td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="number" min="0"
                                  className="w-20 px-2 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 transition-all"
                                  value={item.actual_quantity}
                                  onChange={(e) => updateAuditItem(idx, e.target.value)}
                                />
                              </td>
                              <td className={`px-4 py-3 text-center font-bold ${item.discrepancy === 0 ? 'text-gray-400 dark:text-slate-500' : (item.discrepancy > 0 ? 'text-green-600 dark:text-emerald-500' : 'text-red-600 dark:text-rose-500')}`}>
                                {item.discrepancy > 0 ? '+' : ''}{item.discrepancy}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button type="button" onClick={() => removeAuditItem(idx)} className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"><Trash2 size={18} /></button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAuditModalOpen(false)} className="px-6 py-2.5 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl font-bold transition-all">Đóng</button>
                <button type="submit" className="px-10 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-100 dark:shadow-blue-900/20 transition-all active:scale-95 flex items-center gap-2">
                  <CheckCircle size={20} /> Hoàn tất & Cân bằng kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
