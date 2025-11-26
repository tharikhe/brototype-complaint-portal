'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { SocialIcons } from '@/components/social-icons';
import { Eye, EyeOff, User, ShieldCheck, Loader2 } from 'lucide-react';
import Image from 'next/image';
import PacManLoader from '@/components/pac-man-loader';

import { Snowfall } from 'react-snowfall';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, user, profile, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true); // Login vs Signup
  const [isAdminLogin, setIsAdminLogin] = useState(false); // Student vs Admin
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already logged in (using useEffect to avoid React rendering error)
  useEffect(() => {
    if (!authLoading && user && profile) {
      router.push(profile.role === 'admin' ? '/admin' : '/student');
    }
  }, [authLoading, user, profile, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message || 'Failed to login');
      setLoading(false);
    } else {
      setLoading(false);
      // Auth context handles redirect via useEffect above
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password || !fullName) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    // Force role based on toggle (though signup is usually just for students in this flow, 
    // but let's allow admin signup if they are on admin tab for demo purposes)
    const role = isAdminLogin ? 'admin' : 'student';

    const { error } = await signUp(email, password, fullName, role);

    if (error) {
      setError(error.message || 'Failed to create account');
      setLoading(false);
    } else {
      setError('');
      setLoading(false);
      // Don't redirect here - let the useEffect handle it after profile is loaded
      // This prevents React rendering loop errors
    }
  };

  // Show Pac-Man loader while checking authentication
  if (authLoading) {
    return <PacManLoader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] font-sans selection:bg-red-500/30 relative overflow-hidden p-4">
      {/* Snowfall Effect */}
      <div className="absolute inset-0 z-0">
        <Snowfall
          snowflakeCount={200}
          style={{
            position: 'fixed',
            width: '100vw',
            height: '100vh',
          }}
        />
      </div>

      {/* Ambient Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-zinc-800/20 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0 max-w-6xl w-full z-10">

        {/* Santa Image - Centered with Form */}
        <div className="relative w-64 h-64 mt-16 lg:mt-0 lg:w-[650px] lg:h-[750px] flex-shrink-0 animate-in slide-in-from-left-10 duration-1000 fade-in">
          <Image
            src="/santa_v2.png"
            alt="Santa Clause"
            fill
            className="object-contain drop-shadow-[0_20px_50px_rgba(220,38,38,0.15)] hover:scale-105 transition-transform duration-700 ease-in-out"
            priority
          />
        </div>

        {/* Login Card Container */}
        <div className="flex flex-col items-center gap-4 w-full max-w-sm animate-in slide-in-from-right-10 duration-1000 fade-in lg:mt-20 lg:-ml-20">
          <Card className="w-full p-5 shadow-2xl bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 relative ring-1 ring-zinc-600/20 rounded-[25px] transition-all duration-400 hover:scale-[1.02] hover:border-zinc-600">
            {/* Festive Header Decoration */}
            <div className="absolute -top-8 -right-8 text-7xl rotate-12 select-none opacity-80 drop-shadow-lg animate-bounce duration-[3000ms]">
              🎄
            </div>

            {/* Logo Header */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-48 h-12 mb-4 transition-transform hover:scale-105 duration-300">
                <Image
                  src="/logo.png"
                  alt="Brototype Logo"
                  fill
                  className="object-contain invert drop-shadow-lg"
                  priority
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 backdrop-blur-md">
                <span className="text-red-500 text-lg">❄️</span>
                <h2 className="text-sm font-medium text-zinc-300 tracking-[0.2em] uppercase">
                  Complaint Portal
                </h2>
                <span className="text-red-500 text-lg">❄️</span>
              </div>
            </div>

            {/* Admin/Student Toggle */}
            <div className="flex bg-zinc-950/80 p-1 rounded-xl mb-4 border border-zinc-700/30 relative overflow-hidden shadow-inner">
              <div
                className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-zinc-700/50 rounded-lg transition-all duration-300 ease-out shadow-sm ${isAdminLogin ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'
                  }`}
              />
              <button
                onClick={() => setIsAdminLogin(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors relative z-10 ${!isAdminLogin
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                <User className="w-4 h-4" />
                Student
              </button>
              <button
                onClick={() => setIsAdminLogin(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors relative z-10 ${isAdminLogin
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Staff / Admin
              </button>
            </div>

            {/* Login/Signup Tabs */}
            <div className="flex gap-8 mb-4 border-b border-zinc-700/50 px-2">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`pb-3 text-sm font-medium transition-all relative ${isLogin ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                Login
                <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full transition-all duration-300 ${isLogin ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                  }`} />
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`pb-3 text-sm font-medium transition-all relative ${!isLogin ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                Sign Up
                <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full transition-all duration-300 ${!isLogin ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                  }`} />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Forms */}
            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-3">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-zinc-400 text-xs uppercase tracking-wider">Full Name</Label>
                  <div className="flex items-center gap-3 rounded-[20px] px-4 py-2.5 bg-zinc-900/80 border-none outline-none shadow-[inset_2px_5px_10px_rgb(5,5,5)] transition-all focus-within:shadow-[inset_2px_5px_12px_rgb(10,10,10)]">
                    <svg className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    </svg>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-transparent border-none text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto shadow-none"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-400 text-xs uppercase tracking-wider">Email Address</Label>
                <div className="flex items-center gap-3 rounded-[25px] px-4 py-3 bg-zinc-900/80 border-none outline-none shadow-[inset_2px_5px_10px_rgb(5,5,5)] transition-all focus-within:shadow-[inset_2px_5px_12px_rgb(10,10,10)]">
                  <svg className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
                  </svg>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-none text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto shadow-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-400 text-xs uppercase tracking-wider">Password</Label>
                <div className="flex items-center gap-3 rounded-[25px] px-4 py-3 bg-zinc-900/80 border-none outline-none shadow-[inset_2px_5px_10px_rgb(5,5,5)] transition-all focus-within:shadow-[inset_2px_5px_12px_rgb(10,10,10)] relative">
                  <svg className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                  </svg>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-none text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto shadow-none flex-1 pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-zinc-400 text-xs uppercase tracking-wider">Confirm Password</Label>
                  <div className="flex items-center gap-3 rounded-[25px] px-4 py-3 bg-zinc-900/80 border-none outline-none shadow-[inset_2px_5px_10px_rgb(5,5,5)] transition-all focus-within:shadow-[inset_2px_5px_12px_rgb(10,10,10)] relative">
                    <svg className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                      <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                    </svg>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-transparent border-none text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto shadow-none flex-1 pr-8"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-800 hover:bg-black text-white py-3 text-sm font-semibold mt-4 shadow-lg border border-zinc-700 transition-all duration-400 hover:scale-[1.02] active:scale-[0.98] rounded-lg"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  isLogin ? (isAdminLogin ? 'Login as Staff' : 'Login as Student') : 'Create Account'
                )}
              </Button>
            </form>
          </Card>

          {/* Social Media Icons */}
          <SocialIcons />
        </div>
      </div>
    </div>
  );
}
