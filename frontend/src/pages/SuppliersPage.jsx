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
import { useTheme } from '../context/ThemeContext';

const SuppliersPage = () => {
  const { isDarkMode } = useTheme();
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
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-orange-900/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
            <Truck size={24} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Nhà cung cấp</h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Quản lý danh sách đối tác cung ứng</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm NCC..."
              className={`pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 w-full md:w-64 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
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
        <div className={`flex justify-center py-20 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Đang tải dữ liệu...</div>
      ) : suppliers.length === 0 ? (
        <div className={`rounded-xl shadow-sm border p-20 text-center flex flex-col items-center transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <div className={`p-6 rounded-full mb-4 ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-gray-50 text-gray-400'}`}>
            <Truck size={48} />
          </div>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Không tìm thấy nhà cung cấp nào</h3>
          <p className={`mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Hãy thử tìm kiếm khác hoặc thêm nhà cung cấp mới.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {suppliers.map(supplier => (
            <div key={supplier.id} className={`rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${isDarkMode ? 'bg-orange-900/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                      {supplier.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className={`font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{supplier.name}</h4>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Mã: {supplier.code}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(supplier)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-blue-400 hover:bg-blue-900/20' : 'text-blue-600 hover:bg-blue-50'}`} title="Sửa">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(supplier.id)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`} title="Xóa">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className={`space-y-3 mt-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className={`mt-0.5 shrink-0 ${isDarkMode ? 'text-slate-500' : ''}`} />
                    <span>{supplier.address || 'Chưa cập nhật địa chỉ'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className={`shrink-0 ${isDarkMode ? 'text-slate-500' : ''}`} />
                    <span>{supplier.phone || 'Chưa cập nhật SĐT'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className={`shrink-0 ${isDarkMode ? 'text-slate-500' : ''}`} />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-xl w-full max-w-md overflow-hidden border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-orange-50/50 border-slate-100'}`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {selectedSupplier ? <Edit size={20} className="text-orange-600" /> : <Plus size={20} className="text-orange-600" />}
                {selectedSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className={`transition-colors ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddEdit} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Mã NCC *</label>
                <input
                  type="text" required
                  disabled={!!selectedSupplier}
                  placeholder="Nhập mã nhà cung cấp"
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 disabled:bg-slate-800/50 disabled:text-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500'}`}
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Tên nhà cung cấp *</label>
                <input
                  type="text" required
                  placeholder="Nhập tên công ty / đại lý"
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Địa chỉ</label>
                <input
                  type="text"
                  placeholder="Nhập địa chỉ trụ sở"
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="10 chữ số"
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Email</label>
                  <input
                    type="email"
                    placeholder="example@domain.com"
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}>Hủy bỏ</button>
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
