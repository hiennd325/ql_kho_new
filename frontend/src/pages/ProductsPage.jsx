import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Printer,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Box,
  Users,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const ProductsPage = () => {
  const { isDarkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [brandFilter, setBrandFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const limit = 6;

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    customId: '',
    name: '',
    description: '',
    price: '',
    brand: '',
    supplierId: ''
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearchTerm,
        page: currentPage,
        limit: limit,
      };
      if (brandFilter !== 'all') params.brand = brandFilter;
      if (supplierFilter !== 'all') params.supplier = supplierFilter;

      const response = await api.get('/products', { params });
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, currentPage, brandFilter, supplierFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchFilters = async () => {
    try {
      const [brandsRes, suppliersRes] = await Promise.all([
        api.get('/products/brands'),
        api.get('/suppliers')
      ]);
      setBrands(brandsRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchFilters();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xác nhận xóa sản phẩm này?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
        fetchFilters();
      } catch (error) {
        alert('Lỗi khi xóa sản phẩm: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        ...formData,
        price: parseFloat(formData.price),
        supplierId: formData.supplierId || null
      });
      setIsAddModalOpen(false);
      resetForm();
      fetchProducts();
      fetchFilters();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${selectedProduct.id}`, {
        ...formData,
        price: parseFloat(formData.price),
        supplierId: formData.supplierId || null
      });
      setIsEditModalOpen(false);
      resetForm();
      fetchProducts();
      fetchFilters();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      customId: product.custom_id || '',
      name: product.name,
      description: product.description || '',
      price: product.price,
      brand: product.brand || '',
      supplierId: product.supplier_id || ''
    });
    setIsEditModalOpen(true);
  };

  const openDetailModal = (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      customId: '',
      name: '',
      description: '',
      price: '',
      brand: '',
      supplierId: ''
    });
    setSelectedProduct(null);
  };

  const exportToCSV = async () => {
    try {
      const params = { search: searchTerm };
      if (brandFilter !== 'all') params.brand = brandFilter;
      if (supplierFilter !== 'all') params.supplier = supplierFilter;

      const response = await api.get('/products/export', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Lỗi xuất dữ liệu');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatCurrency = (amount) => {
    const value = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
  };

  return (
    <div className="space-y-6">
      {/* Stats & Actions */}
      <div className={`flex flex-col xl:flex-row xl:items-center justify-between gap-8 p-8 rounded-[32px] border shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-5 rounded-[24px] text-white shadow-xl shadow-blue-600/20">
            <Box size={36} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Quản lý kho hàng</p>
            <h3 className={`text-4xl font-black tracking-tighter leading-none flex items-baseline gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {totalCount}
              <span className="text-sm font-black text-slate-300 uppercase tracking-widest">Sản phẩm hiện có</span>
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl hover:bg-blue-600 transition-all font-black shadow-xl active:scale-95 group uppercase tracking-widest text-xs ${isDarkMode ? 'bg-blue-600 text-white shadow-blue-900/20' : 'bg-slate-900 text-white shadow-slate-900/10'}`}
          >
            <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
            Nhập hàng mới
          </button>
          <div className={`h-12 w-px mx-2 hidden xl:block ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
          <div className="flex items-center gap-2">
            <button onClick={exportToCSV} className={`p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all hover:text-blue-600 group border border-transparent hover:border-slate-100 ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-600'}`} title="Xuất CSV">
              <Download size={20} strokeWidth={2.5} />
            </button>
            <button onClick={() => window.print()} className={`p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all hover:text-blue-600 group border border-transparent hover:border-slate-100 ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-600'}`} title="In báo cáo">
              <Printer size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-5 rounded-2xl shadow-sm border flex flex-wrap gap-5 items-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="relative group flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Tìm theo tên, mã sản phẩm, thương hiệu..."
            className={`w-full pl-12 pr-4 py-3.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 border rounded-xl px-4 py-1 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <Filter size={18} className="text-slate-400" />
            <select
              value={brandFilter}
              onChange={(e) => { setBrandFilter(e.target.value); setCurrentPage(1); }}
              className={`bg-transparent py-2.5 outline-none text-sm font-bold min-w-[140px] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
            >
              <option value="all" className={isDarkMode ? 'bg-slate-900' : ''}>Tất cả nhãn hiệu</option>
              {brands.map(brand => <option key={brand} value={brand} className={isDarkMode ? 'bg-slate-900' : ''}>{brand}</option>)}
            </select>
          </div>

          <div className={`flex items-center gap-2 border rounded-xl px-4 py-1 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <Users size={18} className="text-slate-400" />
            <select
              value={supplierFilter}
              onChange={(e) => { setSupplierFilter(e.target.value); setCurrentPage(1); }}
              className={`bg-transparent py-2.5 outline-none text-sm font-bold min-w-[140px] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
            >
              <option value="all" className={isDarkMode ? 'bg-slate-900' : ''}>Tất cả NCC</option>
              {suppliers.map(s => <option key={s.id} value={s.id} className={isDarkMode ? 'bg-slate-900' : ''}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Sản phẩm</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Đơn giá</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Thương hiệu</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">Tình trạng</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Ngày tạo</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-50'}`}>
              {loading ? (
                <tr><td colSpan="6" className="px-8 py-24 text-center"><div className="flex flex-col items-center gap-4"><RefreshCw className="w-10 h-10 text-blue-600 animate-spin" /><p className="text-slate-400 font-black uppercase text-xs tracking-widest animate-pulse">Đang tải dữ liệu...</p></div></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="6" className="px-8 py-24 text-center"><div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}><Box size={40} /></div><p className="text-slate-400 font-black uppercase text-xs tracking-widest">Kho hàng đang trống</p></td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className={`transition-all group ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/70'}`}>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className={`text-sm font-black group-hover:text-blue-600 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{product.name}</span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter mt-1">{product.custom_id || product.id}</span>
                      </div>
                    </td>
                    <td className={`px-8 py-6 text-sm text-right font-black tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(product.price)}</td>
                    <td className="px-8 py-6">
                      <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${isDarkMode ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-500 bg-slate-100 border-slate-200/50'}`}>{product.brand || 'Phổ thông'}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black shadow-sm border ${product.quantity > 10 ? (isDarkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-100') : (isDarkMode ? 'bg-rose-900/20 text-rose-400 border-rose-800' : 'bg-rose-50 text-rose-700 border-rose-100')}`}>
                          {product.quantity || 0} ĐƠN VỊ
                        </span>
                        {product.quantity <= 10 && <span className="text-[10px] font-black text-rose-500 uppercase animate-pulse">Sắp hết hàng</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-tighter">{formatDate(product.created_at)}</td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center items-center gap-3">
                        <button onClick={() => openDetailModal(product)} className={`p-3 text-slate-400 border hover:border-blue-500 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-500/10 rounded-2xl transition-all active:scale-90 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`} title="Chi tiết">
                          <Eye size={16} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => openEditModal(product)} className={`p-3 text-slate-400 border hover:border-amber-500 hover:text-amber-600 hover:shadow-lg hover:shadow-amber-500/10 rounded-2xl transition-all active:scale-90 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`} title="Sửa">
                          <Edit size={16} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className={`p-3 text-slate-400 border hover:border-rose-500 hover:text-rose-600 hover:shadow-lg hover:shadow-rose-500/10 rounded-2xl transition-all active:scale-90 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`} title="Xóa">
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={`px-8 py-6 border-t flex items-center justify-between transition-colors duration-300 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/30 border-slate-100'}`}>
          <p className="text-sm text-slate-500 font-medium">
            Hiển thị <span className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{(currentPage - 1) * limit + 1}</span> - <span className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{Math.min(currentPage * limit, totalCount)}</span> của <span className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalCount}</span> sản phẩm
          </p>
          <div className="flex items-center gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className={`p-2.5 border rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border-slate-200'}`}
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <div className={`border px-5 py-2 rounded-xl text-sm font-black shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
               Trang {currentPage} / {totalPages}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className={`p-2.5 border rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border-slate-200'}`}
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Thêm sản phẩm mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mã sản phẩm *</label>
                <input
                  type="text" required
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  value={formData.customId}
                  onChange={(e) => setFormData({...formData, customId: e.target.value})}
                  placeholder="SP001"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tên sản phẩm *</label>
                <input
                  type="text" required
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Tên sản phẩm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Giá bán *</label>
                  <input
                    type="number" required
                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nhãn hiệu</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    placeholder="Samsung..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nhà cung cấp</label>
                <select
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  value={formData.supplierId}
                  onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                >
                  <option value="" className={isDarkMode ? 'bg-slate-900' : ''}>Chọn nhà cung cấp</option>
                  {suppliers.map(s => <option key={s.id} value={s.id} className={isDarkMode ? 'bg-slate-900' : ''}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mô tả</label>
                <textarea
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Chi tiết sản phẩm..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Hủy</button>
                <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95">Lưu sản phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Chỉnh sửa sản phẩm</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mã sản phẩm (Không thể sửa)</label>
                <input
                  type="text" disabled
                  className={`w-full px-4 py-3 border rounded-xl font-bold cursor-not-allowed opacity-60 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                  value={formData.customId}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tên sản phẩm *</label>
                <input
                  type="text" required
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Giá bán *</label>
                  <input
                    type="number" required
                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nhãn hiệu</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nhà cung cấp</label>
                <select
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  value={formData.supplierId}
                  onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                >
                  <option value="" className={isDarkMode ? 'bg-slate-900' : ''}>Chọn nhà cung cấp</option>
                  {suppliers.map(s => <option key={s.id} value={s.id} className={isDarkMode ? 'bg-slate-900' : ''}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mô tả</label>
                <textarea
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Hủy</button>
                <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`flex items-center justify-between p-8 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                  <Box size={24} strokeWidth={2.5} />
                </div>
                <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Chi tiết sản phẩm</h3>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                <X size={24} strokeWidth={3} />
              </button>
            </div>
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Mã sản phẩm</label>
                    <p className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedProduct.custom_id || selectedProduct.id}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Tên sản phẩm</label>
                    <p className={`text-lg font-bold leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{selectedProduct.name}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Giá bán niêm yết</label>
                    <p className="text-3xl font-black text-blue-600 tracking-tighter tabular-nums">{formatCurrency(selectedProduct.price)}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Trạng thái tồn kho</label>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black shadow-sm border ${selectedProduct.quantity > 10 ? (isDarkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-100') : (isDarkMode ? 'bg-rose-900/20 text-rose-400 border-rose-800' : 'bg-rose-50 text-rose-700 border-rose-100')}`}>
                        {selectedProduct.quantity || 0} ĐƠN VỊ
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Thương hiệu</label>
                    <p className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{selectedProduct.brand || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Ngày nhập hệ thống</label>
                    <p className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{formatDate(selectedProduct.created_at)}</p>
                  </div>
                </div>
              </div>
              <div className={`mt-10 pt-8 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Mô tả sản phẩm</label>
                <div className={`p-6 rounded-2xl text-sm font-medium leading-relaxed min-h-[140px] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                  {selectedProduct.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                </div>
              </div>
              <div className="flex justify-end mt-10">
                <button onClick={() => setIsDetailModalOpen(false)} className={`px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/5' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10'}`}>Đóng cửa sổ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
