import React, { useState, useEffect, useRef } from 'react';
import { Eye, Mail, MessageCircle, Calendar, Phone, MapPin, Plus, BookOpen, Users, Trash2, EyeOff, Search, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import AdminLayout from '../components/AdminLayout';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filterCentre, setFilterCentre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [studentForm, setStudentForm] = useState({
    name: '', email: '', password: '', phone: '', whatsappPhone: '', address: '', studyCentre: ''
  });
  const [enrollForm, setEnrollForm] = useState({
    studentId: '', courseId: '', paymentStatus: 'pending'
  });
  const [filterPayment, setFilterPayment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedEnrollmentId, setExpandedEnrollmentId] = useState(null);
  const [showReminderCenter, setShowReminderCenter] = useState(false);
  const [reminderCandidates, setReminderCandidates] = useState({ inactive: [], nearCompletion: [] });
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [enrollSearchQuery, setEnrollSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchReminderCandidates();
  }, []);

  const fetchReminderCandidates = async () => {
    setRemindersLoading(true);
    try {
      const data = await api.admin.getReminderCandidates();
      setReminderCandidates(data);
    } catch (error) {
      console.error('Failed to load reminder candidates');
    } finally {
      setRemindersLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await api.courses.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses');
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await api.admin.getStudents();
      setStudents(data);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const viewStudentDetails = async (studentId) => {
    try {
      const data = await api.admin.getStudent(studentId);
      setStudentDetails(data);
      setSelectedStudent(studentId);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Failed to load student details');
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.admin.createStudent(studentForm);
      toast.success('Student created successfully!');
      setShowAddStudentModal(false);
      setStudentForm({ name: '', email: '', password: '', phone: '', whatsappPhone: '', address: '', studyCentre: '' });
      fetchStudents();
    } catch (error) {
      toast.error(error.message || 'Failed to create student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.admin.enrollStudent(enrollForm);
      toast.success('Student enrolled successfully!');
      setShowEnrollModal(false);
      setEnrollForm({ studentId: '', courseId: '', paymentStatus: 'pending' });
      setEnrollSearchQuery('');
      setSelectedStudentForEnroll(null);
      if (selectedStudent) viewStudentDetails(selectedStudent);
    } catch (error) {
      toast.error(error.message || 'Failed to enroll student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {

    // Optimistic Update: Immediately remove from list
    const originalStudents = [...students];
    setStudents(prev => prev.filter(s => s._id !== studentId));

    try {
      await api.admin.deleteStudent(studentId);
      toast.success('Student deleted successfully');
      setShowDetailModal(false);
      setSelectedStudent(null);
      setStudentDetails(null);
    } catch (error) {
      console.error('[DEBUG] DELETE error:', error);
      toast.error('Failed to delete student');
      // Rollback if failed
      setStudents(originalStudents);
    }
  };

  const handleToggleOverride = async (enrollmentId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.admin.toggleOverride(enrollmentId, newStatus);
      toast.success(`Admin override ${newStatus ? 'enabled' : 'disabled'}`);

      // Update local state for student details if currently viewing
      if (studentDetails) {
        setStudentDetails({
          ...studentDetails,
          enrollments: studentDetails.enrollments.map(en =>
            en._id === enrollmentId ? { ...en, adminOverride: newStatus } : en
          )
        });
      }
    } catch (error) {
      toast.error('Failed to update admin override');
    }
  };

  const handleToggleEligibility = async (enrollmentId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.admin.toggleEligibility(enrollmentId, newStatus);
      toast.success(`Exam eligibility ${newStatus ? 'enabled' : 'disabled'}`);

      // Update local state for student details if currently viewing
      if (studentDetails) {
        setStudentDetails({
          ...studentDetails,
          enrollments: studentDetails.enrollments.map(en =>
            en._id === enrollmentId ? { ...en, examEligible: newStatus } : en
          )
        });
      }
    } catch (error) {
      toast.error('Failed to update exam eligibility');
    }
  };

  const handleUpdatePaymentStatus = async (enrollmentId, newStatus) => {
    try {
      await api.admin.updatePaymentStatus(enrollmentId, newStatus);
      toast.success('Payment status updated successfully');

      // Update local state for student details if currently viewing
      if (studentDetails) {
        setStudentDetails({
          ...studentDetails,
          enrollments: studentDetails.enrollments.map(en =>
            en._id === enrollmentId ? { ...en, paymentStatus: newStatus } : en
          )
        });
      }

      // Update main students list to keep badges in sync
      setStudents(prev => prev.map(s => {
        if (s._id === selectedStudent) {
          // This is a bit complex since s.enrollments is filtered in the main display
          // but we can just refetch or rely on the next refresh.
          // For now, let's just refetch to be safe and accurate.
          return s;
        }
        return s;
      }));
      fetchStudents();
    } catch (error) {
      console.error('Payment status update failed:', error);
      toast.error(error.message || 'Failed to update payment status');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Student Management
        </h1>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-colors flex items-center gap-2 text-sm"
            data-testid="add-student-btn"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add Student</span>
            <span className="sm:hidden">Add</span>
          </button>
          <button
            onClick={() => {
              if (students.length === 0) { toast.error('Please add students first'); return; }
              setShowEnrollModal(true);
            }}
            className="bg-[#EAB308] hover:bg-[#CA8A04] text-foreground font-medium px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-colors flex items-center gap-2 text-sm"
            data-testid="enroll-student-btn"
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Enroll Student</span>
            <span className="sm:hidden">Enroll</span>
          </button>
          <button
            onClick={() => setShowReminderCenter(!showReminderCenter)}
            className={`font-medium px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-colors flex items-center gap-2 text-sm ${showReminderCenter
                ? 'bg-[#EF4444] text-white shadow-lg'
                : 'bg-card border border-border text-foreground hover:border-primary/50'
              }`}
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Reminder Center</span>
            <span className="sm:hidden">Reminders</span>
          </button>
        </div>
      </div>

      {/* Filter Bar - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-muted-foreground uppercase whitespace-nowrap">Centre:</label>
          <select
            value={filterCentre}
            onChange={(e) => setFilterCentre(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Centres</option>
            <option value="Kathiatoli">Kathiatoli</option>
            <option value="Nagaon">Nagaon</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-muted-foreground uppercase whitespace-nowrap">Activity:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Warning">Warning</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-muted-foreground uppercase whitespace-nowrap">Pay:</label>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Payments</option>
            <option value="pending">Pending (0%)</option>
            <option value="partial">Partial (50%)</option>
            <option value="paid">Paid (100%)</option>
          </select>
        </div>
      </div>

      {showReminderCenter && (
        <div className="mb-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inactive Students */}
            <div className="bg-card border-2 border-[#EF4444]/20 rounded-[2rem] overflow-hidden shadow-xl shadow-[#EF4444]/5">
              <div className="bg-[#EF4444]/5 p-6 border-b border-[#EF4444]/10">
                <h3 className="text-[#EF4444] font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  Inactive Students (3+ Days)
                </h3>
              </div>
              <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                {reminderCandidates.inactive.length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground italic">No inactive students found. Everyone is studying! 🔥</p>
                ) : (
                  reminderCandidates.inactive.map(s => (
                    <div key={s._id} className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl hover:border-[#EF4444]/30 transition-colors">
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{s.name}</p>
                        <p className="text-xs text-[#EF4444] font-medium">{s.daysInactive} days away</p>
                      </div>
                      <a
                        href={`https://wa.me/${s.whatsappPhone || s.phone}?text=Hi%20${s.name},%0A%0AOur%20records%20indicate%20that%20you%20have%20not%20accessed%20your%20course%20for%20the%20past%20${s.daysInactive}%20days.%20Consistent%20engagement%20is%20essential%20for%20successful%20course%20completion.%20Please%20log%20in%20immediately%20and%20resume%20your%20lessons%20to%20stay%20on%20track.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#25D366]/90 text-white p-2 rounded-xl shadow-lg transition-transform hover:scale-110"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Near Completion Students */}
            <div className="bg-card border-2 border-primary/20 rounded-[2rem] overflow-hidden shadow-xl shadow-primary/5">
              <div className="bg-primary/5 p-6 border-b border-primary/10">
                <h3 className="text-primary font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Near Completion (No Exam)
                </h3>
              </div>
              <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                {reminderCandidates.nearCompletion.length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground italic">No students near completion yet.</p>
                ) : (
                  reminderCandidates.nearCompletion.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl hover:border-primary/30 transition-colors">
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{s.studentName}</p>
                        <p className="text-xs text-primary font-medium">{s.progress}% Finished - {s.courseTitle}</p>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <CheckCircle className="w-4 h-4" />
                        Eligible
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="h-px bg-border my-8" />
        </div>
      )}

      {loading ? (
        <div className="text-muted-foreground">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No students yet. Add your first student!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 min-[1400px]:grid-cols-3 min-[1800px]:grid-cols-4 gap-4 md:gap-6">
          {students
            .filter(student => filterCentre === 'All' || student.studyCentre === filterCentre)
            .filter(student => filterStatus === 'All' || student.activityStatus === filterStatus)
            .filter(student => {
              if (filterPayment === 'All') return true;
              return (student.enrollments || []).some(e => e.paymentStatus === filterPayment);
            })
            .filter(student =>
              student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              student.email?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((student) => (
              <div
                key={student._id}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer min-w-0 overflow-hidden flex flex-col h-full"
                onClick={() => viewStudentDetails(student._id)}
                data-testid={`student-${student._id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-foreground font-medium truncate flex-1 mr-2">{student.name}</h3>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStudent(student._id);
                      }}
                      className="text-muted-foreground hover:text-[#EF4444] p-1 transition-colors"
                      title="Delete Student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Eye className="w-4 h-4 text-primary flex-shrink-0" />
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground break-all overflow-hidden text-xs sm:text-sm">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  {student.studyCentre && (
                    <div className="flex items-center gap-2 text-primary text-xs font-medium">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span>{student.studyCentre}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3" />
                      <span>Referrals Enrolled:</span>
                    </div>
                    <span className="font-bold">{student.rewardedReferrals?.length || 0}</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-2 mb-1 p-2 bg-background border border-border rounded-lg text-xs">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Overall Progress</span>
                      <span className="font-medium text-foreground">{student.overallProgress || 0}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${student.overallProgress || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${student.activityStatus === 'Active' ? 'bg-[#22C55E]' : student.activityStatus === 'Warning' ? 'bg-[#EAB308]' : 'bg-[#EF4444]'}`}></span>
                        {student.activityStatus}
                      </span>
                      <div className="flex gap-1">
                        {student.enrollments?.map((e) => {
                          const getPayLabel = (s) => {
                            if (s === 'paid') return 'Paid (100%)';
                            if (s === 'partial') return 'Partial (50%)';
                            return 'Pending (0%)';
                          };
                          return (
                            <div
                              key={e._id}
                              className={`w-2 h-2 rounded-full ${e.paymentStatus === 'paid' ? 'bg-[#22C55E]' : e.paymentStatus === 'partial' ? 'bg-[#EAB308]' : 'bg-[#EF4444]'}`}
                              title={`${e.courseId?.title}: ${getPayLabel(e.paymentStatus)}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {showDetailModal && studentDetails && (
        <div className="fixed inset-0 bg-black/80 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-card border border-border rounded-[2.5rem] p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto my-auto relative overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Student Details
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDeleteStudent(studentDetails.student._id)}
                  className="bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  title="Delete Student"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-muted-foreground hover:text-foreground p-1 ml-2"
                  data-testid="close-detail-modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Student Info */}
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">{studentDetails.student.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground break-all">
                  <Mail className="w-4 h-4 flex-shrink-0" /> {studentDetails.student.email}
                </div>
                {studentDetails.student.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" /> {studentDetails.student.phone}
                  </div>
                )}
                {studentDetails.student.whatsappPhone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" /> WhatsApp: {studentDetails.student.whatsappPhone}
                  </div>
                )}
                {studentDetails.student.address && (
                  <div className="flex items-start gap-2 text-muted-foreground break-words">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="flex-1">{studentDetails.student.address}</span>
                  </div>
                )}
                {studentDetails.student.studyCentre && (
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <MapPin className="w-4 h-4" /> Study Centre: {studentDetails.student.studyCentre}
                  </div>
                )}
                <div className="flex items-center gap-2 text-amber-600 font-bold bg-amber-50 w-fit px-3 py-1 rounded-lg">
                  <Users className="w-4 h-4" /> Successful Referrals: {studentDetails.student.rewardedReferrals?.length || 0}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" /> Member since {new Date(studentDetails.student.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className={`w-3 h-3 rounded-full ${studentDetails.student.activityStatus === 'Active' ? 'bg-[#22C55E]' : studentDetails.student.activityStatus === 'Warning' ? 'bg-[#EAB308]' : 'bg-[#EF4444]'}`}></span>
                  Status: <b>{studentDetails.student.activityStatus}</b>
                  ({studentDetails.student.daysInactive === 0 ? 'Active Today' : `${studentDetails.student.daysInactive} days inactive`})
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                {studentDetails.student.phone && (
                  <>
                    <a
                      href={`tel:${studentDetails.student.phone}`}
                      className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <Phone className="w-4 h-4" /> Call Student
                    </a>
                    <a
                      href={`https://wa.me/${studentDetails.student.whatsappPhone || studentDetails.student.phone}?text=Hi%20${studentDetails.student.name},%0A%0AOur%20records%20indicate%20that%20you%20have%20not%20accessed%20your%20course%20for%20the%20past%20${studentDetails.student.daysInactive}%20days.%20Consistent%20engagement%20is%20essential%20for%20successful%20course%20completion.%20Please%20log%20in%20immediately%20and%20resume%20your%20lessons%20to%20stay%20on%20track.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp Reminder
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Enrollments */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Enrolled Courses ({studentDetails.enrollments.length})
              </h3>
              <div className="space-y-3">
                {studentDetails.enrollments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No enrollments yet</p>
                ) : (
                  studentDetails.enrollments.map((enrollment) => (
                    <div key={enrollment._id} className="bg-background border border-border rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-foreground font-medium">{enrollment.courseId?.title}</h4>
                        <div className="flex flex-col gap-2 items-end">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className={`text-[10px] font-bold ${enrollment.examEligible ? 'text-green-500' : 'text-muted-foreground'}`}>
                              Exam Eligibility
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleEligibility(enrollment._id, enrollment.examEligible);
                              }}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${enrollment.examEligible ? 'bg-green-500' : 'bg-border'}`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${enrollment.examEligible ? 'translate-x-5' : 'translate-x-1'}`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className={`text-[10px] font-medium ${enrollment.adminOverride ? 'text-primary' : 'text-muted-foreground'}`}>
                              Admin Override
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleOverride(enrollment._id, enrollment.adminOverride);
                              }}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${enrollment.adminOverride ? 'bg-primary' : 'bg-border'}`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${enrollment.adminOverride ? 'translate-x-5' : 'translate-x-1'}`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mb-4 bg-primary/5 p-3 rounded-xl border border-primary/10">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Course Progress</span>
                          <span className="text-foreground font-bold">{enrollment.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-500"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          ></div>
                        </div>

                        {/* Eligibility Status */}
                        <div className="pt-2 mt-1 border-t border-primary/10">
                          {(() => {
                            const enrolledAt = new Date(enrollment.enrolledAt);
                            const minDays = enrollment.courseId?.minDaysBeforeExam || 30;
                            const eligibilityDate = new Date(enrolledAt.getTime() + minDays * 86400000);
                            const minProgress = enrollment.courseId?.minProgress || 80;
                            const isDateEligible = new Date() >= eligibilityDate;
                            const isProgressEligible = (enrollment.progress || 0) >= minProgress;
                            const isFullyEligible = enrollment.examEligible || enrollment.adminOverride;

                            return (
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-[10px] sm:text-xs">
                                  <span className="text-muted-foreground">Exam Eligibility:</span>
                                  <span className={`font-bold ${isFullyEligible ? 'text-primary' : 'text-[#EAB308]'}`}>
                                    {isFullyEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                  <span>Date Requirement:</span>
                                  <span>
                                    {isDateEligible ? 'Passed' : `Eligible on ${eligibilityDate.toLocaleDateString()}`}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                  <span>Progress Requirement:</span>
                                  <span>
                                    {isProgressEligible ? 'Passed' : `Need ${minProgress}% (Current: ${enrollment.progress || 0}%)`}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {enrollment.status === 'pending' && <span className="bg-[#EAB308]/10 text-[#EAB308] px-2 py-1 rounded text-xs">Pending</span>}
                        {enrollment.status === 'paid' && <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Approved</span>}
                        {enrollment.status === 'rejected' && <span className="bg-[#EF4444]/10 text-[#EF4444] px-2 py-1 rounded text-xs">Rejected</span>}

                        <div className="flex items-center gap-1.5 sm:gap-2 bg-card border border-border rounded-lg px-2 sm:px-3 py-1.5 flex-1 sm:flex-initial min-w-[120px]">
                          <span className="text-[10px] text-muted-foreground font-black uppercase whitespace-nowrap">Pay:</span>
                          <select
                            value={enrollment.paymentStatus || 'pending'}
                            onChange={(e) => handleUpdatePaymentStatus(enrollment._id, e.target.value)}
                            className="bg-card text-[10px] sm:text-xs font-bold text-foreground focus:outline-none cursor-pointer w-full"
                          >
                            <option value="pending">Pending (0%)</option>
                            <option value="partial">Partial (50%)</option>
                            <option value="paid">Paid (100%)</option>
                          </select>
                        </div>

                        <button
                          onClick={() => setExpandedEnrollmentId(expandedEnrollmentId === enrollment._id ? null : enrollment._id)}
                          className="text-[10px] sm:text-xs font-medium text-primary hover:underline"
                        >
                          {expandedEnrollmentId === enrollment._id ? 'Close Details' : 'View Video Progress'}
                        </button>
                      </div>

                      {expandedEnrollmentId === enrollment._id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-2 animate-in fade-in slide-in-from-top-2">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Detailed Video Activity</p>
                          {enrollment.courseId?.videos?.filter(v => v.isActive !== false).map((video, idx) => {
                            const watchedRecord = enrollment.watchedVideos?.find(w => w.videoId === (video._id || video.title));
                            const isWatched = watchedRecord && watchedRecord.progress >= 90;

                            return (
                              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/50 text-xs">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-5 h-5 rounded flex items-center justify-center ${isWatched ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <CheckCircle className="w-3 h-3" />
                                  </div>
                                  <div className="truncate">
                                    <p className="font-medium text-foreground truncate">{video.title}</p>
                                    <p className="text-[10px] text-muted-foreground">{video.duration}</p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                  {isWatched ? (
                                    <div className="text-[10px] text-primary font-medium">
                                      Watched
                                      {watchedRecord.watchedAt && (
                                        <p className="text-muted-foreground font-normal">{new Date(watchedRecord.watchedAt).toLocaleDateString()}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">Pending</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {(!enrollment.courseId?.videos || enrollment.courseId.videos.length === 0) && (
                            <p className="text-xs text-muted-foreground italic text-center py-2">No videos found for this course.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto my-4 sm:my-8 relative overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Add Offline Student
            </h2>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required
                    data-testid="student-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Email *</label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required
                    data-testid="student-email-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required
                    data-testid="student-phone-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    value={studentForm.whatsappPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, whatsappPhone: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    placeholder="Same as phone if empty"
                    data-testid="student-whatsapp-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Address *</label>
                <textarea
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E] h-20 resize-none"
                  required
                  data-testid="student-address-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Study Centre *</label>
                <select
                  value={studentForm.studyCentre}
                  onChange={(e) => setStudentForm({ ...studentForm, studyCentre: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                  required
                >
                  <option value="">Select Study Centre</option>
                  <option value="Kathiatoli">Kathiatoli</option>
                  <option value="Nagaon">Nagaon</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 pr-12 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required
                    minLength="6"
                    data-testid="student-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                  data-testid="submit-student-btn"
                >
                  {submitting ? 'Submitting...' : 'Add Student'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddStudentModal(false); setStudentForm({ name: '', email: '', password: '', phone: '', whatsappPhone: '', address: '', studyCentre: '' }); }}
                  className="flex-1 bg-transparent border border-border text-foreground hover:border-[#EF4444] hover:text-[#EF4444] font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8 max-w-md w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Enroll Student in Course
            </h2>
            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <div className="relative" ref={searchRef}>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Search Student *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={enrollSearchQuery}
                    onChange={(e) => {
                      setEnrollSearchQuery(e.target.value);
                      setIsSearchDropdownOpen(true);
                      if (!e.target.value) {
                        setEnrollForm({ ...enrollForm, studentId: '' });
                        setSelectedStudentForEnroll(null);
                      }
                    }}
                    onFocus={() => setIsSearchDropdownOpen(true)}
                    placeholder="Type name, email or phone..."
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required={!enrollForm.studentId}
                  />
                </div>

                {isSearchDropdownOpen && enrollSearchQuery && (
                  <div className="absolute z-[60] mt-2 w-full bg-card border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden">
                    {students
                      .filter(s => 
                        s.name?.toLowerCase().includes(enrollSearchQuery.toLowerCase()) ||
                        s.email?.toLowerCase().includes(enrollSearchQuery.toLowerCase()) ||
                        s.phone?.includes(enrollSearchQuery)
                      )
                      .slice(0, 10).length > 0 ? (
                        students
                          .filter(s => 
                            s.name?.toLowerCase().includes(enrollSearchQuery.toLowerCase()) ||
                            s.email?.toLowerCase().includes(enrollSearchQuery.toLowerCase()) ||
                            s.phone?.includes(enrollSearchQuery)
                          )
                          .slice(0, 10)
                          .map((student) => (
                            <div
                              key={student._id}
                              onClick={() => {
                                setEnrollForm({ ...enrollForm, studentId: student._id });
                                setEnrollSearchQuery(student.name);
                                setSelectedStudentForEnroll(student);
                                setIsSearchDropdownOpen(false);
                              }}
                              className="p-3 hover:bg-primary/5 cursor-pointer border-b border-border/50 last:border-0 transition-colors"
                            >
                              <div className="font-bold text-foreground text-sm">{student.name}</div>
                              <div className="text-[10px] text-muted-foreground truncate">{student.email}</div>
                              {student.phone && (
                                <div className="text-[10px] text-primary font-medium">{student.phone}</div>
                              )}
                            </div>
                          ))
                      ) : (
                        <div className="p-4 text-center text-xs text-muted-foreground">No students found</div>
                      )}
                  </div>
                )}
                
                {selectedStudentForEnroll && (
                  <div className="mt-2 p-2 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
                    <div className="text-[10px] text-primary font-bold uppercase tracking-wider">Selected: {selectedStudentForEnroll.name}</div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setEnrollForm({ ...enrollForm, studentId: '' });
                        setEnrollSearchQuery('');
                        setSelectedStudentForEnroll(null);
                      }}
                      className="text-primary hover:text-[#EF4444]"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Select Course *</label>
                <select
                  value={enrollForm.courseId}
                  onChange={(e) => setEnrollForm({ ...enrollForm, courseId: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                  required
                  data-testid="enroll-course-select"
                >
                  <option value="">Choose a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title} (₹{course.price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Payment Status *</label>
                <select
                  value={enrollForm.paymentStatus}
                  onChange={(e) => setEnrollForm({ ...enrollForm, paymentStatus: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                  required
                >
                  <option value="pending">Pending (0%)</option>
                  <option value="partial">Partial Payment (50%)</option>
                  <option value="paid">Fully Paid (100%)</option>
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">* Student will be enrolled with approved status and full course access</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                  data-testid="submit-enroll-btn"
                >
                  {submitting ? 'Enrolling...' : 'Enroll Student'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEnrollModal(false); setEnrollForm({ studentId: '', courseId: '' }); }}
                  className="flex-1 bg-transparent border border-border text-foreground hover:border-[#EF4444] hover:text-[#EF4444] font-medium py-3 px-6 rounded-xl transition-colors"
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

export default AdminStudents;
