import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { Button } from '../components/ui/Button';
import {
    collection,
    getDocs,
    getDoc,
    doc,
    updateDoc,
  } from "firebase/firestore";
import { auth } from '../firebase'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/input'
import { Loader2, Search, CheckCircle2, XCircle, Package } from 'lucide-react'
import { Eye } from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../hooks/use-toast'
import { useNavigate } from 'react-router-dom';

const PropertyConfirmation = () => {
  const [bookings, setBookings] = useState([]);
  const [fulfillmentstatus, setFulfillmentstatus] = useState(false);
  const [rejectionstatus, setRejectionstatus] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [isDataloading, setIsDataloading] = useState(false);
  const [error, setError] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setAuthInitialized(true);
      if (currentUser) {
        getBookings();
      } else {
        setError("User not authenticated");
        setIsDataloading(false);
      }
    });

    const getBookings = async () => {
      try {
        setIsDataloading(true);
    
        const currentUser = auth.currentUser;
        if (!currentUser) return;
    
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (!userSnap.exists()) return;
    
        if (userSnap.data().role !== "admin") {
          console.warn("Not authorized");
          return;
        }
  
        // console.log("currentUser", currentUser);
    
        const bookingsSnap = await getDocs(collection(db, "bookings"));
    
        const bookings = bookingsSnap?.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
    
        // const userIds = [...new Set(bookings.map(b => b.userId))];
  
        const userIds = [
          ...new Set(
            bookings
              .map(b => b.userId)
              .filter(uid => typeof uid === 'string' && uid.trim() !== '')
          )
        ];
    
        const usersSnap = await Promise.all(
          userIds.map(uid => getDoc(doc(db, "users", uid)))
        );
    
    
        const finalBookings = bookings.map(booking => ({
          ...booking,
        }));
  
        console.log("0000",finalBookings);
        
    
        setBookings(finalBookings);
    
      } catch (error) {
        setError(error.message);
      } finally {
        setIsDataloading(false);
      }
    };

    return () => unsubscribe();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const search = searchEmail.toLowerCase();
  
    const payerEmail =
      booking.verifiedContact?.payerEmail?.toLowerCase() ||
      booking.user?.email?.toLowerCase() ||
      '';
  
    const userName = booking.user?.name?.toLowerCase() || '';
  
    return (
      payerEmail.includes(search) ||
      userName.includes(search)
    );
  });
  
  

  const handleView = async (booking) => {
    sessionStorage.setItem('booking', JSON.stringify(booking));
    navigate(`/admin/property-details/${booking.id}`);
  };

  const getBookingDate = (booking) => {
    if (booking.formattedDateTime) {
      return booking.formattedDateTime;
    }
    if (booking.date) {
      return booking.date;
    }

    // console.log(booking.isDiscount);
    
    if(!booking.date && !booking.time && booking.isDiscount) {
      return '50% Discount';
    }
    return 'N/A';
  };

  const getBookingPrice = (booking) => {
    // console.log("booking", booking);
    if(booking.isDiscount) {
      return `$${booking.property.challengePrice}`;
    } else {
      return `$${booking.fullPrice}`;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_verification':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case 'PAID':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">PAID</Badge>;
      case 'approval_pending':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">Approval Pending</Badge>;
        case 'Approved':
          return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className=" bg-red-50 text-red-700 border-red-300">Rejected</Badge>;
      case 'fulfilled':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Fulfilled</Badge>;
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  const getPaymentMethod = (isDiscount, isDiscount2) => {
    if (isDiscount === true || isDiscount2 === true ) {
      return 'Challenge';
    }
    return 'Pay Now';
  };

  const getEmail = (booking) => {
    if (booking.verifiedContact?.payerEmail) {
      return booking.verifiedContact.payerEmail;
    }
  
    if (booking.user) {
      return booking.user;
    }
  
    return 'N/A';
  };
  

  return (
    <div className=" ">
      <h1 className="text-2xl font-bold mb-4">Property Confirmation</h1>

      {error && <p className="text-red-500">{error}</p>}
      <Card>
        <CardContent>
          <div className="mb-6 mt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="pl-9 rounded-lg border-gray-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 border-b border-gray-400">
                <tr className="text-muted-foreground font-semibold uppercase tracking-wide">
                   <th className="px-3 py-2 text-left min-w-[50px]">Email</th>
                  <th className="px-3 py-2 text-left min-w-[300px]">Property Address</th>
                  <th className="px-3 py-2 text-left min-w-[200px]">Date & Time</th>
                  <th className="px-3 py-2 text-left">Price</th>
                  <th className="px-3 py-2 text-left">Property Type</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const isPendingVerification = booking.status === 'pending_verification';
                  const isSuccess = booking.status === 'SUCCESS' || (!booking.status && booking.verifiedContact);
                  
                  return (
                    <tr
                      key={booking.id}
                      className="border-b border-gray-400 transition hover:bg-muted/20"
                    >

                    <td className="px-3 py-2 text-gray-700 whitespace-normal break-words">
                        {/* {booking.user?.email || 'N/A'} */}
                        {getEmail(booking)}
                      </td>

                      <td className="px-3 py-2 text-gray-700 whitespace-normal break-words">
                        {booking.property?.address || 'N/A'}
                      </td>

                      <td className="px-3 py-2 text-gray-700 whitespace-normal break-words">
                        {getBookingDate(booking)}
                      </td>

                      <td className="px-3 py-2 text-gray-700 font-medium">
                        {getBookingPrice(booking)}
                      </td>

                      <td className="px-3 py-2 text-gray-700 font-medium">
                        {getPaymentMethod( booking.property.isDiscount, booking.isDiscount)}
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {getStatusBadge(booking.status)}
                      </td>

                      <td className="px-3 py-2 text-gray-700">
                        <div className="flex justify-center gap-2">

                              <Button 
                                 onClick={() => handleView(booking)}
                                 className="bg-[#007bff] hover:bg-blue-600 text-white">
                                   View
                              </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {isDataloading && !filteredBookings.length && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    </td>
                  </tr>
                )}

                {!isDataloading && filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted-foreground">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PropertyConfirmation