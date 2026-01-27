import { useState } from 'react'
import Herosection from '../components/HeroSection'
import Header from '../components/Headers'
import Footer from '../components/Footer'
import MainContent from '../components/MainContent'
import { useNavigate } from "react-router-dom";


function Home() {
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);  
  const navigate = useNavigate();



  return (
  <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
    
      <Header />
      <Herosection />
       <MainContent
        property={property}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setProperty={setProperty}
        navigate={navigate}
      />
      <Footer />
      </div>
  )
}

export default Home