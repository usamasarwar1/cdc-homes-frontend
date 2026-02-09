import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/Badge';
import { MapPin, Home, Users, DollarSign, Calendar, User, Phone, Mail } from 'lucide-react';
import { ProgressSteps, GuidanceCard } from '../components/ui/Progress-steps';


export default function BookingSummary() {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('pay_now');
  const [price, setPrice] = useState(0);
  const [booking, setBooking] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false)


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const contactData = JSON.parse(sessionStorage.getItem('verified-contact-data'));
    
    const data = {
      address: urlParams.get('address') || '',
      squareFootage: parseInt(urlParams.get('squareFootage') || '0'),
      propertyType: urlParams.get('propertyType') || '',
      occupancyStatus: urlParams.get('occupancyStatus') || '',
      
      multiFamilyUnits: urlParams.get('multiFamilyUnits') || undefined,
      
      mobileHomeType: urlParams.get('mobileHomeType') || undefined,
      commercialType: urlParams.get('commercialType') || undefined,
            
      payeeName: {
        firstName: urlParams.get('firstName') || '',
        lastName: urlParams.get('lastName') || ''
      },
      payerEmail: urlParams.get('payerEmail') || '',
      reportEmail: urlParams.get('reportEmail') || '',
      phoneNumber: urlParams.get('phoneNumber') || '',
      relationshipToBuyer: urlParams.get('relationshipToBuyer') || '',
      buyerExplanation: urlParams.get('buyerExplanation') || '',
      wantsRealtorNotification: urlParams.get('wantsRealtorNotification') === 'true',
      realtorName: urlParams.get('realtorName') || '',
      realtorEmail: urlParams.get('realtorEmail') || '',
      realtorPhone: urlParams.get('realtorPhone') || '',
      paymentMethod: urlParams.get('paymentMethod') || 'pay_now',
      contactData :  contactData.contactPersons
    };

    const paymentMethod = urlParams.get('paymentMethod') || 'pay_now';
    const booking = JSON.parse(sessionStorage.getItem('bookingDataUsingToken'));
    setBooking(booking);
    
    if(paymentMethod === 'challenge' && booking && booking.property?.challengePrice && booking.isDiscount){
      setSelectedPaymentMethod('challenge');
      setPrice(booking.property.challengePrice);
    } else {
      setSelectedPaymentMethod('pay_now');
    }
    
    setBookingData(data);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);


  const calculatePrice = () => {
    if (!bookingData) return { basePrice: 0, total: 0 };
    
    if (bookingData.propertyType === 'Multi-Family Residence') {
      const { multiFamilyUnits } = bookingData;
      let basePrice = 0;
      
      switch (multiFamilyUnits) {
        case '2 Units': basePrice = 825; break;
        case '3 Units': basePrice = 900; break;
        case '4 Units': basePrice = 950; break;
        case '5 Units': basePrice = 1050; break;
        case '6 Units': basePrice = 1500; break;
        default: basePrice = 825; break; 
      }
      
      if(selectedPaymentMethod === 'challenge' && booking && booking.property?.challengePrice){
        basePrice = booking.property.challengePrice;
      }
      
      return { basePrice, total: basePrice };
    }

    if (bookingData.propertyType === 'Mobile/Manufactured Home') {
      const mobileHomeType = bookingData.mobileHomeType || 'Single Wide';
      let basePrice = 0;
      
      switch (mobileHomeType) {
        case 'Single Wide': basePrice = 625; break;
        case 'Double Wide': basePrice = 750; break;
        case 'Triple Wide': basePrice = 800; break;
        default: basePrice = 625; break; 
      }
      
      if(selectedPaymentMethod === 'challenge' && booking && booking.property?.challengePrice){
        basePrice = booking.property.challengePrice;
      }
      
      return { basePrice, total: basePrice };
    }

    if (bookingData.propertyType === 'Commercial') {
      let basePrice = 1100;
      
      if(selectedPaymentMethod === 'challenge' && booking && booking.property?.challengePrice){
        basePrice = booking.property.challengePrice;
      }
      
      return { basePrice, total: basePrice };
    }
    
    const sqft = bookingData.squareFootage;
    let basePrice = 0;

    if (sqft <= 1200) {
      basePrice = 575;
    } else if (sqft <= 3000) {
      basePrice = 650;
    } else if (sqft <= 5000) {
      basePrice = 725;
    } else if (sqft <= 6000) {
      basePrice = 800;
    } else {
      basePrice = 800;
    }

    // if (sqft <= 1000) basePrice = 475;
    // else if (sqft <= 1500) basePrice = 525;
    // else if (sqft <= 2000) basePrice = 575;
    // else if (sqft <= 2500) basePrice = 625;
    // else if (sqft <= 3000) basePrice = 675;
    // else if (sqft <= 3500) basePrice = 725;
    // else if (sqft <= 4000) basePrice = 775;
    // else if (sqft <= 5000) basePrice = 825;
    // else basePrice = 875;

    if(selectedPaymentMethod === 'challenge' && booking && booking.property?.challengePrice){
      basePrice = booking.property.challengePrice;
    }

    return {
      basePrice,
      total: basePrice
    };
  };


  const handlePickDate = () => {
    if (!bookingData) return;

    const params = new URLSearchParams({
      address: bookingData.address,
      squareFootage: bookingData.squareFootage.toString(),
      propertyType: bookingData.propertyType,
      occupancyStatus: bookingData.occupancyStatus,
      firstName: bookingData.payeeName.firstName,
      lastName: bookingData.payeeName.lastName,
      payerEmail: bookingData.payerEmail,
      reportEmail: bookingData.reportEmail || '',
      phoneNumber: bookingData.phoneNumber,
      relationshipToBuyer: bookingData.relationshipToBuyer,
      buyerExplanation: bookingData.buyerExplanation || '',
      wantsRealtorNotification: bookingData.wantsRealtorNotification.toString(),
      realtorName: bookingData.realtorName || '',
      realtorEmail: bookingData.realtorEmail || '',
      realtorPhone: bookingData.realtorPhone || '',
      paymentMethod: bookingData.paymentMethod
    });

    if (bookingData.multiFamilyUnits) {
      params.set('multiFamilyUnits', bookingData.multiFamilyUnits);
    }
    if (bookingData.unitLabels) {
      params.set('unitLabels', JSON.stringify(bookingData.unitLabels));
    }
    if (bookingData.unitSquareFootages) {
      params.set('unitSquareFootages', JSON.stringify(bookingData.unitSquareFootages));
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    navigate(`/calendar?${params.toString()}`);
  };

  const handleBack = () => {
    if (!bookingData) return;
    
      const params = new URLSearchParams({
      address: bookingData.address,
      street: bookingData.address.split(',')[0]?.trim() || '',
      city: bookingData.address.split(',')[1]?.trim() || '',
      state: bookingData.address.split(',')[2]?.split(' ')[0]?.trim() || '',
      zip: bookingData.address.split(',')[2]?.split(' ')[1]?.trim() || '',
      squareFootage: bookingData.squareFootage.toString(),
      propertyType: bookingData.propertyType,
      paymentMethod: bookingData.paymentMethod,
      
      firstName: bookingData.payeeName.firstName,
      lastName: bookingData.payeeName.lastName,
      payerEmail: bookingData.payerEmail,
      reportEmail: bookingData.reportEmail || '',
      phoneNumber: bookingData.phoneNumber,
      relationshipToBuyer: bookingData.relationshipToBuyer,
      buyerExplanation: bookingData.buyerExplanation || '',
      wantsRealtorNotification: bookingData.wantsRealtorNotification.toString(),
      realtorName: bookingData.realtorName || '',
      realtorEmail: bookingData.realtorEmail || '',
      realtorPhone: bookingData.realtorPhone || '',
      occupancyStatus: bookingData.occupancyStatus
    });

    if (bookingData.multiFamilyUnits) {
      params.set('multiFamilyUnits', bookingData.multiFamilyUnits);
    }
    if (bookingData.unitLabels) {
      params.set('unitLabels', JSON.stringify(bookingData.unitLabels));
    }
    if (bookingData.unitSquareFootages) {
      params.set('unitSquareFootages', JSON.stringify(bookingData.unitSquareFootages));
    }
    
    if (bookingData.mobileHomeType) {
      params.set('mobileHomeType', bookingData.mobileHomeType);
    }
    
    if (bookingData.commercialType) {
      params.set('commercialType', bookingData.commercialType);
    }
    
    if (bookingData.contactPersons && bookingData.contactPersons.length > 0) {
      params.set('contactPersons', JSON.stringify(bookingData.contactPersons));
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    navigate(`/contact-verification?${params.toString()}`);
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const pricing = calculatePrice();

  const progressSteps = [
    { id: 'address', title: 'Address', description: 'Enter location', completed: true },
    { id: 'details', title: 'Property Details', description: 'Verify information', completed: true },
    { id: 'contact', title: 'Contact Info', description: 'Enter details', completed: true },
    { id: 'booking', title: 'Schedule', description: 'Pay & book', current: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <ProgressSteps steps={progressSteps} />

        <div className="text-center hover:underline cursor-pointer md:transform md:-translate-y-1/2 md:text-left pt-4 md:pb-4">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="text-blue-600 hover:bg-white hover:text-blue-600 text-sm cursor-pointer"
          >
            ← Back
          </Button>
        </div>
        
        <GuidanceCard
          title="Step 4: Review Your Booking Details"
          description="Confirm all information is correct before scheduling your inspection. You can make changes if needed."
          nextAction="Click 'Pick Your Date & Time' to schedule your inspection"
          variant="success"
        >
          <div className="text-xs text-green-700 bg-white/30 p-2 rounded mt-2">
            <strong>Almost done!</strong> Review all details below, then select your preferred inspection date and time
          </div>
        </GuidanceCard>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Summary</h1>
          <p className="text-gray-600">Review your inspection details before scheduling</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card  className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{bookingData.address}</p>
                    <p className="text-sm text-gray-600">
                      {bookingData.propertyType === 'Single Family Residence' 
                        ? `${bookingData.squareFootage.toLocaleString()} ft² • ${bookingData.propertyType}`
                        : bookingData.propertyType === 'Multi-Family Residence'
                          ? `${bookingData.multiFamilyUnits || 'Multi-Unit'} • ${bookingData.propertyType}`
                          : bookingData.propertyType === 'Mobile/Manufactured Home' 
                            ? `${bookingData.mobileHomeType || 'Single Wide'} • ${bookingData.propertyType}`
                            : bookingData.propertyType === 'Commercial'
                              ? `Commercial Property • ${bookingData.propertyType}`
                              : `${bookingData.squareFootage.toLocaleString()} ft² • ${bookingData.propertyType}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Occupancy Status:</span>
                  <Badge variant="secondary" className="capitalize">
                    {bookingData.occupancyStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card  className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#47557c]" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Contact Person</p>
                    <p className="font-medium">
                      {bookingData.payeeName.firstName} {bookingData.payeeName.lastName}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {bookingData.relationshipToBuyer}
                      {bookingData.buyerExplanation && ` - ${bookingData.buyerExplanation}`}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{bookingData.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{bookingData.payerEmail}</span>
                    </div>
                    {bookingData.reportEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Report: {bookingData.reportEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {bookingData.contactPersons && bookingData.contactPersons.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Additional Recipients</p>
                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        {bookingData.contactPersons.map((person, index) => (
                          <div key={person.id} className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                              {person.firstName} {person.lastName} - {person.email}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {bookingData.wantsRealtorNotification && bookingData.realtorName && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Realtor Information</p>
                      <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-sm">{bookingData.realtorName}</span>
                        </div>
                        {bookingData.realtorEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{bookingData.realtorEmail}</span>
                          </div>
                        )}
                        {bookingData.realtorPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{bookingData.realtorPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Home Inspection</span>
                    <span className="font-medium">${Number(pricing.basePrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 border-b-2 border-gray-200 pb-6">
                    <span>
                      Property: {bookingData.propertyType === 'Mobile/Manufactured Home' 
                        ? `${bookingData.mobileHomeType || 'Single Wide'}`
                        : bookingData.propertyType === 'Commercial'
                          ? `${bookingData.commercialType || 'Commercial Property'}`
                          : `${bookingData.squareFootage.toLocaleString()} SF`
                      }
                    </span>
                  </div>
                </div>
                <div className='space-y-2'>
                <div className="mt-4">
                <label className="flex items-start space-x-2 cursor-pointer">
  <input
    type="checkbox"
    checked={termsAccepted}
    onChange={(e) => setTermsAccepted(e.target.checked)}
    className="mt-1 flex-shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500"
  />

  <span className="text-xs md:text-sm text-gray-700 leading-6 md:leading-5">
    I agree to the{" "}
    <a
      href="/contract/Service-Agreement.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#e7000b] hover:underline px-1 py-0.5"
    >
      Terms of Service
    </a>
    , and{" "}
    <a
      href="/contract/Payment-Terms.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#e7000b] hover:underline px-1 py-0.5"
    >
      Payment Terms
    </a>
    .
  </span>
</label>

</div>


                  
                </div>

                <Separator />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">${Number(pricing.total).toFixed(2)}</span>
                </div>  

                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={handlePickDate}
                    disabled={!termsAccepted}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Pick Your Date
                  </Button>

                  <Button 
                    onClick={handleBack}
                    variant="outline" 
                    className="w-full  border-gray-200"
                  >
                    Back to Edit Details
                  </Button>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-blue-800 font-medium">
                    Skip the Challenge & Book Now
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Complete payment after scheduling
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
