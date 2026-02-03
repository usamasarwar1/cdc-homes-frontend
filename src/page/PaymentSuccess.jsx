import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast.js';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';



export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        localStorage.removeItem('pending-booking-data');
        localStorage.removeItem('approvalToken');
        localStorage.removeItem('checkoutUrlMethod');
        sessionStorage.removeItem('checkoutUrlMethod');
        sessionStorage.removeItem('verified-contact-data');
        localStorage.removeItem('verified-contact-data'); 
        sessionStorage.removeItem('bookingDataUsingToken');
        localStorage.removeItem('bookingDataUsingToken');
        sessionStorage.removeItem('confirmedProperty');
        localStorage.removeItem('confirmedProperty');
        sessionStorage.removeItem('property');
        localStorage.removeItem('property');
        sessionStorage.removeItem('paymentMethod');
        localStorage.removeItem('paymentMethod');
        localStorage.removeItem('challengeAvailable');
        localStorage.removeItem('assessmentProgress');

        setIsProcessing(false);

        toast({
          title: 'Payment Successful!',
          description: 'Your payment has been received. If a booking was involved, it will be processed shortly.',
        });
      } catch (err) {
        console.error('Payment success page error:', err);
        setIsProcessing(false);
        toast({
          title: 'Payment Processed',
          description: 'Your payment went through, but we could not run the usual follow-up steps on this page.',
        });
      }
    };

    run();
  }, [toast]);
  

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-lg font-medium">Processing your payment...</p>
              <p className="text-sm text-gray-500">Please wait a moment.</p>
            </div>
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
          Your payment has been processed. You may safely close this page or return home.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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