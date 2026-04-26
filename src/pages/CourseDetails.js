import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';
import { Play, Lock, CheckCircle, HelpCircle, BadgeCheck } from 'lucide-react';
import { GraduationCap, Clock, Send, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { isYouTubeUrl } from '../utils/videoUtils';
import ContentProtection from '../components/ContentProtection';
import ProtectedVideoPlayer from '../components/ProtectedVideoPlayer';

export default function CourseDetails() {
  const { id } = useParams();
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    whatsappPhone: '',
    address: '',
    studyCentre: ''
  });

  const fetchCourseDetails = useCallback(async () => {
    try {
      const courseData = await api.courses.getById(id, false);
      setCourse(courseData);
      
      if (user && user !== false) {
        try {
          const enrollmentData = await api.enrollments.getByCourse(id);
          setEnrollment(enrollmentData);
        } catch (err) {
          // Not enrolled
        }
      }
    } catch (error) {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const handleEnrollClick = () => {
    if (!user || user === false) {
      setShowRegisterModal(true);
      return;
    }
    // Logged in user - directly enroll
    handleLoggedInEnroll();
  };

  const handleLoggedInEnroll = async () => {
    setSubmitting(true);
    try {
      await api.enrollments.enrollLoggedIn({ courseId: id });
      toast.success('Enrollment submitted successfully. We will contact you soon.');
      fetchCourseDetails();
    } catch (error) {
      toast.error(error.message || 'Enrollment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterAndEnroll = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.enrollments.enroll({
        ...registerForm,
        courseId: id,
        referralCode: searchParams.get('ref') || sessionStorage.getItem('pendingReferral') || ''
      });
      sessionStorage.removeItem('pendingReferral');
      
      toast.success('Enrollment submitted successfully. We will contact you soon.', {
        duration: 5000,
      });
      setShowRegisterModal(false);
      
      // Update local auth state and then fetch enrollment details
      await checkAuth();
      await fetchCourseDetails();
    } catch (error) {
      toast.error(error?.message || 'Enrollment failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground text-xl">Loading...</div>
    </div>;
  }

  if (!course) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground text-xl">Course not found</div>
    </div>;
  }

  // Determine enrollment button state
  const renderEnrollmentSection = () => {
    if (enrollment) {
      if (enrollment.status === 'pending') {
        return (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="flex flex-col items-center">
                <Clock className="w-12 h-12 text-[#EAB308] mx-auto mb-2" />
                <p className="text-foreground font-medium">Waiting for Confirmation</p>
                <p className="text-muted-foreground text-sm mt-1">Your enrollment request is being reviewed. We will contact you shortly.</p>
              </div>
            </div>
          </div>
        );
      }

      if (enrollment.status === 'paid') {
        return (
          <div className="space-y-4">
            <div className="text-center py-4 space-y-4">
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-foreground font-medium">Enrollment Confirmed</p>
                <p className="text-muted-foreground text-sm">You have full access to this course</p>
              </div>
              <Link
                to={`/courses/${id}/learn`}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                data-testid="start-learning-btn"
              >
                <Play className="w-5 h-5" />
                Start Learning
              </Link>
              <Link
                to="/exams"
                className="w-full bg-transparent border border-primary text-primary hover:bg-primary hover:text-foreground font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-5 h-5" />
                Book Your Exam
              </Link>
            </div>
          </div>
        );
      }

      if (enrollment.status === 'rejected') {
        return (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="flex flex-col items-center">
                <Lock className="w-12 h-12 text-[#EF4444] mx-auto mb-2" />
                <p className="text-foreground font-medium">Enrollment Rejected</p>
                <p className="text-muted-foreground text-sm mt-1">Please contact us for more information.</p>
              </div>
            </div>
          </div>
        );
      }
    }

    // Not enrolled — show enroll button
    return (
      <button
        onClick={handleEnrollClick}
        disabled={submitting}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        data-testid="enroll-now-btn"
      >
        {submitting ? (
          'Submitting...'
        ) : (
          <>
            <Send className="w-5 h-5" />
            Enroll Now
          </>
        )}
      </button>
    );
  };

  return (
    <ContentProtection>
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border h-16 flex items-center px-4 sm:px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="text-lg sm:text-xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Third Eye Computer Education
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              to="/courses" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Back to Courses</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="course-title">
              {course.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">{course.description}</p>

            {course.demoVideos && course.demoVideos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Free Preview - Watch Now
                </h2>
                <div className="space-y-4">
                  {course.demoVideos.map((video, idx) => (
                    <div key={idx} className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="aspect-video bg-black">
                        {isYouTubeUrl(video.url) ? (
                          <ProtectedVideoPlayer
                            url={video.url}
                            title={video.title}
                            isYouTube={true}
                            showFullscreenButton={true}
                          />
                        ) : (
                          <ProtectedVideoPlayer
                            url={video.url}
                            title={video.title}
                            showFullscreenButton={true}
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-foreground font-medium mb-1">{video.title}</h3>
                        <p className="text-muted-foreground text-sm">Duration: {video.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Enroll in this Course
                </h3>
                <p className="text-muted-foreground text-sm">
                  Submit your enrollment request and our team will contact you shortly.
                </p>
              </div>

              {renderEnrollmentSection()}

              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Play className="w-4 h-4 text-primary" />
                  Learn Anytime, Anywhere
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  Doubt Support Available
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  Certificate on Completion
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8 max-w-md lg:max-w-2xl xl:max-w-3xl w-full my-4 sm:my-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Create Account to Enroll
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6">
              Please provide your details to submit your enrollment request
            </p>
            <form onSubmit={handleRegisterAndEnroll} className="space-y-3 sm:space-y-4">
              {/* Two-column grid on lg+, single column on mobile */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Email *</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={registerForm.whatsappPhone}
                    onChange={(e) => setRegisterForm({ ...registerForm, whatsappPhone: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    placeholder="Same as phone if not provided"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Address *</label>
                  <textarea
                    value={registerForm.address}
                    onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E] h-16 sm:h-20 resize-none"
                    placeholder="Enter your full address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Study Centre *</label>
                  <select
                    value={registerForm.studyCentre}
                    onChange={(e) => setRegisterForm({ ...registerForm, studyCentre: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required
                  >
                    <option value="">Select Study Centre</option>
                    <option value="Kathiatoli">Kathiatoli</option>
                    <option value="Nagaon">Nagaon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Create Password *</label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    placeholder="Create a strong password"
                    required
                    minLength="6"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 sm:py-3 px-6 rounded-xl transition-colors text-sm sm:text-base disabled:opacity-50"
                  data-testid="register-and-enroll-btn"
                >
                  {submitting ? 'Submitting...' : 'Create Account & Enroll'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 bg-transparent border border-border text-foreground hover:border-[#EF4444] hover:text-[#EF4444] font-medium py-2.5 sm:py-3 px-6 rounded-xl transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
              <div className="text-center pt-2">
                <p className="text-muted-foreground text-xs">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:text-[#16A34A]">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </ContentProtection>
  );
}
