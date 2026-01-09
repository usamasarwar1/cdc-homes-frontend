import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './page/Home.jsx'
import PropertyConfirm from './page/property-confirmed.jsx'
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

function App() {
  const [count, setCount] = useState(0)

  return (
    <ProgressProvider>
   <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/property-confirmed" element={<PropertyConfirm />} />
      <Route path="/credential-comparison" element={<CredentialComparisonPage />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/what's-included" element={<WhatsIncludedPage />} />
      <Route path="/inspector" element={<InspectorPage />} />
      <Route path="/pricing-schedule" element={<PricingSchedulePage />} />
      <Route path="/contact-verification" element={<ContactVerification />} />
      <Route path="/inspection-confirmed" element={<InspectionConfirmedPage />} />
      <Route path="/booking-summary" element={<BookingSummary />} />
      <Route path="/calendar" element={<InspectionCalendar />} />
    </Routes>
    </ProgressProvider>
  )
}

export default App
