import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Lock, CheckCircle, ChevronRight, BookOpen, LogOut, Maximize, Minimize } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../components/ThemeToggle';
import api from '../utils/api';
import ContentProtection, { Watermark } from '../components/ContentProtection';
import ProtectedVideoPlayer from '../components/ProtectedVideoPlayer';
import { isYouTubeUrl } from '../utils/videoUtils';

export default function CoursePlayer() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef(null);

  const fetchCourseContent = useCallback(async () => {
    try {
      const [contentData, enrollmentData] = await Promise.all([
        api.courses.getContent(id),
        api.enrollments.getByCourse(id)
      ]);
      
      if (contentData && contentData.videos && Array.isArray(contentData.videos)) {
        
        setCourse(contentData);
        if (contentData.videos.length > 0) {
          setSelectedVideo(contentData.videos[0]);
        }
      } else {
        console.error('Course content missing video array:', contentData);
        setCourse(contentData || {});
      }
      setEnrollment(enrollmentData);
    } catch (error) {
      toast.error('Failed to load course content');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseContent();
    
    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [fetchCourseContent]);

  const toggleFullscreen = () => {
    if (!playerRef.current) return;

    if (!document.fullscreenElement) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      } else if (playerRef.current.webkitRequestFullscreen) {
        playerRef.current.webkitRequestFullscreen();
      } else if (playerRef.current.msRequestFullscreen) {
        playerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const handleVideoComplete = async (videoId) => {
    try {
      setActionSubmitting(true);
      
      // Optimistic Update
      const prevEnrollment = { ...enrollment };
      const newEnrollment = { ...enrollment };
      if (!newEnrollment.watchedVideos) newEnrollment.watchedVideos = [];
      const existing = newEnrollment.watchedVideos.find(v => v.videoId === videoId);
      if (existing) {
        existing.progress = 100;
      } else {
        newEnrollment.watchedVideos.push({ videoId, progress: 100 });
      }
      setEnrollment(newEnrollment);

      const response = await api.courses.updateProgress(id, { videoId, progress: 100 });
      toast.success('Progress updated!');
      
      if (response && typeof response.progress === 'number') {
        newEnrollment.progress = response.progress;
        setEnrollment(newEnrollment);
      }
      
      // Sync in background
      api.enrollments.getByCourse(id).then(eData => setEnrollment(eData)).catch(() => {});
    } catch (error) {
      toast.error('Failed to update progress');
      fetchCourseContent(); // Revert optimistic update
    } finally {
      setActionSubmitting(false);
    }
  };

  const isVideoWatched = (videoId) => {
    if (!enrollment || !enrollment.watchedVideos) return false;
    const watched = enrollment.watchedVideos.find(v => v.videoId === videoId);
    return watched && watched.progress >= 90;
  };

  const isUnlocked = (index) => {
    if (index === 0) return true;
    const prevVideo = course.videos[index - 1];
    return isVideoWatched(prevVideo._id || prevVideo.title);
  };

  const completedCount = course?.videos?.filter(v => isVideoWatched(v._id || v.title)).length || 0;
  const totalCount = course?.videos?.length || 0;
  
  const studentName = user && user.name ? user.name : "Student";
  const watermarkText = `Third Eye Computer Education | ${studentName}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading course...</div>
      </div>
    );
  }

  if (!course || !enrollment || enrollment.status !== 'paid') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-[#EF4444] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            {enrollment && enrollment.status === 'pending' 
              ? 'Your enrollment is pending approval. Please wait for confirmation.' 
              : 'You need to enroll in this course first'}
          </p>
          <Link
            to={`/courses/${id}`}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-3 rounded-xl transition-colors inline-block"
          >
            View Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ContentProtection showWatermark={false} watermarkText={'Third Eye Computer Education'}>
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border h-14 sm:h-16 flex items-center px-4 sm:px-6">
        <div className="max-w-full w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              ← Back to Dashboard
            </Link>
            <div className="h-6 w-px bg-[#2A2A2A]"></div>
            <h1 className="text-lg font-semibold text-foreground truncate max-w-md" data-testid="course-player-title">
              {enrollment.courseId?.title}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end gap-1 mr-4">
              <div className="flex items-baseline gap-2">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">Course Progress</span>
                <span className="text-primary font-bold text-sm">{completedCount}/{totalCount} completed ({enrollment.progress || 0}%)</span>
              </div>
              <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500" 
                  style={{ width: `${enrollment.progress || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="h-6 w-px bg-border mr-4 hidden lg:block"></div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-muted-foreground text-sm hidden sm:inline">Status: </span>
              <span className="text-primary font-semibold text-sm">{enrollment.progress >= 90 ? 'Completed' : 'Study In Progress'}</span>
            </div>
            <ThemeToggle />
            <button onClick={logout} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        {/* Video Player */}
        <div className="flex-1 flex flex-col bg-background p-3 sm:p-6">
          {selectedVideo ? (
            <div className="flex-1 flex flex-col">
              {/* Video Container */}
              <div 
                ref={playerRef}
                className="relative bg-black rounded-2xl overflow-hidden mb-4 aspect-video group"
                style={{ isolation: 'isolate' }}
              >
                {/* z-0 level: The Video Player */}
                <div className="relative z-0 w-full h-full">
                  {selectedVideo.url && isYouTubeUrl(selectedVideo.url) ? (
                    <ProtectedVideoPlayer
                      url={selectedVideo.url}
                      title={selectedVideo.title}
                      isYouTube={true}
                      onEnded={() => handleVideoComplete(selectedVideo._id || selectedVideo.title)}
                    />
                  ) : selectedVideo.url ? (
                    <ProtectedVideoPlayer
                      url={selectedVideo.url}
                      title={selectedVideo.title}
                      onEnded={() => handleVideoComplete(selectedVideo._id || selectedVideo.title)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D]">
                      <div className="text-center">
                        <Play className="w-20 h-20 text-primary mx-auto mb-4" />
                        <p className="text-foreground text-lg mb-2">{selectedVideo.title}</p>
                        <p className="text-muted-foreground text-sm mb-4">Duration: {selectedVideo.duration}</p>
                        <button
                          onClick={() => handleVideoComplete(selectedVideo._id || selectedVideo.title)}
                          disabled={actionSubmitting || isVideoWatched(selectedVideo._id || selectedVideo.title)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-xl transition-colors disabled:opacity-50"
                          data-testid="mark-complete-btn"
                        >
                          {actionSubmitting ? 'Updating...' : isVideoWatched(selectedVideo._id || selectedVideo.title) ? 'Completed' : 'Mark as Complete'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* z-[9999] level: Custom Fullscreen Watermark Overlay */}
                <Watermark text={watermarkText} />

                {/* z-[10000] level: Custom Fullscreen Controls (Overlay) */}
                <div className="absolute top-4 right-4 z-[10000] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={toggleFullscreen}
                    className="bg-black/70 hover:bg-black/90 backdrop-blur-md p-3 rounded-xl text-white transition-all active:scale-95 border border-white/30 shadow-2xl flex items-center gap-2"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    <span className="text-xs font-bold uppercase tracking-wider">{isFullscreen ? 'Exit' : 'Full Screen'}</span>
                  </button>
                </div>
              </div>

              {/* Video Info */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {selectedVideo.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Lesson {selectedVideo.order}</span>
                  <span>•</span>
                  <span>{selectedVideo.duration}</span>
                  {isVideoWatched(selectedVideo._id || selectedVideo.title) && (
                    <>
                      <span>•</span>
                      <span className="text-primary flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Select a video to start learning</p>
            </div>
          )}
        </div>

        {/* Sidebar - Video List */}
        <div className="w-full lg:w-96 bg-card border-t lg:border-t-0 lg:border-l border-border overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Course Content
            </h3>
            
            {/* Video List */}
            <div className="space-y-2">
              {course.videos && course.videos.map((video, index) => {
                const watched = isVideoWatched(video._id || video.title);
                const unlocked = isUnlocked(index);
                const isActive = selectedVideo && (selectedVideo._id === video._id || selectedVideo.title === video.title);
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (unlocked) {
                        setSelectedVideo(video);
                      } else {
                        toast.error('Complete previous lesson to unlock');
                      }
                    }}
                    disabled={!unlocked}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-primary/10 border-primary/20'
                        : 'bg-background border-border hover:border-primary/50'
                    } ${!unlocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                    data-testid={`video-item-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        watched ? 'bg-primary/20' : !unlocked ? 'bg-muted/50' : 'bg-[#2A2A2A]'
                      }`}>
                        {watched ? (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        ) : !unlocked ? (
                          <Lock className="w-4 h-4 text-muted-foreground/50" />
                        ) : (
                          <Play className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-foreground font-medium text-sm truncate">
                            {video.title}
                          </h4>
                          {!unlocked && <Lock className="w-3 h-3 text-muted-foreground/50" />}
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {unlocked ? video.duration : 'Locked'}
                        </p>
                      </div>
                      {isActive && (
                        <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mock Tests */}
            {course.mockTests && course.mockTests.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Mock Tests
                </h3>
                <div className="space-y-2">
                  {course.mockTests.map((test, index) => (
                    <div
                      key={index}
                      className="p-4 bg-background border border-border rounded-xl"
                    >
                      <h4 className="text-foreground font-medium text-sm mb-2">{test.title}</h4>
                      <p className="text-muted-foreground text-xs mb-3">
                        {test.questionsCount || 0} Questions
                      </p>
                      <button className="text-primary hover:text-[#16A34A] text-sm font-medium transition-colors">
                        Start Test →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </ContentProtection>
  );
}
