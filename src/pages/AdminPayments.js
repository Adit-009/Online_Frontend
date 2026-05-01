import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar, CheckCircle, XCircle, Clock, Phone, Mail, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import AdminLayout from '../components/AdminLayout';

const AdminPayments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCentre, setFilterCentre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const data = await api.admin.getEnrollments();
      setEnrollments(data);
    } catch (error) {
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId) => {
    try {
      setProcessingId(enrollmentId);
      await api.admin.approveEnrollment(enrollmentId);
      toast.success('Enrollment approved successfully');
      fetchEnrollments();
    } catch (error) {
      console.error('[DEBUG] Approve API error:', error);
      toast.error('Failed to approve enrollment');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePaymentStatusUpdate = async (enrollmentId, newStatus) => {
    try {
      setUpdatingPaymentId(enrollmentId);
      await api.admin.updatePaymentStatus(enrollmentId, newStatus);
      toast.success('Payment status updated successfully');
      fetchEnrollments();
    } catch (error) {
      console.error('[DEBUG] Payment Update API error:', error);
      toast.error('Failed to update payment status');
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const handleReject = async (enrollment, isApproved = false) => {
    const enrollmentId = enrollment._id;
    
    // Optimistic Update: Immediately remove from list
    const originalEnrollments = [...enrollments];
    setEnrollments(prev => prev.filter(e => e._id !== enrollmentId));
    
    try {
      await api.admin.rejectEnrollment(enrollmentId);
      toast.success(isApproved ? 'Access revoked and enrollment deleted' : 'Enrollment request removed');
    } catch (error) {
      console.error('[DEBUG] DELETE error:', error);
      toast.error(`Error: ${error.message || 'Failed to remove enrollment'}`);
      setEnrollments(originalEnrollments);
    }
  };

  const formatWhatsAppLink = (phone) => {
    if (!phone) return '#';
    const cleanPhone = phone.toString().replace(/\D/g, '');
    if (cleanPhone.startsWith('91') && cleanPhone.length > 10) {
      return `https://wa.me/${cleanPhone}`;
    }
    return `https://wa.me/91${cleanPhone}`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-[#EAB308]/10 text-[#EAB308]',
      paid: 'bg-primary/10 text-primary',
      rejected: 'bg-[#EF4444]/10 text-[#EF4444]'
    };
    const labels = {
      pending: 'Pending',
      paid: 'Approved',
      rejected: 'Rejected'
    };
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredEnrollments = enrollments
    .filter(e => filterStatus === 'all' || e.status === filterStatus)
    .filter(e => filterCentre === 'All' || e.userId?.studyCentre === filterCentre)
    .filter(e => {
      const search = searchQuery.toLowerCase();
      const userName = e.userId?.name?.toLowerCase() || '';
      const userPhone = e.userId?.phone?.toString() || '';
      const userEmail = e.userId?.email?.toLowerCase() || '';
      const courseTitle = e.courseId?.title?.toLowerCase() || '';
      
      return userName.includes(search) || 
             userPhone.includes(search) || 
             userEmail.includes(search) ||
             courseTitle.includes(search);
    });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Enrollment Management
        </h1>
        <div className="flex gap-2">
          {['all', 'pending', 'paid', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === status 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'all' ? 'All' : status === 'paid' ? 'Approved' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, phone, email or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Centre:</label>
          <select
            value={filterCentre}
            onChange={(e) => setFilterCentre(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Centres</option>
            <option value="Kathiatoli">Kathiatoli</option>
            <option value="Nagaon">Nagaon</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading enrollments...</div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No enrollments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEnrollments.map((enrollment) => (
            <div key={enrollment._id} className="bg-card border border-border rounded-xl p-4 sm:p-5" data-testid={`enrollment-${enrollment._id}`}>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground font-medium truncate">{enrollment.userId?.name || 'Unknown'}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="text-muted-foreground text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {enrollment.userId?.email}
                      </span>
                      {enrollment.userId?.phone && (
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {enrollment.userId?.phone}
                        </span>
                      )}
                    </div>
                    {enrollment.userId?.address && (
                      <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{enrollment.userId?.address}</span>
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <p className="text-primary text-sm font-medium">{enrollment.courseId?.title || 'Unknown Course'}</p>
                      {enrollment.userId?.studyCentre && (
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          {enrollment.userId.studyCentre}
                        </span>
                      )}
                      {enrollment.userId?.referredBy?.name && (
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Ref: {enrollment.userId.referredBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-right">
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(enrollment.status)}
                        <select
                          value={enrollment.paymentStatus || 'pending'}
                          onChange={(e) => handlePaymentStatusUpdate(enrollment._id, e.target.value)}
                          disabled={updatingPaymentId === enrollment._id}
                          className="bg-card border border-border rounded-md px-2 py-1 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        >
                          <option value="pending">Pending (0%)</option>
                          <option value="partial">Partial (50%)</option>
                          <option value="paid">Paid (100%)</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-muted-foreground text-[10px] mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2 border-l border-border pl-3">
                      {enrollment.status === 'pending' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleApprove(enrollment._id); }}
                          disabled={processingId === enrollment._id}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Approve enrollment"
                          data-testid={`approve-enrollment-${enrollment._id}`}
                        >
                          <CheckCircle className={`w-5 h-5 pointer-events-none ${processingId === enrollment._id ? 'animate-pulse' : ''}`} />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReject(enrollment, enrollment.status === 'paid'); }}
                        className="p-2 text-muted-foreground hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors cursor-pointer"
                        title={enrollment.status === 'paid' ? "Revoke Access / Delete" : "Remove Request"}
                        data-testid={`delete-enrollment-${enrollment._id}`}
                      >
                        <XCircle className="w-5 h-5 pointer-events-none" />
                      </button>
                    </div>
                    {(enrollment.userId?.whatsappPhone || enrollment.userId?.phone) && (
                      <a
                        href={formatWhatsAppLink(enrollment.userId.whatsappPhone || enrollment.userId.phone)}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[40px] h-[40px]"
                        title="Chat on WhatsApp"
                      >
                        <Phone className="w-5 h-5 pointer-events-none" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPayments;
