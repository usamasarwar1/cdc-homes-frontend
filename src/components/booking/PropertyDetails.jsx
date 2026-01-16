import { Home, Calendar, DollarSign, ArrowRight, CheckCircle, Info, Edit3 } from 'lucide-react';
// import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
// import { Input } from '../ui/input';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../gamification/ProgressProvider';
import { getPricingTier } from '../../utils/getPricingTier';
import { ProgressSteps, GuidanceCard } from '../ui/Progress-steps';


export default function PropertyDetails({ property, onContinue, onBack }) {
  const navigate = useNavigate();
  const formatNumber = (num) => num?.toLocaleString() || 'N/A';
  const [selectedPayment, setSelectedPayment] = useState('pay_now');
  const [squareFootageConfirmed, setSquareFootageConfirmed] = useState(false);
  const [manualSquareFootage, setManualSquareFootage] = useState(property.squareFootage || 0);
  const [isEditingSquareFootage, setIsEditingSquareFootage] = useState(false);

  
  const { currentStep, completedSteps, completeStep, setStep } = useProgress();
  
  useEffect(() => {
    setStep('details');
    completeStep('address'); 
  }, [setStep, completeStep]);

  const finalSquareFootage = isEditingSquareFootage ? manualSquareFootage : (property.squareFootage || 0);
  const updatedProperty = { ...property, squareFootage: finalSquareFootage };
  const pricing = getPricingTier(updatedProperty);

  const progressSteps = [
    { id: 'address', title: 'Address', description: 'Enter location', completed: true },
    { id: 'details', title: 'Pricing Details', description: '50% Off Challenge', current: true },
    { id: 'contact', title: 'Contact Info', description: 'Enter details', completed: false },
    { id: 'booking', title: 'Schedule', description: 'Pay & book', completed: false }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 md:py-8 w-full overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-2 md:px-4">
              <ProgressSteps steps={progressSteps} />
              
              <div className="hidden md:block">
                <GuidanceCard
                  title="Step 2: Pricing Details & 50% Off Challenge"
                  description="Review and confirm the property information below. This ensures accurate pricing for your inspection."
                  nextAction="Choose payment option to continue"
                  variant="info"
                >
                  <div className="text-sm text-blue-700 bg-white/30 p-2 rounded mt-2">
                    <strong>What's next:</strong> Select either standard pricing or take the 50% challenge to proceed
                  </div>
                </GuidanceCard>
              </div>
              
              <div className="space-y-4 md:space-y-6">
            <div className="mb-4 md:mb-6">
              <div className="p-3 md:p-4 bg-blue-50 border border-blue-300 rounded-lg shadow-sm">
                <div className="text-center md:text-left">
                  <h2 className="text-base md:text-xl font-bold text-blue-900 mb-1 md:mb-2">Your Inspection Address</h2>
                  <div className="text-blue-800 text-sm md:text-lg font-semibold leading-tight md:leading-relaxed">
                    <div className="truncate">{property.street || property.address?.split(',')[0] || ''}</div>
                    <div className="text-xs md:text-base">{property.city || property.address?.split(',')[1]?.trim() || ''}, {property.state || 'AZ'} {property.zip || property.zipCode}</div>
                    {(finalSquareFootage > 0 || property.multiFamilyUnits || property.mobileHomeType) && (
                      <div className="mt-1 text-xs md:text-base font-bold">
                        {property.propertyType === 'Single Family Residence' 
                          ? `${formatNumber(finalSquareFootage)} ft²`
                          : property.propertyType === 'Multi-Family Residence'
                            ? `${property.multiFamilyUnits || 'Multi-Unit'}`
                            : property.propertyType === 'Mobile/Manufactured Home'
                              ? `${property.mobileHomeType || 'Single Wide'}`
                              : property.propertyType === 'Commercial'
                                ? 'Commercial Property'
                                : `${formatNumber(finalSquareFootage)} ft²`
                        }
                      </div>
                    )}
                  </div>
                </div>
                
                {(property.isManual || property.manualEntry) && (
                  <div className="mt-1 md:mt-3 text-center md:text-left">
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-100">
                      Manual Entry
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
      
      {property.propertyType !== 'Single Family Residence' && (
        <div className="mb-6 md:mb-8 p-3 md:p-4 bg-gray-50 rounded-lg">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Property Type Details</h3>
          <div className="text-sm md:text-base text-gray-700 space-y-1">
            <p><strong>Property Type:</strong> {property.propertyType}</p>
            {property.mobileHomeType && <p><strong>Mobile Home Type:</strong> {property.mobileHomeType}</p>}
            {property.multiFamilyUnits && <p><strong>Number of Units:</strong> {property.multiFamilyUnits}</p>}
            {property.commercialType && <p><strong>Commercial Type:</strong> {property.commercialType}</p>}
          </div>
        </div>
      )}


      {(property.address || property.street) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 md:p-6 mb-6 md:mb-8">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-2 text-center md:text-left">Your Inspection Pricing</h3>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 text-center md:text-left">Property Size: {pricing.tier}</p>
          
          <div className="flex flex-col space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
            <button
              onClick={() => {
                completeStep('details');
                setStep('contact');
                
                const params = new URLSearchParams({
                  address: property.address || '',
                  street: property.street || '',
                  city: property.city || '',
                  state: property.state || '',
                  zip: property.zip || '',
                  propertyType: property.propertyType || '',
                  squareFootage: finalSquareFootage?.toString() || '',
                  paymentMethod: 'pay_now'
                });
                
                if (property.propertyType === 'Multi-Family Residence') {
                  if (property.multiFamilyUnits) params.set('multiFamilyUnits', property.multiFamilyUnits);
                  if (property.unitLabels) params.set('unitLabels', JSON.stringify(property.unitLabels));
                  if (property.unitSquareFootages) params.set('unitSquareFootages', JSON.stringify(property.unitSquareFootages));
                }
                sessionStorage.setItem('paymentMethod', 'pay_now');
                navigate(`/contact-verification?${params.toString()}`);
              }}
              className="text-center md:text-left p-4 rounded-lg border-2 border-green-300 bg-green-50 hover:border-green-400 hover:shadow-lg hover:bg-green-100 transition-all cursor-pointer group h-[120px] flex flex-col justify-between"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1 md:mb-2">
                <span className="font-semibold text-sm md:text-base text-gray-900 group-hover:text-green-800 mb-1 md:mb-0">Skip Challenge & Book Now</span>
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-green-600 group-hover:text-green-700 transition-colors mx-auto md:mx-0 flex-shrink-0" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-green-600 group-hover:text-green-700">${pricing.payNow}.00</div>
              <div className="text-xs md:text-base text-gray-600 mt-1 group-hover:text-green-700">Standard Fee</div>
            </button>
            
            <button
              onClick={() => {
                completeStep('details');
                setStep('credentials');
                
                const challengeParams = new URLSearchParams({
                  address: property.address || '',
                  street: property.street || '',
                  city: property.city || '',
                  state: property.state || '',
                  zip: property.zip || '',
                  propertyType: property.propertyType || '',
                  squareFootage: property.squareFootage?.toString() || '',
                  paymentMethod: 'challenge'
                });
                
                if (property.propertyType === 'Multi-Family Residence') {
                  if (property.multiFamilyUnits) challengeParams.set('multiFamilyUnits', property.multiFamilyUnits);
                  if (property.unitLabels) challengeParams.set('unitLabels', JSON.stringify(property.unitLabels));
                  if (property.unitSquareFootages) challengeParams.set('unitSquareFootages', JSON.stringify(property.unitSquareFootages));
                }
                sessionStorage.setItem('paymentMethod', 'challenge');
                navigate(`/credential-comparison?${challengeParams.toString()}`);
              }}
              className="cursor-pointer text-center md:text-left p-4 rounded-lg border-2 transition-all relative overflow-hidden border-blue-300 bg-blue-600 hover:bg-blue-700 hover:border-blue-400 hover:shadow-md challenge-button-pulse h-[120px] flex flex-col justify-between"
              style={{
                animation: 'challengePulse 1.2s ease-in-out infinite, challengeGlow 1.8s ease-in-out infinite'
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1 md:mb-2">
                <span className="font-semibold text-sm md:text-base text-white mb-1 md:mb-0">50% Off Challenge</span>
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-white mx-auto md:mx-0 flex-shrink-0" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">${Math.floor(pricing.payNow / 2)}.00</div>
              <div className="text-xs md:text-base text-white mt-1">Match Credentials</div>
            </button>
          </div>
          
          <div className="mt-2 md:mt-4 p-3 md:p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm md:text-xs text-gray-700 text-center leading-tight">
              Choose 50% challenge to match credentials or standard pricing to continue
            </p>
          </div>
        </div>
      )}
              </div>
            </div>
      </div>
   
  );
}