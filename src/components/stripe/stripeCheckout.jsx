import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/use-toast.js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Payment Form Component
function PaymentForm({ amount, onSuccess, onError, metadata = {} }) {

  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const functionUrl = import.meta.env.VITE_BASE_URL;
    try {
      // Step 1: Create Payment Intent on your backend
      const response = await fetch(`${functionUrl}/createPaymentIntent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'usd',
          metadata: metadata,
        }),
      });

      const { clientSecret, error: backendError } = await response.json();

      if (backendError) {
        throw new Error(backendError);
      }

      // Step 2: Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              // Add customer details if available
              // name: 'Customer Name',
              // email: 'customer@example.com',
            },
          },
        }
      );

      if (confirmError) {
        throw confirmError;
      }

      if (paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully.",
        });
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      setError(err.message);
      toast({
        title: "Payment Failed",
        description: err.message,
        variant: "destructive",
      });
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement options={cardElementOptions} />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full"
      >
        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Test card: 4242 4242 4242 4242 | Any future date | Any CVC
      </p>
    </form>
  );
}

// Main Checkout Component
export function StripeCheckout({ amount, onSuccess, onError, metadata }) {
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Stripe publishable key not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm 
        amount={amount} 
        onSuccess={onSuccess}
        onError={onError}
        metadata={metadata}
      />
    </Elements>
  );
}