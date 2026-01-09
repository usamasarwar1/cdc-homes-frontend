import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import PropertyDetails from '../components/booking/PropertyDetails';

export default function PropertyConfirmed() {
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const savedProperty = sessionStorage.getItem('confirmedProperty');
    if (savedProperty) {
        window.scrollTo(0, 0);
      setProperty(JSON.parse(savedProperty));
      
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Property Details Confirmed</h1>
            <p className="text-base md:text-lg text-gray-600">Ready to continue - let's meet your inspector!</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative h-[300px] md:h-[400px] bg-gray-100">
            {property.streetViewUrl && !property.streetViewUrl.includes('placeholder') ? (
              <img 
                src={property.streetViewUrl} 
                alt="Property street view"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`flex items-center justify-center h-full bg-gray-100 ${property.streetViewUrl && !property.streetViewUrl.includes('placeholder') ? 'hidden' : ''}`}>
              <div className="text-center">
                <div className="text-6xl mb-4">🏠</div>
                <div className="text-lg md:text-xl font-semibold text-gray-600 px-2">{property.address}</div>
                <div className="text-sm md:text-base text-gray-500 mt-2">{property.squareFootage?.toLocaleString()} SF</div>
              </div>
            </div>
            <div className="absolute top-3 right-3 md:top-4 md:right-4">
              <div className="bg-green-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold shadow-lg text-base">
                ${property.basePrice || property.payNowPrice}.00 Base Price
              </div>
            </div>
          </div>
                    
          <div className="p-4 md:p-8">
            <PropertyDetails
              property={property}
              onContinue={(propertyData, paymentMethod) => {
                const updatedProperty = { ...property, ...propertyData, paymentMethod };
                sessionStorage.setItem('confirmedProperty', JSON.stringify(updatedProperty));
                
                if (paymentMethod === 'challenge') {
                  const challengeParams = new URLSearchParams({
                    street: updatedProperty.street || updatedProperty.address?.split(',')[0] || '',
                    city: updatedProperty.city || '',
                    state: updatedProperty.state || '',
                    zip: updatedProperty.zip || '',
                    propertyType: updatedProperty.propertyType || '',
                    squareFootage: updatedProperty.squareFootage?.toString() || '',
                    paymentMethod: 'challenge'
                  });
                  
                  if (updatedProperty.propertyType === 'Multi-Family Residence') {
                    if (updatedProperty.multiFamilyUnits) challengeParams.set('multiFamilyUnits', updatedProperty.multiFamilyUnits);
                    if (updatedProperty.unitLabels) challengeParams.set('unitLabels', JSON.stringify(updatedProperty.unitLabels));
                    if (updatedProperty.unitSquareFootages) challengeParams.set('unitSquareFootages', JSON.stringify(updatedProperty.unitSquareFootages));
                  }
                  navigate(`/credential-comparison?${challengeParams.toString()}`);
                } else {
                  const params = new URLSearchParams({
                    street: updatedProperty.street || updatedProperty.address?.split(',')[0] || '',
                    city: updatedProperty.city || '',
                    state: updatedProperty.state || '',
                    zip: updatedProperty.zip || '',
                    propertyType: updatedProperty.propertyType || '',
                    squareFootage: updatedProperty.squareFootage?.toString() || '',
                    paymentMethod: 'pay_now'
                  });
                  
                  if (updatedProperty.propertyType === 'Multi-Family Residence') {
                    if (updatedProperty.multiFamilyUnits) params.set('multiFamilyUnits', updatedProperty.multiFamilyUnits);
                    if (updatedProperty.unitLabels) params.set('unitLabels', JSON.stringify(updatedProperty.unitLabels));
                    if (updatedProperty.unitSquareFootages) params.set('unitSquareFootages', JSON.stringify(updatedProperty.unitSquareFootages));
                  }
                  navigate(`/contact-verification?${params.toString()}`);
                }
              }}
              onBack={() => {
                sessionStorage.removeItem('confirmedProperty');
                navigate('/');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}