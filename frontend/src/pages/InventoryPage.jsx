import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  AlertTriangle,
  X,
  Trash2,
  ChevronDown,
  Warehouse
} from 'lucide-react';
import api from '../services/api';

const InventoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [activeTab, setActiveTab] = useState('import'); // 'import', 'export', 'alerts'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const limit = 10;

  // Modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form states
  const [importForm, setImportForm] = useState({
    supplier_id: '',
    warehouse_id: '',
    items: [{ product_id: '', quantity: 1 }]
  });

  const [exportForm, setExportForm] = useState({
    customer_name: '',
    warehouse_id: '',
    items: [{ product_id: '', quantity: 1 }]
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        search: searchTerm,
        warehouseId: warehouseFilter,
        type: activeTab === 'import' ? 'nhap' : (activeTab === 'export' ? 'xuat' : '')
      };

      const [transRes, statsRes, alertsRes, whRes, prodRes, suppRes] = await Promise.all([
        activeTab === 'alerts' ? Promise.resolve({ data: { transactions: [] } }) : api.get('/inventory/transactions', { params }),
        api.get('/reports/quick-stats'),
        api.get('/reports/alerts', { params: { warehouse: warehouseFilter } }),
        api.get('/warehouses'),
        api.get('/products'),
        api.get('/suppliers')
      ]);

      if (activeTab !== 'alerts') {
        setTransactions(transRes.data.transactions);
        setTotalPages(transRes.data.totalPages);
        setTotalCount(transRes.data.totalCount);
      }
      setStats(statsRes.data);
      setAlerts(alertsRes.data);
      setWarehouses(whRes.data);
      setProducts(prodRes.data.products || []);
      setSuppliers(suppRes.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, warehouseFilter, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/import', {
        supplier_id: parseInt(importForm.supplier_id),
        warehouse_id: importForm.warehouse_id,
        products: importForm.items.map(item => ({
          product_id: item.product_id,
          quantity: parseInt(item.quantity)
        }))
      });
      setIsImportModalOpen(false);
      resetImportForm();
      fetchData();
      alert('Nhập kho thành công!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleExportSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/export', {
        customer_name: exportForm.customer_name,
        warehouse_id: exportForm.warehouse_id,
        products: exportForm.items.map(item => ({
          product_id: item.product_id,
          quantity: parseInt(item.quantity)
        }))
      });
      setIsExportModalOpen(false);
      resetExportForm();
      fetchData();
      alert('Xuất kho thành công!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetImportForm = () => {
    setImportForm({ supplier_id: '', warehouse_id: '', items: [{ product_id: '', quantity: 1 }] });
  };

  const resetExportForm = () => {
    setExportForm({ customer_name: '', warehouse_id: '', items: [{ product_id: '', quantity: 1 }] });
  };

  const addImportItem = () => {
    setImportForm({ ...importForm, items: [...importForm.items, { product_id: '', quantity: 1 }] });
  };

  const addExportItem = () => {
    setExportForm({ ...exportForm, items: [...exportForm.items, { product_id: '', quantity: 1 }] });
  };

  const removeImportItem = (index) => {
    const newItems = importForm.items.filter((_, i) => i !== index);
    setImportForm({ ...importForm, items: newItems });
  };

  const removeExportItem = (index) => {
    const newItems = exportForm.items.filter((_, i) => i !== index);
    setExportForm({ ...exportForm, items: newItems });
  };

  const handleImportItemChange = (index, field, value) => {
    const newItems = [...importForm.items];
    newItems[index][field] = value;
    setImportForm({ ...importForm, items: newItems });
  };

  const handleExportItemChange = (index, field, value) => {
    const newItems = [...exportForm.items];
    newItems[index][field] = value;
    setExportForm({ ...exportForm, items: newItems });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  const groupedTransactions = transactions.reduce((acc, t) => {
    if (!acc[t.reference_id]) acc[t.reference_id] = [];
    acc[t.reference_id].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng nhập</p>
            <h3 className="text-xl font-bold">{stats.total_import || 0} SP</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-lg text-red-600"><TrendingDown size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng xuất</p>
            <h3 className="text-xl font-bold">{stats.total_export || 0} SP</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Package size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng tồn kho</p>
            <h3 className="text-xl font-bold">{stats.total_inventory || 0} SP</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600"><DollarSign size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Giá trị tồn</p>
            <h3 className="text-xl font-bold">{formatCurrency(stats.total_value || 0)}</h3>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 w-fit">
          <button 
            onClick={() => { setActiveTab('import'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'import' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Phiếu nhập
          </button>
          <button 
            onClick={() => { setActiveTab('export'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'export' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Phiếu xuất
          </button>
          <button 
            onClick={() => { setActiveTab('alerts'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'alerts' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 flex items-center gap-2'}`}
          >
            Cảnh báo {alerts.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{alerts.length}</span>}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={warehouseFilter}
            onChange={(e) => { setWarehouseFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Tất cả kho</option>
            {warehouses.map(w => <option key={w.custom_id} value={w.custom_id}>{w.name}</option>)}
          </select>

          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-sm"
            >
              <Plus size={18} /> Tạo phiếu <ChevronDown size={16} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                <button 
                  onClick={() => { setIsImportModalOpen(true); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600 font-medium"
                >
                  <TrendingUp size={16} /> Phiếu nhập kho
                </button>
                <button 
                  onClick={() => { setIsExportModalOpen(true); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 font-medium"
                >
                  <TrendingDown size={16} /> Phiếu xuất kho
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {activeTab === 'alerts' ? (
                  <>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã SP</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Số lượng</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Mức tối thiểu</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kho</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Số phiếu</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày giao dịch</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">SL</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Giá trị</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kho</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Loại</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500 italic">Đang tải dữ liệu...</td></tr>
              ) : activeTab === 'alerts' ? (
                alerts.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-400 italic">Không có cảnh báo tồn kho nào</td></tr>
                ) : (
                  alerts.map(alert => (
                    <tr key={alert.id} className="hover:bg-red-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">SP{alert.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">{alert.name}</td>
                      <td className="px-6 py-4 text-sm text-right text-red-600 font-bold">{alert.quantity}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-500 font-medium">{alert.min_quantity || 10}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{alert.warehouse_name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Sắp hết hàng</span>
                      </td>
                    </tr>
                  ))
                )
              ) : transactions.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-400 italic">Không có dữ liệu phiếu</td></tr>
              ) : (
                Object.entries(groupedTransactions).map(([refId, group]) => (
                  <React.Fragment key={refId}>
                    {group.map((t, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        {idx === 0 && (
                          <>
                            <td className="px-6 py-4 text-sm font-bold text-blue-600" rowSpan={group.length}>{refId}</td>
                            <td className="px-6 py-4 text-sm text-gray-500" rowSpan={group.length}>{new Date(t.transaction_date).toLocaleDateString('vi-VN')}</td>
                          </>
                        )}
                        <td className="px-6 py-4 text-sm text-gray-700">{t.product_name}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium">{t.quantity}</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-900 font-bold">{formatCurrency(t.value || (t.price * t.quantity))}</td>
                        {idx === 0 && (
                          <>
                            <td className="px-6 py-4 text-sm text-gray-600 font-medium" rowSpan={group.length}>{t.warehouse_name}</td>
                            <td className="px-6 py-4 text-sm" rowSpan={group.length}>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.type === 'nhap' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {t.type === 'nhap' ? 'Nhập kho' : 'Xuất kho'}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {activeTab !== 'alerts' && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <p className="text-sm text-gray-500">
              Hiển thị <span className="font-medium">{(currentPage - 1) * limit + 1}</span> - <span className="font-medium">{Math.min(currentPage * limit, totalCount)}</span> trong <span className="font-medium">{totalCount}</span> kết quả
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-bold px-4 text-gray-700">Trang {currentPage} / {totalPages}</span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b bg-green-50/50">
              <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
                <TrendingUp size={24} /> Tạo phiếu nhập kho
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleImportSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nhà cung cấp *</label>
                  <select 
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    value={importForm.supplier_id}
                    onChange={(e) => setImportForm({...importForm, supplier_id: e.target.value})}
                  >
                    <option value="">-- Chọn nhà cung cấp --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nhập vào kho *</label>
                  <select 
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    value={importForm.warehouse_id}
                    onChange={(e) => setImportForm({...importForm, warehouse_id: e.target.value})}
                  >
                    <option value="">-- Chọn kho nhận --</option>
                    {warehouses.map(w => <option key={w.custom_id} value={w.custom_id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-bold text-gray-700">Danh sách sản phẩm</label>
                  <button type="button" onClick={addImportItem} className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                    <Plus size={14} /> Thêm dòng
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {importForm.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start p-3 bg-gray-50 rounded-xl border border-gray-200 group">
                      <select 
                        required
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                        value={item.product_id}
                        onChange={(e) => handleImportItemChange(idx, 'product_id', e.target.value)}
                      >
                        <option value="">-- Chọn sản phẩm --</option>
                        {products.map(p => <option key={p.id} value={p.custom_id}>{p.name} (Tồn: {p.quantity})</option>)}
                      </select>
                      <input 
                        type="number" required min="1"
                        placeholder="SL"
                        className="w-20 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 text-center font-bold"
                        value={item.quantity}
                        onChange={(e) => handleImportItemChange(idx, 'quantity', e.target.value)}
                      />
                      <button 
                        type="button" 
                        onClick={() => removeImportItem(idx)}
                        disabled={importForm.items.length === 1}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-0 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-all">Hủy bỏ</button>
                <button type="submit" className="px-8 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold shadow-lg shadow-green-100 transition-all active:scale-95">Lưu phiếu nhập</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b bg-red-50/50">
              <h3 className="text-xl font-bold text-red-800 flex items-center gap-2">
                <TrendingDown size={24} /> Tạo phiếu xuất kho
              </h3>
              <button onClick={() => setIsExportModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleExportSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Khách hàng / Đối tác *</label>
                  <input 
                    type="text" required
                    placeholder="Nhập tên khách hàng"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    value={exportForm.customer_name}
                    onChange={(e) => setExportForm({...exportForm, customer_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Xuất từ kho *</label>
                  <select 
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    value={exportForm.warehouse_id}
                    onChange={(e) => setExportForm({...exportForm, warehouse_id: e.target.value})}
                  >
                    <option value="">-- Chọn kho xuất --</option>
                    {warehouses.map(w => <option key={w.custom_id} value={w.custom_id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-bold text-gray-700">Danh sách sản phẩm</label>
                  <button type="button" onClick={addExportItem} className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                    <Plus size={14} /> Thêm dòng
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {exportForm.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start p-3 bg-gray-50 rounded-xl border border-gray-200 group">
                      <select 
                        required
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500"
                        value={item.product_id}
                        onChange={(e) => handleExportItemChange(idx, 'product_id', e.target.value)}
                      >
                        <option value="">-- Chọn sản phẩm --</option>
                        {products.map(p => <option key={p.id} value={p.custom_id}>{p.name} (Tồn: {p.quantity})</option>)}
                      </select>
                      <input 
                        type="number" required min="1"
                        placeholder="SL"
                        className="w-20 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500 text-center font-bold"
                        value={item.quantity}
                        onChange={(e) => handleExportItemChange(idx, 'quantity', e.target.value)}
                      />
                      <button 
                        type="button" 
                        onClick={() => removeExportItem(idx)}
                        disabled={exportForm.items.length === 1}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-0 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsExportModalOpen(false)} className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-all">Hủy bỏ</button>
                <button type="submit" className="px-8 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-lg shadow-red-100 transition-all active:scale-95">Lưu phiếu xuất</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
