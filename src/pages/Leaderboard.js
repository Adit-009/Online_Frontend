import React, { useState, useEffect } from 'react';
import { Trophy, BookOpen, Crown, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';

const Leaderboard = () => {
  const [data, setData] = useState({ topPerformers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const lbData = await api.leaderboard.get();
        setData(lbData);
      } catch (error) {
        console.error('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (index) => {
    switch(index) {
      case 0: return <Crown className="w-5 h-5 text-[#FFD700]" />;
      case 1: return <Crown className="w-5 h-5 text-[#C0C0C0]" />;
      case 2: return <Crown className="w-5 h-5 text-[#CD7F32]" />;
      default: return <span className="text-muted-foreground font-bold">{index + 1}</span>;
    }
  };

  const renderContent = () => {
    if (loading) return <div className="text-center py-20 text-muted-foreground animate-pulse">Calculating rankings...</div>;

    const list = data.topPerformers || [];
    if (list.length === 0) return <div className="text-center py-20 text-muted-foreground italic">No rankings available yet. Keep studying to appear here!</div>;

    return (
      <div className="space-y-3">
        {list.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
              index < 3 ? 'bg-primary/5 border-primary/20 scale-100 hover:scale-[1.02]' : 'bg-card border-border hover:border-primary/30'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-background border border-border">
                {getRankBadge(index)}
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">{item.name}</p>
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {item.course}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex flex-col items-end">
                <span className="text-primary font-black text-xl">{item.progress}%</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Progress</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/90 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-lg sm:text-xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
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
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4 sm:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Global Rankings</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-foreground mb-4 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Hall of <span className="text-primary">Fame</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Celebrating the dedication and achievement of our top students. Are you ready to claim your spot?
          </p>
        </div>

        {/* Leaderboard Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-black text-foreground uppercase tracking-widest">Top Performers</h2>
            </div>
            {renderContent()}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/register" className="text-primary hover:underline font-medium">
            Join the race! Register now and start learning ➜
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
