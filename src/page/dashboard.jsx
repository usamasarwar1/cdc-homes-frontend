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

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]); 
  const [isDataloading, setIsDataloading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [error, setError] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalInspections: 0,
    completedPayments: 0,
    pendingApprovals: 0
  });
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
    
    
        const bookingsSnap = await getDocs(collection(db, "bookings"));
        const allBookings = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
        const isPaid = (booking) =>
          booking.paymentStatus === "completed" ||
          booking.status?.toLowerCase() === "paid";
    
        const isPending = (booking) =>
          booking.status === "pending_verification" ||
          booking.status === "approval_pending";
    
        const totalRevenue = allBookings
          .filter(isPaid)
          .reduce((sum, b) => sum + (b.fullPrice || 0), 0);
    
        const totalInspections = allBookings.length;
    
        const completedPayments = allBookings.filter(isPaid).length;
        const pendingApprovals = allBookings.filter(isPending).length;
    
        setAnalytics({
          totalRevenue,
          totalInspections,
          completedPayments,
          pendingApprovals,
        });
    
        setAllBookings(allBookings);
    
        // const tableBookings = allBookings.filter((el)=> el.status === 'pending_verification');
        const tableBookings = allBookings.filter(isPending);
        setBookings(tableBookings);
    
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError(error.message);
      } finally {
        setIsDataloading(false);
      }
    };
    

    return () => unsubscribe();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    
    const search = searchEmail.toLowerCase();
    const payerEmail = booking.user?.toLowerCase() || ""; 
  
    return payerEmail.includes(search);
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
    
    if(!booking.date && !booking.time && booking.isDiscount) {
      return '50% Discount';
    }
    return 'N/A';
  };

  const getBookingPrice = (booking) => {
    if(booking.status === 'pending_verification') {
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
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-5">
  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
    <p className="text-2xl font-bold text-gray-900 mt-2">
      ${analytics.totalRevenue.toFixed(2)}
    </p>
    <p className="text-xs text-gray-500 mt-1">From completed payments</p>
  </div>

  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="text-sm font-medium text-gray-600">Total Inspections</h3>
    <p className="text-2xl font-bold text-gray-900 mt-2">
      {analytics.totalInspections}
    </p>
    <p className="text-xs text-gray-500 mt-1">All time bookings</p>
  </div>

  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="text-sm font-medium text-gray-600">Completed Payments</h3>
    <p className="text-2xl font-bold text-green-600 mt-2">
      {analytics.completedPayments}
    </p>
    <p className="text-xs text-gray-500 mt-1">
      {analytics.totalInspections > 0 
        ? `${((analytics.completedPayments / analytics.totalInspections) * 100).toFixed(1)}% completion rate`
        : 'No data'}
    </p>
  </div>

  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="text-sm font-medium text-gray-600">Pending Bookings</h3>
    <p className="text-2xl font-bold text-orange-600 mt-2">
      {analytics.pendingApprovals}
    </p>
    <p className="text-xs text-gray-500 mt-1">Awaiting verification</p>
  </div>
</div>


      {error && <p className="text-red-500">{error}</p>}
      <Card>
        <CardContent>
          <div className="mb-6 mt-6">
            <h2 className='mb-3 text-gray-700 font-bold text-lg'>Pending Bookings</h2>
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
                  {/* <th className="px-3 py-2 text-left min-w-[200px]">Date & Time</th> */}
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

                      {/* <td className="px-3 py-2 text-gray-700 whitespace-normal break-words">
                        {getBookingDate(booking)}
                      </td> */}

                      <td className="px-3 py-2 text-gray-700 font-medium">
                        {getBookingPrice(booking)}
                      </td>

                      {/* <td className="px-3 py-2 text-gray-700 font-medium">
                        {getPaymentMethod( booking.property.isDiscount, booking.isDiscount)}
                      </td> */}
                      
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

export default Dashboard