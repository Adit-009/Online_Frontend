import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';
import { Calendar, MapPin, Clock, CheckCircle, AlertCircle, Loader2, LogOut, Menu, X, GraduationCap } from 'lucide-react';

const ExamBooking = () => {
  const { user, logout } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchAvailableExams();
  }, []);

  const fetchAvailableExams = async () => {
    try {
      setLoading(true);
      
      const data = await api.exams.getAvailable();
      
      if (data && Array.isArray(data)) {
        setExams(data);
      } else {
        setExams([]);
      }
    } catch (error) {
      console.error('CRITICAL: Exam loading error:', error);
      toast.error(error.message || 'Unable to connect to the exam server.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (examId) => {
    try {
      setBookingLoading(examId);
      
      const data = await api.exams.book(examId);
      
      toast.success(data.message || 'Exam slot booked successfully!');
      fetchAvailableExams();
    } catch (error) {
      console.error('Booking error detail:', error);
      toast.error(error.message || 'Failed to book exam slot. Please contact support.');
    } finally {
      setBookingLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/90 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-lg sm:text-xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Third Eye Computer Education
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                My Dashboard
              </Link>
              <div className="flex items-center gap-4 border-l border-border pl-6">
                <span className="text-muted-foreground text-sm">{user?.name}</span>
                <button
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-4">
            <div className="text-foreground text-sm font-medium border-b border-border pb-2">{user?.name}</div>
            <Link 
              to="/dashboard" 
              className="block text-muted-foreground hover:text-foreground transition-colors text-sm py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Dashboard
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

      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>Exam Booking</h1>
          <p className="text-muted-foreground">Schedule your offline examination for enrolled courses</p>
        </div>

        {exams.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Exams Available</h2>
            <p className="text-muted-foreground">There are no upcoming exams scheduled for your courses at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => (
              <div key={exam._id} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-2">
                      {exam.courseTitle}
                    </span>
                    <h3 className="text-xl font-bold text-foreground">{exam.title}</h3>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    {new Date(exam.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    {exam.time}
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    {exam.venue}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  {exam.isBooked ? (
                    <div className="flex items-center justify-center gap-2 text-primary bg-primary/10 py-3 rounded-xl font-medium">
                      <CheckCircle className="w-5 h-5" />
                      Successfully Booked
                    </div>
                  ) : exam.isEligible ? (
                    <button
                      onClick={() => handleBookSlot(exam._id)}
                      disabled={bookingLoading === exam._id}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {bookingLoading === exam._id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Book Your Slot'}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {!exam.eligibilityDetails?.adminOverride && (
                        <>
                          {exam.eligibilityDetails?.daysLeft > 0 && (
                            <div className="flex items-center gap-2 text-[#EAB308] bg-[#EAB308]/10 p-3 rounded-xl text-xs">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              <span>You can book exam after <b>{exam.eligibilityDetails.daysLeft} days</b> ⏳</span>
                            </div>
                          )}
                          {exam.eligibilityDetails?.currentProgress < exam.eligibilityDetails?.requiredProgress && (
                            <div className="flex items-center gap-2 text-[#EAB308] bg-[#EAB308]/10 p-3 rounded-xl text-xs">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              <span>Complete <b>{exam.eligibilityDetails.requiredProgress}%</b> of course to unlock exam 📊 (Current: {Math.floor(exam.eligibilityDetails.currentProgress)}%)</span>
                            </div>
                          )}
                          {!exam.eligibilityDetails && (
                            <div className="flex items-center gap-2 text-[#EAB308] bg-[#EAB308]/10 p-3 rounded-xl text-xs">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              <span>Your enrollment must be approved before you can book this exam.</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamBooking;
