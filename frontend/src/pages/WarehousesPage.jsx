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
  List
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Tổng số kho</p>
          <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Tổng sức chứa</p>
          <h3 className="text-2xl font-bold mt-1 text-blue-600">{stats.capacity.toLocaleString()} SP</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Đang sử dụng</p>
          <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.usage.toLocaleString()} SP ({stats.capacity > 0 ? Math.round((stats.usage/stats.capacity)*100) : 0}%)</h3>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutGrid size={16} /> Danh sách kho
          </button>
          <button 
            onClick={() => setActiveTab('transfers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'transfers' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <ArrowRightLeft size={16} /> Điều chuyển hàng
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm kho..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} /> Thêm kho
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarehouses.map((wh, idx) => (
            <div key={wh.custom_id || idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex flex-col justify-end">
                <h4 className="text-white font-bold text-lg">{wh.name}</h4>
                <p className="text-blue-100 text-xs">Mã kho: {wh.custom_id}</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Sức chứa</p>
                    <p className="text-sm font-semibold">{wh.capacity.toLocaleString()} SP</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Sử dụng</p>
                    <p className="text-sm font-semibold text-green-600">{wh.current_usage.toLocaleString()} SP</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Tỷ lệ sử dụng</span>
                    <span className="font-bold">{Math.round((wh.current_usage / wh.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${wh.current_usage/wh.capacity > 0.9 ? 'bg-red-500' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min((wh.current_usage / wh.capacity) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => openDetail(wh)} className="flex-1 flex justify-center items-center gap-1 bg-gray-50 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-100 font-medium">
                    <Eye size={16} /> Xem
                  </button>
                  <button onClick={() => openEditModal(wh)} className="flex-1 flex justify-center items-center gap-1 bg-gray-50 text-blue-600 py-2 rounded-lg text-sm hover:bg-blue-50 font-medium">
                    <Edit size={16} /> Sửa
                  </button>
                  <button onClick={() => handleDelete(wh.custom_id)} className="flex-1 flex justify-center items-center gap-1 bg-gray-50 text-red-600 py-2 rounded-lg text-sm hover:bg-red-50 font-medium">
                    <Trash2 size={16} /> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Mã phiếu</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ngày</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Kho nguồn</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Kho đích</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">SL</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Trạng thái</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transfers.map(t => (
                  <tr key={t.id || t.code} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{t.from_warehouse}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{t.to_warehouse}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{t.quantity}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(t.status)}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      {t.status === 'pending' && (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => updateTransferStatus(t.id, 'completed')} className="text-green-600 hover:bg-green-50 p-1 rounded" title="Hoàn thành">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => updateTransferStatus(t.id, 'cancelled')} className="text-red-600 hover:bg-red-50 p-1 rounded" title="Hủy">
                            <XCircle size={18} />
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
