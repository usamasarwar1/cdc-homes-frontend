import { useEffect } from 'react';
import { BookingFlow } from '../components/booking/BookingFlow';

export default function InspectionConfirmedPage() {
  useEffect(() => {
    document.title = "Inspection Details - CDC Home Inspections";
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);
  
  const urlParams = new URLSearchParams(window.location.search);
  const initialProperty = {
    address: urlParams.get('address') || '',
    street: urlParams.get('street') || '',
    city: urlParams.get('city') || '',
    state: urlParams.get('state') || '',
    zip: urlParams.get('zip') || '',
    propertyType: urlParams.get('propertyType') || '',
    squareFootage: parseInt(urlParams.get('squareFootage') || '0') || undefined,
    paymentMethod: urlParams.get('paymentMethod') || 'pay_now',
    // for Multi-Family specific data
    multiFamilyUnits: urlParams.get('multiFamilyUnits') || '',
    // for Mobile Home specific data
    mobileHomeType: urlParams.get('mobileHomeType') || '',
    // for Commercial specific data
    commercialType: urlParams.get('commercialType') || ''
  };

  console.log('InspectionConfirmed - URL search params:', window.location.search);
  console.log('InspectionConfirmed - Parsed property data:', initialProperty);



  return <BookingFlow initialProperty={initialProperty} />;
}