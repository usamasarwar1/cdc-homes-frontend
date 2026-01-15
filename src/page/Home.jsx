import { useState, useEffect } from 'react'
import Herosection from '../components/HeroSection'
import Header from '../components/Headers'
import Footer from '../components/Footer'
import MainContent from '../components/MainContent'
import { useNavigate } from "react-router-dom";
import AuthModal from '../components/AuthModal';
import { getPricingTier } from '../utils/getPricingTier';


function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('login');
  const [pendingPropertyInfo, setPendingPropertyInfo] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const userData = sessionStorage.getItem("userData");
    if(userData){
      setIsAuthenticated(true);
      setUserData(JSON.parse(userData));
    }
    window.scrollTo(0, 0);
  }, []);

  const processPropertyInfo = (propertyInfo) => {
    const pricing = getPricingTier(propertyInfo);
    
    const propertyWithPricing = {
      ...propertyInfo,
      basePrice: pricing.payNow,
      payNowPrice: pricing.payNow,
      challengePrice: pricing.challenge,
      pricingTier: pricing.tier,
    };
   
    sessionStorage.setItem(
      "confirmedProperty",
      JSON.stringify(propertyWithPricing),
    );
    navigate("/property-confirmed");
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setIsModalOpen(false);
    
    const storedUserData = sessionStorage.getItem("userData");
    const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
    
    if (parsedUserData) {
      setUserData(parsedUserData);
    }
    
    if (pendingPropertyInfo) {
      processPropertyInfo(pendingPropertyInfo);
      setPendingPropertyInfo(null);
    } else if (pendingPropertyInfo === null && parsedUserData?.role === "admin"){
      navigate("/dashboard");
      console.log("userData in home", parsedUserData);
      console.log("pendingPropertyInfo in home", pendingPropertyInfo);
    } else {
      navigate("/");
    }
  };

  return (
  <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
    
      <Header setIsModalOpen={setIsModalOpen} userData={userData} setModalType={setModalType} setIsAuthenticated={setIsAuthenticated} isAuthenticated={isAuthenticated} />
      <Herosection />
       <MainContent
        property={property}
        currentStep={currentStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setProperty={setProperty}
        setCurrentStep={setCurrentStep}
        navigate={navigate}
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        setIsModalOpen={setIsModalOpen}
        setModalType={setModalType}
        setPendingPropertyInfo={setPendingPropertyInfo}
      />
      <Footer />
       
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType={modalType}
        setModalType={setModalType}
        onAuthSuccess={handleAuthSuccess}
        setIsAuthenticated={setIsAuthenticated}
      />
      </div>
  )
}

export default Home