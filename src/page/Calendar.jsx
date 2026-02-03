import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/Badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialoag';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/Label';
import { CalendarIcon, ClockIcon, MapPinIcon, HomeIcon, UserIcon, PhoneIcon, MailIcon, UsersIcon, Clock, AlertCircle } from 'lucide-react';
import { format, addDays, isWeekend, isSaturday, isToday } from 'date-fns';
import { useToast } from '../hooks/use-toast.js';
import { auth } from '../firebase';
import { ProgressSteps, GuidanceCard } from '../components/ui/Progress-steps';
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';




export default function InspectionCalendar() {
  const functionUrl = import.meta.env.VITE_BASE_URL;
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [property, setProperty] = useState({});
  const [contact, setContact] = useState({});
  const [showWaitingListDialog, setShowWaitingListDialog] = useState(false);
  const [waitingListEmail, setWaitingListEmail] = useState('');
  const [waitingListPhone, setWaitingListPhone] = useState('');
  const [loginUser, setLoginUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [blockedSlotsByDate, setBlockedSlotsByDate] = useState({});

  /**
   * Gets all time slots for a given date (regardless of availability)
   */
  const getTimeSlots = (date) => {
    if (!date) return [];
    
    // Convert string date to Date object if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isSaturday(dateObj)) {
      return [
        '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM',
        '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM',
        '1:30 PM', '2:00 PM'
      ];
    } else {
      return [
        '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
        '5:00 PM'
      ];
    }
  };

  /**
   * Parses inceptionDate string format: "Thursday, February 12th, 2026 at 3:30 PM"
   * Returns a Date object or null if parsing fails
   */
  const parseInceptionDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
      return null;
    }

    try {
      // Remove ordinal suffixes (st, nd, rd, th) from day
      const cleaned = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
      
      // Parse the date string
      // Format: "Thursday, February 12, 2026 at 3:30 PM"
      const dateMatch = cleaned.match(/(\w+day),\s+(\w+)\s+(\d+),\s+(\d+)\s+at\s+(\d+):(\d+)\s+(AM|PM)/i);
      
      if (!dateMatch) {
        console.warn('Failed to parse date string:', dateString);
        return null;
      }

      const [, , monthName, day, year, hour, minute, ampm] = dateMatch;
      
      const months = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
      };
      
      const month = months[monthName.toLowerCase()];
      if (month === undefined) {
        console.warn('Invalid month name:', monthName);
        return null;
      }

      let hour24 = parseInt(hour, 10);
      if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
        hour24 = 0;
      }

      const date = new Date(
        parseInt(year, 10),
        month,
        parseInt(day, 10),
        hour24,
        parseInt(minute, 10),
        0,
        0
      );

      // Validate the date
      if (isNaN(date.getTime())) {
        console.warn('Invalid date created from:', dateString);
        return null;
      }

      return date;
    } catch (error) {
      console.error('Error parsing inceptionDate:', error, dateString);
      return null;
    }
  };

  /**
   * Calculates blocked time slots based on bookings
   * Each booking blocks a 3-hour window (the booking time + 2 more hours)
   * Returns an object mapping date strings (YYYY-MM-DD) to arrays of blocked time strings
   */
  const calculateBlockedSlots = (bookingsData) => {
    const blocked = {};

    bookingsData.forEach((booking) => {
      if (!booking.inceptionDate) return;

      const bookingDate = parseInceptionDate(booking.inceptionDate);
      if (!bookingDate) return;

      // Get date string in YYYY-MM-DD format
      const dateKey = format(bookingDate, 'yyyy-MM-dd');
      
      // Get the booking time in 12-hour format (e.g., "3:30 PM")
      const bookingHour = bookingDate.getHours();
      const bookingMinute = bookingDate.getMinutes();
      
      // Convert to 12-hour format
      let hour12 = bookingHour % 12;
      if (hour12 === 0) hour12 = 12;
      const ampm = bookingHour >= 12 ? 'PM' : 'AM';
      const minuteStr = bookingMinute.toString().padStart(2, '0');
      const bookingTimeStr = `${hour12}:${minuteStr} ${ampm}`;

      // Initialize array for this date if it doesn't exist
      if (!blocked[dateKey]) {
        blocked[dateKey] = [];
      }

      // Calculate the 3-hour window
      // Block the booking time and the next 2 hours
      const blockedTimes = [];
      
      // Get all time slots for this date to find which ones to block
      const testDate = new Date(bookingDate);
      testDate.setHours(0, 0, 0, 0);
      const allTimeSlots = getTimeSlots(testDate);
      
      // Find the index of the booking time in the time slots array
      const bookingTimeIndex = allTimeSlots.findIndex(slot => slot === bookingTimeStr);
      
      if (bookingTimeIndex !== -1) {
        // Block the booking time and the next 2 consecutive slots
        for (let i = 0; i < 6 && bookingTimeIndex + i < allTimeSlots.length; i++) {
          const blockedTime = allTimeSlots[bookingTimeIndex + i];
          if (blockedTime && !blocked[dateKey].includes(blockedTime)) {
            blocked[dateKey].push(blockedTime);
          }
        }
      } else {
        // Fallback: manually calculate the 3-hour window
        // Block booking time, +1 hour, +2 hours
        blocked[dateKey].push(bookingTimeStr);
        
        // Calculate next hour
        const nextHour = new Date(bookingDate);
        nextHour.setHours(nextHour.getHours() + 1);
        let nextHour12 = nextHour.getHours() % 12;
        if (nextHour12 === 0) nextHour12 = 12;
        const nextAmpm = nextHour.getHours() >= 12 ? 'PM' : 'AM';
        const nextMinuteStr = nextHour.getMinutes().toString().padStart(2, '0');
        const nextTimeStr = `${nextHour12}:${nextMinuteStr} ${nextAmpm}`;
        if (!blocked[dateKey].includes(nextTimeStr)) {
          blocked[dateKey].push(nextTimeStr);
        }
        
        // Calculate +2 hours
        const next2Hour = new Date(bookingDate);
        next2Hour.setHours(next2Hour.getHours() + 2);
        let next2Hour12 = next2Hour.getHours() % 12;
        if (next2Hour12 === 0) next2Hour12 = 12;
        const next2Ampm = next2Hour.getHours() >= 12 ? 'PM' : 'AM';
        const next2MinuteStr = next2Hour.getMinutes().toString().padStart(2, '0');
        const next2TimeStr = `${next2Hour12}:${next2MinuteStr} ${next2Ampm}`;
        if (!blocked[dateKey].includes(next2TimeStr)) {
          blocked[dateKey].push(next2TimeStr);
        }
      }
    });

    return blocked;
  };

  /**
   * Checks if a time slot is blocked for a given date
   */
  const isTimeSlotBlocked = (date, timeSlot) => {
    if (!date || !timeSlot) return false;
    
    // Convert date to YYYY-MM-DD format
    let dateKey;
    if (typeof date === 'string') {
      // If it's already in YYYY-MM-DD format, use it directly
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        dateKey = date;
      } else {
        // Otherwise, parse it as a date string
        const dateObj = new Date(date);
        dateKey = format(dateObj, 'yyyy-MM-dd');
      }
    } else {
      dateKey = format(date, 'yyyy-MM-dd');
    }
    
    const blockedSlots = blockedSlotsByDate[dateKey] || [];
    const isBlocked = blockedSlots.includes(timeSlot);
    
    // Debug logging
    if (isBlocked) {
      console.log(`Time slot ${timeSlot} is blocked for ${dateKey}`, { blockedSlots, timeSlot });
    }
    
    return isBlocked;
  };

  /**
   * Checks if a date is fully booked (all time slots are blocked)
   */
  const isDateFullyBooked = (date) => {
    if (!date) return false;
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const timeSlotsForDate = getTimeSlots(dateObj);
    
    if (timeSlotsForDate.length === 0) return true; // No slots available (e.g., weekend)
    
    const dateKey = format(dateObj, 'yyyy-MM-dd');
    const blockedSlots = blockedSlotsByDate[dateKey] || [];
    
    // Check if all time slots are blocked
    return timeSlotsForDate.every(slot => blockedSlots.includes(slot));
  };

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

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
  //     if (!currentUser) {
  //       setUser(null);
  //       return;
  //     }

  //     try {
  //       const token = localStorage.getItem('approvalToken') || sessionStorage.getItem('approvalToken');
  //       setToken(token)
  //     } catch (err) {
  //       console.error("Error fetching user role", err);
  //       setCurrentUserId(currentUser.uid);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const inspectionDates = await getDocs(collection(db, "inspectionDates"));
        const inspectionDatesData = inspectionDates.docs.map(doc => doc.data());
        
        console.log("Raw bookings data:", inspectionDatesData);
        
        setBookings(inspectionDatesData);
        
        // Calculate blocked slots based on 3-hour window rule
        const blocked = calculateBlockedSlots(inspectionDatesData);
        setBlockedSlotsByDate(blocked);
        
        console.log("Blocked slots by date:", blocked);
        console.log("Blocked slots keys:", Object.keys(blocked));
        console.log("Sample blocked slots:", {
          '2026-02-12': blocked['2026-02-12'],
          '2026-02-17': blocked['2026-02-17']
        });
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
  
    fetchBookings();
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

    if(bookingData && bookingData.isDiscount && propertyData.paymentMethod === 'challenge'){
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
    
    if (bookingData && bookingData.property && paymentMethod === 'challenge') {
      if (bookingData.isDiscount === true && bookingData.property.challengePrice) {
        return bookingData.property.challengePrice;
      } 
    }
    
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

  // Get time slots and filter out blocked ones
  const getAvailableTimeSlots = (date) => {
    const allSlots = getTimeSlots(date);
    if (!date) return allSlots;
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dateKey = format(dateObj, 'yyyy-MM-dd');
    const blockedSlots = blockedSlotsByDate[dateKey] || [];
    
    return allSlots.filter(slot => !blockedSlots.includes(slot));
  };

  const timeSlots = getTimeSlots(selectedDate);
  const availableTimeSlots = getAvailableTimeSlots(selectedDate);

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
        const allSlots = getTimeSlots(date);
        totalSlots = allSlots.length;
        
        // Calculate available slots by subtracting blocked slots
        const dateKey = format(date, 'yyyy-MM-dd');
        const blockedSlots = blockedSlotsByDate[dateKey] || [];
        availableSlots = Math.max(0, totalSlots - blockedSlots.length);
      }
      
      let status;
      if (availableSlots === 0) {
        status = 'unavailable';
      } else if (availableSlots <= totalSlots * 0.3) {
        status = 'limited';
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
    return dayOfWeek === 0 || dayOfWeek === 6; 
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Convert string to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (dateObj < today) return true;
    
    if (isToday(dateObj)) return true; 
    
    if (dateObj.getDay() === 0 || dateObj.getDay() === 6) return true;
    
    const maxDate = addDays(today, 14);
    if (dateObj > maxDate) return true;
    
    // Check if date is fully booked
    if (isDateFullyBooked(dateObj)) return true;
    
    return false;
  };

  const customDayRenderer = (day, modifiers) => {
    const availability = getDateAvailability(day);
    const isPastDate = day < new Date();
    const isTodayDate = isToday(day);
    const isFullyBooked = isDateFullyBooked(day);
    
    let className = '';
    
    if (isPastDate) {
      className = 'text-gray-400 bg-gray-100';
    } else if (isTodayDate) {
      className = 'border-2 border-blue-500 bg-blue-50 text-blue-700 font-semibold';
    } else if (isFullyBooked) {
      // Fully booked dates should appear dimmed
      className = 'bg-gray-100 hover:bg-gray-200 text-gray-400 border-gray-300 opacity-50 cursor-not-allowed';
    } else if (availability) {
      switch (availability.status) {
        case 'available':
          className = 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300';
          break;
        case 'limited':
          className = 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300';
          break;
        case 'unavailable':
          className = 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300 opacity-50';
          break;
      }
    }
    
    return (
      <div className={`relative w-full h-full flex items-center justify-center p-2 rounded ${className}`}>
        <span className="text-base font-medium">{day.getDate()}</span>
        {isFullyBooked && (
          <span className="absolute top-0 right-0 text-xs text-red-500">✕</span>
        )}
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
      
      if (!selectedDate || !selectedTime) {
        setIsLoading(false);
        toast({
          title: "Selection Required",
          description: "Please select both a date and time for your inspection.",
          variant: "destructive",
        });
        return;
      }
      
      const bookingDataFromToken = JSON.parse(sessionStorage.getItem('bookingDataUsingToken') || 'null');
      setToken(bookingDataFromToken)
      const appointmentData = {
        date: selectedDate,
        time: selectedTime,
        formattedDateTime: `${format(selectedDate, 'EEEE, MMMM do, yyyy')} at ${selectedTime}`,
        property: property,
        verifiedContact: contact,
        fullPrice,
        isDiscount: false,
        status: 'SUCCESS',
      };
  
      const appointmentDateISO = selectedDate instanceof Date 
        ? selectedDate.toISOString() 
        : new Date(selectedDate).toISOString();
  
      /* =====================
         PAY NOW FLOW
      ====================== */
      if (property.paymentMethod === 'pay_now') {
        const bookingData = {
          ...appointmentData,
          timestamp: new Date().toISOString()
        };
        
        
        localStorage.setItem('pending-booking-data', JSON.stringify(bookingData));
        sessionStorage.setItem('checkoutUrlMethod', 'pay_now');
        localStorage.setItem('checkoutUrlMethod', 'pay_now');
  
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
        return; 
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
  
        
        const bookingData = {
          ...appointmentData,
          approvalToken: approvalToken,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('pending-booking-data', JSON.stringify(bookingData));
        localStorage.setItem('property', JSON.stringify(property));
        sessionStorage.setItem('checkoutUrlMethod', 'challenge');
        localStorage.setItem('checkoutUrlMethod', 'challenge');
  
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
                        onChange={(e) => {
                          const dateValue = e.target.value;
                          const dateObj = new Date(dateValue);
                          const dateKey = dateValue; // HTML date input returns YYYY-MM-DD format
                          
                          // Debug: Log when date is selected
                          const blockedForDate = blockedSlotsByDate[dateKey] || [];
                          if (blockedForDate.length > 0) {
                            setError(true);
                            setErrorMessage(`${dateKey} is fully booked. All time slots are unavailable.`);
                            // setErrorDate(dateKey);
                            // console.log(`📅 Selected date ${dateKey} has ${blockedForDate.length} blocked slots:`, blockedForDate);
                          } else {
                            // console.log(`📅 Selected date ${dateKey} has no blocked slots (all slots available)`);
                            // setErrorDate(null);
                          }
                          
                          if (isWeekendDate(dateValue)) {
                            toast({
                              title: "Weekend Not Available",
                              description: "Please select a weekday (Monday-Friday) for your inspection.",
                              variant: "destructive",
                            });
                            setSelectedDate('');  
                            setSelectedTime('');
                          } 
                          else if (isDateFullyBooked(dateObj)) {
                            toast({
                              title: "Date Fully Booked",
                              description: "This date is fully booked. Please select another date or join the waiting list.",
                              variant: "destructive",
                            });
                            setSelectedDate('');  
                            setSelectedTime('');
                            setError(true);
                            setErrorMessage(`${dateKey} is fully booked. All time slots are unavailable.`);
                            // setErrorDate(dateKey);
                          }
                          else {
                            setSelectedDate(dateValue);
                            setSelectedTime('');
                          }
                        }} 
                      />
                      {selectedDate && isDateFullyBooked(new Date(selectedDate)) && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800">
                            ⚠️ This date is fully booked. All time slots are unavailable.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => setShowWaitingListDialog(true)}
                          >
                            Join Waiting List
                          </Button>
                        </div>
                      )}
             

                {selectedDate && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <ClockIcon className="h-4 w-4" />
                        Select Time
                      </label>
                      <Select 
                        value={selectedTime} 
                        onValueChange={(value) => {
                          // Double-check that the selected time is not blocked
                          const dateKey = typeof selectedDate === 'string' 
                            ? selectedDate 
                            : format(new Date(selectedDate), 'yyyy-MM-dd');
                          
                          const blockedSlots = blockedSlotsByDate[dateKey] || [];
                          const isBlocked = blockedSlots.includes(value);
                          
                          console.log('Attempting to select time:', { 
                            value, 
                            dateKey, 
                            blockedSlots: blockedSlots.length > 0 ? blockedSlots : 'No blocked slots for this date',
                            isBlocked,
                            allBlockedDates: Object.keys(blockedSlotsByDate)
                          });
                          
                          if (!isBlocked) {
                            setSelectedTime(value);
                          } else {
                            toast({
                              title: "Time Slot Unavailable",
                              description: "This time slot is already booked. Please select another time.",
                              variant: "destructive",
                            });
                            // Don't set the time if it's blocked
                            setSelectedTime('');
                          }
                        }}
                      >
                        {/* {error && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-800">
                              {error}
                            </p>
                          </div>
                        )} */}
                        <SelectTrigger className="h-12 cursor-pointer text-lg bg-blue-50 border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                          <SelectValue placeholder="🕐 Choose a time slot" className="cursor-pointer text-blue-800 font-medium" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => {
                            const isBlocked = isTimeSlotBlocked(selectedDate, time);
                            
                            // Debug: Log blocked status for each time slot (only for dates with bookings)
                            if (selectedDate) {
                              const dateKey = typeof selectedDate === 'string' 
                                ? selectedDate 
                                : format(new Date(selectedDate), 'yyyy-MM-dd');
                              
                              // Only log if this date has blocked slots or if we're checking a potentially blocked time
                              const blockedSlots = blockedSlotsByDate[dateKey] || [];
                              if (blockedSlots.length > 0) {
                                console.log(`⏰ Time slot ${time} for ${dateKey}:`, { 
                                  isBlocked, 
                                  blockedSlots: blockedSlots.length > 0 ? blockedSlots : 'No blocked slots',
                                  timeSlot: time,
                                  dateHasBookings: blockedSlots.length > 0
                                });
                              }
                            }
                            
                            // Render blocked slots as disabled
                            if (isBlocked) {
                              return (
                                <SelectItem 
                                  key={time} 
                                  value={time} 
                                  disabled={true}
                                  className="text-lg py-3"
                                >
                                  {time}
                                </SelectItem>
                              );
                            }
                            
                            return (
                              <SelectItem 
                                key={time} 
                                value={time} 
                                className="text-lg py-3"
                              >
                                {time}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {availableTimeSlots.length === 0 && timeSlots.length > 0 && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800">
                            ⚠️ All time slots for this date are currently booked. Please select another date.
                          </p>
                        </div>
                      )}
                         {/* {error && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-800">
                              {errorMessage}
                            </p>
                          </div>
                        )} */}
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

            {error && !selectedDate && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-lg text-red-800">
                              {errorMessage}
                            </p>
                          </div>
                        )}

           {!error && selectedDate && (
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

                  <div className="border-t pt-4">
                 <div className="flex justify-between items-center">
                   <span className="font-semibold">Total Amount</span>
                   <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                     {property.paymentMethod === 'challenge' && property.isDiscount && property.challengePrice 
                       ? `$${Number(property.challengePrice).toFixed(2)}` 
                       : `$${Number(fullPrice).toFixed(2)}`}
                   </Badge>
                 </div>
               </div>
             </CardContent>
           </Card>
           )}
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
      
      {/* <Dialog open={showWaitingListDialog} onOpenChange={setShowWaitingListDialog}>
        <DialogContent className="bg-white">
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
      </Dialog> */}
    </div>
  );
}