import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/Badge';
import { Mail, Phone, Shield, Plus, X, Edit3, Check, User, FileText, Calendar } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { ProgressSteps, GuidanceCard } from '../ui/progress-steps';
import { useFormGuidance } from '../../hooks/useGormGuideance';


export default function ContactVerification({ property, onVerified, onBack }) {
  console.log("init property", property);
  
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payeeName, setPayeeName] = useState({ firstName: '', lastName: '' });
  const [relationshipToBuyer, setRelationshipToBuyer] = useState('');
  const [buyerExplanation, setBuyerExplanation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const hasManuallyEditedAddress = useRef(false);

  const formatPhoneNumber = (digits) => {
    // Limit to 10 digits
    const cleaned = digits.slice(0, 10);
    
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  };

  const handlePhoneChange = (e) => {
    const newValue = e.target.value;
    
    
    // Extract digits only
    const digits = newValue.replace(/\D/g, '');
    const formatted = formatPhoneNumber(digits);
    
    
    setPhoneNumber(formatted);
  };
  const [isAddressCorrect, setIsAddressCorrect] = useState(true);
  // const [editedAddress, setEditedAddress] = useState(
  //   property.address || 
  //   (property.street && property.city && property.state && property.zip 
  //     ? `${property.street}, ${property.city}, ${property.state} ${property.zip}`
  //     : '')
  // );
  const [editedAddress, setEditedAddress] = useState('');
  const [isSquareFootageCorrect, setIsSquareFootageCorrect] = useState(null);
  const [editedSquareFootage, setEditedSquareFootage] = useState(property.squareFootage?.toString() || '');

  // code comment by Haider dev
  // Dynamic address and square footage with fallback to prevent "Not specified"
  const getDisplayAddress = () => {
    if (property.street && property.city && property.state && property.zip) {
      return `${property.street}, ${property.city}, ${property.state} ${property.zip}`;
    }
    if (property.address) {
      return property.address;
    }
    return '123 Main Street, Phoenix, AZ 85001';
  };

useEffect(() => {

  console.log('useEffect running', {
    hasManuallyEdited: hasManuallyEditedAddress.current,
    propertyAddress: property?.address,
    propertyStreet: property?.street,
    propertyCity: property?.city,
    propertyState: property?.state,
    propertyZip: property?.zip
  });

  if (!hasManuallyEditedAddress.current) {
    if (property?.address) {
      setEditedAddress(property.address);
    } else if (
      property?.street &&
      property?.city &&
      property?.state &&
      property?.zip
    ) {
      setEditedAddress(
        `${property.street}, ${property.city}, ${property.state} ${property.zip}`
      );
    } else {
      setEditedAddress('');
    }
  }
}, [property?.address, property?.street, property?.city, property?.state, property?.zip]);

  const getDisplaySquareFootage = () => {
    if (property.squareFootage && property.squareFootage > 0) {
      return property.squareFootage.toLocaleString();
    }
    return '2,500';
  };

  const [displayAddress, setDisplayAddress] = useState(getDisplayAddress());
  const [displaySquareFootage, setDisplaySquareFootage] = useState(getDisplaySquareFootage());
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingDisplaySquareFootage, setIsEditingDisplaySquareFootage] = useState(false);

  useEffect(() => {
    setDisplayAddress(getDisplayAddress());
    setDisplaySquareFootage(getDisplaySquareFootage());
  }, [property.street, property.city, property.state, property.zip, property.address, property.squareFootage]);


  const [occupancyStatus, setOccupancyStatus] = useState('');
  const [wantsRealtorNotification, setWantsRealtorNotification] = useState(null);
  const [realtorName, setRealtorName] = useState('');
  const [realtorEmail, setRealtorEmail] = useState('');
  const [realtorPhone, setRealtorPhone] = useState('');
  const [contactPersons, setContactPersons] = useState([]);
  const [verificationMethod, setVerificationMethod] = useState('sms');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(import.meta.env.DEV ? true : false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWhatsIncluded, setShowWhatsIncluded] = useState(false);
  const [showContractPreview, setShowContractPreview] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasClosedModal, setHasClosedModal] = useState(false);
  const [showUnitNumber, setShowUnitNumber] = useState(false);
  const [unitNumber, setUnitNumber] = useState('');
  const [isPayerEmailValid, setIsPayerEmailValid] = useState(false);
  const [hasEmailBlurred, setHasEmailBlurred] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailBlur = () => {
    console.log('Email blur triggered. Email:', payerEmail, 'Valid:', validateEmail(payerEmail));
    setHasEmailBlurred(true);
    setIsPayerEmailValid(validateEmail(payerEmail));
  };

  useEffect(() => {
    if (payerEmail) {
      setIsPayerEmailValid(validateEmail(payerEmail));
    } else {
      setIsPayerEmailValid(false);
    }
  }, [payerEmail]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('firstName')) {
      setPayeeName({
        firstName: urlParams.get('firstName') || '',
        lastName: urlParams.get('lastName') || ''
      });
    }
    if (urlParams.get('payerEmail')) {
      setPayerEmail(urlParams.get('payerEmail') || '');
    }
    if (urlParams.get('phoneNumber')) {
      setPhoneNumber(urlParams.get('phoneNumber') || '');
    }
    if (urlParams.get('relationshipToBuyer')) {
      setRelationshipToBuyer(urlParams.get('relationshipToBuyer') || '');
    }
    if (urlParams.get('buyerExplanation')) {
      setBuyerExplanation(urlParams.get('buyerExplanation') || '');
    }
    if (urlParams.get('occupancyStatus')) {
      setOccupancyStatus(urlParams.get('occupancyStatus') || '');
    }
    if (urlParams.get('reportEmail')) {
      setReportEmail(urlParams.get('reportEmail') || '');
    }
    if (urlParams.get('wantsRealtorNotification')) {
      setWantsRealtorNotification(urlParams.get('wantsRealtorNotification') === 'true');
    }
    if (urlParams.get('realtorName')) {
      setRealtorName(urlParams.get('realtorName') || '');
    }
    if (urlParams.get('realtorEmail')) {
      setRealtorEmail(urlParams.get('realtorEmail') || '');
    }
    if (urlParams.get('realtorPhone')) {
      setRealtorPhone(urlParams.get('realtorPhone') || '');
    }

    if (urlParams.get('firstName') || urlParams.get('payerEmail')) {
      setHasInteracted(true);
    }
  }, []);

  // code comment by Haider dev
  // Check if form sections should be blurred based on email validation
  // Blur when user has left email field without proper format
  const shouldBlurFormSections = hasEmailBlurred && !isPayerEmailValid;
  
  //code comment by Haider dev Debug logging for blur conditions 
  // useEffect(() => {
  //   console.log('Blur condition check:', {
  //     hasEmailBlurred,
  //     isPayerEmailValid,
  //     hasInteracted,
  //     hasClosedModal,
  //     shouldBlur: shouldBlurFormSections
  //   });
  // }, [hasEmailBlurred, isPayerEmailValid, hasInteracted, hasClosedModal, shouldBlurFormSections]);

  const addContactPerson = () => {
    setContactPersons([...contactPersons, { 
      id: Date.now().toString(), 
      firstName: '', 
      lastName: '', 
      email: '' 
    }]);
  };

  const removeContactPerson = (id) => {
    setContactPersons(contactPersons.filter(person => person.id !== id));
  };

  const updateContactPerson = (id, field, value) => {
    setContactPersons(contactPersons.map(person => 
      person.id === id ? { ...person, [field]: value } : person
    ));
  };

  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number for SMS verification.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/sms/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowVerificationInput(true);
        
        // Show different messages based on Twilio response
        const description = data.message.includes('Twilio Verify')
          ? "Verification code sent via Twilio Verify - check your phone!"
          : data.message.includes('Trial account')
          ? "Code generated! Since this is a trial account, use the code shown in your browser console."
          : "We've sent a verification code to your phone.";
        
        toast({
          title: "Verification Code Sent",
          description,
        });
        
        // Always log the code for trial accounts
        if (data.code) {
          console.log('SMS Verification Code:', data.code);
          console.log('Enter this code in the verification field');
        }
        
        // Log Twilio debugging info
        if (data.twilioInfo) {
          console.log('Twilio Status:', data.twilioInfo);
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send verification code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('SMS verification error:', error);
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    console.log('Verifying code:', verificationCode, 'Length:', verificationCode.length);
    
    if (!verificationCode || verificationCode.length < 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the complete 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Making verification request to server...');
      const response = await fetch('/api/sms/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          code: verificationCode
        }),
      });

      const data = await response.json();
      console.log('Verification response:', data);

      if (data.success) {
        setIsVerified(true);
        toast({
          title: "Verified Successfully",
          description: "Your contact details have been verified!",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('SMS verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate pricing based on property type and square footage
  const calculatePrice = (propertyType, squareFootage, units) => {
    // Multi-family pricing based on units
    if (propertyType === 'Multi-Family Residence' && units) {
      const unitCount = parseInt(units) || 1;
      switch (unitCount) {
        case 2: return 825;
        case 3: return 900;
        case 4: return 950;
        case 5: return 1050;
        case 6: return 1500;
        default: return 825; // Default to 2-unit pricing
      }
    }
    
    // Mobile/Manufactured home pricing
    if (propertyType === 'Mobile/Manufactured Home') {
      // Assume based on square footage or default to single wide
      if (squareFootage <= 800) return 625; // Single Wide
      else if (squareFootage <= 1500) return 750; // Double Wide
      else return 800; // Triple Wide
    }
    
    // Commercial property pricing
    if (propertyType === 'Commercial') {
      return 1100;
    }
    
    // Single Family tiered pricing based on square footage
    if (squareFootage <= 1200) {
      return 575;
    } else if (squareFootage <= 3000) {
      return 650;
    } else if (squareFootage <= 5000) {
      return 725;
    } else {
      return 800;
    }
  };

  // Get Stripe payment URL for a specific amount and type
  const getStripePaymentUrl = (amount, type) => {
    const saved = localStorage.getItem('stripe-payment-links');
    
    if (!saved) {
      console.log('No payment links found in localStorage');
      return '#payment-not-configured';
    }
    
    try {
      const paymentLinks = JSON.parse(saved);
      console.log('Available payment links:', paymentLinks.map((p) => `${p.amount} (${p.type})`));
      
      const link = paymentLinks.find((p) => 
        Math.abs(p.amount - amount) < 0.01 && p.type === type
      );
      
      console.log('Found matching link:', link);
      return link?.stripeUrl || '#payment-not-configured';
    } catch (error) {
      console.error('Error loading payment links:', error);
      return '#payment-not-configured';
    }
  };

  const handleSubmit = () => {
    const contactData = {
      payeeName,
      payerEmail,
      reportEmail,
      relationshipToBuyer,
      buyerExplanation: relationshipToBuyer !== 'buyer' ? buyerExplanation : '',
      phoneNumber,
      address: isAddressCorrect ? 
        (property.address || 
         (property.street && property.city && property.state && property.zip 
          ? `${property.street}, ${property.city}, ${property.state} ${property.zip}`
          : property.address)) 
        : editedAddress,
      squareFootage: property.squareFootage,
      occupancyStatus,
      wantsRealtorNotification,
      realtorName: wantsRealtorNotification ? realtorName : '',
      realtorEmail: wantsRealtorNotification ? realtorEmail : '',
      realtorPhone: wantsRealtorNotification ? realtorPhone : '',
      contactPersons,
      verificationMethod,
      verificationCode,
      isVerified,
      // Enhanced property details
      propertyType: property.propertyType,
      paymentMethod: property.paymentMethod,
      // Confirmation flags
      isAddressCorrect
    };
    
    // Save verified contact data to localStorage
    localStorage.setItem('verified-contact-data', JSON.stringify(contactData));
    
    // Navigate to booking summary with all collected data
    const params = new URLSearchParams({
      // Property data
      address: contactData.address,
      squareFootage: (contactData.squareFootage || 0).toString(),
      propertyType: contactData.propertyType,
      occupancyStatus: contactData.occupancyStatus,
      
      // Contact information
      firstName: contactData.payeeName.firstName,
      lastName: contactData.payeeName.lastName,
      payerEmail: contactData.payerEmail,
      reportEmail: contactData.reportEmail || '',
      phoneNumber: contactData.phoneNumber,
      relationshipToBuyer: contactData.relationshipToBuyer,
      buyerExplanation: contactData.buyerExplanation || '',
      
      // Realtor information
      wantsRealtorNotification: (contactData.wantsRealtorNotification ?? false).toString(),
      realtorName: contactData.realtorName || '',
      realtorEmail: contactData.realtorEmail || '',
      realtorPhone: contactData.realtorPhone || '',
      
      // Payment method
      paymentMethod: contactData.paymentMethod
    });

    // Add Additional Recipients data if available
    if (contactPersons && contactPersons.length > 0) {
      params.set('contactPersons', JSON.stringify(contactPersons));
    }

    // Add Multi-Family specific data if available
    if (property.multiFamilyUnits) {
      params.set('multiFamilyUnits', property.multiFamilyUnits);
    }
    if (property.unitLabels) {
      params.set('unitLabels', JSON.stringify(property.unitLabels));
    }
    if (property.unitSquareFootages) {
      params.set('unitSquareFootages', JSON.stringify(property.unitSquareFootages));
    }
    
    // Add Mobile Home specific data if available
    if (property.mobileHomeType) {
      params.set('mobileHomeType', property.mobileHomeType);
    }
    
    // Add Commercial specific data if available
    if (property.commercialType) {
      params.set('commercialType', property.commercialType);
    }
    
    // Scroll to top before navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    navigate(`/booking-summary?${params.toString()}`);
    
    // For 50% Challenge or other payment methods, continue with normal flow
    onVerified(contactData);
  };

  // Helper function to capitalize each word (title case)
  const toTitleCase = (str) => {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Individual field validation functions
  const isFirstNameValid = payeeName.firstName && payeeName.firstName.trim() !== '';
  const isLastNameValid = payeeName.lastName && payeeName.lastName.trim() !== '';
  const isRelationshipValid = relationshipToBuyer && relationshipToBuyer.trim() !== '';
  const isPhoneNumberValid = phoneNumber && phoneNumber.replace(/\D/g, '').length === 10;
  const isEmailValid = payerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail);
  const isAddressConfirmed = isAddressCorrect !== null;
  const isOccupancyStatusValid = occupancyStatus && occupancyStatus.trim() !== '';
  const isRealtorNotificationValid = wantsRealtorNotification !== null;
  const isAdditionalRecipientsValid = true; // This is always valid since it's optional
  
  // Realtor details validation (only required if user wants realtor notification)
  const isRealtorDetailsValid = wantsRealtorNotification === false || 
    (realtorName && realtorName.trim() !== '' && 
     realtorEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(realtorEmail) && 
     realtorPhone && realtorPhone.replace(/\D/g, '').length === 10);
  
  // Check if ready for verification (only email is needed)
  const isReadyForVerification = isFirstNameValid && 
    isLastNameValid && 
    isRelationshipValid && 
    isPhoneNumberValid && 
    isEmailValid;
  
  // Overall form completion check
  const isFormComplete = isFirstNameValid && 
    isLastNameValid && 
    // isRelationshipValid && 
    // isPhoneNumberValid && 
    isEmailValid && 
    // isVerified && 
    isAddressConfirmed && 
    isOccupancyStatusValid && 
    isRealtorNotificationValid && 
    isRealtorDetailsValid && 
    isAdditionalRecipientsValid;

  // Define form sections for guidance system with specific field order and rotating animations
  const formSections = [
    // Action buttons first
    {
      id: 'action-buttons',
      name: 'Getting Started',
      isComplete: hasInteracted,
      isRequired: true,
      hint: 'Choose "Preview Contract", "See What\'s Included", or "Skip and Continue" to get started.',
    },
    // Payer information - First Name and Last Name
    {
      id: 'firstName',
      name: 'First Name',
      isComplete: isFirstNameValid,
      isRequired: true,
      hint: 'Please enter your first name. Animation: "Smart"',
    },
    {
      id: 'lastName', 
      name: 'Last Name',
      isComplete: isLastNameValid,
      isRequired: true,
      hint: 'Please enter your last name. Animation: "Buyer"',
    },
    // Relationship to buyer - rotating highlights
    {
      id: 'relationship-buyer',
      name: 'Buyer',
      isComplete: relationshipToBuyer === 'buyer',
      isRequired: true,
      hint: 'Select "Buyer" if you are purchasing the property.',
    },
    {
      id: 'relationship-realtor',
      name: 'Realtor',
      isComplete: relationshipToBuyer === 'realtor',
      isRequired: true,
      hint: 'Select "Realtor" if you are the real estate agent.',
    },
    {
      id: 'relationship-family',
      name: 'Family',
      isComplete: relationshipToBuyer === 'family',
      isRequired: true,
      hint: 'Select "Family" if you are a family member.',
    },
    {
      id: 'relationship-friend',
      name: 'Friend',
      isComplete: relationshipToBuyer === 'friend',
      isRequired: true,
      hint: 'Select "Friend" if you are helping a friend.',
    },
    {
      id: 'relationship-attorney',
      name: 'Attorney',
      isComplete: relationshipToBuyer === 'attorney',
      isRequired: true,
      hint: 'Select "Attorney" if you are the legal representative.',
    },
    // Phone and Email
    {
      id: 'phoneNumber',
      name: 'Phone Number',
      isComplete: isPhoneNumberValid,
      isRequired: true,
      hint: 'Please enter your phone number for SMS verification.',
    },
    {
      id: 'payerEmail',
      name: 'Your Email Address',
      isComplete: isEmailValid,
      isRequired: true,
      hint: 'Please enter your email address for notifications.',
    },
    // Phone verification
    {
      id: 'phone-verification',
      name: 'Phone Verification',
      isComplete: isVerified,
      isRequired: true,
      hint: 'Click "Send Verification Code" to verify your phone number.',
    },
    // Additional Report Recipients
    {
      id: 'additional-recipients-first-name',
      name: 'Additional Recipient First Name',
      isComplete: contactPersons.length === 0 || contactPersons.every(p => p.firstName.trim() !== ''),
      isRequired: false,
      hint: 'Add additional people who should receive the inspection report.',
    },
    {
      id: 'additional-recipients-last-name',
      name: 'Additional Recipient Last Name',
      isComplete: contactPersons.length === 0 || contactPersons.every(p => p.lastName.trim() !== ''),
      isRequired: false,
      hint: 'Enter the last name for additional report recipients.',
    },
    {
      id: 'additional-recipients-email',
      name: 'Additional Recipient Email',
      isComplete: contactPersons.length === 0 || contactPersons.every(p => p.email.trim() !== ''),
      isRequired: false,
      hint: 'Enter email addresses for additional report recipients.',
    },
    // Realtor Authorization (rotating highlights)
    {
      id: 'realtor-auth-yes',
      name: 'Realtor Authorization - Yes',
      isComplete: wantsRealtorNotification === true,
      isRequired: false,
      hint: 'Select "Yes" to authorize sharing the report with your realtor.',
    },
    {
      id: 'realtor-auth-no',
      name: 'Realtor Authorization - No',
      isComplete: wantsRealtorNotification === false,
      isRequired: false,
      hint: 'Select "No" if you don\'t want to share the report with a realtor.',
    },
    // Realtor details (if authorized)
    {
      id: 'realtorName',
      name: 'Realtor Name',
      isComplete: !wantsRealtorNotification || (realtorName?.trim() !== ''),
      isRequired: wantsRealtorNotification === true,
      hint: 'Enter your realtor\'s full name.',
    },
    {
      id: 'realtorEmail',
      name: 'Realtor Email',
      isComplete: !wantsRealtorNotification || (realtorEmail?.trim() !== ''),
      isRequired: wantsRealtorNotification === true,
      hint: 'Enter your realtor\'s email address.',
    },
    {
      id: 'realtorPhone',
      name: 'Realtor Phone',
      isComplete: !wantsRealtorNotification || (realtorPhone?.trim() !== ''),
      isRequired: wantsRealtorNotification === true,
      hint: 'Enter your realtor\'s phone number.',
    },
    // Property confirmation
    {
      id: 'property-confirmation',
      name: 'Property Details',
      isComplete: isAddressConfirmed,
      isRequired: true,
      hint: 'Please confirm your property address and square footage are correct.',
    },
    // Occupancy Status (rotating highlights)
    {
      id: 'occupancy-occupied',
      name: 'Occupied',
      isComplete: occupancyStatus === 'occupied',
      isRequired: true,
      hint: 'Select "Occupied" if someone currently lives in the property.',
    },
    {
      id: 'occupancy-vacant',
      name: 'Vacant',
      isComplete: occupancyStatus === 'vacant',
      isRequired: true,
      hint: 'Select "Vacant" if the property is currently empty.',
    },
    {
      id: 'occupancy-unknown',
      name: 'Unknown',
      isComplete: occupancyStatus === 'unknown',
      isRequired: true,
      hint: 'Select "Unknown" if you\'re unsure of the occupancy status.',
    },
    {
      id: 'realtor-notification',
      name: 'Realtor Notification',
      isComplete: isRealtorNotificationValid && isRealtorDetailsValid,
      isRequired: true,
      hint: 'Please indicate if you want realtor notification and provide details if needed.',
    },
  ];

  // Initialize form guidance
  // const { resetActivityTimer } = useFormGuidance({
  //   sections: formSections,
  //   inactivityTimeout: 3000, // 3 seconds
  // });

  // Enhanced automatic highlighting system - highlight next incomplete field after 3 seconds of no activity
  useEffect(() => {
    let activityTimer = null;
    let highlightTimer = null;

    const resetTimer = () => {
      if (activityTimer) clearTimeout(activityTimer);
      if (highlightTimer) clearTimeout(highlightTimer);
      
      // Clear any existing highlights
      document.querySelectorAll('.guidance-highlight').forEach(el => {
        el.classList.remove('guidance-highlight');
      });
      
      // Start new 3-second timer
      activityTimer = setTimeout(() => {
        // Find the first incomplete required section
        const nextSection = formSections.find(section => section.isRequired && !section.isComplete);
        if (nextSection) {
          const element = document.querySelector(`[data-section="${nextSection.id}"]`);
          if (element) {
            // Add highlight to next field
            element.classList.add('guidance-highlight');
            
            // Remove highlight after 6 seconds
            highlightTimer = setTimeout(() => {
              element.classList.remove('guidance-highlight');
            }, 6000);
          }
        }
      }, 3000);
    };

    // Start the timer initially
    resetTimer();

    // Reset timer on any user interaction
    const handleActivity = () => resetTimer();
    
    // Listen for various activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'input', 'change'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      if (activityTimer) clearTimeout(activityTimer);
      if (highlightTimer) clearTimeout(highlightTimer);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [formSections]);



  // Define progress steps for this component
  const progressSteps = [
    { id: 'address', title: 'Address', description: 'Enter location', completed: true },
    { id: 'details', title: 'Property Details', description: 'Verify information', completed: true },
    { id: 'contact', title: 'Contact Info', description: 'Enter details', current: true },
    { id: 'booking', title: 'Schedule', description: 'Pay & book', completed: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <ProgressSteps steps={progressSteps} />
        
        <GuidanceCard
          title="Step 3: Enter Your Contact Information"
          description="Complete all required fields below. We'll verify your phone number to ensure accurate communication for your inspection."
          nextAction={hasInteracted ? "Fill out all required fields and continue" : "Choose an action to get started"}
          variant="info"
        >
          <div className="text-xs text-blue-700 bg-white/30 p-2 rounded mt-2">
            <strong>Required:</strong> Name, phone, email, relationship to buyer, and address confirmation
          </div>
        </GuidanceCard>

        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Let's Get You Verified and Setup!</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center">
              Let's get you on the books, but before we do, you can preview the contract and see what's included, or skip and continue.
            </p>
          </div>

      <div className="text-center space-y-4" data-section="action-buttons">
        <div className="flex flex-col lg:flex-row gap-4 justify-center">
          <Button
            onClick={() => {
              setHasInteracted(true);
              setShowWhatsIncluded(false);
              setShowContractPreview(true);
            
              
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            📄 Preview Contract
          </Button>
          
          <Button
            onClick={() => {
              setShowWhatsIncluded(true);
              setHasInteracted(false)
            
            }}
            variant="outline"
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            📋 See What's Included
          </Button>
          
          <Button
            onClick={() => {
              setHasInteracted(true);
              setShowWhatsIncluded(false);
              setShowContractPreview(false);
              

            }}
            variant="secondary"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-400"
          >
            ⏩ Skip and Continue
          </Button>
        </div>
      </div>

      {showWhatsIncluded && (
        <Card className="mb-6 border-2 border-blue-500 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-blue-800">What's Included in Your Inspection</CardTitle>
              <Button
                onClick={() => setShowWhatsIncluded(false)}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">🏠 Structural Systems</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Foundation and structural components</li>
                  <li>• Roof and attic inspection</li>
                  <li>• Exterior walls and siding</li>
                  <li>• Windows and doors</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">⚡ Electrical & Plumbing</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Electrical panel and wiring</li>
                  <li>• Outlets and fixtures</li>
                  <li>• Plumbing systems</li>
                  <li>• Water heater inspection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">🌡️ HVAC Systems</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Heating and cooling systems</li>
                  <li>• Ductwork inspection</li>
                  <li>• Air filtration systems</li>
                  <li>• Ventilation assessment</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">🔍 Additional Features Included</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Interior rooms and features</li>
                  <li>• Safety equipment</li>
                  <li>• Garage and outbuildings</li>
                  <li>• Pool/spa equipment (if applicable)</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-700">
                <strong>Professional Report:</strong> You'll receive a comprehensive digital report with photos, 
                detailed findings, and recommendations within 24 hours of your inspection.
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => {
                  setShowWhatsIncluded(false);
                  setHasClosedModal(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                Close & Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showContractPreview && (
        <Card className="mb-6 border-2 border-green-500 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-green-800">Contract Preview</CardTitle>
              <Button
                onClick={() => {
                  setShowContractPreview(false);
                  setHasClosedModal(true);
                }}
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-800"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg border p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">CDC Home Inspections Service Agreement</h3>
                <a 
                  href="/attached_assets/2025 CDC Home Inspections Service Agreement_1755575856452.pdf"
                  target="_blank"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Open in New Tab ↗
                </a>
              </div>
              
              <div className="w-full h-96 border rounded-lg overflow-hidden">
                <iframe
                  src="/attached_assets/2025 CDC Home Inspections Service Agreement_1755575856452.pdf"
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title="Contract Preview"
                >
                  <p>Your browser doesn't support PDF viewing. 
                     <a href="/attached_assets/2025 CDC Home Inspections Service Agreement_1755575856452.pdf" target="_blank">
                       Click here to download the PDF
                     </a>
                  </p>
                </iframe>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => {
                  setShowContractPreview(false);
                  setHasClosedModal(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              >
                Close & Continue with Form
              </Button>
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/attached_assets/2025 CDC Home Inspections Service Agreement_1755575856452.pdf';
                  link.download = 'CDC_Home_Inspections_Service_Agreement.pdf';
                  link.click();
                }}
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50 px-6 py-2"
              >
                📄 Download Contract
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={!hasInteracted && !hasClosedModal ? "opacity-50 blur-sm pointer-events-none" : ""} data-section="payer-info">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="animate-pulse">Whose Paying?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div data-section="firstName">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <Input
                  id="firstName"
                  required
                  value={payeeName.firstName}
                  onChange={(e) => {
                    setPayeeName(prev => ({ ...prev, firstName: toTitleCase(e.target.value) }));
                  
                  }}
                  placeholder="Smart"
                  className="pr-12 border-2 border-blue-500"
                />
                {isFirstNameValid && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div data-section="lastName">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <Input
                  id="lastName"
                  required
                  value={payeeName.lastName}
                  onChange={(e) => {
                    setPayeeName(prev => ({ ...prev, lastName: toTitleCase(e.target.value) }));
                   
                  }}
                  placeholder="Buyer"
                  className="pr-12 border-2 border-blue-500"
                />
                {isLastNameValid && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3" data-section="relationship-info">
            <Label>What is your relationship to the buyer?</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {['Buyer', 'Realtor', 'Family', 'Friend', 'Attorney'].map((relationship) => (
                <Button
                  key={relationship}
                  data-section={`relationship-${relationship.toLowerCase()}`}
                  variant={relationshipToBuyer === relationship.toLowerCase() ? "default" : "outline"}
                  onClick={() => {
                    setRelationshipToBuyer(relationship.toLowerCase());
                    
                  }}
                  className={`h-12 border-2 relative ${
                    relationshipToBuyer === relationship.toLowerCase() 
                      ? 'border-green-500 bg-white text-gray-800' 
                      : 'border-blue-300 bg-white hover:border-green-400 text-gray-800'
                  }`}
                >
                  <span>{relationship}</span>
                  {isRelationshipValid && relationshipToBuyer === relationship.toLowerCase() && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  )}
                </Button>
              ))}
            </div>
            {relationshipToBuyer && relationshipToBuyer !== 'buyer' && (
              <div className="mt-3">
                <Label htmlFor="buyerExplanation">
                  According to the Arizona Board of Technical Registration, the paying party for the inspection will be listed as the client. You can pay for another person, but you will be listed as the client. You may list any additional report recipients below.
                </Label>
              </div>
            )}
          </div>

          <div data-section="contact-info">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>

            </div>
            <div className="relative">
              <Input
                id="phoneNumber"
                data-section="phoneNumber"
                required
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  handlePhoneChange(e);
               
                }}
                placeholder="(555) 123-4567"
                className="pr-12 border-2 border-blue-500"
              />

              {isPhoneNumberValid && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="payerEmail">Your Email Address *</Label>
            <div className="relative">
              <Input
                id="payerEmail"
                type="email"
                required
                value={payerEmail}
                onChange={(e) => {
                  setPayerEmail(e.target.value);
                 
                }}
                onBlur={handleEmailBlur}
                placeholder="your.email@example.com"
                className={`pr-12 ${hasEmailBlurred && !isPayerEmailValid ? 'border-red-500 border-2' : 'border-blue-500 border-2'}`}
              />
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {isPayerEmailValid && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>


        </CardContent>
      </Card>

      {isReadyForVerification && (
        <Card className={isVerified ? "border-green-500" : ""} data-section="phone-verification">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isVerified ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Shield className="h-5 w-5 text-blue-600" />
              )}
              Contact Verification
              {import.meta.env.DEV && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  DEV MODE - BYPASSED
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {isVerified 
                ? import.meta.env.DEV 
                  ? "Verification bypassed in development mode. Will be enabled in production."
                  : "Your contact details have been verified successfully!"
                : "You'll receive a verification code via text. This step helps us filter serious inquiries and provide instant and accurate service prices."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isVerified && !import.meta.env.DEV && (
              <>
                {!showVerificationInput ? (
                  <div className="space-y-3">
                    <Button onClick={sendVerificationCode} disabled={isLoading} className="w-full">
                      {isLoading ? "Sending..." : "Send Verification Code via SMS"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="verificationCode">Enter Verification Code</Label>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-yellow-800">
                        <strong>SMS not received?</strong> Check the browser console for the verification code, or use the development code option.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="border-2 border-blue-500"
                      />
                      <Button onClick={verifyCode} disabled={isLoading || verificationCode.length < 6}>
                        {isLoading ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button variant="ghost" onClick={() => setShowVerificationInput(false)} size="sm">
                        Resend Code
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {isVerified && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">
                    {import.meta.env.DEV ? "Development Mode - Verification Bypassed" : "Verification Complete"}
                  </span>
                </div>
                <p className="text-green-600 mt-1">
                  {import.meta.env.DEV 
                    ? "In production, users will complete SMS verification before proceeding."
                    : "You can now access pricing and continue with your booking."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className={shouldBlurFormSections ? "opacity-50 blur-sm pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Additional Report Recipients
            {isAdditionalRecipientsValid && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            Everyone listed will receive a copy of the inspection report via email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {contactPersons.length === 0 ? (
            <Button variant="outline" onClick={addContactPerson} className="w-full border-2 border-blue-300 hover:border-green-400">
              <Plus className="h-4 w-4 mr-2" />
              Add Additional Report Recipient
            </Button>
          ) : (
            <>
              {contactPersons.map((person, index) => (
                <div key={person.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Contact {index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContactPerson(person.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                    required
                      placeholder="First Name"
                      value={person.firstName}
                      onChange={(e) => updateContactPerson(person.id, 'firstName', e.target.value)}
                    />
                    <Input
                      required
                      placeholder="Last Name"
                      value={person.lastName}
                      onChange={(e) => updateContactPerson(person.id, 'lastName', e.target.value)}
                    />
                    <Input
                      required
                      placeholder="Email Address"
                      type="email"
                      value={person.email}
                      onChange={(e) => updateContactPerson(person.id, 'email', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              {contactPersons.length < 3 && (
                <Button variant="outline" onClick={addContactPerson} className="w-full border-2 border-blue-300 hover:border-green-400">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Contact
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className={shouldBlurFormSections ? "opacity-50 blur-sm pointer-events-none" : ""} data-section="realtor-notification">
        <CardHeader>
          <CardTitle>Realtor Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Do you want your realtor to have a copy before you review the report?</Label>
            <div className="flex gap-4">
              <Button
                variant={wantsRealtorNotification === true ? "default" : "outline"}
                onClick={() => setWantsRealtorNotification(true)}
                className={`border-2 relative pr-12 ${
                  wantsRealtorNotification === true 
                    ? 'border-green-500 bg-white text-gray-800' 
                    : 'border-blue-300 bg-white hover:border-green-400 text-gray-800'
                }`}
              >
                <span>Yes</span>
                {isRealtorNotificationValid && wantsRealtorNotification === true && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                )}
              </Button>
              <Button
                variant={wantsRealtorNotification === false ? "default" : "outline"}
                onClick={() => setWantsRealtorNotification(false)}
                className={`border-2 relative pr-12 ${
                  wantsRealtorNotification === false 
                    ? 'border-green-500 bg-white text-gray-800' 
                    : 'border-blue-300 bg-white hover:border-green-400 text-gray-800'
                }`}
              >
                <span>No</span>
                {isRealtorNotificationValid && wantsRealtorNotification === false && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {wantsRealtorNotification === true && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="realtorName">Realtor Name</Label>
                <div className="relative">
                  <Input
                    id="realtorName"
                    value={realtorName}
                    onChange={(e) => setRealtorName(e.target.value)}
                    placeholder="Enter realtor's name"
                    className="pr-12 border-2 border-blue-500"
                  />
                  {realtorName && realtorName.trim() !== '' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="realtorEmail">Realtor Email</Label>
                <div className="relative">
                  <Input
                    id="realtorEmail"
                    type="email"
                    value={realtorEmail}
                    onChange={(e) => setRealtorEmail(e.target.value)}
                    placeholder="realtor@email.com"
                    className="pr-12 border-2 border-blue-500"
                  />
                  {realtorEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(realtorEmail) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="realtorPhone">Realtor Phone</Label>
                <div className="relative">
                  <Input
                    id="realtorPhone"
                    type="tel"
                    value={realtorPhone}
                    onChange={(e) => setRealtorPhone(formatPhoneNumber(e.target.value.replace(/\D/g, '')))}
                    placeholder="(555) 123-4567"
                    className="pr-12 border-2 border-blue-500"
                  />
                  {realtorPhone && realtorPhone.replace(/\D/g, '').length === 10 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={shouldBlurFormSections ? "opacity-50 blur-sm pointer-events-none" : ""} data-section="property-confirmation">
        <CardHeader>
          <CardTitle>Property Details Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Inspection Street Address</Label>
            <div className="mt-3 p-3 sm:p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              {isEditingAddress ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={displayAddress}
                    onChange={(e) => setDisplayAddress(e.target.value)}
                    onBlur={() => setIsEditingAddress(false)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingAddress(false);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    autoFocus
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsEditingAddress(false)}
                      className="text-blue-600 hover:text-blue-700 text-sm underline"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-left">
                  <div className="text-sm sm:text-base font-semibold text-blue-900 mb-2">
                    Your Inspection Address:
                  </div>
                 
                  <div className="text-blue-800 text-sm sm:text-base font-medium leading-relaxed">
  {editedAddress ? (
    editedAddress.split(',').map((line, i) => (
      <div key={i}>{line.trim()}</div>
    ))
  ) : (
    <div>Address not available</div>
  )}
</div>
                  <div className="mt-2 flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUnitNumber(!showUnitNumber)}
                      className="text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      {showUnitNumber ? 'Remove Unit #' : 'Add Unit Number'}
                    </Button>
                    <button
                      onClick={() => setIsEditingAddress(true)}
                      className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
              
              {showUnitNumber && (
                <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="unitNumber" className="text-sm font-medium text-gray-700">Unit Number</Label>
                  <div className="relative mt-1">
                    <Input
                      id="unitNumber"
                      value={unitNumber}
                      onChange={(e) => setUnitNumber(e.target.value)}
                      placeholder="Unit Number 123"
                      className="pr-12 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    {unitNumber && unitNumber.trim() !== '' && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <Button
                variant={isAddressCorrect === true ? "default" : "outline"}
                onClick={() => {
                  setIsAddressCorrect(true)
                  // console.log('clicked correct');
                  // console.log("editedAddress", editedAddress);
                  // console.log(isAddressCorrect);
                  
                  
                  // setEditedAddress
                }}
                className={`flex-1 border-2 relative h-14 text-lg font-semibold ${
                  isAddressCorrect === true 
                    ? 'border-green-500 bg-green-50 text-green-800 shadow-lg' 
                    : 'border-blue-500 bg-white hover:border-green-400 hover:bg-green-50 text-blue-700'
                }`}
              >
                <span className="pr-8">✓ Address is Correct</span>
                {isAddressConfirmed && isAddressCorrect === true && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                )}
              </Button>
              <Button
                variant={isAddressCorrect === false ? "default" : "outline"}
                // onClick={() => setIsAddressCorrect(false)}
                onClick={() => {
                  setIsAddressCorrect(false);
                  // hasManuallyEditedAddress.current = true;
                
                  // if (!editedAddress) {
                  //   const currentAddress = property.address || 
                  //     (property.street && property.city && property.state && property.zip
                  //       ? `${property.street}, ${property.city}, ${property.state} ${property.zip}`
                  //       : '');
                  //   setEditedAddress(currentAddress);
                  // }
                }}
                className={`flex-1 border-2 h-14 text-lg font-semibold ${
                  isAddressCorrect === false 
                    ? 'border-green-500 bg-green-50 text-green-800 shadow-lg' 
                    : 'border-blue-500 bg-white hover:border-green-400 hover:bg-green-50 text-blue-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isAddressCorrect === false ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Edit3 className="h-5 w-5" />
                  )}
                  <span>Edit Address</span>
                </div>
              </Button>
            </div>
            {isAddressCorrect === false && (
              <div className="mt-3">
                <Input
                  value={editedAddress}
                  onChange={(e) => setEditedAddress(e.target.value)}
                  required
                  placeholder="Enter correct address"
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div className="space-y-4 bg-blue-50 p-5 rounded-lg border-2 border-blue-300 shadow-md">
            <div className="text-center">
              <Label className="text-xl font-bold text-blue-800">REQUIRED: How Big is the House?</Label>
              <p className="text-sm text-blue-600 mt-1 font-medium">Square footage is needed to calculate your inspection price</p>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <Button
                  variant="default"
                  className="w-full border-3 h-16 text-xl font-bold border-green-600 bg-green-100 text-green-900 shadow-xl relative hover:bg-green-200 transition-all"
                  disabled
                >
                  <span className="pr-10">{displaySquareFootage} SF</span>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 border-2 border-blue-500 rounded-lg" data-section="occupancy-status">
            <Label className="text-base font-semibold">Occupancy Status</Label>
            <div className="grid grid-cols-3 gap-3">
              {['Occupied', 'Vacant', 'Unknown'].map((status) => (
                <Button
                  key={status}
                  onClick={() => {
                    setOccupancyStatus(status.toLowerCase());
                  
                  }}
                  className={`h-16 relative text-base font-semibold px-4 flex items-center justify-center border-2 ${
                    occupancyStatus === status.toLowerCase() 
                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                  }`}
                >
                  <span className="text-center">
                    {status}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Action Buttons */}
      <div className={`flex flex-col sm:flex-row gap-4 ${shouldBlurFormSections ? "opacity-50 blur-sm pointer-events-none" : ""}`}>
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back to Property Details
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!isFormComplete}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
        >
          View Booking Summary
        </Button>
      </div>
        </div>
      </div>
    </div>
  );
}