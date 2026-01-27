import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Calendar } from '../components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/Badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialoag';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/Label';
import { CalendarIcon, ClockIcon, MapPinIcon, HomeIcon, UserIcon, PhoneIcon, MailIcon, UsersIcon, Clock, AlertCircle } from 'lucide-react';
import { format, addDays, isWeekend, isSaturday, isToday } from 'date-fns';
import { useToast } from '../hooks/use-toast';
import { doc, setDoc, getDoc, deleteField, serverTimestamp, collection, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ProgressSteps, GuidanceCard } from '../components/ui/Progress-steps';
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';




export default function InspectionCalendar() {
  const functionUrl = import.meta.env.VITE_BASE_URL;
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  const stripe = useStripe();
const elements = useElements();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [property, setProperty] = useState({});
  const [contact, setContact] = useState({});
  const [showWaitingListDialog, setShowWaitingListDialog] = useState(false);
  const [waitingListEmail, setWaitingListEmail] = useState('');
  const [waitingListPhone, setWaitingListPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loginUser, setLoginUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null);
  const [showPaymentIntent, setShowPaymentIntent] = useState(false);
const [pendingBookingData, setPendingBookingData] = useState(null);



  const parseAddress = (addressString) => {
    if (!addressString || typeof addressString !== 'string') {
      return {
        address: addressString || '',
        street: '',
        streetNumber: '',
        direction: '',
        streetName: '',
        city: '',
        state: '',
        zip: ''
      };
    }
  
    const cleanedAddress = addressString.trim();
    
    const zipMatch = cleanedAddress.match(/\b(\d{5}(-\d{4})?)\b/);
    const zip = zipMatch ? zipMatch[1].substring(0, 5) : '';
    
    const addressWithoutZip = cleanedAddress.replace(/\b\d{5}(-\d{4})?\b/, '').trim();
    
    const cleanedWithoutZip = addressWithoutZip.replace(/,\s*$/, '').trim();
    
    const parts = cleanedWithoutZip.split(',').map(part => part.trim()).filter(Boolean);
    
    const streetPart = parts[0] || '';
    
    const streetWords = streetPart.split(/\s+/).filter(Boolean);
    
    let streetNumber = '';
    let direction = '';
    let streetName = '';
    let street = streetPart;
    
    if (streetWords.length > 0) {
      const firstWord = streetWords[0];
      if (/^\d+$/.test(firstWord)) {
        streetNumber = firstWord;
        
        const directionPattern = /^(North|South|East|West|Northeast|Northwest|Southeast|Southwest|N|S|E|W|NE|NW|SE|SW)$/i;
        if (streetWords.length > 1 && directionPattern.test(streetWords[1])) {
          direction = streetWords[1];
          streetName = streetWords.slice(2).join(' ');
        } else {
          streetName = streetWords.slice(1).join(' ');
        }
      } else {
        const directionPattern = /^(North|South|East|West|Northeast|Northwest|Southeast|Southwest|N|S|E|W|NE|NW|SE|SW)$/i;
        if (directionPattern.test(firstWord)) {
          direction = firstWord;
          streetName = streetWords.slice(1).join(' ');
        } else {
          // No number or direction, entire string is street name
          streetName = streetPart;
        }
      }
      
      // Reconstruct full street address
      const streetParts = [streetNumber, direction, streetName].filter(Boolean);
      street = streetParts.join(' ');
    }
    
    // Parse city and state from remaining parts
    let city = '';
    let state = '';
    
    if (parts.length === 2) {
      // "Street, City" or "Street, State"
      // Check if second part looks like a state (2 uppercase letters) or city
      if (/^[A-Z]{2}$/.test(parts[1])) {
        state = parts[1];
      } else {
        city = parts[1];
      }
    } else if (parts.length >= 3) {
      // "Street, City, State" format
      city = parts[1];
      // Last part might be state (2 uppercase letters)
      const lastPart = parts[parts.length - 1];
      if (/^[A-Z]{2}$/.test(lastPart)) {
        state = lastPart;
      } else {
        city = parts.slice(1, -1).join(', ');
        state = lastPart;
      }
    }
    
    return {
      address: cleanedAddress,
      street: street || cleanedAddress,
      streetNumber: streetNumber || '',
      direction: direction || '',
      streetName: streetName || street || '',
      city: city || '',
      state: state || '',
      zip: zip || ''
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        return;
      }

      try {
        // console.log("currentUser", currentUser.uid);

        const token = localStorage.getItem('approvalToken') || sessionStorage.getItem('approvalToken');
        console.log("token", token);
        setToken(token)
        // let userIdToUse = currentUser.uid; 
  
        // if(token){
        //   const bookingsRef = collection(db, "bookings");
        //   const q = query(bookingsRef, where("approvalToken", "==", token));
        //   const querySnapshot = await getDocs(q);
      
          
        //     const bookingDoc = querySnapshot.docs[0]; 
        //     // const bookingDocData = bookingDoc.data();

        //     // console.log("bookingDocData", bookingDocData.userId);
        //     // userIdToUse = bookingDocData.userId;
        // } else {
        //   // userIdToUse = currentUser.uid;
        // }
        // setCurrentUserId(userIdToUse);
      } catch (err) {
        console.error("Error fetching user role", err);
        setCurrentUserId(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const urlParams = new URLSearchParams(window.location.search);
    setLoginUser(JSON.parse(sessionStorage.getItem('userData')));
    const additionalContact = JSON.parse(sessionStorage.getItem('verified-contact-data'));

    const urlAddress = urlParams.get('address') || '';
    
    const parsedAddress = urlAddress ? parseAddress(urlAddress) : {
      address: '',
      street: '',
      streetNumber: '',
      direction: '',
      streetName: '',
      city: '',
      state: '',
      zip: ''
    };

    const propertyData = {
      address: urlAddress || parsedAddress.address,
      street: urlParams.get('street') || parsedAddress.street,
      streetNumber: urlParams.get('streetNumber') || parsedAddress.streetNumber,
      direction: urlParams.get('direction') || parsedAddress.direction,
      streetName: urlParams.get('streetName') || parsedAddress.streetName,
      city: urlParams.get('city') || parsedAddress.city,
      state: urlParams.get('state') || parsedAddress.state,
      zip: urlParams.get('zip') || parsedAddress.zip,
      propertyType: urlParams.get('propertyType') || '',
      squareFootage: Number(urlParams.get('squareFootage')) || 0,
      paymentMethod: urlParams.get('paymentMethod') || 'pay_now',
      multiFamilyUnits: urlParams.get('multiFamilyUnits') || '',
      additionalContact: additionalContact.contactPersons
    };

    const bookingData = JSON.parse(sessionStorage.getItem('bookingDataUsingToken'));

    // console.log("bookingData in session storage---------- after obj-", bookingData);
    // console.log("paymentMethod from URL:", propertyData.paymentMethod);
    
    // Only merge challenge data if URL paymentMethod is 'challenge' AND bookingData has isDiscount
    if(bookingData && bookingData.isDiscount && propertyData.paymentMethod === 'challenge'){
      console.log("bookingData ", bookingData);
      
      const mergedProperty = {
        ...propertyData,
        paymentMethod: 'challenge', // Keep as challenge since URL confirms it
        challengePrice: bookingData.property?.challengePrice || bookingData.challengePrice,
        isDiscount: true, // Set isDiscount flag
        city: propertyData.city || bookingData.property?.city || bookingData.city || '',
        state: propertyData.state || bookingData.property?.state || bookingData.state || '',
        street: propertyData.street || bookingData.property?.street || bookingData.street || '',
        streetNumber: propertyData.streetNumber || bookingData.property?.streetNumber || bookingData.streetNumber || '',
        direction: propertyData.direction || bookingData.property?.direction || bookingData.direction || '',
        streetName: propertyData.streetName || bookingData.property?.streetName || bookingData.streetName || '',
        zip: propertyData.zip || bookingData.property?.zip || bookingData.zip || '',
        address: propertyData.address || bookingData.property?.address || bookingData.address || '',
      };

      if (mergedProperty.address && (!mergedProperty.street || !mergedProperty.zip || !mergedProperty.streetNumber)) {
        const parsed = parseAddress(mergedProperty.address);
        mergedProperty.street = mergedProperty.street || parsed.street;
        mergedProperty.streetNumber = mergedProperty.streetNumber || parsed.streetNumber;
        mergedProperty.direction = mergedProperty.direction || parsed.direction;
        mergedProperty.streetName = mergedProperty.streetName || parsed.streetName;
        mergedProperty.city = mergedProperty.city || parsed.city;
        mergedProperty.state = mergedProperty.state || parsed.state;
        mergedProperty.zip = mergedProperty.zip || parsed.zip;
      }

      setProperty(mergedProperty);
    } else {
      // ----- pay_now -----

      // console.log("----- pay_now -----", {
      //   ...propertyData,
      //   isDiscount: false,
      //   paymentMethod: propertyData.paymentMethod || 'challenge'
      // });
      
      setProperty({
        ...propertyData,
        isDiscount: false,
        paymentMethod: propertyData.paymentMethod || 'pay_now'
      });
    }

    const contactData = {
      firstName: urlParams.get('firstName') || '',
      lastName: urlParams.get('lastName') || '',
      payerEmail: urlParams.get('payerEmail') || '',
      reportEmail: urlParams.get('reportEmail') || '',
      phoneNumber: urlParams.get('phoneNumber') || '',
      relationshipToBuyer: urlParams.get('relationshipToBuyer') || '',
      buyerExplanation: urlParams.get('buyerExplanation') || '',
      occupancyStatus: urlParams.get('occupancyStatus') || '',
      wantsRealtorNotification: urlParams.get('wantsRealtorNotification') === 'true',
      realtorName: urlParams.get('realtorName') || '',
      realtorEmail: urlParams.get('realtorEmail') || '',
      realtorPhone: urlParams.get('realtorPhone') || ''
    };

    setContact(contactData);
  }, []);

  const calculatePrice = (propertyData) => {
    if (!propertyData) return 0;
    
    const { propertyType, squareFootage = 0, multiFamilyUnits, mobileHomeType, paymentMethod } = propertyData;
    
    const bookingData = JSON.parse(sessionStorage.getItem('bookingDataUsingToken') || 'null');
    
    // Only use challenge price if paymentMethod is 'challenge' AND bookingData confirms it
    if (bookingData && bookingData.property && paymentMethod === 'challenge') {
      if (bookingData.isDiscount === true && bookingData.property.challengePrice) {
        return bookingData.property.challengePrice;
      } 
    }
    
    // Use payNowPrice if available and paymentMethod is pay_now
    if (bookingData && bookingData.property && paymentMethod === 'pay_now') {
      if (bookingData.property.payNowPrice) {
        return bookingData.property.payNowPrice;
      }
    }
    
    let basePrice = 0;
    
    if (propertyType === 'Multi-Family Residence') {
      switch (multiFamilyUnits) {
        case '2 Units': return 825;
        case '3 Units': return 900;
        case '4 Units': return 950;
        case '5 Units': return 1050;
        case '6 Units': return 1500;
        default: return 825;
      }
    }
    
    if (propertyType === 'Mobile/Manufactured Home') {
      switch (mobileHomeType) {
        case 'Single Wide': return 625;
        case 'Double Wide': return 750;
        case 'Triple Wide': return 800;
        default: return 625;
      }
    }
    
    if (propertyType === 'Commercial') {
      return 1100;
    }
    
    if (squareFootage <= 1200) {
      return 575;
    } else if (squareFootage <= 3000) {
      return 650;
    } else if (squareFootage <= 5000) {
      return 725;
    } else if (squareFootage <= 6000) {
      return 800;
    } else {
      return 800;
    }
  }

  const fullPrice = calculatePrice(property);

  const getTimeSlots = (date) => {
    if (!date) return [];
    
    if (isSaturday(date)) {
      // Saturday: 7:30am - 2pm
      return [
        '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM',
        '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM',
        '1:30 PM', '2:00 PM'
      ];
    } else {
      // Weekdays: 8am - 5pm
      return [
        '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
        '5:00 PM'
      ];
    }
  };

  const timeSlots = getTimeSlots(selectedDate);

  const getAvailableDatesWithStatus = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 1; i <= 14; i++) {
      const date = addDays(today, i);
      
      let totalSlots;
      let availableSlots;
        
      if (date.getDay() === 0 || date.getDay() === 6) {
        totalSlots = 0;
        availableSlots = 0;
      
      } else {
        totalSlots = 9;
        availableSlots = totalSlots;
      }
      
      let status;
      if (availableSlots === 0) {
        status = 'unavailable';
      } else {
        status = 'available';
      }
      
      dates.push({
        date,
        status,
        availableSlots,
        totalSlots
      });
    }
    return dates;
  };

  const availableDatesWithStatus = getAvailableDatesWithStatus();

  const getDateAvailability = (date) => {
    return availableDatesWithStatus.find(d => 
      d.date.toDateString() === date.toDateString()
    ) || null;
  };

  const isWeekendDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable same-day booking (return true to disable)
    if (isToday(date)) return true; // Disable today for booking
    
    // Disable Sundays and Saturdays
    if (date.getDay() === 0 || date.getDay() === 6) return true;
    
    // Only allow dates within our 14-day window
    const maxDate = addDays(today, 14);
    if (date > maxDate) return true;
    
    return false;
  };

  const customDayRenderer = (day, modifiers) => {
    const availability = getDateAvailability(day);
    const isPastDate = day < new Date();
    const isTodayDate = isToday(day);
    
    let className = '';
    
    if (isPastDate) {
      className = 'text-gray-400 bg-gray-100';
    } else if (isTodayDate) {
      className = 'border-2 border-blue-500 bg-blue-50 text-blue-700 font-semibold';
    } else if (availability) {
      switch (availability.status) {
        case 'available':
          className = 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300';
          break;
        case 'limited':
          className = 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300';
          break;
        case 'unavailable':
          className = 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300';
          break;
      }
    }
    
    return (
      <div className={`relative w-full h-full flex items-center justify-center p-2 rounded ${className}`}>
        <span className="text-base font-medium">{day.getDate()}</span>
      </div>
    );
  };

  const getCalendarDateRange = () => {
    const today = new Date();
    const maxDate = addDays(today, 14);
    return { minDate: today, maxDate };
  };

  const { minDate, maxDate } = getCalendarDateRange();

  const handleWaitingListSubmit = async () => {
    if (!waitingListEmail || !selectedDate) return;
    
    try {
      console.log('Waiting list entry:', {
        date: selectedDate,
        email: waitingListEmail,
        phone: waitingListPhone,
        property,
        contact
      });
      
      toast({
        title: "Added to Waiting List",
        description: "You'll be notified within 24 hours if a slot becomes available.",
      });
      
      setShowWaitingListDialog(false);
      setWaitingListEmail('');
      setWaitingListPhone('');
    } catch (error) {
      console.error('Error adding to waiting list:', error);
      toast({
        title: "Error",
        description: "Failed to add to waiting list. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleContinueToPayment = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!selectedDate || !selectedTime) {
        setIsLoading(false);
        toast({
          title: "Selection Required",
          description: "Please select both a date and time for your inspection.",
          variant: "destructive",
        });
        return;
      }
  
      // Get userId from multiple sources with fallback logic
      const bookingDataFromToken = JSON.parse(sessionStorage.getItem('bookingDataUsingToken') || 'null');
      setToken(bookingDataFromToken)
      // let userIdToUse = currentUserId;
      
      // Fallback 1: Use userId from bookingDataUsingToken if currentUserId is null
      // if (!userIdToUse && bookingDataFromToken?.userId) {
      //   userIdToUse = bookingDataFromToken.userId;
      //   console.log('Using userId from bookingDataUsingToken:', userIdToUse);
      // }
      
      // Fallback 2: Try to get from existing userData if available
      // if (!userIdToUse) {
      //   const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || 'null');
      //   if (userData?.userId) {
      //     userIdToUse = userData.userId;
      //     console.log('Using userId from userData:', userIdToUse);
      //   }
      // }
      
      // Validate userId exists before proceeding
      // if (!userIdToUse) {
      //   console.error('userId is missing!', { 
      //     currentUserId, 
      //     bookingDataFromToken: bookingDataFromToken?.userId,
      //     hasBookingData: !!bookingDataFromToken 
      //   });
      //   toast({
      //     title: "User Identification Error",
      //     description: "User identification failed. Please refresh the page and try again.",
      //     variant: "destructive",
      //   });
      //   setIsLoading(false);
      //   return;
      // }
  
      // Prepare appointment data with validated userId
      const appointmentData = {
        date: selectedDate,
        time: selectedTime,
        formattedDateTime: `${format(selectedDate, 'EEEE, MMMM do, yyyy')} at ${selectedTime}`,
        property: property,
        verifiedContact: contact,
        fullPrice,
        // userId: userIdToUse, // Use the validated userId
        isDiscount: false,
        status: 'SUCCESS',
      };
  
      // Ensure selectedDate is a Date object and convert to ISO string
      const appointmentDateISO = selectedDate instanceof Date 
        ? selectedDate.toISOString() 
        : new Date(selectedDate).toISOString();
  
      /* =====================
         PAY NOW FLOW
      ====================== */
      if (property.paymentMethod === 'pay_now') {
        // Save booking data to localStorage for retrieval after payment
        const bookingData = {
          ...appointmentData,
          timestamp: new Date().toISOString()
        };
        
        // Log for debugging
        // console.log('Pay Now Flow - Saving bookingData with userId:', userIdToUse);
        console.log('Pay Now Flow - Full bookingData:', bookingData);
        
        localStorage.setItem('pending-booking-data', JSON.stringify(bookingData));
        sessionStorage.setItem('checkoutUrlMethod', 'pay_now');
        localStorage.setItem('checkoutUrlMethod', 'pay_now');
  
        // Create Checkout Session dynamically
        const createCheckoutResponse = await fetch(`${functionUrl}/createCheckoutSession`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: fullPrice,
            currency: 'usd',
            customerEmail: contact.payerEmail,
            customerName: `${contact.firstName} ${contact.lastName}`,
            successUrl: `${window.location.origin}/payment-success`,
            cancelUrl: `${window.location.origin}/payment-cancel`,
            metadata: {
              enabled: true,
              // userId: userIdToUse, // Use validated userId
              status: "PAYMENT_PENDING",
              paymentType: "pay_now",
              appointmentDate: appointmentDateISO,
              appointmentTime: selectedTime,
              propertyAddress: property.address || '',
            },
            pendingBookingData: bookingData,
          }),
        });
  
        const { checkoutUrl, error: checkoutError } = await createCheckoutResponse.json();
  
        if (checkoutError || !checkoutUrl) {
          throw new Error(checkoutError || 'Failed to create checkout session');
        }
  
        console.log('Calendar - Redirecting to Stripe Checkout (Pay Now):', checkoutUrl);
        window.location.href = checkoutUrl;
        return; // Exit after redirect
      }
  
      /* =====================
         CHALLENGE FLOW
      ====================== */
      if (property.paymentMethod === 'challenge') {
        console.log("Challenge Flow - property.paymentMethod:", property.paymentMethod);


  const approvalToken = localStorage.getItem('approvalToken') || sessionStorage.getItem('approvalToken');
  
  if (!approvalToken) {
    toast({
      title: "Approval Token Missing",
      description: "Approval token not found. Please use the link from your email.",
      variant: "destructive",
    });
    setIsLoading(false);
    return;
  }
  
        
        // Save booking data to localStorage for retrieval after payment
        const bookingData = {
          ...appointmentData,
          approvalToken: approvalToken,
          timestamp: new Date().toISOString()
        };
        
        // Log for debugging
        // console.log('Challenge Flow - Saving bookingData with userId:', userIdToUse);
        console.log('Challenge Flow - Full bookingData:', bookingData);
        
        localStorage.setItem('pending-booking-data', JSON.stringify(bookingData));
        localStorage.setItem('property', JSON.stringify(property));
        sessionStorage.setItem('checkoutUrlMethod', 'challenge');
        localStorage.setItem('checkoutUrlMethod', 'challenge');
  
        // Create Checkout Session dynamically
        const createCheckoutResponse = await fetch(`${functionUrl}/createCheckoutSession`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: fullPrice,
            currency: 'usd',
            customerEmail: contact.payerEmail,
            customerName: `${contact.firstName} ${contact.lastName}`,
            successUrl: `${window.location.origin}/payment-success`,
            cancelUrl: `${window.location.origin}/payment-cancel`,
            metadata: {
              enabled: true,
              // token: userIdToUse, 
              status: "PAYMENT_PENDING",
              paymentType: "challenge",
              appointmentDate: appointmentDateISO,
              appointmentTime: selectedTime,
              propertyAddress: property.address || '',
            },
            pendingBookingData: bookingData, 
          }),
        });
  
        const { checkoutUrl, error: checkoutError } = await createCheckoutResponse.json();
  
        if (checkoutError || !checkoutUrl) {
          throw new Error(checkoutError || 'Failed to create checkout session');
        }
  
        console.log('Calendar - Redirecting to Stripe Checkout (Challenge):', checkoutUrl);
        window.location.href = checkoutUrl;
        return; 
      }
  
      // If payment method is not recognized
      throw new Error(`Unknown payment method: ${property.paymentMethod}`);
  
    } catch (error) {
      console.error('Calendar - Error in handleContinueToPayment:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const progressSteps = [
    { id: 'address', title: 'Address', description: 'Enter location', completed: true },
    { id: 'details', title: 'Property Details', description: 'Verify information', completed: true },
    { id: 'contact', title: 'Contact Info', description: 'Enter details', completed: true },
    { id: 'booking', title: 'Schedule', description: 'Pay & book', current: true }
  ];

  return (
    <div className="min-h-screen bg-white from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <ProgressSteps steps={progressSteps} />
          
          <GuidanceCard
            title="Final Step: Schedule Your Inspection"
            description="Choose your preferred date and time from the available slots. Weekend and holiday inspections have special scheduling."
            nextAction="Select a date and time, then proceed to payment"
            variant="success"
          >
            <div className="text-xs text-green-700 bg-white/30 p-2 rounded mt-2">
              <strong>Available:</strong> Monday-Friday (8am-5pm) starting tomorrow. Same-day and weekend inspections are not available. Real-time availability managed through inspector dashboard.
            </div>
          </GuidanceCard>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black mb-2">
              Inspection Calendar
            </h1>
            <p className="text-lg text-slate-600">
              Select your preferred inspection date and time
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
           
 <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Choose Inspection Date
                </CardTitle>
                <CardDescription>
                  Select an available date for your inspection (weekdays only, starting tomorrow)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">


                      <Input 
                        type="date"
                        value={selectedDate} 
                        min={new Date().toISOString().split("T")[0]}
                        max={maxDate}
                        // className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-primary focus:border-primary focus:ring-primary"
                        onChange={(e) => {
                          const dateValue = e.target.value;
                          if (isWeekendDate(dateValue)) {
                            toast({
                              title: "Weekend Not Available",
                              description: "Please select a weekday (Monday-Friday) for your inspection.",
                              variant: "destructive",
                            });
                            alert("Weekend Not Available");
                            setSelectedDate('');  
                            setSelectedTime('');
                          } 
                          else {
                            setSelectedDate(dateValue);
                            setSelectedTime('');
                          }
                        }} 
                      />
             

                {selectedDate && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <ClockIcon className="h-4 w-4" />
                        Select Time
                      </label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger className="h-12 cursor-pointer text-lg bg-blue-50 border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                          <SelectValue placeholder="🕐 Choose a time slot" className="cursor-pointer text-blue-800 font-medium" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time} className="text-lg py-3">
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedTime && (
                      <div className="p-4 rounded-lg border border-green-800 dark:border-green-800">
                        <p className="text-green-800 font-medium">
                          📅 {format(selectedDate, 'EEEE, MMMM do, yyyy')} at {selectedTime}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inspection Summary</CardTitle>
                <CardDescription>
                  Review your booking details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-600  uppercase tracking-wide">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <UserIcon className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">
                        {contact.firstName && contact.lastName 
                          ? `${contact.firstName} ${contact.lastName}` 
                          : 'Not provided'}
                      </span>
                      {contact.relationshipToBuyer && (
                        <Badge variant="secondary" className="text-xs capitalize ml-2">
                          {contact.relationshipToBuyer}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MailIcon className="h-4 w-4 text-slate-500" />
                      <span>{contact.payerEmail || 'Not provided'}</span>
                    </div>
                    {contact.reportEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <MailIcon className="h-4 w-4 text-slate-500" />
                        <span className="text-xs">Report: {contact.reportEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <PhoneIcon className="h-4 w-4 text-slate-500" />
                      <span>{contact.phoneNumber || 'Not provided'}</span>
                    </div>
                    {contact.occupancyStatus && (
                      <div className="flex items-center gap-2 text-sm">
                        <UsersIcon className="h-4 w-4 text-slate-500" />
                        <span className="capitalize">Occupancy: {contact.occupancyStatus}</span>
                      </div>
                    )}
                    {contact.wantsRealtorNotification && contact.realtorName && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Realtor Information
                        </p>
                        <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                          <div>{contact.realtorName}</div>
                          {contact.realtorEmail && <div>{contact.realtorEmail}</div>}
                          {contact.realtorPhone && <div>{contact.realtorPhone}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-semibold text-sm text-slate-600 uppercase tracking-wide">
                    Property Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPinIcon className="h-4 w-4 text-slate-500 mt-0.5" />
                      <span>{property.address || 'Address not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HomeIcon className="h-4 w-4 text-slate-500" />
                      <span>{property.propertyType || 'Single Family Residence'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      {property.propertyType === 'Single Family Residence' ? (
                        <>
                          <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-slate-500">ft²</span>
                          <span>{(property.squareFootage || 0).toLocaleString()} ft²</span>
                        </>
                      ) : property.propertyType === 'Multi-Family Residence' ? (
                        <>
                          <UsersIcon className="h-4 w-4 text-slate-500" />
                          <span>{property.multiFamilyUnits || 'Multi-Unit'}</span>
                        </>
                      ) : property.propertyType === 'Mobile/Manufactured Home' ? (
                        <>
                          <HomeIcon className="h-4 w-4 text-slate-500" />
                          <span>{property.mobileHomeType || 'Single Wide'}</span>
                        </>
                      ) : property.propertyType === 'Commercial' ? (
                        <>
                          <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-slate-500">🏢</span>
                          <span>Commercial Property</span>
                        </>
                      ) : (
                        <>
                          <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-slate-500">ft²</span>
                          <span>{(property.squareFootage || 0).toLocaleString()} ft²</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {selectedDate && selectedTime && (
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="font-semibold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Inspection Schedule
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-slate-500" />
                      <span>{format(selectedDate, 'EEEE, MMMM do, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="h-4 w-4 text-slate-500" />
                      <span>{selectedTime}</span>
                    </div>
                  </div>
                )}

                {/* <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                      {property.isDiscount ? `$${property.challengePrice}` : `$${fullPrice}`}
                    </Badge>
                  </div>
                </div> */}
                   <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                      {property.paymentMethod === 'challenge' && property.isDiscount && property.challengePrice 
                        ? `$${property.challengePrice}` 
                        : `$${fullPrice}`}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
             
            ) : (
            <Button
              onClick={handleContinueToPayment}
              disabled={!selectedDate || !selectedTime}
              className="w-full md:w-auto px-8 py-3 text-lg font-semibold bg-[#C21F1F] text-white"
              size="lg"
            >
              Confirm Booking Summary
            </Button>
            )}
          </div>
        </div>
      </div>
      
      <Dialog open={showWaitingListDialog} onOpenChange={setShowWaitingListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Join Waiting List
            </DialogTitle>
            <DialogDescription>
              {selectedDate && `${format(selectedDate, 'EEEE, MMMM do, yyyy')} is fully booked. Join the waiting list and we'll notify you within 24 hours if a slot becomes available.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="waitlist-email">Email Address</Label>
              <Input
                id="waitlist-email"
                type="email"
                value={waitingListEmail}
                onChange={(e) => setWaitingListEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="waitlist-phone">Phone Number (Optional)</Label>
              <Input
                id="waitlist-phone"
                type="tel"
                value={waitingListPhone}
                onChange={(e) => setWaitingListPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">24-Hour Notification</p>
                  <p>You'll receive an email or text if a slot opens up. You'll have priority booking for that time slot.</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowWaitingListDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleWaitingListSubmit}
                disabled={!waitingListEmail}
                className="flex-1"
              >
                Join Waiting List
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}