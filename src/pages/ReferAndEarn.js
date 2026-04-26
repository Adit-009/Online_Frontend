import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Copy, ExternalLink, ArrowLeft, Trophy, Award, CheckCircle, Clock, Star, Gift } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { toast } from 'sonner';

const ReferAndEarn = () => {
  const { user: authUser } = useAuth();
  const [dashboardUser, setDashboardUser] = React.useState(null);
  const [referralStats, setReferralStats] = React.useState({ referredCount: 0, successfulReferrals: 0, referredUsers: [] });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const api = (await import('../utils/api')).default;
      const data = await api.dashboard.getData();
      setReferralStats(data.referralStats || { referredCount: 0, successfulReferrals: 0, referredUsers: [] });
      setDashboardUser(data.user || null);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const referralCode = dashboardUser?.referralCode || authUser?.referralCode;
    if (referralCode) {
      const link = `${window.location.origin}/register?ref=${referralCode}`;
      navigator.clipboard.writeText(link);
      toast.success('Referral link copied to clipboard!');
    } else {
      toast.error('Referral code not found. Please try again.');
    }
  };

  const getMilestoneProgress = () => {
    // Fallback: if server stats are lagging, calculate from points
    // Points / 50 should equal successful referrals
    const count = Math.max(
      referralStats.successfulReferrals || 0,
      Math.floor((dashboardUser?.rewardPoints || authUser?.rewardPoints || 0) / 50)
    );

    if (count < 3) return { next: 3, progress: (count / 3) * 100, label: 'Silver Milestone', count };
    if (count < 5) return { next: 5, progress: (count / 5) * 100, label: 'Gold Milestone', count };
    return { next: 10, progress: (count / 10) * 100, label: 'Platinum Milestone', count };
  };

  const milestone = getMilestoneProgress();

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/90 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <div className="text-xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Refer & Earn
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
            <Users className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-foreground mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Invite friends, earn rewards!
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Share your unique referral link and earn <span className="text-primary font-bold">50 Points</span> for every friend who successfully enrolls in a course.
          </p>
        </div>

        {/* Milestone Tracker Section */}
        <div className="mb-12">
          <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-6 h-6 text-primary fill-primary" />
                  <h3 className="text-xl font-bold text-foreground">Certification Ceremony Milestones</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Reach 3 or 5 successful referrals to receive a special award during the **Certificate Distribution Ceremony**! 
                  Milestone rewards are allotted offline.
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-primary">{milestone.label}</span>
                    <span>{milestone.count} / {milestone.next}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-1000 ease-out rounded-full"
                      style={{ width: `${milestone.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                <Gift className="w-12 h-12 text-primary" />
                <div className="text-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rewards at Ceremony</p>
                  <p className="text-sm font-black text-foreground">Special Awards & Recognition</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance & Referral Action Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Points Card */}
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 rounded-[2.5rem] shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
              <Award className="w-20 h-20" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">My Performance</p>
            <h3 className="text-5xl font-black mb-6">
              {dashboardUser?.rewardPoints || 0} <span className="text-xl">Points</span>
            </h3>
            <Link to="/leaderboard" className="inline-flex items-center gap-2 text-sm font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl backdrop-blur-sm transition-all underline-none">
              Check My Ranking ➜
            </Link>
          </div>

          {/* Referral Action Card */}
          <div className="md:col-span-2 bg-card border border-border p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center h-full">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Refer & Earn</h3>
                <div className="flex items-center gap-3 bg-background border border-border px-4 py-3 rounded-2xl mb-4">
                  <span className="font-mono font-bold text-primary tracking-widest text-lg line-clamp-1">
                    {dashboardUser?.referralCode || authUser?.referralCode || 'GENERATING...'}
                  </span>
                  <button 
                    onClick={copyReferralLink} 
                    className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
                    title="Copy Code"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground italic">Unlimited invitations allowed!</p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={copyReferralLink}
                  className="w-full bg-primary text-primary-foreground font-black py-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <ExternalLink className="w-5 h-5" />
                  COPY FULL LINK
                </button>
                <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-tighter">
                  Link: {window.location.origin}/register?ref={dashboardUser?.referralCode || authUser?.referralCode || '...'}
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Referred Students List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
              My Referrals History
            </h2>
            <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-bold">
              {referralStats.referredCount} Registered
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground font-medium">Updating referral status...</div>
          ) : referralStats.referredUsers.length === 0 ? (
            <div className="bg-card border border-dashed border-border p-12 rounded-[2.5rem] text-center shadow-sm">
              <Users className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
              <p className="text-muted-foreground text-lg">Your referrals will appear here once someone joins using your link.</p>
              <button 
                onClick={copyReferralLink}
                className="mt-6 text-primary font-bold hover:underline"
              >
                Share your link now ➜
              </button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-8 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Student Name</th>
                      <th className="px-8 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {referralStats.referredUsers.map((refUser, idx) => (
                      <tr key={idx} className="hover:bg-muted/10 transition-colors">
                        <td className="px-8 py-5">
                          <div className="font-bold text-foreground flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                                {refUser.name.charAt(0).toUpperCase()}
                             </div>
                             {refUser.name}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-muted-foreground font-medium text-right">
                          {new Date(refUser.createdAt).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferAndEarn;
