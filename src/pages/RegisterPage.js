import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [address, setAddress] = useState('');
  const [studyCentre, setStudyCentre] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || sessionStorage.getItem('pendingReferral') || '');

  React.useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode.toUpperCase());
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (user && user !== false) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studyCentre) {
      toast.error('Please select a study centre');
      return;
    }
    setLoading(true);

    try {
      await register(name, email, password, phone, whatsappPhone || phone, address, studyCentre, referralCode);
      sessionStorage.removeItem('pendingReferral'); // Success! Clear the code
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12">
      <div className="w-full max-w-md lg:max-w-2xl xl:max-w-3xl">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Third Eye Computer Education
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">Admission Form</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-1 sm:mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Create Account to Enrol
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Start your learning journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
            {/* Two-column grid on lg+, single column on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    required
                    data-testid="register-name-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                    data-testid="register-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all"
                  placeholder="Enter your phone number"
                  required
                  data-testid="register-phone-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  WhatsApp Number (Optional)
                </label>
                <input
                  type="tel"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all"
                  placeholder="Same as phone if not provided"
                  data-testid="register-whatsapp-input"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Address *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all h-16 sm:h-20 resize-none"
                  placeholder="Enter your full address"
                  required
                  data-testid="register-address-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Study Centre *
                </label>
                <select
                  value={studyCentre}
                  onChange={(e) => setStudyCentre(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all"
                  required
                  data-testid="register-study-centre-select"
                >
                  <option value="">Select Study Centre</option>
                  <option value="Kathiatoli">Kathiatoli</option>
                  <option value="Nagaon">Nagaon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-11 pr-12 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all"
                    placeholder="Create a strong password"
                    required
                    minLength="6"
                    data-testid="register-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2">
                {searchParams.get('ref') && (
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4 flex items-center gap-2 animate-in zoom-in-95 duration-300">
                    <span className="text-xl">🎉</span>
                    <p className="text-sm font-bold text-primary">Referral Bonus Active! You'll get extra benefits upon joining.</p>
                  </div>
                )}
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  disabled={!!searchParams.get('ref')}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                  placeholder="Enter referral code if you have one"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 sm:py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="register-submit-button"
            >
              {loading ? (
                'Creating account...'
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-[#16A34A] font-medium transition-colors"
                data-testid="login-link"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 text-center">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
