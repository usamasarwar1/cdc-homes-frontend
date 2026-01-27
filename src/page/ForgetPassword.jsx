import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const ForgetPassword = () => {
    const auth = getAuth();
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent! Check your email.");

    //   navigate("/check-email");
    } catch (err) {
      console.error(err);
      setError("Failed to send reset email. Make sure the email is correct.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-50">

      {/* Back to Home – Top Left */}
      <div className="absolute top-4 left-4">
        <Button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:bg-blue-50 text-sm px-3 py-1"
        >
          ← Back to Home
        </Button>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-white px-5 py-2 text-red-600">
          <img
            src="./attached_assets/CDC Logo_1753482679929.png"
            alt="CDC Logo"
            className="w-40 h-20 mx-auto"
          />
          <p className="text-red-700 text-xs text-center mt-1">
            Enter your email to reset your password
          </p>
        </div>

        <div className="max-w-md mx-auto px-5 py-2 bg-white shadow-lg rounded-xl">
  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Forgot Password</h2>

  <form onSubmit={handleSubmit} className="space-y-6">
    {/* Email Input */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
      <input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
      />
    </div>

    {/* Messages */}
    {message && <p className="text-gray-500 text-sm">{message}</p>}
    {error && <p className="text-red-600 text-sm">{error}</p>}

    {/* Submit Button */}
    <div>
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full cursor-pointer px-4 py-3 text-white rounded-md font-medium focus:outline-none transition ${
          isLoading
            ? "bg-red-300 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {isLoading ? "Sending..." : "Reset Password"}
      </button>
    </div>
  </form>

  {/* Optional footer */}
  <p className="mt-6 text-center text-gray-500 text-sm">
    Remembered your password?{" "}
    <a href="/login" className="text-red-600 hover:underline">
      Login here
    </a>
  </p>
</div>

      </div>
    </div>
  );
};

export default ForgetPassword;
