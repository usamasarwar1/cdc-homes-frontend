import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  getAuth,
  verifyPasswordResetCode,
  confirmPasswordReset
} from "firebase/auth";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = getAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [oobCode, setOobCode] = useState('');
  const [validCode, setValidCode] = useState(false);

  // ✅ Get & verify reset code from URL
  useEffect(() => {
    const code = searchParams.get("oobCode");
    if (!code) {
      setError("Invalid or missing reset link.");
      return;
    }

    setOobCode(code);

    verifyPasswordResetCode(auth, code)
      .then(() => setValidCode(true))
      .catch(() => setError("This reset link is expired or invalid."));
  }, [searchParams, auth]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setMessage("Password reset successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!validCode && !error) {
    return <p className="text-center mt-20">Verifying reset link...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">

        <img
          src="./attached_assets/CDC Logo_1753482679929.png"
          alt="CDC Logo"
          className="w-40 h-20 mx-auto mb-2"
        />

        <h2 className="text-2xl font-bold text-center mb-6">
          Reset Your Password
        </h2>

        <form onSubmit={handleReset} className="space-y-5">

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative mt-1 border-gray-500">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                 placeholder="Enter new password"
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 "
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 cursor-pointer top-3 text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative mt-1 border-gray-500">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
              
placeholder="Confirm new password"

                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 cursor-pointer top-3 text-gray-400"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {message && <p className="text-green-600 text-sm">{message}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-md cursor-pointer text-white font-medium ${
              isLoading
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
