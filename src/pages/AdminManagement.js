import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, Edit, Search, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import AdminLayout from '../components/AdminLayout';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getAdmins();
      setAdmins(data);
    } catch (error) {
      const errorMsg = error.message || 'Failed to load administrators';
      toast.error(errorMsg);
      console.error('Fetch admins error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setCurrentAdminId(null);
    setFormData({ name: '', email: '', password: '' });
    setShowPassword(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (admin) => {
    setIsEditing(true);
    setCurrentAdminId(admin._id);
    setFormData({ name: admin.name, email: admin.email, password: '' });
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // When editing, password is only required if they want to change it.
        // We will send only the modified fields, but our backend PUT handles empty password by ignoring it.
        await api.admin.updateAdmin(currentAdminId, formData);
        toast.success('Admin updated successfully');
      } else {
        await api.admin.createAdmin(formData);
        toast.success('Admin created successfully');
      }
      setShowModal(false);
      fetchAdmins();
    } catch (error) {
      const action = isEditing ? 'update' : 'create';
      toast.error(error.message || `Failed to ${action} admin`);
      console.error(`${action} admin error:`, error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this administrator? This action cannot be undone.')) {
      try {
        await api.admin.deleteAdmin(id);
        toast.success('Admin deleted successfully');
        fetchAdmins();
      } catch (error) {
        toast.error(error.message || 'Failed to delete admin');
      }
    }
  };

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <ShieldCheck className="w-8 h-8 text-primary" />
            Admin Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage platform administrators and permissions.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-5 h-5" />
          Add New Admin
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search admins by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Administrator</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Role</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm hidden md:table-cell">Joined</th>
                <th className="text-right py-4 px-6 font-medium text-muted-foreground text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-muted-foreground">Loading administrators...</td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-muted-foreground">No administrators found.</td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{admin.name}</div>
                          <div className="text-sm text-muted-foreground">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium uppercase tracking-wider">
                        {admin.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground hidden md:table-cell">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(admin)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit Admin"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(admin._id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Admin"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Admin Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {isEditing ? 'Edit Administrator' : 'Create New Admin'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 pr-12 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                    required={!isEditing}
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
                >
                  {isEditing ? 'Save Changes' : 'Create Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminManagement;
