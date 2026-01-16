import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import Home from './page/Home.jsx'
import PropertyConfirm from './page/Property-confirmed.jsx'
import { ProgressProvider } from './components/gamification/ProgressProvider.jsx'
import CredentialComparisonPage from './page/credential-comparison.jsx'
import Pricing from './page/Pricing.jsx'
import WhatsIncludedPage from './page/Whats-includes.jsx'
import InspectorPage from './page/Inspector.jsx'
import PricingSchedulePage from './page/pricing-schedule.jsx'
import ContactVerification from './page/Contact-verification.jsx'
import BookingSummary from './page/BookingSummary.jsx'
import InspectionCalendar from './page/Calendar.jsx'
import InspectionConfirmedPage from './page/inspection-confirmed.jsx'
import Layout from './components/Layout.jsx'
import Dashboard from './page/dashboard.jsx'
import { onAuthStateChanged } from 'firebase/auth'
import Users from './page/Users.jsx'
import { auth, db } from './firebase'
import { getDoc, doc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'



function ProtectedRoute({ children, allowedRoles = "admin" }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const userByRole = await getDoc(doc(db, "users", currentUser.uid));
       console.log("userByRole", userByRole.data());

       if(userByRole.data().role === "admin") {
        navigate("/dashboard");
        setUserRole("admin");
       }else{
        navigate("/");
        setUserRole("user");
       }
      } catch (err) {
        console.error("Error fetching user role", err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (userRole !== "admin") {
    return <Navigate to="/" replace />;
  }


  return children;
}

function Router() {

  return (
  <Routes>
      <Route path="/" element={
          <Home />
      } />
      
      {/* Dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
        <Layout>
          <Users />
        </Layout>
        </ProtectedRoute>
      } />
       <Route path="/pricing" element={
        <ProtectedRoute>
        <Layout>
          <Pricing />
        </Layout>
        </ProtectedRoute>
      } />
      <Route path="/pricing-schedule" element={
        <ProtectedRoute>
        <Layout>
          <PricingSchedulePage />
        </Layout>
        </ProtectedRoute>
      } />

      {/* Users */}
      <Route path="/property-confirmed" element={<PropertyConfirm />} />
      <Route path="/credential-comparison" element={<CredentialComparisonPage />} />
      <Route path="/contact-verification" element={<ContactVerification />} />
      <Route path="/what's-included" element={<WhatsIncludedPage />} />
      <Route path="/inspector" element={<InspectorPage />} />
      <Route path="/inspection-confirmed" element={<InspectionConfirmedPage />} />
      <Route path="/booking-summary" element={<BookingSummary />} />
      <Route path="/calendar" element={<InspectionCalendar />} />
      </Routes>
  );
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <ProgressProvider>
        <Router />
    </ProgressProvider>
  )
}

export default App
