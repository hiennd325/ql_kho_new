import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Lock,
  Save
} from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const UsersPage = () => {
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'staff',
    status: 'active'
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (selectedUser && !payload.password) {
        delete payload.password;
      }

      if (selectedUser) {
        await api.put(`/users/${selectedUser.id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        alert('Lỗi khi xóa người dùng: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email || '',
      password: '',
      role: user.role,
      status: user.status
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ username: '', email: '', password: '', role: 'staff', status: 'active' });
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Quản lý người dùng</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">Phân quyền và quản lý tài khoản hệ thống</p>
          </div>
        </div>

        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-bold active:scale-95"
        >
          <Plus size={18} /> Thêm người dùng
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Tên đăng nhập</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Vai trò</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-slate-400 italic">Đang tải dữ liệu...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400 dark:text-slate-500 italic">Không có người dùng nào</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">#{user.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{user.username}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{user.email || 'Chưa cập nhật email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}>
                        <Shield size={10} /> {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.status === 'active' ? (
                        <span className="flex items-center gap-1 text-green-600 dark:text-emerald-400 font-medium"><UserCheck size={14} /> Hoạt động</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 dark:text-rose-400 font-medium"><UserX size={14} /> Tạm khóa</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(user)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="Sửa">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-900/20 rounded-lg transition-all" title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/20">
              <h3 className="text-lg font-bold flex items-center gap-2 dark:text-slate-100">
                {selectedUser ? <Edit size={20} className="text-indigo-600 dark:text-indigo-400" /> : <Plus size={20} className="text-indigo-600 dark:text-indigo-400" />}
                {selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Tên đăng nhập *</label>
                <input
                  type="text" required
                  placeholder="Nhập tên đăng nhập"
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 transition-all"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Mật khẩu {selectedUser ? '(để trống nếu không đổi)' : '*'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password" required={!selectedUser}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Vai trò</label>
                  <select
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-slate-900 dark:text-slate-100 transition-all"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="staff" className="dark:bg-slate-800">Staff</option>
                    <option value="admin" className="dark:bg-slate-800">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Trạng thái</label>
                  <select
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-slate-900 dark:text-slate-100 transition-all"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="active" className="dark:bg-slate-800">Hoạt động</option>
                    <option value="inactive" className="dark:bg-slate-800">Tạm khóa</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-bold transition-all">Hủy bỏ</button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 transition-all active:scale-95">
                  <Save size={18} /> Lưu tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
