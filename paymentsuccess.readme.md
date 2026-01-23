import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, deleteField, limit } from 'firebase/firestore';
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

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        const checkoutUrlMethod =
          sessionStorage.getItem('checkoutUrlMethod') ||
          localStorage.getItem('checkoutUrlMethod');
    
        // Get userId from localStorage/sessionStorage
        const bookingDataFromToken = JSON.parse(
          sessionStorage.getItem('bookingDataUsingToken') || 'null'
        );
        const userData = JSON.parse(
          sessionStorage.getItem('userData') || localStorage.getItem('userData') || 'null'
        );
        const userId = bookingDataFromToken?.userId || userData?.userId;
        
        if (!userId) {
          throw new Error('User ID not found');
        }
        
        // Poll for booking with retries (webhook might take a few seconds)
        let bookingFound = false;
        let attempts = 0;
        const maxAttempts = 10; // Try for up to 10 seconds
        
        while (!bookingFound && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between attempts
          
          const bookingsQuery = query(
            collection(db, 'bookings'),
            where('userId', '==', userId),
            where('status', 'in', ['PAID', 'Approved']),
            limit(1)
          );
          
          const querySnapshot = await getDocs(bookingsQuery);
          
          if (!querySnapshot.empty) {
            bookingFound = true;
            console.log('✅ Booking found:', querySnapshot.docs[0].id);
            break;
          }
          
          attempts++;
          console.log(`Waiting for booking... (attempt ${attempts}/${maxAttempts})`);
        }
        
        if (!bookingFound) {
          console.warn('⚠️ Booking not found after polling. Webhook may still be processing.');
          // Don't throw error - just show success message
          // The webhook will eventually process it
        }
  
        // Cleanup
        localStorage.removeItem('pending-booking-data');
        localStorage.removeItem('approvalToken');
        localStorage.removeItem('checkoutUrlMethod');
        sessionStorage.removeItem('checkoutUrlMethod');
  
        setIsProcessing(false);
  
        toast({
          title: "Payment Successful!",
          description: bookingFound 
            ? "Your booking has been confirmed." 
            : "Payment received. Your booking confirmation will be processed shortly.",
        });
  
      } catch (err) {
        console.error('Payment processing error:', err);
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
  }, [toast]);
  

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
          {/* <Button onClick={() => navigate('/booking-summary')} className="w-full">
            View Booking Summary
          </Button> */}
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