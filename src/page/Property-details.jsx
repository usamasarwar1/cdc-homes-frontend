import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Separator } from '../components/ui/separator'
import { useToast } from '../hooks/use-toast.js'
import { db } from '../firebase'
import { useParams } from 'react-router-dom'
import { 
  Home, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Building2,
  Globe,
  Award,
  Users as UsersIcon,
  Loader2
} from 'lucide-react'
import {
  getDoc,
  doc,
  updateDoc,
  serverTimestamp, 
} from "firebase/firestore";

const PropertyDetails = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMessageBox, setShowMessageBox] = useState(false)
  const [message, setMessage] = useState('')
  const [messageError, setMessageError] = useState("")
  const [messageLoading, setMessageLoading] = useState(false) 

  useEffect(() => {
    getBooking();
  }, [bookingId, toast]);

  const formatDate = (date) => {
    if (!date) return 'N/A'
    if (date.toDate) {
      return date.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    return 'N/A'
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A'
    return dateTime
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_verification':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending Verification</Badge>
      case 'PAID':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">PAID</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Approved</Badge>
      case 'approval_pending':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">Approval Pending</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rejected</Badge>
      case 'fulfilled':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Fulfilled</Badge>
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>
    }
  }

  const getCustomerName = (booking) => {
    if (booking.verifiedContact) {
      const firstName = booking.verifiedContact.firstName || ''
      const lastName = booking.verifiedContact.lastName || ''
      return `${firstName} ${lastName}`.trim() || 'N/A'
    }
    if (booking.user?.name) {
      return booking.user.name
    }
    return 'N/A'
  }

  const getCustomerEmail = (booking) => {
    return booking.verifiedContact?.payerEmail || 
           booking.verifiedContact?.reportEmail || 
           booking.user?.email || 
           'N/A'
  }

  const getBooking = async () => {
    try {
      setLoading(true);
  
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingSnap = await getDoc(bookingRef);

      // console.log(bookingSnap.data());
      
  
      if (!bookingSnap.exists()) {
        console.error('Booking not found');
        setLoading(false);
        return;
      }
  
      const bookingData = bookingSnap.data();
  
      const combinedBooking = {
        id: bookingSnap.id,
        isDiscount: bookingData.isDiscount,
        updatedAt: bookingData.updatedAt,
        createdAt: bookingData.createdAt,
        property: bookingData.property,
        inspector: bookingData.inspector,
        status: bookingData.status,
        additionalContact: bookingData.property.additionalContact,
        ...(bookingData.verifiedContact && { verifiedContact: bookingData.verifiedContact }),
        ...(bookingData.fullPrice && { fullPrice: bookingData.fullPrice }),
        ...(bookingData.date && { date: bookingData.date }),
        ...(bookingData.time && { time: bookingData.time }),
        ...(bookingData.formattedDateTime && { formattedDateTime: bookingData.formattedDateTime }),
      };

      // console.log("combinedBooking", combinedBooking);
  
      setBooking(combinedBooking);
  
    } catch (error) {
      console.error('Error getting booking:', error);
      toast({
        title: "Error",
        description: "Failed to load booking details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleApprove = async (bookingId) => {
    setLoading(true);
  
    try {
      const bookingRef = doc(db, "bookings", bookingId);
  
      const token = crypto.randomUUID();
  
      await updateDoc(bookingRef, {
        status: "approval_pending",
        approvalToken: token,
        approvalTokenUsed: false,
        approvalTokenExpiresAt: Date.now() + 1000 * 60 * 60 * 24, 
        updatedAt: serverTimestamp(),
      });
  
      const bookingSnap = await getDoc(bookingRef);
  
      if (!bookingSnap.exists()) return;
  
      const bookingData = bookingSnap.data();

      // console.log("bookingData", bookingData);
      

      let userEmail;
      let userName;
      if (bookingData.user) {
        userEmail = bookingData.user;
        userName = bookingData.user.split("@")[0] || null;
      }

      if (bookingData.verifiedContact?.payerEmail) {
        userEmail = booking.verifiedContact.payerEmail;
        userName = `${booking.verifiedContact.firstName} ${booking.verifiedContact.lastName} ` ;
      }
      
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
      const url = `${baseUrl}/contact-verification?token=${token}`;

      // console.log({
      //   url,
      //   email: userEmail,
      //   name: userName,
      // });


      const response = await fetch(`${VITE_BASE_URL}/propertyVerificationApproval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          name: userName,
          token,
          url,
        }),
      });
  
  const data = await response.json();

  // console.log("---email--",data);
  
  
  
      toast({
        title: "Approval Email Sent",
        description: "User has been notified.",
      });
  
      getBooking();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (bookingId) => {
    setLoading(true);
    try {
      
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingSnap = await getDoc(bookingRef);      
  
      if (!bookingSnap.exists()) {
        console.error('Booking not found');
        setLoading(false);
        return;
      }
  
      const bookingData = bookingSnap.data();
      
      let userEmail;
      let userName;
      if (bookingData.user) {
        userEmail = bookingData.user;
        // userName = bookingData.name || "user";
        userName = bookingData.user.split("@")[0] || null;
      }

      if (bookingData.verifiedContact?.payerEmail) {
        userEmail = booking.verifiedContact.payerEmail;
        userName = `${booking.verifiedContact.firstName} ${booking.verifiedContact.lastName} ` ;
      }
  

      const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
      const response = await fetch(`${VITE_BASE_URL}/rejectPropertyVerification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          name: userName,
        }),
      });
  
  const data = await response.json();


  if(response.ok){
      await updateDoc(bookingRef, {
        status: "rejected",
        updatedAt: new Date(),
      });
  }
  
      toast({
        title: "Booking Rejected",
        description: "The booking has been rejected.",
      });
      
      getBooking();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdditionInfo = async () => {
    if (!message || message.trim() === "") {
      setMessageError("Message can't be empty")
      return
    }
  
    setMessageError("")
    setMessageLoading(true)
  
    try {
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
  
      for (const contact of booking.additionalContact) {  
        const response = await fetch(`${VITE_BASE_URL}/additionalAcknowledgementReport`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: contact.email,
            name: `${contact.firstName} ${contact.lastName}`,
            message,
          }),
        });
  
        await response.json();      
      }
      setMessage("")
      setShowMessageBox(false)
      alert('Acknowledgement message send successfully')
    } catch (error) {
      console.error("Error sending emails:", error)
    } finally {
      setMessageLoading(false)
    }
  };
  



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">Unable to load booking details.</p>
            <Button onClick={() => navigate('/property-confirmated')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isDiscount = booking.isDiscount
  const isPendingVerification = booking.status === 'pending_verification'

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
    
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          {getStatusBadge(booking.status)}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-lg">
                    {booking.property?.address || 'N/A'}
                  </p>
                  {booking.property?.street && (
                    <p className="text-sm text-gray-600 mt-1">
                      {booking.property.street}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Property Type</p>
                  <p className="font-medium text-gray-900">
                    {booking.property?.propertyType || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Square Footage</p>
                  <p className="font-medium text-gray-900">
                    {booking.property?.squareFootage?.toLocaleString() || 'N/A'} ft²
                  </p>
                </div>
                {booking.property?.pricingTier && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pricing Tier</p>
                    <p className="font-medium text-gray-900">
                      {booking.property.pricingTier}
                    </p>
                  </div>
                )}
            
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Payment & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isDiscount ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <p className="font-semibold text-yellow-900">Challenge Payment (50% Discount)</p>
                    </div>
                    <p className="text-sm text-yellow-800">
                      This booking is using the challenge payment method and requires verification.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                   {!booking.isDiscount && (
                     <div className="bg-gray-50 rounded-lg p-4">
                     <p className="text-sm text-gray-500 mb-1">Base Price</p>
                     <p className="text-2xl font-bold text-gray-900">
                       ${booking.property?.basePrice?.toLocaleString() || 'N/A'}
                     </p>
                   </div>
                   )}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600 mb-1">Challenge Price (50%)</p>
                      <p className="text-2xl font-bold text-blue-700">
                        ${booking.property?.challengePrice?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    {booking.property?.payNowPrice && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-600 mb-1">Pay Now Price</p>
                        <p className="text-2xl font-bold text-green-700">
                          ${booking.property.payNowPrice.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-green-900">Pay Now Payment</p>
                    </div>
                    <p className="text-sm text-green-800">
                      Full payment has been processed successfully.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Total Amount Paid</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${booking.fullPrice?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isDiscount && booking.inspector && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Inspector Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium text-gray-900">
                      { `${booking.inspector.firstName} ${booking.inspector.lastName}` || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">License Numbers</p>
                    <p className="font-medium text-gray-900">
                      {booking.inspector.licenseNumbers || 'N/A'}
                    </p>
                  </div>
                  <div className="grid md:grid-cols-1 gap-4">
                  <p className="text-sm text-gray-500 mb-1">License Status</p>
                    <p className="font-medium text-gray-900 p-3 bg-yellow-50 rounded text-yellow-900">
                      {booking.inspector.licenceStatus
  ? booking.inspector.licenceStatus
      .split('_')                
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')                 
  : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">Website URL</p>
                    <a
                      href={
                        booking.inspector.websiteUrl?.startsWith('http://') || 
                        booking.inspector.websiteUrl?.startsWith('https://')
                          ? booking.inspector.websiteUrl
                          : booking.inspector.websiteUrl
                          ? `https://${booking.inspector.websiteUrl}`
                          : '#'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Globe className="w-4 h-4" />
                      {booking.inspector.websiteUrl || 'N/A'}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!isDiscount && booking.verifiedContact && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Scheduled Date & Time</p>
                    <p className="font-medium text-gray-900 text-lg">
                      {formatDateTime(booking.formattedDateTime) || formatDate(booking.date)}
                    </p>
                    {booking.time && (
                      <p className="text-sm text-gray-600 mt-1">
                        Time: {booking.time}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

{booking.additionalContact?.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <UsersIcon className="w-5 h-5 text-indigo-600" />
        Additional Contacts
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-6">
      {/* Table of additional contacts */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                First Name
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                Last Name
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {booking.additionalContact.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2 text-gray-900">
                  {contact.firstName}
                </td>
                <td className="border border-gray-200 px-4 py-2 text-gray-900">
                  {contact.lastName}
                </td>
                <td className="border border-gray-200 px-4 py-2 text-gray-900">
                  {contact.email}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Separator />

{!showMessageBox &&  (
  <Button
  variant="outline"
  className="w-full text-indigo-700 hover:bg-indigo-50"
  onClick={() => setShowMessageBox(true)}
>
  {/* {showMessageBox ? 'Cancel' : 'Send Message to Additional Contacts'} */}
  Send Message to Additional Contacts
</Button>

)}
    
    {showMessageBox && (
  <div className="space-y-3 mt-4">
    <textarea
      className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      rows={3}
      placeholder="Type your message here..."
      value={message}
      required
      // onChange={(e) => setMessage(e.target.value)}
      onChange={(e) => {
        setMessage(e.target.value)
        if (messageError) setMessageError("") 
      }}
    />

    {messageError && (
      <p className="text-sm text-red-600">{messageError}</p>
    )}
  </div>
)}

   {showMessageBox && (
  !messageLoading ? (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        className="w-full text-indigo-700 hover:bg-indigo-50"
        onClick={() => handleAdditionInfo()}
      >
        Send
      </Button>
      <Button
        variant="outline"
        className="w-full text-red-700 hover:bg-red-50"
        onClick={() => setShowMessageBox(false)}
      >
        Cancel
      </Button>
    </div>
  ) : (
    <div className="flex justify-center items-center py-4">
      {/* Replace this with your actual animation */}
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  )
)}

    </CardContent>
  </Card>
)}





          {!isDiscount && booking.verifiedContact && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-indigo-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium text-gray-900">
                      {getCustomerName(booking)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="font-medium text-gray-900">
                        {getCustomerEmail(booking)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="font-medium text-gray-900">
                        {booking.verifiedContact.phoneNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Relationship to Buyer</p>
                    <Badge variant="secondary" className="capitalize">
                      {booking.verifiedContact.relationshipToBuyer || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Occupancy Status</p>
                    <Badge variant="secondary" className="capitalize">
                      {booking.verifiedContact.occupancyStatus || 'N/A'}
                    </Badge>
                  </div>
                  {booking.verifiedContact.reportEmail && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Report Email</p>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="font-medium text-gray-900">
                          {booking.verifiedContact.reportEmail}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {booking.verifiedContact.wantsRealtorNotification && booking.verifiedContact.realtorName && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-3">Realtor Information</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Realtor Name</p>
                          <p className="font-medium text-gray-900">
                            {booking.verifiedContact.realtorName}
                          </p>
                        </div>
                        {booking.verifiedContact.realtorEmail && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Realtor Email</p>
                            <p className="font-medium text-gray-900">
                              {booking.verifiedContact.realtorEmail}
                            </p>
                          </div>
                        )}
                        {booking.verifiedContact.realtorPhone && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Realtor Phone</p>
                            <p className="font-medium text-gray-900">
                              {booking.verifiedContact.realtorPhone}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                <p className="font-mono text-xs text-gray-700 break-all">
                  {booking.id}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <Badge variant={isDiscount || booking.property.isDiscount ? "outline" : "default"} className={isDiscount || booking.property.isDiscount ? "bg-yellow-50 text-yellow-700" : "bg-green-100 text-green-700"}>
                  {isDiscount || booking.property.isDiscount ? 'Challenge (50%) Off' : 'Pay Now'}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500 mb-1">Created At</p>
                <p className="font-medium text-gray-900">
                  {formatDate(booking.createdAt)}
                </p>
              </div>
              {booking.updatedAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(booking.updatedAt)}
                    </p>
                  </div>
                </>
              )}
              {booking.user && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">User Account</p>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">
                        {booking.user.name || booking.user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.user.email}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {isPendingVerification && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-900">Action Required</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-800 mb-4">
                  This booking requires verification before it can be approved.
                </p>
                <div className="space-y-2">
                  <Button onClick={() => handleApprove(booking.id)} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Approve Booking
                  </Button>
                  <Button onClick={() => handleReject(booking.id)} variant="destructive" className="w-full text-white bg-[#dc2626] hover:bg-[#dc2626]/90">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                    Reject Booking
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default PropertyDetails