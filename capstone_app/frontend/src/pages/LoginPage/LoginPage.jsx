import { useEffect, useState } from 'react';
import logo from '../../assets/logo/balangkas_logo.png';
import googleIcon from '../../assets/ico/google_icon.png';
// import PageTransition from '../../components/PageTransition';
import { useLocation, useNavigate } from 'react-router-dom';
import TypewriterEffect from '../../components/TypewriterEffect';
import {
  DEMO_ADMIN_LOGIN,
  DEMO_INSTRUCTOR_LOGIN,
  DEMO_STUDENT_LOGIN,
  authenticateLocalUser,
  registerLocalUser,
  setDemoAuthSession,
} from '../../demoAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPasswords, setShowSignupPasswords] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    const mode = new URLSearchParams(location.search).get('mode');
    setIsSignup(mode === 'signup');
  }, [location.search]);

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);
  const handleAuth = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    let authSucceeded = false;

    if (isSignup && (!firstName.trim() || !lastName.trim())) {
      setError('First name and last name are required.');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError('Invalid email.');
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    let routeAfterLogin = '/playershipdashboard';

    try {
      if (isSignup) {
        registerLocalUser({
          firstName,
          lastName,
          email,
          password,
          role: 'student',
        });
        const localSession = authenticateLocalUser(email, password);
        if (!localSession) {
          throw new Error('Unable to sign in after account creation.');
        }
        setDemoAuthSession(localSession);
        setMessage('Account created successfully.');
        authSucceeded = true;
        routeAfterLogin = '/playershipdashboard';
      } else {
        const session = authenticateLocalUser(email, password);
        if (!session) {
          throw new Error('Invalid email or password.');
        }
        setDemoAuthSession(session);
        setMessage('Login successful.');
        authSucceeded = true;
        if (session.profile?.role === 'admin') {
          routeAfterLogin = '/admin';
        } else if (session.profile?.role === 'instructor') {
          routeAfterLogin = '/instructor';
        } else {
          routeAfterLogin = '/playershipdashboard';
        }
      }
    } catch (authError) {
      setError(authError.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
      if (authSucceeded) {
        navigate(routeAfterLogin, { replace: true });
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setMessage('Google sign-in is disabled while local role-based auth is active.');
  };

  return (
    <>
      {/* {showTransition && (
        <PageTransition
          onComplete={() => {
            setShowTransition(false);
            navigate(nextRoute);
          }}
        />
      )} */}
      <main className="min-h-screen flex flex-wrap items-center justify-center gap-0 p-0 bg-cover bg-center" style={{backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.12)), url(../../assets/bg/bg_main.png)'}}>
        {/* Logo Section */}
        <div className="hidden md:flex flex-[0_0_54%] max-w-[54%] h-screen items-center justify-center p-6">
        <img className="w-full max-w-[560px] h-auto object-contain" style={{filter: 'drop-shadow(0 14px 22px rgba(23, 72, 140, 0.18))'}} src={logo} alt="Balangkas logo" />
      </div>

      {/* Form Section */}
      <section className="flex-[0_0_100%] md:flex-[0_0_46%] md:max-w-[46%] w-full md:w-[46%] min-h-[92vh] flex overflow-hidden rounded-[24px] md:rounded-l-[28px] md:rounded-r-[0]" style={{boxShadow: '-18px 24px 56px rgba(27, 76, 136, 0.16)', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.24)), url(../../assets/bg/login_form_bg.png)', backdropFilter: 'blur(18px)', borderLeft: '1px solid rgba(255, 255, 255, 0.42)'}}>
        <div className="relative flex items-center justify-center flex-1 p-6 md:p-11">
          <div className="relative z-10 w-full max-w-[420px] p-6 md:p-0">
            <form className="grid gap-[22px]" onSubmit={handleAuth}>
              <TypewriterEffect
              text={isSignup ? "Create your account" : "Welcome back"}
              speed={60}
              className="text-[#12385f] text-xl font-semibold mb-2 block"
              />
              {isSignup ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="grid gap-[14px]">
                    <span className="text-base font-normal text-gray-600">First Name</span>
                    <input
                      type="text"
                      name="firstName"
                      aria-label="First Name"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      required={isSignup}
                      className="w-full border-0 border-b border-[rgba(34,122,224,0.82)] rounded-none p-3 pb-[14px] bg-transparent text-[#12385f] outline-none transition-all focus:border-b-[#0f6ed9] focus:shadow-[0_1px_0_0_rgba(15,110,217,0.28)]"
                    />
                  </label>

                  <label className="grid gap-[14px]">
                    <span className="text-base font-normal text-gray-600">Last Name</span>
                    <input
                      type="text"
                      name="lastName"
                      aria-label="Last Name"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      required={isSignup}
                      className="w-full border-0 border-b border-[rgba(34,122,224,0.82)] rounded-none p-3 pb-[14px] bg-transparent text-[#12385f] outline-none transition-all focus:border-b-[#0f6ed9] focus:shadow-[0_1px_0_0_rgba(15,110,217,0.28)]"
                    />
                  </label>
                </div>
              ) : null}

              <label className="grid gap-[14px]">
                <span className="text-base font-normal text-gray-600">Email</span>
                <input
                  type="email"
                  name="email"
                  aria-label="Email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full border-0 border-b border-[rgba(34,122,224,0.82)] rounded-none p-3 pb-[14px] bg-transparent text-[#12385f] outline-none transition-all focus:border-b-[#0f6ed9] focus:shadow-[0_1px_0_0_rgba(15,110,217,0.28)]"
                />
              </label>

              <label className="grid gap-[14px]">
                <span className="text-base font-normal text-gray-600">Password</span>
                <input
                  type={isSignup && showSignupPasswords ? 'text' : 'password'}
                  name="password"
                  aria-label="Password"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full border-0 border-b border-[rgba(34,122,224,0.82)] rounded-none p-3 pb-[14px] bg-transparent text-[#12385f] outline-none transition-all focus:border-b-[#0f6ed9] focus:shadow-[0_1px_0_0_rgba(15,110,217,0.28)]"
                />
              </label>

              {isSignup ? (
                <>
                  <label className="grid gap-[14px]">
                    <span className="text-base font-normal text-gray-600">Confirm Password</span>
                    <input
                      type={showSignupPasswords ? 'text' : 'password'}
                      name="confirmPassword"
                      aria-label="Confirm Password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required={isSignup}
                      className="w-full border-0 border-b border-[rgba(34,122,224,0.82)] rounded-none p-3 pb-[14px] bg-transparent text-[#12385f] outline-none transition-all focus:border-b-[#0f6ed9] focus:shadow-[0_1px_0_0_rgba(15,110,217,0.28)]"
                    />
                  </label>

                  <label className="inline-flex items-center gap-[10px] -mt-2">
                    <input
                      type="checkbox"
                      name="showSignupPasswords"
                      checked={showSignupPasswords}
                      onChange={(event) => setShowSignupPasswords(event.target.checked)}
                      className="w-4 h-4 accent-[#2d79d8]"
                    />
                    <span className="text-[0.95rem] text-gray-400">Show passwords</span>
                  </label>
                </>
              ) : null}

              <button 
                type="submit" 
                disabled={isLoading}
                className="mt-1.5 border-0 rounded-lg py-[15px] px-[18px] bg-gradient-to-r from-[#2d79d8] to-[#72baf8] text-white font-bold cursor-pointer shadow-lg shadow-[rgba(45,121,216,0.25)] transition-all hover:shadow-[0_20px_34px_rgba(45,121,216,0.32)] hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-72 disabled:transform-none disabled:shadow-none"
              >
                {isLoading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
              </button>

              <button 
                type="button" 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-3 w-fit mx-auto py-2.5 px-[18px] border border-gray-400 border-opacity-24 rounded-full bg-[#fafafa] text-gray-700 font-medium shadow-md hover:shadow-lg transition-shadow disabled:cursor-not-allowed disabled:opacity-72"
              >
                <img className="w-[18px] h-[18px] object-contain" src={googleIcon} alt="Google" />
                <span>{isSignup ? 'Continue with Google' : 'Sign in with Google'}</span>
              </button>

              {!isSignup ? (
                <p className="text-center text-xs uppercase tracking-[0.24em] text-gray-500">
                  Demo student: {DEMO_STUDENT_LOGIN.email} / {DEMO_STUDENT_LOGIN.password}
                  <br />
                  Demo instructor: {DEMO_INSTRUCTOR_LOGIN.email} / {DEMO_INSTRUCTOR_LOGIN.password}
                  <br />
                  Demo admin: {DEMO_ADMIN_LOGIN.email} / {DEMO_ADMIN_LOGIN.password}
                </p>
              ) : null}

              {error ? <p className="mt-[-6px] text-center text-[0.95rem] text-[#b42318]">{error}</p> : null}
              {message ? <p className="mt-[-6px] text-center text-[0.95rem] text-[#1f7a3f]">{message}</p> : null}

              <p className="mt-2.5 text-center text-gray-500">
                {isSignup ? 'Already have an account?' : 'Don\'t have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup((value) => !value);
                    setFirstName('');
                    setLastName('');
                    setPassword('');
                    setConfirmPassword('');
                    setShowSignupPasswords(false);
                    setError('');
                    setMessage('');
                  }}
                  className="border-0 p-0 bg-transparent text-[#2d79d8] font-semibold cursor-pointer hover:underline transition-all"
                >
                  {isSignup ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
