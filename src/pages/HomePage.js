import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BookOpen, GraduationCap, Video, Award, ArrowRight, CheckCircle2, Menu, X, Sun, Moon, Trophy } from 'lucide-react';
import { useState } from 'react';
import useTitle from '../hooks/useTitle';

const HomePage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useTitle('Home');

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/90 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg sm:text-xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="site-title">
              Third Eye Computer Education
            </h1>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors mr-2 focus:outline-none"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link
                to="/courses"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                data-testid="courses-nav-link"
              >
                Courses
              </Link>
              <Link
                to="/leaderboard"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                data-testid="leaderboard-nav-link"
              >
                <Trophy className="w-4 h-4 text-primary" />
                Leaderboard
              </Link>
              {user && user !== false ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 sm:px-6 py-2 rounded-xl transition-colors text-sm"
                  data-testid="dashboard-link"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                    data-testid="login-nav-link"
                  >
                    Login
                  </Link>
                  <Link
                    to="/courses"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 sm:px-6 py-2 rounded-xl transition-colors text-sm"
                    data-testid="register-nav-link"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/courses"
                className="block text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
              <Link
                to="/leaderboard"
                className="block text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Leaderboard
              </Link>
              {user && user !== false ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="block bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-3 rounded-xl transition-colors text-sm text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/courses"
                    className="block bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-3 rounded-xl transition-colors text-sm text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/5 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="hero-title">
              Master Technology,
              <br />
              <span className="text-primary">Build Your Future</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Enroll in our expertly crafted courses, learn at your own pace, and earn your certification through offline exams.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                to="/courses"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-sm sm:text-base"
                data-testid="explore-courses-btn"
              >
                Explore Courses
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link
                to="/leaderboard"
                className="bg-card border border-border text-foreground hover:border-primary hover:text-primary font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm"
                data-testid="hero-leaderboard-btn"
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                View Leaderboard
              </Link>
              <Link
                to="/courses"
                className="bg-transparent border border-border text-foreground hover:border-primary hover:text-primary font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-colors text-center text-sm sm:text-base lg:hidden xl:inline-block"
                data-testid="register-cta-btn"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center mb-8 sm:mb-12" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Why to Choose Third Eye Computer Education's Online Coureses ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 hover:-translate-y-1 transition-transform duration-300" data-testid="feature-easy-enrollment">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">Easy Enrollment</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Simple enrollment process. Submit your request and our team will get in touch with you to get started.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 hover:-translate-y-1 transition-transform duration-300" data-testid="feature-quality-content">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">Quality Content</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Access high-quality video lessons, mock tests, and comprehensive learning materials.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 hover:-translate-y-1 transition-transform duration-300 sm:col-span-2 lg:col-span-1" data-testid="feature-offline-exams">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">Offline Exams</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Appear for offline exams at our institute and earn recognized certifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center mb-8 sm:mb-12" style={{ fontFamily: 'Outfit, sans-serif' }}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                num: '01',
                title: 'Choose Course',
                desc: 'Browse and select the course that fits your goals'
              },
              {
                num: '02',
                title: 'Submit Details',
                desc: 'Fill in your details and send your enrollment request'
              },
              {
                num: '03',
                title: 'Pay 50% & Start Learning',
                desc: 'Secure your seat by paying 50% and get instant access to learning'
              },
              {
                num: '04',
                title: 'Get Certified',
                desc: 'Complete the course and appear for the final exam to earn your certificate'
              }
            ].map((step, idx) => (
              <div key={idx} className="text-center" data-testid={`step-${idx + 1}`}>
                <div className="text-4xl sm:text-5xl font-bold text-primary/80 mb-3 sm:mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>{step.num}</div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-br from-[#22C55E]/10 via-transparent to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-4 sm:mb-6" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Ready to Start Your Journey?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
            Join Third Eye Computer Education Kathiatoli and unlock your potential
          </p>
          <Link
            to="/courses"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-colors inline-flex items-center gap-2 text-sm sm:text-base"
            data-testid="footer-cta-btn"
          >
            Get Started Today
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground text-xs sm:text-sm">
          <p>© {new Date().getFullYear()} Third Eye Computer Education. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
