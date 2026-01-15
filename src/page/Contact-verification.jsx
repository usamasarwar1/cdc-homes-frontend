import { useEffect, useState } from 'react';
import ContactVerification from '../components/booking/ContactVerification';
import { MiniProgressTracker } from '../components/gamification/MiniProgressTracker';
import { useProgress } from '../components/gamification/ProgressProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function ContactVerificationPage() {
  const navigate = useNavigate();
  const { currentStep, completedSteps, completeStep, setStep } = useProgress();
  
  const urlParams = new URLSearchParams(window.location.search);
  const property = {
    address: urlParams.get('address') || '',
    street: urlParams.get('street') || '',
    city: urlParams.get('city') || '',
    state: urlParams.get('state') || '',
    zip: urlParams.get('zip') || '',
    propertyType: urlParams.get('propertyType') || '',
    squareFootage: parseInt(urlParams.get('squareFootage') || '0') || undefined,
    paymentMethod: urlParams.get('paymentMethod') || 'pay_now'
  };

  // console.log('ContactVerificationPage - URL search params:', window.location.search);
  // console.log('ContactVerificationPage - Parsed property data:', property);

  useEffect(() => {
    setStep('contact');
    completeStep('details'); 
  }, []);

  const handleVerified = (contactData) => {
    console.log('Contact verification completed:', contactData);
    
    completeStep('contact');
    setStep('scheduling');
    
  };

  const handleBack = () => {
    const params = new URLSearchParams();
    Object.entries(property).forEach(([key, value]) => {
      if (value && key !== 'paymentMethod') params.set(key, value.toString());
    });
    
    navigate(`/inspection-confirmed?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Tracker */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <MiniProgressTracker 
          currentStep={currentStep}
          completedSteps={completedSteps}
          className="mb-4"
        />
      </div>
      
      <header className="bg-white shadow-sm">
        <div className="text-center md:absolute md:left-4 md:top-40 md:transform md:-translate-y-1/2 md:text-left pt-4 md:pb-4">
                        <Button
                          onClick={() => {
                            navigate('/property-confirmed')
                          }}
                          variant="ghost"
                          className="text-blue-600 hover:bg-blue-50 text-sm cursor-pointer"
                        >
                          ← Back to Home
                        </Button>
                      </div>
        <div className="max-w-7xl mx-auto px-4 py-4">
           
          <div className="text-center">
            
            <h1 className="text-2xl font-bold text-gray-900">Contact Verification</h1>
            <p className="text-gray-600 mt-2">Verify your contact information to continue with booking</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <ContactVerification
          property={property}
          onVerified={handleVerified}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}