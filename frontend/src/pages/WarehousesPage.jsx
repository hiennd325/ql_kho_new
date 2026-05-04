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

const WarehousesPage = () => {
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 px-4 border-r border-slate-100 last:border-0 flex-1">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
            <Warehouse size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Tổng số kho</p>
            <h3 className="text-xl font-black text-slate-900 leading-none">{stats.total}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 px-4 border-r border-slate-100 last:border-0 flex-1">
          <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
            <LayoutGrid size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Sức chứa hệ thống</p>
            <h3 className="text-xl font-black text-blue-600 leading-none">{stats.capacity.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">SP</span></h3>
          </div>
        </div>

        <div className="flex items-center gap-4 px-4 border-r border-slate-100 last:border-0 flex-1">
          <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Mức độ lấp đầy</p>
            <h3 className="text-xl font-black text-emerald-600 leading-none">{stats.usage.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">({stats.capacity > 0 ? Math.round((stats.usage/stats.capacity)*100) : 0}%)</span></h3>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1.5 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutGrid size={18} /> Danh sách kho
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all ${activeTab === 'transfers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
              className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-full transition-all font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-black shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> THÊM KHO MỚI
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Kho</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Vị trí</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Sức chứa</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Hiện có</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Tỷ lệ lấp đầy</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWarehouses.map((wh, idx) => (
                  <tr key={wh.custom_id || idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                          <Warehouse size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{wh.name}</p>
                          <p className="text-[10px] font-bold text-blue-600 uppercase">{wh.custom_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                        <MapPin size={14} className="text-slate-400" /> {wh.location || 'Chưa xác định'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900 text-right">
                      {wh.capacity.toLocaleString()} <span className="text-[10px] text-slate-400">SP</span>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-emerald-600 text-right">
                      {wh.current_usage.toLocaleString()} <span className="text-[10px] text-slate-400">SP</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${wh.current_usage/wh.capacity > 0.9 ? 'bg-rose-500' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min((wh.current_usage / wh.capacity) * 100, 100)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${wh.current_usage/wh.capacity > 0.9 ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                          {Math.round((wh.current_usage / wh.capacity) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openDetail(wh)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Chi tiết">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => openEditModal(wh)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Sửa">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(wh.custom_id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Xóa">
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Mã phiếu</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Ngày lập</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Kho nguồn</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Kho đích</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Số lượng</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.map(t => (
                  <tr key={t.id || t.code} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 text-sm font-black text-blue-600">
                       <div className="bg-blue-50 px-3 py-1 rounded-lg w-fit border border-blue-100">{t.code}</div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-bold">{t.date}</td>
                    <td className="px-8 py-5 text-sm text-slate-700 font-bold flex items-center gap-2 mt-1">
                       <div className="w-2 h-2 bg-rose-400 rounded-full"></div> {t.from_warehouse}
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-700 font-bold">
                       <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div> {t.to_warehouse}</div>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900 text-right">{t.quantity.toLocaleString()}</td>
                    <td className="px-8 py-5 text-center">
                       <div className="flex justify-center">{getStatusBadge(t.status)}</div>
                    </td>
                    <td className="px-8 py-5">
                      {t.status === 'pending' && (
                        <div className="flex justify-center gap-3">
                          <button onClick={() => updateTransferStatus(t.id, 'completed')} className="p-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90" title="Hoàn thành">
                            <CheckCircle size={18} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => updateTransferStatus(t.id, 'cancelled')} className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90" title="Hủy">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold">{selectedWarehouse ? 'Chỉnh sửa kho' : 'Thêm kho mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã kho *</label>
                <input 
                  type="text" required
                  disabled={!!selectedWarehouse}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  value={formData.custom_id}
                  onChange={(e) => setFormData({...formData, custom_id: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên kho *</label>
                <input 
                  type="text" required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa *</label>
                <input 
                  type="number" required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedWarehouse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Warehouse className="text-blue-600" />
                Chi tiết kho: {selectedWarehouse.name}
              </h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <h4 className="font-bold text-gray-700 border-b pb-2 mb-4">Thông tin cơ bản</h4>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mã kho:</span>
                    <span className="font-bold">{selectedWarehouse.custom_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tên kho:</span>
                    <span className="font-bold">{selectedWarehouse.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sức chứa tối đa:</span>
                    <span className="font-bold text-blue-600">{selectedWarehouse.capacity.toLocaleString()} SP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hiện tại sử dụng:</span>
                    <span className="font-bold text-green-600">{selectedWarehouse.current_usage.toLocaleString()} SP</span>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center p-4">
                  <div className="relative w-32 h-32 mb-4">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path className="text-gray-200" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path className="text-blue-600" strokeDasharray={`${Math.min((selectedWarehouse.current_usage/selectedWarehouse.capacity)*100, 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                      {Math.round((selectedWarehouse.current_usage/selectedWarehouse.capacity)*100)}%
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Tỷ lệ sử dụng không gian</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Package size={18} className="text-blue-600" />
                  Sản phẩm trong kho
                </h4>
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Sản phẩm</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Mã</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Số lượng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {warehouseProducts.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-4 py-10 text-center text-gray-400">Kho đang trống</td>
                        </tr>
                      ) : (
                        warehouseProducts.map((p, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{p.code}</td>
                            <td className="px-4 py-3 text-sm font-bold text-right">{p.quantity}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setIsDetailOpen(false)} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousesPage;
