import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Warehouse,
  ChevronRight as ChevronRightIcon,
  ShoppingBag,
  Save
} from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/ui/StatCard';

const InventoryPage = () => {
  const { isDarkMode } = useTheme();
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const limit = 10;

  // Debounce search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (refId) => {
    setExpandedGroups(prev => ({ ...prev, [refId]: !prev[refId] }));
  };

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
        search: debouncedSearchTerm,
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
  }, [currentPage, debouncedSearchTerm, warehouseFilter, activeTab]);

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

  const groupedTransactions = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (!acc[t.reference_id]) acc[t.reference_id] = [];
      acc[t.reference_id].push(t);
      return acc;
    }, {});
  }, [transactions]);

  const handleQuickImport = (product) => {
    setImportForm({
      supplier_id: '',
      warehouse_id: '',
      items: [{ product_id: product.custom_id, quantity: 10 }]
    });
    setIsImportModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng nhập"
          value={stats.total_import || 0}
          detail="Sản phẩm"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          label="Tổng xuất"
          value={stats.total_export || 0}
          detail="Sản phẩm"
          icon={TrendingDown}
          color="rose"
        />
        <StatCard
          label="Tồn kho"
          value={stats.total_inventory || 0}
          detail="Sản phẩm"
          icon={Package}
          color="blue"
        />
        <StatCard
          label="Giá trị tồn"
          value={formatCurrency(stats.total_value || 0)}
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full lg:w-fit overflow-x-auto scrollbar-hide">
          <button
            onClick={() => { setActiveTab('import'); setCurrentPage(1); }}
            className={`flex-1 lg:flex-none px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'import' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Phiếu nhập
          </button>
          <button
            onClick={() => { setActiveTab('export'); setCurrentPage(1); }}
            className={`flex-1 lg:flex-none px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'export' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Phiếu xuất
          </button>
          <button
            onClick={() => { setActiveTab('alerts'); setCurrentPage(1); }}
            className={`flex-1 lg:flex-none px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'alerts' ? 'bg-rose-600 text-white shadow-md shadow-rose-200 dark:shadow-rose-900/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Cảnh báo {alerts.length > 0 && <span className={`${activeTab === 'alerts' ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'} text-[10px] px-1.5 py-0.5 rounded-full`}>{alerts.length}</span>}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative group flex-1 sm:min-w-[200px] lg:min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 w-full transition-all text-sm font-medium text-slate-900 dark:text-slate-100"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 sm:flex-none flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1">
              <Warehouse size={16} className="text-slate-400" />
              <select
                className="bg-transparent py-2 outline-none text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex-1 sm:min-w-[100px]"
                value={warehouseFilter}
                onChange={(e) => { setWarehouseFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="" className="dark:bg-slate-800">Tất cả kho</option>
                {warehouses.map(w => <option key={w.custom_id} value={w.custom_id} className="dark:bg-slate-800">{w.name}</option>)}
              </select>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all text-xs font-black shadow-lg shadow-blue-100 dark:shadow-blue-900/20 active:scale-95"
              >
                <Plus size={18} strokeWidth={3} className="sm:hidden" />
                <span className="hidden sm:inline">TẠO PHIẾU</span>
                <ChevronDown size={16} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-3 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 mb-2 border-b border-slate-50 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại giao dịch</p>
                  </div>
                  <button
                    onClick={() => { setIsImportModalOpen(true); setIsDropdownOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold transition-colors"
                  >
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg"><TrendingUp size={16} /></div>
                    Nhập kho mới
                  </button>
                  <button
                    onClick={() => { setIsExportModalOpen(true); setIsDropdownOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold transition-colors"
                  >
                    <div className="bg-rose-100 dark:bg-rose-900/30 p-1.5 rounded-lg"><TrendingDown size={16} /></div>
                    Xuất kho mới
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                {activeTab === 'alerts' ? (
                  <>
                    <th className="px-4 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sản phẩm</th>
                    <th className="hidden md:table-cell px-8 py-5 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Số lượng</th>
                    <th className="hidden lg:table-cell px-8 py-5 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Tối thiểu</th>
                    <th className="hidden sm:table-cell px-4 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Kho</th>
                    <th className="px-4 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                    <th className="px-4 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Số phiếu</th>
                    <th className="hidden md:table-cell px-8 py-5 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ngày</th>
                    <th className="px-4 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sản phẩm</th>
                    <th className="hidden sm:table-cell px-8 py-5 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">SL</th>
                    <th className="px-4 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Giá trị</th>
                    <th className="hidden lg:table-cell px-8 py-5 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Kho</th>
                    <th className="hidden xs:table-cell px-4 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Loại</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="7" className="px-4 py-20 text-center"><div className="flex flex-col items-center gap-3"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div><p className="text-slate-400 dark:text-slate-500 font-bold italic">Đang tải dữ liệu...</p></div></td></tr>
              ) : activeTab === 'alerts' ? (
                alerts.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-20 text-center text-slate-400 dark:text-slate-500 font-medium italic">Không có cảnh báo tồn kho nào</td></tr>
                ) : (
                  alerts.map(alert => (
                    <tr key={alert.id} className="hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors group">
                      <td className="px-4 sm:px-8 py-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="text-[10px] sm:text-xs font-black text-slate-400">SP{alert.id}</span>
                          <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{alert.name}</span>
                          <div className="md:hidden flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-bold text-rose-500">Tồn: {alert.quantity}</span>
                             <span className="text-[10px] text-slate-400">/ Min: {alert.min_quantity || 10}</span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-8 py-5 text-sm text-right text-rose-600 dark:text-rose-400 font-black">{alert.quantity}</td>
                      <td className="hidden lg:table-cell px-8 py-5 text-sm text-right text-slate-400 dark:text-slate-500 font-bold">{alert.min_quantity || 10}</td>
                      <td className="hidden sm:table-cell px-4 sm:px-8 py-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">{alert.warehouse_name}</td>
                      <td className="px-4 sm:px-8 py-5 text-center">
                        <span className="px-2 sm:px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm border border-rose-200 dark:border-rose-800">Sắp hết</span>
                      </td>
                      <td className="px-4 sm:px-8 py-5 text-center">
                        <button
                          onClick={() => handleQuickImport(alert)}
                          className="flex items-center gap-1 sm:gap-2 mx-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all text-[10px] sm:text-xs font-black shadow-md shadow-emerald-100 dark:shadow-emerald-900/20 active:scale-95 whitespace-nowrap"
                        >
                          <Plus size={14} strokeWidth={3} /> <span className="hidden xs:inline">NHẬP KHO</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )
              ) : transactions.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-20 text-center text-slate-400 dark:text-slate-500 font-medium italic">Không có dữ liệu phiếu</td></tr>
              ) : (
                Object.entries(groupedTransactions).map(([refId, group]) => (
                  <React.Fragment key={refId}>
                    {group.map((t, idx) => {
                      if (idx > 0 && !expandedGroups[refId]) return null;

                      return (
                        <tr key={idx} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${idx > 0 ? 'bg-slate-50/20 dark:bg-slate-800/10' : ''}`}>
                          {idx === 0 && (
                            <>
                              <td className="px-4 sm:px-8 py-5 text-sm font-black text-blue-600 dark:text-blue-400" rowSpan={expandedGroups[refId] ? group.length : 1}>
                                 <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3">
                                   <div className="bg-blue-50 dark:bg-blue-900/20 px-2 sm:px-3 py-1 rounded-lg w-fit border border-blue-100 dark:border-blue-800 font-mono text-xs sm:text-sm">{refId}</div>
                                   {group.length > 1 && (
                                     <button
                                       onClick={() => toggleGroup(refId)}
                                       className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors text-blue-500 w-fit"
                                     >
                                       {expandedGroups[refId] ? <ChevronDown size={14} strokeWidth={3} /> : <ChevronRightIcon size={14} strokeWidth={3} />}
                                     </button>
                                   )}
                                   <div className="md:hidden text-[10px] text-slate-400 font-medium">
                                      {new Date(t.transaction_date).toLocaleDateString('vi-VN')}
                                   </div>
                                 </div>
                              </td>
                              <td className="hidden md:table-cell px-8 py-5 text-sm text-slate-500 dark:text-slate-400 font-bold" rowSpan={expandedGroups[refId] ? group.length : 1}>{new Date(t.transaction_date).toLocaleDateString('vi-VN')}</td>
                            </>
                          )}
                          <td className="px-4 sm:px-8 py-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold">
                            <div className="flex items-center gap-2">
                              {idx > 0 && <span className="text-slate-300 dark:text-slate-600">└</span>}
                              <div className="flex flex-col">
                                <span>{t.product_name}</span>
                                <span className="sm:hidden text-[10px] text-slate-400">SL: {t.quantity}</span>
                              </div>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-8 py-5 text-sm text-right font-black text-slate-900 dark:text-slate-100">{t.quantity}</td>
                          <td className="px-4 sm:px-8 py-5 text-xs sm:text-sm text-right text-slate-900 dark:text-slate-100 font-black">{formatCurrency(t.value || (t.price * t.quantity))}</td>
                          {idx === 0 && (
                            <>
                              <td className="hidden lg:table-cell px-8 py-5 text-sm text-slate-600 dark:text-slate-400 font-bold" rowSpan={expandedGroups[refId] ? group.length : 1}>
                                 <div className="flex items-center gap-2"><Warehouse size={14} className="text-slate-400" /> {t.warehouse_name}</div>
                              </td>
                              <td className="hidden xs:table-cell px-4 sm:px-8 py-5 text-center" rowSpan={expandedGroups[refId] ? group.length : 1}>
                                <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm border ${t.type === 'nhap' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800'}`}>
                                  {t.type === 'nhap' ? 'NHẬP' : 'XUẤT'}
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {activeTab !== 'alerts' && (
          <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Hiển thị <span className="font-black text-slate-900 dark:text-slate-100">{(currentPage - 1) * limit + 1}</span> - <span className="font-black text-slate-900 dark:text-slate-100">{Math.min(currentPage * limit, totalCount)}</span> của <span className="font-black text-slate-900 dark:text-slate-100">{totalCount}</span> giao dịch
            </p>
            <div className="flex items-center gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>

              <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) setCurrentPage(page);
                    else if (e.target.value === '') setCurrentPage('');
                  }}
                  className="w-12 py-2 text-center text-sm font-black text-blue-600 dark:text-blue-400 bg-transparent outline-none"
                />
                <span className="pr-4 text-sm font-bold text-slate-400">/ {totalPages}</span>
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className={`rounded-[24px] sm:rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 border transition-all my-auto ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`flex items-center justify-between p-5 sm:p-8 border-b ${isDarkMode ? 'border-slate-800 bg-emerald-950/20' : 'border-slate-100 bg-emerald-50/50'}`}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-emerald-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-emerald-600/20">
                  <TrendingUp size={20} sm:size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Nhập kho</h3>
                  <p className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1">Ghi nhận hàng hóa vào hệ thống</p>
                </div>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                <X size={20} sm:size={24} strokeWidth={3} />
              </button>
            </div>
            <form onSubmit={handleImportSubmit} className="p-5 sm:p-10 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 sm:mb-3 ml-1">Nhà cung cấp *</label>
                  <select
                    required
                    className={`w-full px-4 sm:px-5 py-3 sm:py-4 border rounded-xl sm:rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-sm sm:text-base ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    value={importForm.supplier_id}
                    onChange={(e) => setImportForm({...importForm, supplier_id: e.target.value})}
                  >
                    <option value="" className={isDarkMode ? 'bg-slate-900' : ''}>-- Chọn --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id} className={isDarkMode ? 'bg-slate-900' : ''}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 sm:mb-3 ml-1">Kho nhận hàng *</label>
                  <select
                    required
                    className={`w-full px-4 sm:px-5 py-3 sm:py-4 border rounded-xl sm:rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-sm sm:text-base ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    value={importForm.warehouse_id}
                    onChange={(e) => setImportForm({...importForm, warehouse_id: e.target.value})}
                  >
                    <option value="" className={isDarkMode ? 'bg-slate-900' : ''}>-- Chọn --</option>
                    {warehouses.map(w => <option key={w.custom_id} value={w.custom_id} className={isDarkMode ? 'bg-slate-900' : ''}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Danh mục sản phẩm</label>
                  <button type="button" onClick={addImportItem} className="text-[9px] sm:text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1 sm:gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-emerald-100 dark:border-emerald-800 transition-all active:scale-95 uppercase tracking-widest">
                    <Plus size={12} sm:size={14} strokeWidth={3} /> Thêm
                  </button>
                </div>
                <div className="space-y-3 sm:space-y-4 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                  {importForm.items.map((item, idx) => (
                    <div key={idx} className={`flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] border transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex-1">
                        <label className="block text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2 ml-1">Sản phẩm</label>
                        <select
                          required
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-xs sm:text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                          value={item.product_id}
                          onChange={(e) => handleImportItemChange(idx, 'product_id', e.target.value)}
                        >
                          <option value="" className={isDarkMode ? 'bg-slate-900' : ''}>-- Chọn --</option>
                          {products.map(p => <option key={p.id} value={p.custom_id} className={isDarkMode ? 'bg-slate-900' : ''}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="flex items-end gap-3">
                        <div className="flex-1 sm:w-32">
                          <label className="block text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2 ml-1">Số lượng</label>
                          <input
                            type="number" required min="1"
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-black text-center text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            value={item.quantity}
                            onChange={(e) => handleImportItemChange(idx, 'quantity', e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImportItem(idx)}
                          disabled={importForm.items.length === 1}
                          className="p-2 sm:p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg sm:rounded-xl disabled:opacity-0 transition-all active:scale-90"
                        >
                          <Trash2 size={18} sm:size={20} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                <button type="button" onClick={() => setIsImportModalOpen(false)} className={`order-2 sm:order-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Hủy phiếu</button>
                <button type="submit" className="order-1 sm:order-2 px-8 sm:px-12 py-3 sm:py-4 bg-emerald-600 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                  Hoàn tất nhập kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className={`rounded-[24px] sm:rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 border transition-all my-auto ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`flex items-center justify-between p-5 sm:p-8 border-b ${isDarkMode ? 'border-slate-800 bg-rose-950/20' : 'border-slate-100 bg-rose-50/50'}`}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-rose-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-rose-600/20">
                  <TrendingDown size={20} sm:size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Xuất kho</h3>
                  <p className="text-[9px] sm:text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mt-1">Ghi nhận hàng hóa rời khỏi kho</p>
                </div>
              </div>
              <button onClick={() => setIsExportModalOpen(false)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                <X size={20} sm:size={24} strokeWidth={3} />
              </button>
            </div>
            <form onSubmit={handleExportSubmit} className="p-5 sm:p-10 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 sm:mb-3 ml-1">Đối tác nhận *</label>
                  <input
                    type="text" required
                    className={`w-full px-4 sm:px-5 py-3 sm:py-4 border rounded-xl sm:rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-sm sm:text-base ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    value={exportForm.customer_name}
                    onChange={(e) => setExportForm({...exportForm, customer_name: e.target.value})}
                    placeholder="Vd: Apple Store..."
                  />
                </div>
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 sm:mb-3 ml-1">Xuất từ kho *</label>
                  <select
                    required
                    className={`w-full px-4 sm:px-5 py-3 sm:py-4 border rounded-xl sm:rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-sm sm:text-base ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    value={exportForm.warehouse_id}
                    onChange={(e) => setExportForm({...exportForm, warehouse_id: e.target.value})}
                  >
                    <option value="" className={isDarkMode ? 'bg-slate-900' : ''}>-- Chọn --</option>
                    {warehouses.map(w => <option key={w.custom_id} value={w.custom_id} className={isDarkMode ? 'bg-slate-900' : ''}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Danh mục sản phẩm</label>
                  <button type="button" onClick={addExportItem} className="text-[9px] sm:text-[10px] font-black text-rose-600 hover:text-rose-700 flex items-center gap-1 sm:gap-2 bg-rose-50 dark:bg-rose-900/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-rose-100 dark:border-rose-800 transition-all active:scale-95 uppercase tracking-widest">
                    <Plus size={12} sm:size={14} strokeWidth={3} /> Thêm
                  </button>
                </div>
                <div className="space-y-3 sm:space-y-4 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                  {exportForm.items.map((item, idx) => (
                    <div key={idx} className={`flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] border transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex-1">
                        <label className="block text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2 ml-1">Sản phẩm xuất</label>
                        <select
                          required
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-xs sm:text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                          value={item.product_id}
                          onChange={(e) => handleExportItemChange(idx, 'product_id', e.target.value)}
                        >
                          <option value="" className={isDarkMode ? 'bg-slate-900' : ''}>-- Chọn --</option>
                          {products.map(p => <option key={p.id} value={p.custom_id} className={isDarkMode ? 'bg-slate-900' : ''}>{p.name} (Tồn: {p.quantity})</option>)}
                        </select>
                      </div>
                      <div className="flex items-end gap-3">
                        <div className="flex-1 sm:w-32">
                          <label className="block text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2 ml-1">Số lượng</label>
                          <input
                            type="number" required min="1"
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-black text-center text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            value={item.quantity}
                            onChange={(e) => handleExportItemChange(idx, 'quantity', e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExportItem(idx)}
                          disabled={exportForm.items.length === 1}
                          className="p-2 sm:p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg sm:rounded-xl disabled:opacity-0 transition-all active:scale-90"
                        >
                          <Trash2 size={18} sm:size={20} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                <button type="button" onClick={() => setIsExportModalOpen(false)} className={`order-2 sm:order-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Hủy phiếu</button>
                <button type="submit" className="order-1 sm:order-2 px-8 sm:px-12 py-3 sm:py-4 bg-rose-600 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-600/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                  Hoàn tất xuất kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
