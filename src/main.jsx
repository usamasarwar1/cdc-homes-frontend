import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import StripeProvider from './components/stripe/stripeProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StripeProvider>
        <App />
      </StripeProvider>
     </BrowserRouter>
  </StrictMode>,
)
