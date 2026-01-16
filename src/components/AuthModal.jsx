import { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  Dialog,
  DialogContent,
} from './ui/dialoag';
import { Button } from './ui/Button';
import { Input } from './ui/input';

const AuthModal = ({ isOpen, onClose, modalType, setModalType, onAuthSuccess, setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    setIsLoading(false);
    onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
    const authUser =  await signInWithEmailAndPassword(auth, email, password);
   const userData = await getDoc(doc(db, 'users', authUser.user.uid));
  //  console.log("-----", userData.data(), authUser.user.uid);

   const data = {
    ...userData.data(),
    userId: authUser.user.uid,
    };
    sessionStorage.setItem("userData", JSON.stringify(data));

    setIsAuthenticated(true);
      onAuthSuccess();
      handleClose();
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid credentials. Please try again or sign up.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userProfile = {
        email: user.email,
        name: user.email.split('@')[0],
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      setModalType('login');

      // code comment by haide dev 
      // onAuthSuccess();
      // handleClose();
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.code?.startsWith('firestore/')) {
        setError('Failed to create profile. Please try again.');
        return;
      }
      
      if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use. Please login instead.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak.');
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[300px] sm:max-w-md md:max-w-md p-0 gap-0 overflow-hidden rounded-lg shadow-2xl border-0 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute cursor-pointer right-3 top-3 z-50 rounded-full p-1 text-white hover:text-gray-600 hover:bg-gray-100 bg-red-700 shadow-sm transition-colors"
          type="button"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-white to-white px-5 py-4 text-red-600">
          <img src="./attached_assets/CDC Logo_1753482679929.png" alt="" className="w-40 h-20 mx-auto" />
          
          <p className="text-red-700 text-xs text-center mt-1">
            {modalType === 'login'
              ? 'Sign in to continue to your dashboard'
              : 'Join us to get started'}
          </p>
        </div>

        <div className="p-4 bg-white">
          <div className="flex gap-1.5 mb-4 bg-gray-200 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setModalType('login');
                resetForm();
              }}
              className={`flex-1 py-2 rounded-md cursor-pointer text-xs font-medium transition ${
                modalType === 'login'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setModalType('signup');
                resetForm();
              }}
              className={`flex-1 py-2 rounded-md cursor-pointer text-xs font-medium transition ${
                modalType === 'signup'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-1.5 mb-3 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={modalType === 'login' ? handleLogin : handleSignup}
            className="space-y-3"
          >
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 pr-3 h-9 text-sm rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 h-9 text-sm rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 cursor-pointer top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {modalType === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 pr-9 h-10 text-sm rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg mt-4 shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {modalType === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  {modalType === 'login' ? (
                    <>
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </>
                  )}
                </span>
              )}
            </Button>
          </form>

          <div className="text-center mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              {modalType === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setModalType('signup');
                      resetForm();
                    }}
                    className="text-red-600 font-semibold hover:text-red-700 hover:underline transition-colors"
                  >
                    Sign up here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setModalType('login');
                      resetForm();
                    }}
                    className="text-red-600 font-semibold hover:text-red-700 hover:underline transition-colors"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;