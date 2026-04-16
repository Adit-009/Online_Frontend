import React from 'react';
import { Users, GraduationCap, BookOpen, ClipboardList, ShieldCheck } from 'lucide-react';
import api from '../utils/api';
import AdminLayout from '../components/AdminLayout';
import { Link } from 'react-router-dom';
import useTitle from '../hooks/useTitle';

const AdminDashboard = () => {
  const [stats, setStats] = React.useState(null);
  useTitle('Admin Dashboard');

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.admin.getStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'text-primary' },
    { label: 'Active Courses', value: stats?.totalCourses || 0, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Enrollments', value: stats?.totalEnrollments || 0, icon: ClipboardList, color: 'text-purple-500' },
    { label: 'Pending Requests', value: stats?.pendingEnrollments || 0, icon: GraduationCap, color: 'text-yellow-500' },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Welcome back to your control center.</p>
        </div>
        <Link
          to="/admin/admins"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm sm:text-base group"
          data-testid="admin-management-btn"
        >
          <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Admin Management
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-muted rounded-lg">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm font-medium mb-1">{stat.label}</div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Placeholder for recent activity or quick actions if needed */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
            <Link to="/admin/courses" className="flex flex-col items-center justify-center p-4 bg-muted hover:bg-primary/5 border border-border hover:border-primary/20 rounded-xl transition-colors group">
              <BookOpen className="w-6 h-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-medium text-foreground">Add Course</span>
            </Link>
            <Link to="/admin/students" className="flex flex-col items-center justify-center p-4 bg-muted hover:bg-primary/5 border border-border hover:border-primary/20 rounded-xl transition-colors group">
              <Users className="w-6 h-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-medium text-foreground">Manage Students</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};


export default AdminDashboard;
