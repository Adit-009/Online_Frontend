import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Calendar, MapPin, Clock, Users, Mail, Phone, Eye, X, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import AdminLayout from '../components/AdminLayout';

const AdminExams = () => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isAdminEditing, setIsAdminEditing] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [examForm, setExamForm] = useState({
    title: '', courseId: '', date: '', time: '', venue: '', maxSeats: 50
  });
  const [selectedExam, setSelectedExam] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  const fetchExams = async () => {
    try {
      const data = await api.admin.getExams();
      setExams(data);
    } catch (error) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
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

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isAdminEditing) {
        await api.admin.updateExam(editingExamId, examForm);
        toast.success('Exam updated successfully!');
      } else {
        await api.admin.createExam(examForm);
        toast.success('Exam scheduled successfully!');
      }
      setShowCreateModal(false);
      setIsAdminEditing(false);
      setEditingExamId(null);
      setExamForm({ title: '', courseId: '', date: '', time: '', venue: '', maxSeats: 50 });
      fetchExams();
    } catch (error) {
      console.error('Exam save error:', error);
      toast.error(error.message || 'Failed to save exam');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (exam) => {
    try {
      const examDate = exam.date ? new Date(exam.date) : new Date();
      const formattedDate = isNaN(examDate.getTime()) 
        ? new Date().toISOString().split('T')[0] 
        : examDate.toISOString().split('T')[0];

      setEditingExamId(exam._id);
      setExamForm({
        title: exam.title || '',
        courseId: exam.courseId?._id || exam.courseId || '',
        date: formattedDate,
        time: exam.time || '',
        venue: exam.venue || '',
        maxSeats: exam.maxSeats || 50
      });
      setIsAdminEditing(true);
      setShowCreateModal(true);
    } catch (error) {
      toast.error('Error loading exam details');
    }
  };

  const handleDeleteExam = async (examId) => {
    
    // Optimistic Update: Immediately remove from list
    const originalExams = [...exams];
    setExams(prev => prev.filter(e => e._id !== examId));
    
    try {
      await api.admin.deleteExam(examId);
      toast.success('Exam deleted successfully');
    } catch (error) {
      console.error('[DEBUG] DELETE error:', error);
      toast.error('Failed to delete exam');
      // Rollback if failed
      setExams(originalExams);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Exam Management
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          data-testid="schedule-exam-btn"
        >
          <Plus className="w-5 h-5" />
          Schedule Exam
        </button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading exams...</div>
      ) : exams.length === 0 ? (
        <div className="text-center py-20">
          <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No exams scheduled yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {exams.map((exam) => (
            <div key={exam._id} className="bg-card border border-border rounded-2xl p-4 sm:p-6" data-testid={`exam-${exam._id}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-foreground">{exam.title}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(exam)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam._id); }} 
                    className="p-1.5 text-muted-foreground hover:text-[#EF4444] transition-colors cursor-pointer"
                    title="Delete Exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-3">{exam.courseId?.title}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(exam.date).toLocaleDateString()}
                </div>
                {exam.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {exam.time}
                  </div>
                )}
                {exam.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {exam.venue}
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">
                    {exam.enrolledStudents?.length || 0} / {exam.maxSeats} students
                  </span>
                  <button
                    onClick={() => {
                      setSelectedExam(exam);
                      setShowStudentsModal(true);
                    }}
                    className="text-primary hover:text-[#16A34A] text-xs font-medium flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View Enrolled
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enrolled Students Modal */}
      {showStudentsModal && selectedExam && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">{selectedExam.title}</h2>
                <p className="text-muted-foreground text-sm">Enrolled Students ({selectedExam.enrolledStudents?.length || 0})</p>
              </div>
              <button 
                onClick={() => setShowStudentsModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {selectedExam.enrolledStudents?.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No students have booked this slot yet.
                </div>
              ) : (
                selectedExam.enrolledStudents.map((enrollment, idx) => (
                  <div key={idx} className="bg-background border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {enrollment.userId?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{enrollment.userId?.name || 'Unknown'}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Mail className="w-3 h-3" /> {enrollment.userId?.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-muted-foreground text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Booked {new Date(enrollment.bookedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8 max-w-md w-full my-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {isAdminEditing ? 'Update Exam' : 'Schedule New Exam'}
            </h2>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Exam Title *</label>
                <input
                  type="text"
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                  required
                  data-testid="exam-title-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Course *</label>
                <select
                  value={examForm.courseId}
                  onChange={(e) => setExamForm({ ...examForm, courseId: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                  required
                  data-testid="exam-course-select"
                >
                  <option value="">Choose a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Date *</label>
                  <input
                    type="date"
                    value={examForm.date}
                    onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required
                    data-testid="exam-date-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Time *</label>
                  <input
                    type="time"
                    value={examForm.time}
                    onChange={(e) => setExamForm({ ...examForm, time: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required
                    data-testid="exam-time-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Venue *</label>
                <input
                  type="text"
                  value={examForm.venue}
                  onChange={(e) => setExamForm({ ...examForm, venue: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                  placeholder="e.g., Third Eye Institute, Room 101"
                  required
                  data-testid="exam-venue-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Max Students</label>
                <input
                  type="number"
                  value={examForm.maxSeats}
                  onChange={(e) => setExamForm({ ...examForm, maxSeats: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                  min="1"
                  data-testid="exam-max-students-input"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-testid="submit-exam-btn"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      {isAdminEditing ? 'Updating...' : 'Scheduling...'}
                    </>
                  ) : (
                    isAdminEditing ? 'Update Exam' : 'Schedule Exam'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { 
                    setShowCreateModal(false); 
                    setIsAdminEditing(false);
                    setEditingExamId(null);
                    setExamForm({ title: '', courseId: '', date: '', time: '', venue: '', maxSeats: 50 }); 
                  }}
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

export default AdminExams;
