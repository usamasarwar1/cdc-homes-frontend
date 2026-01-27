import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './page/Home.jsx'
import PropertyConfirm from './page/Property-confirmed.jsx'
import { ProgressProvider } from './components/gamification/ProgressProvider.jsx'
import CredentialComparisonPage from './page/Credential-comparison.jsx'
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

import { auth, db } from './firebase'
import { getDoc, doc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import PropertyConfirmation from './page/Property-confirmation.jsx'
import PropertyDetails from './page/Property-details.jsx'
import PricingScheduleAdminPage from './page/Pricing_schduleAdmin.jsx'
import PaymentSuccess from './page/PaymentSuccess.jsx'
import PaymentCancel from './page/PaymentCancel.jsx'
import Login from './page/Login.jsx'



function ProtectedRoute({ children, allowedRoles = ["admin"] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        const role = userSnap.data()?.role || null;
        setUserRole(role);

        // Redirect only if user is admin and not already on admin route
        if (role === "admin" && !location.pathname.startsWith("/admin")) {
          navigate("/admin/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Error fetching user role", err);
        setUserRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // If not allowed role, redirect to home
  if (!allowedRoles.includes(userRole)) {
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
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin/pricing-schedule-admin" element={
            <ProtectedRoute>
            <Layout>
              <PricingScheduleAdminPage />
            </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/property-confirm" element={
            <ProtectedRoute>
            <Layout>
              <PropertyConfirmation />
            </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/property-details/:bookingId" element={
            <ProtectedRoute>
            <Layout>
              <PropertyDetails />
            </Layout>
            </ProtectedRoute>
          } />

          <Route path='/login' element={<Login />} />
          <Route path="/property-confirmed" element={<PropertyConfirm />} />
          <Route path="/property-confirmed" element={<login />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/credential-comparison" element={<CredentialComparisonPage />} />
          <Route path="/contact-verification" element={<ContactVerification />} />
          <Route path="/what's-included" element={<WhatsIncludedPage />} />
          <Route path="/inspector" element={<InspectorPage />} />
          <Route path="/pricing-schedule" element={<PricingSchedulePage />} />
          <Route path="/inspection-confirmed" element={<InspectionConfirmedPage />} />
          <Route path="/booking-summary" element={<BookingSummary />} />
          <Route path="/calendar" element={<InspectionCalendar />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
        </Routes>
    );
  }
function App() {

  return (
    <ProgressProvider>
        <Router />
    </ProgressProvider>
  )
}

export default App
