import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar as CalendarIcon, Clock, MapPin, Users, Edit2, Trash2, X, Loader2, MessageSquare } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import api from '../utils/api';
import { toast } from 'sonner';

const AdminDoubtSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    maxParticipants: 30
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsData, coursesData] = await Promise.all([
        api.admin.getDoubtSessions(),
        api.courses.getAll()
      ]);
      setSessions(sessionsData);
      setCourses(coursesData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSession) {
        await api.admin.updateDoubtSession(editingSession._id, formData);
        toast.success('Session updated successfully');
      } else {
        await api.admin.createDoubtSession(formData);
        toast.success('Session scheduled successfully');
      }
      setShowModal(false);
      setEditingSession(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to save session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      courseId: session.courseId?._id || '',
      title: session.title,
      date: new Date(session.date).toISOString().split('T')[0],
      time: session.time,
      venue: session.venue,
      description: session.description || '',
      maxParticipants: session.maxParticipants || 30
    });
    setShowModal(true);
  };

  const handleViewParticipants = (session) => {
    setSelectedSession(session);
    setShowParticipantsModal(true);
  };

  const handleDelete = async (id) => {
    
    // Optimistic Update: Immediately remove from list
    const originalSessions = [...sessions];
    setSessions(prev => prev.filter(s => s._id !== id));
    
    try {
      await api.admin.deleteDoubtSession(id);
      toast.success('Session deleted successfully');
    } catch (error) {
      console.error('[DEBUG] DELETE error:', error);
      toast.error('Failed to delete session');
      // Rollback if failed
      setSessions(originalSessions);
    }
  };

  const resetForm = () => {
    setFormData({
      courseId: '',
      title: '',
      date: '',
      time: '',
      venue: '',
      description: '',
      maxParticipants: 30
    });
  };

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (session.courseId && session.courseId.title && session.courseId.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Doubt Sessions
          </h1>
          <p className="text-muted-foreground">Manage and schedule doubt solving classes for courses</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingSession(null); setShowModal(true); }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Schedule Session
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sessions or courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Sessions Found</h2>
          <p className="text-muted-foreground">No doubt sessions match your search or none are scheduled yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <div key={session._id} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-2">
                    {session.courseId?.title}
                  </span>
                  <h3 className="text-xl font-bold text-foreground line-clamp-1">{session.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewParticipants(session)}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors bg-background rounded-lg"
                    title="View Participants"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleEdit(session)} className="p-2 text-muted-foreground hover:text-primary transition-colors bg-background rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(session._id)} className="p-2 text-muted-foreground hover:text-[#EF4444] transition-colors bg-background rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  {new Date(session.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  {session.time}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  {session.venue}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  {session.participants?.length || 0} / {session.maxParticipants} Students Enrolled
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-muted-foreground text-sm line-clamp-2 italic">
                  {session.description || 'No description provided.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Participants Modal */}
      {showParticipantsModal && selectedSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Enrolled Students
                </h2>
                <p className="text-sm text-muted-foreground">{selectedSession.title}</p>
              </div>
              <button onClick={() => setShowParticipantsModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {selectedSession.participants?.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-[#2A2A2A] mx-auto mb-3" />
                  <p className="text-muted-foreground">No students have enrolled yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedSession.participants.map((student, idx) => (
                    <div key={idx} className="bg-background border border-border p-4 rounded-xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-foreground font-medium">{student.name}</div>
                        <div className="text-muted-foreground text-sm">{student.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border bg-background/50">
              <button
                onClick={() => setShowParticipantsModal(false)}
                className="w-full bg-[#2A2A2A] hover:bg-[#3F3F46] text-foreground font-medium py-3 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {editingSession ? 'Edit Session' : 'Schedule New Session'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Select Course</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Session Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    placeholder="e.g. Weekly Python Q&A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Time</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    placeholder="e.g. 10:00 AM - 12:00 PM"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Venue / Link</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    placeholder="e.g. Room 302 or Zoom Link"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Max Participants</label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E] h-24 resize-none"
                  placeholder="What will be covered in this session?"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingSession ? 'Update Session' : 'Schedule Session')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-transparent border border-border text-foreground hover:bg-border font-medium py-3 rounded-xl transition-colors"
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

export default AdminDoubtSessions;
