import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CheckCircle, ArrowLeft, ArrowRight, Clock, DollarSign } from 'lucide-react';
import PropertyDetails from './PropertyDetails';
import ContactVerification from './ContactVerification';
import ConditionalNavigation from './ConditionalNavigation';
// import CalendarScheduling from './CalendarScheduling';
import AdvancedCalendarScheduling from './AdvancedCalendarScheduling';
import { ContractAgreement } from './ContractAgreement';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';


export function BookingFlow({ initialProperty }) {
    // console.log('BookingFlow - Initial property data:', initialProperty);
const setLocation = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState('property');
  const [propertyData, setPropertyData] = useState(initialProperty || {});
  const [contactData, setContactData] = useState(null);
  const [schedulingData, setSchedulingData] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  
  // Mock scheduling data for demo - in real app this would come from calendar selection
  const mockScheduling = {
    selectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    selectedTime: '10:00 AM',
    scheduledDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    duration: 180 // 3 hours
  };

  // code comment by Haider dev:
//   const createAppointmentMutation = useMutation({
//     mutationFn: async (appointmentData) => {
//       return apiRequest('POST', '/api/appointments', appointmentData);
//     },
//     onSuccess: (appointment) => {
//       toast({
//         title: "Contract Signed Successfully!",
//         description: "Email confirmations have been sent to all parties. Redirecting to payment...",
//       });
      
//       // Redirect to payment page
//       setTimeout(() => {
//         setLocation(`/checkout/${appointment.id}`);
//       }, 2000);
//     },
//     onError: (error) => {
//       console.error('Appointment creation error:', error);
//       toast({
//         title: "Error",
//         description: "Failed to create appointment. Please try again.",
//         variant: "destructive",
//       });
//     },
//   });

  const handlePropertyContinue = (property, paymentMethod) => {
    setPropertyData({ ...property, paymentMethod });
    setPricing(property.pricing || { payNow: 450 });
    setCurrentStep('verification');
  };

  const handleVerificationComplete = (verificationData) => {
    setContactData(verificationData);
    setIsVerified(verificationData.isVerified);
    setCurrentStep('scheduling');
  };

  const handleSchedulingComplete = async (appointmentData) => {
    try {
      // Send scheduling data to backend to create calendar event and send emails
      const response = await fetch('/api/appointments/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...appointmentData, contactData })
      });
      
      if (response.ok) {
        const result = await response.json();
        setSchedulingData(appointmentData);
        setCurrentStep('navigation');
        
        toast({
          title: "Inspection Scheduled!",
          description: "Calendar event created and confirmation emails sent.",
        });
      } else {
        throw new Error('Failed to schedule appointment');
      }
    } catch (error) {
      console.error('Scheduling error:', error);
      toast({
        title: "Scheduling Error",
        description: "Failed to schedule your inspection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewPricing = () => {
    if (isVerified) {
      setCurrentStep('contract');
    }
  };

  const handleContractSigned = async (signedContractData) => {
    setContractData(signedContractData);

    // Create appointment with contract data
    const appointmentData = {
      propertyId: propertyData.id || 'temp-property',
      propertyAddress: signedContractData.inspectionAddress,
      scheduledDateTime: new Date(`${schedulingData.date}T${schedulingData.time}:00`).toISOString(),
      contactData: contactData,
      totalPrice: pricing?.payNow?.toString() || '450.00',
      paymentMethod: 'pay_now',
      paymentStatus: 'pending',
      status: 'scheduled',
      specialInstructions: '',
      // Include contract data for email sending
      contractData: signedContractData,
      signatureDataUrl: signedContractData.signatureDataUrl,
      // Store contract information in appointment
      payerName: signedContractData.payerName,
      payerEmail: signedContractData.payerEmail,
      payerPhone: signedContractData.payerPhone,
      buyerName: signedContractData.buyerName,
      buyerEmail: signedContractData.buyerEmail,
      relationshipToBuyer: signedContractData.relationshipToBuyer,
      realtorName: signedContractData.realtorName,
      realtorEmail: signedContractData.realtorEmail,
      inspectionReportEmail: signedContractData.reportEmail,
    };

    // createAppointmentMutation.mutate(appointmentData);
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'property', name: 'Property Details', completed: currentStep !== 'property' },
      { id: 'verification', name: 'Contact Verification', completed: isVerified },
      { id: 'scheduling', name: 'Schedule Inspection', completed: schedulingData !== null },
      { id: 'navigation', name: 'Service Information', completed: currentStep === 'contract' || currentStep === 'payment' },
      { id: 'contract', name: 'Sign Contract', completed: contractData !== null },
      { id: 'payment', name: 'Payment', completed: false }
    ];

    return (
      <div className="mb-8">
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center min-w-max px-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : step.id === currentStep
                      ? 'border-blue-500 text-blue-500'
                      : 'border-gray-300 text-gray-300'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium whitespace-nowrap ${
                  step.completed ? 'text-green-600' : 
                  step.id === currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 flex-shrink-0 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'property':
        return (
          <PropertyDetails
            property={propertyData}
            onContinue={handlePropertyContinue}
            onBack={() => setLocation('/')}
          />
        );

      case 'verification':
        return (
          <ContactVerification
            property={propertyData}
            onVerified={handleVerificationComplete}
            onBack={() => setCurrentStep('property')}
          />
        );

      case 'scheduling':
        return (
          <AdvancedCalendarScheduling
            property={propertyData}
            onScheduled={handleSchedulingComplete}
            onBack={() => setCurrentStep('verification')}
          />
        );

      case 'navigation':
        return (
          <ConditionalNavigation
            isVerified={isVerified}
            onViewInspector={() => {
            }}
            onViewIncludes={() => {
            }}
            onViewPricing={handleViewPricing}
            onBack={() => setCurrentStep('scheduling')}
          />
        );

      case 'contract':
        if (!schedulingData || !pricing) return null;
        
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Appointment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">PROPERTY</h4>
                    <p className="text-sm">{propertyData.address || 'Property address'}</p>
                    <p className="text-xs text-gray-500">{propertyData.propertyType}</p>
                    {propertyData.propertyType === 'Multi-Family Residence' && propertyData.unitLabels && propertyData.unitSquareFootages && (
                      <div className="mt-1 text-xs text-gray-500">
                        {propertyData.unitLabels.map((label, index) => (
                          <div key={index}>
                            {label}: {propertyData.unitSquareFootages[index]?.toLocaleString()} SF
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">SCHEDULED</h4>
                    <p className="text-sm">
                      {new Date(schedulingData.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-xs text-gray-500">{schedulingData.time}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">PRICING</h4>
                    <p className="text-lg font-bold text-green-600">
                      ${pricing.payNow || 450}
                    </p>
                    <Badge variant="outline" className="text-xs">Pay Now Rate</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ContractAgreement
              onContractSigned={handleContractSigned}
              propertyAddress={propertyData.address || 'Property address'}
              totalPrice={pricing.payNow || 450}
              scheduledDateTime={new Date(`${schedulingData.date}T${schedulingData.time}:00`)}
              initialData={{
                payerName: contactData?.payeeName ? `${contactData.payeeName.firstName} ${contactData.payeeName.lastName}` : '',
                payerPhone: contactData?.phoneNumber || '',
                payerEmail: contactData?.payerEmail || '',
                reportEmail: contactData?.reportEmail || '',
                relationshipToBuyer: contactData?.relationshipToBuyer || 'buyer',
                buyerName: contactData?.relationshipToBuyer !== 'buyer' ? contactData?.buyerExplanation : '',
                realtorName: contactData?.realtorName || '',
                realtorPhone: contactData?.realtorPhone || ''
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  const params = new URLSearchParams({
                    address: propertyData?.address || '',
                    street: propertyData?.street || '',
                    city: propertyData?.city || '',
                    state: propertyData?.state || '',
                    zip: propertyData?.zip || '',
                    propertyType: propertyData?.propertyType || '',
                    squareFootage: propertyData?.squareFootage?.toString() || '',
                  });

                  if (propertyData?.multiFamilyUnits) {
                    params.append('multiFamilyUnits', propertyData.multiFamilyUnits);
                    if (propertyData.unitLabels && propertyData.unitLabels.length > 0) {
                      params.append('unitLabels', JSON.stringify(propertyData.unitLabels));
                    }
                    if (propertyData.unitSquareFootages && propertyData.unitSquareFootages.length > 0) {
                      params.append('unitSquareFootages', JSON.stringify(propertyData.unitSquareFootages));
                    }
                  }
                  if (propertyData?.mobileHomeType) {
                    params.append('mobileHomeType', propertyData.mobileHomeType);
                  }
                  if (propertyData?.commercialType) {
                    params.append('commercialType', propertyData.commercialType);
                  }
                  if (propertyData?.hasCasita !== undefined) {
                    params.append('hasCasita', propertyData.hasCasita.toString());
                  }
                  if (propertyData?.hasPoolSpa !== undefined) {
                    params.append('hasPoolSpa', propertyData.hasPoolSpa.toString());
                  }
                  if (propertyData?.hasDetachedGarage !== undefined) {
                    params.append('hasDetachedGarage', propertyData.hasDetachedGarage.toString());
                  }

                  setLocation(`/?${params.toString()}`);
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Address
              </Button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Book Your Inspection</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepIndicator()}
        
        {/* Haider dev ( comment this code because not having backend yet) */}
        {/* {createAppointmentMutation.isPending && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                <span>Creating your appointment and sending email confirmations...</span>
              </div>
            </CardContent>
          </Card>
        )} */}

        {renderCurrentStep()}
      </div>
    </div>
  );
}