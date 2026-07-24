import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const authUser = await signInWithEmailAndPassword(auth, email, password);
      const userData = await getDoc(doc(db, "users", authUser.user.uid));

      const data = {
        ...userData.data(),
        userId: authUser.user.uid,
      };
      localStorage.setItem("user", JSON.stringify(data));

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setError("Invalid credentials. Please try again");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <img
          src="./attached_assets/CDC Logo_1753482679929.png"
          alt="CDC Logo"
          className="w-40 h-20 mx-auto mb-2"
        />

        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative mt-1 border-gray-500">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={email}
                placeholder="Enter Email"
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 pr-10"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              New Password
            </label>
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

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-md cursor-pointer text-white font-medium ${
              isLoading
                ? "bg-red-300 cursor-not-allowed flex items-center justify-center gap-2"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
