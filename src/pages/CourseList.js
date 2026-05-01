import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import {
  BookOpen,
  Clock,
  IndianRupee,
  Play,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { toast } from "sonner";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await api.courses.getAll();
      setCourses(data);
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const courseThumbnails = [
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/90 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-lg sm:text-xl font-bold text-foreground"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Third Eye Computer Education
              </Link>
              <Link
                to="/"
                className="hidden sm:flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm font-medium border-l border-border pl-4 ml-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Home
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              {user && user !== false ? (
                <Link
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-2 rounded-xl transition-colors"
                  data-testid="dashboard-nav-link"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/courses"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-2 rounded-xl transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-foreground"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-4">
            {user && user !== false ? (
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                className="block bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-3 rounded-xl transition-colors text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/courses"
                  className="block bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-3 rounded-xl transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4"
            style={{ fontFamily: "Outfit, sans-serif" }}
            data-testid="courses-page-title"
          >
            All Courses
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Browse our comprehensive catalog of technology courses
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl overflow-hidden animate-shimmer h-64"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-base sm:text-lg">
              No courses available at the moment
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {courses.map((course, idx) => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-primary/50 transition-all duration-300"
                data-testid={`course-card-${idx}`}
              >
                <div className="aspect-video bg-background relative overflow-hidden">
                  <img
                    src={
                      course.thumbnail ||
                      courseThumbnails[idx % courseThumbnails.length]
                    }
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <span className="bg-primary/90 text-foreground text-xs font-medium px-2 sm:px-3 py-1 rounded-full">
                      Enroll Now
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <h3
                    className="text-lg sm:text-xl font-semibold text-foreground mb-2 line-clamp-1"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-primary font-semibold text-base sm:text-lg">
                      <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                      {course.price}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      In-Demand Course
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseList;
