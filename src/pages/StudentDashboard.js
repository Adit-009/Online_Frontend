import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Menu, X, GraduationCap, Calendar, MessageSquare, Clock, CheckCircle, Lock, Trophy, Users, Award, Download } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { toast } from 'sonner';
import useTitle from '../hooks/useTitle';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [enrollments, setEnrollments] = React.useState([]);
  const [recentActivities, setRecentActivities] = React.useState([]);
  const [dashboardUser, setDashboardUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [badges, setBadges] = React.useState({ exams: 0, doubtSessions: 0 });
  useTitle('Student Dashboard');

  React.useEffect(() => {
    fetchEnrollments();
    checkBadges();
  }, []);

  const checkBadges = async () => {
    try {
      const api = (await import('../utils/api')).default;
      const [availableExams, availableSessions] = await Promise.all([
        api.exams.getAvailable(),
        api.doubtSessions.getAvailable()
      ]);

      // Show total count of upcoming scheduled items without clearing them
      setBadges({ 
        exams: availableExams.length, 
        doubtSessions: availableSessions.length 
      });
    } catch (error) {
      console.error('Failed to check badges:', error);
    }
  };

  const handleDownloadReceipt = (enrollmentId) => {
    const api = require('../utils/api').default;
    const url = api.enrollments.downloadReceipt(enrollmentId);
    window.open(url, '_blank');
  };

  const fetchEnrollments = async () => {
    try {
      const api = (await import('../utils/api')).default;
      const data = await api.dashboard.getData();
      setEnrollments(data.enrollments || []);
      setRecentActivities(data.recentActivities || []);
      setDashboardUser(data.user || null);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInactive = () => {
    if (!dashboardUser) return 0;
    const msPerDay = 1000 * 60 * 60 * 24;
    const refDate = dashboardUser.lastActiveDate ? new Date(dashboardUser.lastActiveDate) : new Date(dashboardUser.createdAt);
    return Math.max(0, Math.floor((new Date() - refDate) / msPerDay));
  };


  const getStatusBadge = (enrollment) => {
    if (enrollment.status === 'pending') {
      return (
        <span className="bg-[#EAB308]/10 text-[#EAB308] px-2 sm:px-3 py-1 rounded-full text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Waiting for Confirmation
        </span>
      );
    }
    if (enrollment.status === 'paid') {
      return (
        <span className="bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full text-xs flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      );
    }
    if (enrollment.status === 'rejected') {
      return (
        <span className="bg-[#EF4444]/10 text-[#EF4444] px-2 sm:px-3 py-1 rounded-full text-xs flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Rejected
        </span>
      );
    }
    return null;
  };

  const getRemainingDays = (enrollment) => {
    if (!enrollment.enrolledAt || !enrollment.courseId?.minDaysBeforeExam) return null;
    if (enrollment.examEligible) return 0; // Already marked eligible by admin

    const enrolledDate = new Date(enrollment.enrolledAt);
    const minDays = enrollment.courseId.minDaysBeforeExam;
    const eligibilityDate = new Date(enrolledDate.getTime() + minDays * 24 * 60 * 60 * 1000);
    const today = new Date();
    
    const diffTime = eligibilityDate - today;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getActionButton = (enrollment) => {
    if (enrollment.status === 'paid') {
      return (
        <Link
          to={`/courses/${enrollment.courseId?._id}/learn`}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 sm:py-2.5 px-4 rounded-xl transition-colors inline-block text-center text-sm"
        >
          Start Learning
        </Link>
      );
    }
    if (enrollment.status === 'pending') {
      return (
        <button
          disabled
          className="w-full bg-[#EAB308]/10 text-[#EAB308] font-medium py-2 sm:py-2.5 px-4 rounded-xl text-center text-sm cursor-not-allowed border border-[#EAB308]/20"
        >
          Waiting for Confirmation
        </button>
      );
    }
    if (enrollment.status === 'rejected') {
      return (
        <Link
          to={`/courses/${enrollment.courseId?._id}`}
          className="w-full bg-card border border-border text-muted-foreground font-medium py-2 sm:py-2.5 px-4 rounded-xl transition-colors inline-block text-center text-sm hover:text-foreground"
        >
          View Course
        </Link>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/90 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-lg sm:text-xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Third Eye Computer Education
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/exams" 
                className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 relative"
              >
                <GraduationCap className="w-4 h-4" />
                Exams
                {badges.exams > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full min-w-[16px] text-center">
                    {badges.exams}
                  </span>
                )}
              </Link>
              <Link 
                to="/doubt-sessions" 
                className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 relative"
              >
                <MessageSquare className="w-4 h-4" />
                Doubt Classes
                {badges.doubtSessions > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full min-w-[16px] text-center">
                    {badges.doubtSessions}
                  </span>
                )}
              </Link>
              <Link to="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Link>
              <Link to="/refer-and-earn" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Refer & Earn
              </Link>
              <div className="flex items-center gap-4 border-l border-border pl-6">
                <ThemeToggle />
                <span className="text-muted-foreground text-sm">{user?.name}</span>
                <button
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-2"
                  data-testid="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-foreground"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-4">
            <div className="text-foreground text-sm font-medium border-b border-border pb-2">{user?.name}</div>
            <Link
              to="/exams"
              className="block text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <GraduationCap className="w-4 h-4" />
              Exams
              {badges.exams > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                  {badges.exams}
                </span>
              )}
            </Link>
            <Link
              to="/doubt-sessions"
              className="block text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MessageSquare className="w-4 h-4" />
              Doubt Classes
              {badges.doubtSessions > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                  {badges.doubtSessions}
                </span>
              )}
            </Link>
            <Link
              to="/leaderboard"
              className="block text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>
            <Link
              to="/refer-and-earn"
              className="block text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Users className="w-4 h-4" />
              Refer & Earn
            </Link>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-2 py-1"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="dashboard-title">
            My Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
            <Link
              to="/refer-and-earn"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl transition-all shadow-lg shadow-primary/20 font-bold text-sm"
            >
              <Users className="w-4 h-4" />
              Refer & Earn
            </Link>
            <Link
              to="/exams"
              className="inline-flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl transition-all border border-primary/20 font-medium text-sm"
            >
              <Calendar className="w-4 h-4" />
              Schedule My Exam
            </Link>
          </div>
        </div>

        {!loading && dashboardUser && (
          <div className="mb-8">
            <div className={`p-6 rounded-[2rem] border ${getDaysInactive() > 3 ? 'bg-[#EF4444]/5 border-[#EF4444]/20' : getDaysInactive() >= 2 ? 'bg-[#EAB308]/5 border-[#EAB308]/20' : 'bg-primary/5 border-primary/20'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getDaysInactive() > 3 ? 'bg-[#EF4444]/20 text-[#EF4444]' : getDaysInactive() >= 2 ? 'bg-[#EAB308]/20 text-[#EAB308]' : 'bg-primary/20 text-primary'}`}>
                  {getDaysInactive() > 3 ? (
                    <Lock className="w-6 h-6" />
                  ) : getDaysInactive() >= 2 ? (
                    <Clock className="w-6 h-6" />
                  ) : (
                    <Trophy className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className={`text-lg font-black tracking-tight ${getDaysInactive() > 3 ? 'text-[#EF4444]' : getDaysInactive() >= 2 ? 'text-[#EAB308]' : 'text-primary'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {getDaysInactive() > 3
                      ? `AWAY FOR ${getDaysInactive()} DAYS!`
                      : getDaysInactive() >= 2
                        ? `READY TO LEVEL UP?`
                        : `STREAK IS ON FIRE!`}
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium">
                    {getDaysInactive() > 3
                      ? "Your progress is waiting. Come back and finish what you started!"
                      : getDaysInactive() >= 2
                        ? "Don't break your momentum now. Your future self will thank you."
                        : "You're doing amazing! Keep this energy going."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}




        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            My Courses
          </h2>

          {loading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : enrollments.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">You haven't enrolled in any courses yet</p>
              <Link
                to="/courses"
                className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-colors text-sm sm:text-base"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {enrollments.map((enrollment) => (
                <div key={enrollment._id} className="bg-card border border-border rounded-2xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 line-clamp-2">{enrollment.courseId?.title}</h3>
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-foreground font-medium">
                        {enrollment.status === 'paid'
                          ? (enrollment.progress >= 90 ? 'Completed' : 'In Progress')
                          : enrollment.status === 'pending' ? 'Pending Approval' : 'Rejected'
                        }
                      </span>
                    </div>
                    {enrollment.status === 'paid' && (
                      <div className="w-full bg-border rounded-full h-2 mt-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${enrollment.progress || 0}%` }}
                        ></div>
                        <div className="text-right text-xs text-muted-foreground mt-1">{enrollment.progress || 0}%</div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {getStatusBadge(enrollment)}
                    {enrollment.status === 'paid' && (
                      <>
                        {getRemainingDays(enrollment) > 0 ? (
                          <span className="flex items-center gap-1.5 text-[#EAB308] text-xs font-bold bg-[#EAB308]/10 px-2 py-1 rounded-full border border-[#EAB308]/20">
                            <Clock className="w-3 h-3" />
                            Exam in {getRemainingDays(enrollment)} Days
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[#22C55E] text-xs font-bold bg-[#22C55E]/10 px-2 py-1 rounded-full border border-[#22C55E]/20">
                            <GraduationCap className="w-3 h-3" />
                            Eligible for Exam
                          </span>
                        )}
                      </>
                    )}
                    {enrollment.paymentStatus === 'paid' ? (
                      <span className="flex items-center gap-1.5 text-[#22C55E] text-xs font-bold bg-[#22C55E]/10 px-2 py-1 rounded-full border border-[#22C55E]/20">
                        <CheckCircle className="w-3 h-3" />
                        Paid (100%)
                      </span>
                    ) : enrollment.paymentStatus === 'partial' ? (
                      <span className="flex items-center gap-1.5 text-[#EAB308] text-xs font-bold bg-[#EAB308]/10 px-2 py-1 rounded-full border border-[#EAB308]/20">
                        <Clock className="w-3 h-3" />
                        Partial (50%)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[#EF4444] text-xs font-bold bg-[#EF4444]/10 px-2 py-1 rounded-full border border-[#EF4444]/20">
                        <Clock className="w-3 h-3" />
                        Pending (0%)
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {getActionButton(enrollment)}
                    <button
                      onClick={() => handleDownloadReceipt(enrollment._id)}
                      className="w-full bg-card border border-border hover:border-primary/50 text-foreground font-medium py-2 sm:py-2.5 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && recentActivities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Recent Activity
            </h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="divide-y divide-border">
                {recentActivities.map((activity, idx) => (
                  <div key={activity._id || idx} className="p-4 flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      {activity.activityType === 'video' || activity.activityType === 'lesson' ? (
                        <BookOpen className="w-5 h-5" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-foreground font-medium text-sm">
                        {activity.description || `Performed a ${activity.activityType} action`}
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
