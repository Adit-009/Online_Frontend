import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Play, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import AdminLayout from '../components/AdminLayout';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail: '',
    videos: [],
    demoVideos: [],
    minDaysBeforeExam: 30,
    minProgress: 80
  });
  const [videoForm, setVideoForm] = useState({ title: '', url: '', duration: '' });
  const [demoVideoForm, setDemoVideoForm] = useState({ title: '', url: '', duration: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await api.admin.getCourses();
      setCourses(data);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const courseData = {
        ...formData,
        price: Number(formData.price),
        videos: (formData.videos || []).map((v, i) => ({ ...v, order: i + 1 })),
        demoVideos: formData.demoVideos || [],
        mockTests: editingCourse && editingCourse.mockTests ? editingCourse.mockTests : [],
        isActive: true
      };

      if (editingCourse) {
        await api.admin.updateCourse(editingCourse._id, courseData);
        toast.success('Course updated successfully');
      } else {
        await api.admin.createCourse(courseData);
        toast.success('Course created successfully');
      }

      setShowAddModal(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', price: '', thumbnail: '', videos: [], demoVideos: [], minDaysBeforeExam: 30, minProgress: 80 });
    setVideoForm({ title: '', url: '', duration: '' });
    setDemoVideoForm({ title: '', url: '', duration: '' });
  };

  const handleEdit = async (course) => {
    try {
      const fullCourse = await api.courses.getById(course._id, true);
      setEditingCourse(fullCourse);
      setFormData({
        title: fullCourse.title,
        description: fullCourse.description,
        price: fullCourse.price,
        thumbnail: fullCourse.thumbnail || '',
        videos: fullCourse.videos || [],
        demoVideos: fullCourse.demoVideos || [],
        minDaysBeforeExam: fullCourse.minDaysBeforeExam || 30,
        minProgress: fullCourse.minProgress || 80
      });
      setShowAddModal(true);
    } catch (error) {
      toast.error('Failed to load full course details');
    }
  };

  const addVideo = () => {
    if (videoForm.title && videoForm.url && videoForm.duration) {
      setFormData({
        ...formData,
        videos: [...(formData.videos || []), { ...videoForm }]
      });
      setVideoForm({ title: '', url: '', duration: '' });
      toast.success('Video added');
    }
  };

  const addDemoVideo = () => {
    if (demoVideoForm.title && demoVideoForm.url && demoVideoForm.duration) {
      setFormData({
        ...formData,
        demoVideos: [...(formData.demoVideos || []), { ...demoVideoForm }]
      });
      setDemoVideoForm({ title: '', url: '', duration: '' });
      toast.success('Demo video added');
    }
  };

  const removeVideo = (index) => {
    setFormData({
      ...formData,
      videos: (formData.videos || []).filter((_, i) => i !== index)
    });
  };

  const removeDemoVideo = (index) => {
    setFormData({
      ...formData,
      demoVideos: (formData.demoVideos || []).filter((_, i) => i !== index)
    });
  };

  const toggleVideoActive = (index) => {
    const updatedVideos = [...(formData.videos || [])];
    const currentStatus = updatedVideos[index].isActive === undefined ? true : updatedVideos[index].isActive;
    updatedVideos[index].isActive = !currentStatus;
    setFormData({ ...formData, videos: updatedVideos });
  };

  const toggleDemoVideoActive = (index) => {
    const updatedDemoVideos = [...(formData.demoVideos || [])];
    const currentStatus = updatedDemoVideos[index].isActive === undefined ? true : updatedDemoVideos[index].isActive;
    updatedDemoVideos[index].isActive = !currentStatus;
    setFormData({ ...formData, demoVideos: updatedDemoVideos });
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to deactivate this course? Students will no longer be able to enroll in it.")) {
      return;
    }

    // Optimistic Update: Immediately remove from list
    const originalCourses = [...courses];
    setCourses(prev => prev.filter(c => c._id !== courseId));

    try {
      await api.admin.deleteCourse(courseId);
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('[DEBUG] DELETE error:', error);
      toast.error('Failed to delete course');
      // Rollback if failed
      setCourses(originalCourses);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Course Management
        </h1>
        <button
          onClick={() => { setEditingCourse(null); resetForm(); setShowAddModal(true); }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          data-testid="add-course-btn"
        >
          <Plus className="w-5 h-5" />
          Add Course
        </button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No courses yet. Create your first course!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-card border border-border rounded-2xl p-4 sm:p-6" data-testid={`course-item-${course._id}`}>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="w-full sm:w-48 h-40 sm:h-32 bg-background rounded-xl overflow-hidden flex-shrink-0">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Play className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{course.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3 sm:mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm">
                    <span className="text-primary font-semibold">₹{course.price}</span>
                    <span className="text-muted-foreground">{course.videos?.length || 0} videos</span>
                    <span className="text-muted-foreground">{course.demoVideos?.length || 0} demos</span>
                    <span className={`px-3 py-1 rounded-full text-xs ${course.isActive ? 'bg-primary/10 text-primary' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">⏳ {course.minDaysBeforeExam || 30} days</span>
                      <span className="flex items-center gap-1">📊 {course.minProgress || 80}% progress</span>
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 self-start">
                  <button
                    onClick={() => handleEdit(course)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-border rounded-lg transition-colors"
                    data-testid={`edit-course-${course._id}`}
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="p-2 text-muted-foreground hover:text-[#EF4444] hover:bg-border rounded-lg transition-colors"
                    data-testid={`delete-course-${course._id}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Course Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required
                    data-testid="course-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 border-t border-border pt-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Min. Days Before Exam ⏳</label>
                  <input
                    type="number"
                    value={formData.minDaysBeforeExam}
                    onChange={(e) => setFormData({ ...formData, minDaysBeforeExam: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    min="0"
                    placeholder="e.g. 30"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Days after enrollment before student can book exam</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Min. Course Progress (%) 📊</label>
                  <input
                    type="number"
                    value={formData.minProgress}
                    onChange={(e) => setFormData({ ...formData, minProgress: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    min="0"
                    max="100"
                    placeholder="e.g. 80"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Percentage of videos watched before student can book exam</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E] h-24 resize-none"
                  required
                  data-testid="course-description-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                  placeholder="https://example.com/image.jpg"
                  data-testid="course-thumbnail-input"
                />
              </div>

              {/* Demo Videos Section */}
              <div className="border-t border-border pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Demo Videos (Free Preview)</h3>
                <div className="space-y-3 mb-3">
                  <input
                    type="text"
                    value={demoVideoForm.title}
                    onChange={(e) => setDemoVideoForm({ ...demoVideoForm, title: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    placeholder="Video title"
                    data-testid="demo-video-title-input"
                  />
                  <input
                    type="url"
                    value={demoVideoForm.url}
                    onChange={(e) => setDemoVideoForm({ ...demoVideoForm, url: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    placeholder="YouTube URL"
                    data-testid="demo-video-url-input"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={demoVideoForm.duration}
                      onChange={(e) => setDemoVideoForm({ ...demoVideoForm, duration: e.target.value })}
                      className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                      placeholder="Duration (e.g., 15:30)"
                      data-testid="demo-video-duration-input"
                    />
                    <button
                      type="button"
                      onClick={addDemoVideo}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl transition-colors text-sm whitespace-nowrap"
                      data-testid="add-demo-video-btn"
                    >
                      Add
                    </button>
                  </div>
                </div>
                {formData.demoVideos && formData.demoVideos.length > 0 && (
                  <div className="space-y-2">
                    {formData.demoVideos.map((video, index) => (
                      <div key={index} className={`flex items-center gap-3 bg-background border border-border rounded-xl p-3 transition-opacity ${video.isActive === false ? 'opacity-50' : 'opacity-100'}`}>
                        <Play className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">
                            {video.title} {video.isActive === false && <span className="text-xs text-[#EF4444] ml-2">(Inactive)</span>}
                          </p>
                          <p className="text-muted-foreground text-xs">{video.duration}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleDemoVideoActive(index)}
                          className="text-muted-foreground hover:text-primary flex-shrink-0"
                          title={video.isActive === false ? "Activate Video" : "Deactivate Video"}
                        >
                          {video.isActive === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button type="button" onClick={() => removeDemoVideo(index)} className="text-[#EF4444] hover:text-[#DC2626] flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Course Videos Section */}
              <div className="border-t border-border pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Course Videos (Paid Content)</h3>
                <div className="space-y-3 mb-3">
                  <input
                    type="text"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    placeholder="Lesson title"
                    data-testid="video-title-input"
                  />
                  <input
                    type="url"
                    value={videoForm.url}
                    onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    placeholder="YouTube URL"
                    data-testid="video-url-input"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={videoForm.duration}
                      onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                      className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                      placeholder="Duration (e.g., 45:00)"
                      data-testid="video-duration-input"
                    />
                    <button
                      type="button"
                      onClick={addVideo}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl transition-colors text-sm whitespace-nowrap"
                      data-testid="add-video-btn"
                    >
                      Add
                    </button>
                  </div>
                </div>
                {formData.videos && formData.videos.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {formData.videos.map((video, index) => (
                      <div key={index} className={`flex items-center gap-3 bg-background border border-border rounded-xl p-3 transition-opacity ${video.isActive === false ? 'opacity-50' : 'opacity-100'}`}>
                        <div className="text-muted-foreground text-xs font-mono w-6 flex-shrink-0">#{index + 1}</div>
                        <Play className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">
                            {video.title} {video.isActive === false && <span className="text-xs text-[#EF4444] ml-2">(Inactive)</span>}
                          </p>
                          <p className="text-muted-foreground text-xs">{video.duration}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleVideoActive(index)}
                          className="text-muted-foreground hover:text-primary flex-shrink-0"
                          title={video.isActive === false ? "Activate Video" : "Deactivate Video"}
                        >
                          {video.isActive === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button type="button" onClick={() => removeVideo(index)} className="text-[#EF4444] hover:text-[#DC2626] flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-xl transition-colors"
                  data-testid="submit-course-btn"
                >
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingCourse(null); resetForm(); }}
                  className="flex-1 bg-transparent border border-border text-foreground hover:border-[#EF4444] hover:text-[#EF4444] font-medium py-3 px-6 rounded-xl transition-colors"
                  data-testid="cancel-course-btn"
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

export default AdminCourses;
