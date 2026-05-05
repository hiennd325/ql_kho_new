import React, { useState, useEffect, useCallback } from 'react';
import {
  Warehouse,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  MapPin,
  Package,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Clock,
  LayoutGrid,
  List,
  Activity
} from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const WarehousesPage = () => {
  const { isDarkMode } = useTheme();
  const [warehouses, setWarehouses] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'transfers'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouseProducts, setWarehouseProducts] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    custom_id: '',
    name: '',
    capacity: '',
    location: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [whRes, transRes] = await Promise.all([
        api.get('/warehouses'),
        api.get('/transfers', { params: { limit: 20 } })
      ]);
      setWarehouses(whRes.data);
      setTransfers(transRes.data);
    } catch (error) {
      console.error('Error fetching warehouse data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddEdit = async (e) => {
    e.preventDefault();
    try {
      if (selectedWarehouse) {
        await api.put(`/warehouses/${selectedWarehouse.custom_id}`, formData);
      } else {
        await api.post('/warehouses', formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (customId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kho này?')) {
      try {
        await api.delete(`/warehouses/${customId}`);
        fetchData();
      } catch (error) {
        alert('Lỗi khi xóa kho: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const openEditModal = (wh) => {
    setSelectedWarehouse(wh);
    setFormData({
      custom_id: wh.custom_id,
      name: wh.name,
      capacity: wh.capacity,
      location: wh.location || ''
    });
    setIsModalOpen(true);
  };

  const openDetail = async (wh) => {
    setSelectedWarehouse(wh);
    setIsDetailOpen(true);
    try {
      const response = await api.get(`/warehouses/${wh.custom_id}/products`);
      setWarehouseProducts(response.data);
    } catch (error) {
      console.error('Error fetching warehouse products:', error);
    }
  };

  const resetForm = () => {
    setFormData({ custom_id: '', name: '', capacity: '', location: '' });
    setSelectedWarehouse(null);
  };

  const updateTransferStatus = async (id, status) => {
    try {
      await api.put(`/transfers/${id}/status`, { status });
      fetchData();
    } catch (error) {
      alert('Lỗi cập nhật trạng thái: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    const labels = {
      completed: 'Hoàn thành',
      in_progress: 'Đang xử lý',
      pending: 'Chờ xử lý',
      cancelled: 'Đã hủy'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
  };

  const stats = {
    total: warehouses.length,
    capacity: warehouses.reduce((sum, w) => sum + w.capacity, 0),
    usage: warehouses.reduce((sum, w) => sum + w.current_usage, 0)
  };

  const filteredWarehouses = warehouses.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.custom_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className={`p-4 rounded-xl border shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-center gap-4 px-4 border-r last:border-0 flex-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            <Warehouse size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Tổng số kho</p>
            <h3 className={`text-xl font-black leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.total}</h3>
          </div>
        </div>

        <div className={`flex items-center gap-4 px-4 border-r last:border-0 flex-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-900/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <LayoutGrid size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Sức chứa hệ thống</p>
            <h3 className={`text-xl font-black leading-none ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{stats.capacity.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">SP</span></h3>
          </div>
        </div>

        <div className={`flex items-center gap-4 px-4 border-r last:border-0 flex-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Mức độ lấp đầy</p>
            <h3 className={`text-xl font-black leading-none ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{stats.usage.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">({stats.capacity > 0 ? Math.round((stats.usage/stats.capacity)*100) : 0}%)</span></h3>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className={`flex flex-col xl:flex-row xl:items-center justify-between gap-6 p-4 rounded-2xl border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`flex p-1.5 rounded-xl w-fit ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all ${activeTab === 'list' ? (isDarkMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-600 shadow-sm') : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutGrid size={18} /> Danh sách kho
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all ${activeTab === 'transfers' ? (isDarkMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-600 shadow-sm') : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ArrowRightLeft size={18} /> Điều chuyển hàng
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm tên kho, vị trí, mã kho..."
              className={`pl-12 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-full transition-all font-medium text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-black shadow-lg active:scale-95 ${isDarkMode ? 'bg-blue-600 text-white shadow-blue-900/20' : 'bg-blue-600 text-white shadow-blue-100'}`}
          >
            <Plus size={20} strokeWidth={3} /> THÊM KHO MỚI
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50/80 border-slate-100'}`}>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Kho</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Vị trí</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Sức chứa</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Hiện có</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Tỷ lệ lấp đầy</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredWarehouses.map((wh, idx) => (
                  <tr key={wh.custom_id || idx} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                          <Warehouse size={18} />
                        </div>
                        <div>
                          <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{wh.name}</p>
                          <p className="text-[10px] font-bold text-blue-600 uppercase">{wh.custom_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                        <MapPin size={14} className="text-slate-400" /> {wh.location || 'Chưa xác định'}
                      </div>
                    </td>
                    <td className={`px-8 py-5 text-sm font-black text-right ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {wh.capacity.toLocaleString()} <span className="text-[10px] text-slate-400">SP</span>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-emerald-600 text-right">
                      {wh.current_usage.toLocaleString()} <span className="text-[10px] text-slate-400">SP</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <div className={`flex-1 rounded-full h-2 overflow-hidden border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${wh.current_usage/wh.capacity > 0.9 ? 'bg-rose-500' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min((wh.current_usage / wh.capacity) * 100, 100)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${wh.current_usage/wh.capacity > 0.9 ? (isDarkMode ? 'bg-rose-900/20 text-rose-400' : 'bg-rose-100 text-rose-700') : (isDarkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-700')}`}>
                          {Math.round((wh.current_usage / wh.capacity) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openDetail(wh)} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-blue-400 hover:bg-blue-900/20' : 'text-blue-600 hover:bg-blue-50'}`} title="Chi tiết">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => openEditModal(wh)} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-amber-400 hover:bg-amber-900/20' : 'text-amber-600 hover:bg-amber-50'}`} title="Sửa">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(wh.custom_id)} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-rose-400 hover:bg-rose-900/20' : 'text-rose-600 hover:bg-rose-50'}`} title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50/80 border-slate-100'}`}>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Mã phiếu</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Ngày lập</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Kho nguồn</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Kho đích</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Số lượng</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {transfers.map(t => (
                  <tr key={t.id || t.code} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-8 py-5 text-sm font-black">
                       <div className={`px-3 py-1 rounded-lg w-fit border ${isDarkMode ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{t.code}</div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-bold">{t.date}</td>
                    <td className={`px-8 py-5 text-sm font-bold flex items-center gap-2 mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                       <div className="w-2 h-2 bg-rose-400 rounded-full"></div> {t.from_warehouse}
                    </td>
                    <td className={`px-8 py-5 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                       <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div> {t.to_warehouse}</div>
                    </td>
                    <td className={`px-8 py-5 text-sm font-black text-right ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t.quantity.toLocaleString()}</td>
                    <td className="px-8 py-5 text-center">
                       <div className="flex justify-center">{getStatusBadge(t.status)}</div>
                    </td>
                    <td className="px-8 py-5">
                      {t.status === 'pending' && (
                        <div className="flex justify-center gap-3">
                          <button onClick={() => updateTransferStatus(t.id, 'completed')} className={`p-2.5 rounded-xl transition-all shadow-sm active:scale-90 ${isDarkMode ? 'text-emerald-400 bg-emerald-900/20 hover:bg-emerald-600 hover:text-white' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white'}`} title="Hoàn thành">
                            <CheckCircle size={18} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => updateTransferStatus(t.id, 'cancelled')} className={`p-2.5 rounded-xl transition-all shadow-sm active:scale-90 ${isDarkMode ? 'text-rose-400 bg-rose-900/20 hover:bg-rose-600 hover:text-white' : 'text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white'}`} title="Hủy">
                            <XCircle size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedWarehouse ? 'Chỉnh sửa kho' : 'Thêm kho mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            <form onSubmit={handleAddEdit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mã kho *</label>
                <input
                  type="text" required
                  disabled={!!selectedWarehouse}
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white disabled:opacity-50' : 'bg-slate-50 border-slate-200 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400'}`}
                  value={formData.custom_id}
                  onChange={(e) => setFormData({...formData, custom_id: e.target.value})}
                  placeholder="WH001"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tên kho *</label>
                <input
                  type="text" required
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Tên kho hàng"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Sức chứa (Đơn vị SP) *</label>
                <input
                  type="number" required
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Vị trí</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Khu vực A, Tầng 1..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Hủy</button>
                <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedWarehouse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border flex flex-col transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`flex items-center justify-between p-8 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                  <Warehouse size={24} strokeWidth={2.5} />
                </div>
                <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Chi tiết kho: {selectedWarehouse.name}
                </h3>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <div className={`p-6 rounded-2xl space-y-4 border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] border-b pb-3 mb-4 ${isDarkMode ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'}`}>Thông tin cơ bản</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Mã định danh:</span>
                    <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedWarehouse.custom_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Tên kho hàng:</span>
                    <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedWarehouse.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Sức chứa tối đa:</span>
                    <span className="text-sm font-black text-blue-500">{selectedWarehouse.capacity.toLocaleString()} SP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Hiện tại sử dụng:</span>
                    <span className="text-sm font-black text-emerald-500">{selectedWarehouse.current_usage.toLocaleString()} SP</span>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center p-6 rounded-2xl border border-transparent">
                  <div className="relative w-40 h-40 mb-6">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" className={`${isDarkMode ? 'text-slate-800' : 'text-slate-100'}`} stroke="currentColor" strokeWidth="3.5" />
                      <circle
                        cx="18" cy="18" r="16" fill="none"
                        className={`${selectedWarehouse.current_usage/selectedWarehouse.capacity > 0.9 ? 'text-rose-500' : 'text-blue-600'}`}
                        stroke="currentColor" strokeWidth="3.5" strokeDasharray="100"
                        strokeDashoffset={100 - Math.min((selectedWarehouse.current_usage/selectedWarehouse.capacity)*100, 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{Math.round((selectedWarehouse.current_usage/selectedWarehouse.capacity)*100)}%</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Đã lấp đầy</span>
                    </div>
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tỷ lệ không gian khả dụng</p>
                </div>
              </div>

              <div>
                <h4 className={`text-sm font-black mb-6 flex items-center gap-3 uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Package size={16} strokeWidth={2.5} />
                  </div>
                  Danh mục hàng hóa hiện có
                </h4>
                <div className={`rounded-2xl border overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã vạch/Mã SP</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tồn thực tế</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                      {warehouseProducts.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Package className="text-slate-700/20" size={32} />
                              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Kho đang trống</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        warehouseProducts.map((p, idx) => (
                          <tr key={idx} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                            <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{p.name}</td>
                            <td className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-tighter">{p.code}</td>
                            <td className={`px-6 py-4 text-sm font-black text-right tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{p.quantity.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className={`p-8 border-t flex justify-end transition-colors ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              <button onClick={() => setIsDetailOpen(false)} className={`px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10'}`}>Đóng cửa sổ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousesPage;
