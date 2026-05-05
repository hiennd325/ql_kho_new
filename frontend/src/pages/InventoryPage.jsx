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
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 hover:shadow-sm transition-all">
          <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-600"><TrendingUp size={22} /></div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tổng nhập</p>
            <h3 className="text-xl font-black text-slate-900">{stats.total_import || 0} <span className="text-xs font-medium text-slate-400">SP</span></h3>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 hover:shadow-sm transition-all">
          <div className="bg-rose-50 p-2.5 rounded-lg text-rose-600"><TrendingDown size={22} /></div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tổng xuất</p>
            <h3 className="text-xl font-black text-slate-900">{stats.total_export || 0} <span className="text-xs font-medium text-slate-400">SP</span></h3>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 hover:shadow-sm transition-all">
          <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600"><Package size={22} /></div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tồn kho</p>
            <h3 className="text-xl font-black text-slate-900">{stats.total_inventory || 0} <span className="text-xs font-medium text-slate-400">SP</span></h3>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 hover:shadow-sm transition-all">
          <div className="bg-amber-50 p-2.5 rounded-lg text-amber-600"><DollarSign size={22} /></div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Giá trị tồn</p>
            <h3 className="text-xl font-black text-slate-900 truncate">{formatCurrency(stats.total_value || 0)}</h3>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1.5 rounded-xl w-fit">
          <button
            onClick={() => { setActiveTab('import'); setCurrentPage(1); }}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'import' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Phiếu nhập
          </button>
          <button
            onClick={() => { setActiveTab('export'); setCurrentPage(1); }}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'export' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Phiếu xuất
          </button>
          <button
            onClick={() => { setActiveTab('alerts'); setCurrentPage(1); }}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'alerts' ? 'bg-rose-600 text-white shadow-md shadow-rose-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Cảnh báo {alerts.length > 0 && <span className={`${activeTab === 'alerts' ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'} text-[10px] px-1.5 py-0.5 rounded-full`}>{alerts.length}</span>}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm mã phiếu, sản phẩm..."
              className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-full transition-all font-medium"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
            <Warehouse size={18} className="text-slate-400" />
            <select
              className="bg-transparent py-2 outline-none text-sm font-bold text-slate-700 min-w-[120px]"
              value={warehouseFilter}
              onChange={(e) => { setWarehouseFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Tất cả kho</option>
              {warehouses.map(w => <option key={w.custom_id} value={w.custom_id}>{w.name}</option>)}
            </select>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-black shadow-lg shadow-blue-100 active:scale-95"
            >
              <Plus size={20} strokeWidth={3} /> TẠO PHIẾU <ChevronDown size={18} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 mb-2 border-b border-slate-50">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại giao dịch</p>
                </div>
                <button
                  onClick={() => { setIsImportModalOpen(true); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 flex items-center gap-3 text-emerald-600 font-bold transition-colors"
                >
                  <div className="bg-emerald-100 p-1.5 rounded-lg"><TrendingUp size={16} /></div>
                  Nhập kho mới
                </button>
                <button
                  onClick={() => { setIsExportModalOpen(true); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-rose-50 flex items-center gap-3 text-rose-600 font-bold transition-colors"
                >
                  <div className="bg-rose-100 p-1.5 rounded-lg"><TrendingDown size={16} /></div>
                  Xuất kho mới
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {activeTab === 'alerts' ? (
                  <>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Mã SP</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Tên sản phẩm</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Số lượng</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Tối thiểu</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Kho</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
                  </>
                ) : (
                  <>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Số phiếu</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Ngày giao dịch</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Sản phẩm</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">SL</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Giá trị</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Kho</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Loại</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="px-8 py-20 text-center"><div className="flex flex-col items-center gap-3"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div><p className="text-slate-400 font-bold italic">Đang tải dữ liệu...</p></div></td></tr>
              ) : activeTab === 'alerts' ? (
                alerts.length === 0 ? (
                  <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-medium italic">Không có cảnh báo tồn kho nào</td></tr>
                ) : (
                  alerts.map(alert => (
                    <tr key={alert.id} className="hover:bg-rose-50/30 transition-colors group">
                      <td className="px-8 py-5 text-sm font-black text-slate-900">SP{alert.id}</td>
                      <td className="px-8 py-5 text-sm text-slate-700 font-bold group-hover:text-blue-600 transition-colors">{alert.name}</td>
                      <td className="px-8 py-5 text-sm text-right text-rose-600 font-black">{alert.quantity}</td>
                      <td className="px-8 py-5 text-sm text-right text-slate-400 font-bold">{alert.min_quantity || 10}</td>
                      <td className="px-8 py-5 text-sm text-slate-600 font-medium">{alert.warehouse_name}</td>
                      <td className="px-8 py-5 text-center">
                        <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm border border-rose-200">Sắp hết hàng</span>
                      </td>
                    </tr>
                  ))
                )
              ) : transactions.length === 0 ? (
                <tr><td colSpan="7" className="px-8 py-20 text-center text-slate-400 font-medium italic">Không có dữ liệu phiếu</td></tr>
              ) : (
                Object.entries(groupedTransactions).map(([refId, group]) => (
                  <React.Fragment key={refId}>
                    {group.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        {idx === 0 && (
                          <>
                            <td className="px-8 py-5 text-sm font-black text-blue-600" rowSpan={group.length}>
                               <div className="bg-blue-50 px-3 py-1 rounded-lg w-fit border border-blue-100">{refId}</div>
                            </td>
                            <td className="px-8 py-5 text-sm text-slate-500 font-bold" rowSpan={group.length}>{new Date(t.transaction_date).toLocaleDateString('vi-VN')}</td>
                          </>
                        )}
                        <td className="px-8 py-5 text-sm text-slate-700 font-bold">{t.product_name}</td>
                        <td className="px-8 py-5 text-sm text-right font-black text-slate-900">{t.quantity}</td>
                        <td className="px-8 py-5 text-sm text-right text-slate-900 font-black">{formatCurrency(t.value || (t.price * t.quantity))}</td>
                        {idx === 0 && (
                          <>
                            <td className="px-8 py-5 text-sm text-slate-600 font-bold" rowSpan={group.length}>
                               <div className="flex items-center gap-2"><Warehouse size={14} className="text-slate-400" /> {t.warehouse_name}</div>
                            </td>
                            <td className="px-8 py-5 text-center" rowSpan={group.length}>
                              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${t.type === 'nhap' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                {t.type === 'nhap' ? 'NHẬP KHO' : 'XUẤT KHO'}
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
          <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm text-slate-500 font-medium">
              Hiển thị <span className="font-black text-slate-900">{(currentPage - 1) * limit + 1}</span> - <span className="font-black text-slate-900">{Math.min(currentPage * limit, totalCount)}</span> của <span className="font-black text-slate-900">{totalCount}</span> giao dịch
            </p>
            <div className="flex items-center gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <div className="bg-white border border-slate-200 px-5 py-2 rounded-xl text-sm font-black text-slate-700 shadow-sm">
                {currentPage} / {totalPages}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
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
