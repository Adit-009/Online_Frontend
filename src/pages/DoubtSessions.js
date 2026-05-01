import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Loader2, MessageSquare, ArrowLeft, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const DoubtSessions = () => {
  const { user } = useAuth();
  const [availableSessions, setAvailableSessions] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Get student enrollments for context
      const enrolledData = await api.enrollments.getMy();
      setEnrollments(enrolledData);
      
      // 2. Fetch ALL upcoming doubt sessions
      const allSessions = await api.doubtSessions.getAvailable();
      
      // 3. Get sessions user has already joined
      const joinedData = await api.doubtSessions.getMy();
      
      setAvailableSessions(allSessions);
      setMySessions(joinedData);
      
    } catch (error) {
      toast.error('Failed to load doubt sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (sessionId) => {
    setJoining(sessionId);
    try {
      await api.doubtSessions.join(sessionId);
      toast.success('Successfully joined the doubt session!');
      fetchData(); // Refresh to update participant counts and joined status
    } catch (error) {
      toast.error(error.message || 'Failed to join session');
    } finally {
      setJoining(null);
    }
  };

  const isJoined = (sessionId) => {
    return mySessions.some(s => s._id === sessionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Finding sessions for your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/90 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Doubt Clearing Classes
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Book Your Session
          </h2>
          <p className="text-muted-foreground text-lg">Select an upcoming session to resolve your doubts with instructors.</p>
        </div>

        {availableSessions.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Sessions Scheduled</h3>
            <p className="text-muted-foreground">There are no upcoming doubt clearing sessions right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSessions.map((session) => {
              const joined = isJoined(session._id);
              const isFull = !joined && session.participants?.length >= session.maxParticipants;
              
              return (
                <div key={session._id} className={`bg-card border ${joined ? 'border-primary/50' : 'border-border'} rounded-2xl overflow-hidden flex flex-col hover:border-primary/30 transition-all group`}>
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                        {session.courseId?.title || 'General Session'}
                      </span>
                      {joined && (
                        <span className="flex items-center gap-1 text-primary text-xs font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Joined
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{session.title}</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-muted-foreground text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
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
                        {session.participants?.length || 0} / {session.maxParticipants} Students enrolled
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm line-clamp-3 bg-background p-3 rounded-xl italic">
                      {session.description || 'Join this session to clear all your subject-related doubts directly with our expert instructors.'}
                    </p>
                  </div>

                  <div className="p-6 pt-0 mt-auto">
                    {joined ? (
                      <button 
                        disabled
                        className="w-full bg-primary/10 text-primary font-bold py-3 rounded-xl border border-primary/20 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        You're Enrolled
                      </button>
                    ) : isFull ? (
                      <button 
                        disabled
                        className="w-full bg-[#3F3F46] text-muted-foreground font-bold py-3 rounded-xl cursor-not-allowed opacity-50"
                      >
                        Session Full
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleJoin(session._id)}
                        disabled={joining === session._id}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#22C55E]/20 flex items-center justify-center gap-2"
                      >
                        {joining === session._id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Session'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoubtSessions;
