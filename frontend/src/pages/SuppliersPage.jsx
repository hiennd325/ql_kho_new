import React, { useState, useEffect, useCallback } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X,
  Mail,
  Phone,
  MapPin,
  Save
} from 'lucide-react';
import api from '../services/api';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/suppliers', { params: { search: searchTerm } });
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleAddEdit = async (e) => {
    e.preventDefault();
    
    // Validation
    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      alert('Số điện thoại phải là 10 chữ số.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      alert('Định dạng email không hợp lệ.');
      return;
    }

    try {
      if (selectedSupplier) {
        await api.put(`/suppliers/${selectedSupplier.id}`, formData);
      } else {
        await api.post('/suppliers', formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        fetchSuppliers();
      } catch (error) {
        alert('Lỗi khi xóa nhà cung cấp: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      code: supplier.code,
      name: supplier.name,
      address: supplier.address || '',
      phone: supplier.phone || '',
      email: supplier.email || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ code: '', name: '', address: '', phone: '', email: '' });
    setSelectedSupplier(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
            <Truck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Nhà cung cấp</h2>
            <p className="text-sm text-gray-500">Quản lý danh sách đối tác cung ứng</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm NCC..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap"
          >
            <Plus size={18} /> Thêm NCC
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-500">Đang tải dữ liệu...</div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-20 text-center flex flex-col items-center">
          <div className="bg-gray-50 p-6 rounded-full mb-4 text-gray-400">
            <Truck size={48} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Không tìm thấy nhà cung cấp nào</h3>
          <p className="text-gray-500 mt-1">Hãy thử tìm kiếm khác hoặc thêm nhà cung cấp mới.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-xl">
                      {supplier.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight">{supplier.name}</h4>
                      <p className="text-xs text-gray-500 font-medium">Mã: {supplier.code}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(supplier)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(supplier.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mt-4 text-sm">
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPin size={16} className="mt-0.5 shrink-0" />
                    <span>{supplier.address || 'Chưa cập nhật địa chỉ'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone size={16} className="shrink-0" />
                    <span>{supplier.phone || 'Chưa cập nhật SĐT'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail size={16} className="shrink-0" />
                    <span className="truncate">{supplier.email || 'Chưa cập nhật email'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b bg-orange-50/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                {selectedSupplier ? <Edit size={20} className="text-orange-600" /> : <Plus size={20} className="text-orange-600" />}
                {selectedSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã NCC *</label>
                <input 
                  type="text" required
                  disabled={!!selectedSupplier}
                  placeholder="Nhập mã nhà cung cấp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhà cung cấp *</label>
                <input 
                  type="text" required
                  placeholder="Nhập tên công ty / đại lý"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input 
                  type="text"
                  placeholder="Nhập địa chỉ trụ sở"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input 
                    type="tel"
                    placeholder="10 chữ số"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email"
                    placeholder="example@domain.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Hủy bỏ</button>
                <button type="submit" className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold flex items-center gap-2 shadow-md transition-all active:scale-95">
                  <Save size={18} /> Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
