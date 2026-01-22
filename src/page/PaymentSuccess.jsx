import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../hooks/use-toast';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        const checkoutUrlMethod =
          sessionStorage.getItem('checkoutUrlMethod') ||
          localStorage.getItem('checkoutUrlMethod');
  
        const approvalToken = localStorage.getItem('approvalToken');
        const pendingBookingData = JSON.parse(
          localStorage.getItem('pending-booking-data')
        );
  
        if (!pendingBookingData) {
          throw new Error('No pending booking data found');
        }
  
        const {
          property,
          date,
          time,
          formattedDateTime,
          verifiedContact,
          userId,
        } = pendingBookingData;
  
        /* =====================
           PAY NOW FLOW
        ====================== */
        // if (checkoutUrlMethod === 'pay_now') {
        //   const bookingsRef = collection(db, 'bookings');
  
        //   await addDoc(bookingsRef, {
        //     ...pendingBookingData,
        //     status: 'PAID',
        //     paymentStatus: 'completed',
        //     stripeSessionId: sessionId || null,
        //     createdAt: serverTimestamp(),
        //     paidAt: serverTimestamp(),
        //   });
        // }

        if (checkoutUrlMethod === 'pay_now') {
            if (!sessionId) {
              throw new Error('Stripe session ID missing');
            }
          
            const existingBookingQuery = query(
              collection(db, 'bookings'),
              where('stripeSessionId', '==', sessionId)
            );
          
            const existingSnapshot = await getDocs(existingBookingQuery);
          
            if (!existingSnapshot.empty) {
              console.warn('Booking already exists for this Stripe session');
              return;
            }
          
            const bookingsRef = collection(db, 'bookings');
          
            await addDoc(bookingsRef, {
              ...pendingBookingData,
              status: 'PAID',
              paymentStatus: 'completed',
              stripeSessionId: sessionId,
              createdAt: serverTimestamp(),
              paidAt: serverTimestamp(),
            });
          }
  
        /* =====================
           CHALLENGE FLOW
        ====================== */
        if (checkoutUrlMethod === 'challenge') {
          if (!approvalToken) {
            throw new Error('Approval token missing');
          }
  
          const bookingsQuery = query(
            collection(db, 'bookings'),
            where('approvalToken', '==', approvalToken)
          );
  
          const querySnapshot = await getDocs(bookingsQuery);
  
          if (querySnapshot.empty) {
            throw new Error('Booking not found for approval token');
          }
  
          const bookingDoc = querySnapshot.docs[0];
          const bookingRef = doc(db, 'bookings', bookingDoc.id);
  
          const updatedProperty = {
            ...property,
            challengePrice: bookingDoc.data().property.challengePrice,
          };
  
          await updateDoc(bookingRef, {
            property: updatedProperty,
            isDiscount: true,
            status: 'Approved',
            updatedAt: serverTimestamp(),
            approvalTokenUsed: true,
            approvalToken: deleteField(),
            approvalTokenExpiresAt: deleteField(),
            date,
            seesionId:sessionId,
            time,
            formattedDateTime,
            verifiedContact,
            userId,
          });
        }
  
        // Cleanup
        localStorage.removeItem('pending-booking-data');
        localStorage.removeItem('approvalToken');
        localStorage.removeItem('checkoutUrlMethod');
  
        setIsProcessing(false);
  
        toast({
          title: "Payment Successful!",
          description: "Your booking has been confirmed.",
        });
  
      } catch (err) {
        console.error(err);
        setError(err.message);
        setIsProcessing(false);
  
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    };
  
    processPaymentSuccess();
  }, [sessionId]);
  

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-lg font-medium">Processing your payment...</p>
              <p className="text-sm text-gray-500">Please wait while we confirm your booking.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Processing Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your booking has been confirmed and payment has been processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* {sessionId && (
            <div className="text-sm text-gray-600">
              <p>Session ID: <code className="bg-gray-100 px-2 py-1 rounded">{sessionId}</code></p>
            </div>
          )} */}
          <Button onClick={() => navigate('/booking-summary')} className="w-full">
            View Booking Summary
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="w-full"
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}