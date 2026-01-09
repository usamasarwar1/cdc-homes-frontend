import { useState, useEffect } from 'react'
import Herosection from '../components/HeroSection'
import Header from '../components/Headers'
import Footer from '../components/Footer'
import MainContent from '../components/MainContent'
import { useNavigate } from "react-router-dom";



function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
  <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
    
      <Header />
      <Herosection />
       <MainContent
        property={property}
        currentStep={currentStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setProperty={setProperty}
        setCurrentStep={setCurrentStep}
        navigate={navigate}
      />
      <Footer />
       
      </div>
  )
}

export default Home