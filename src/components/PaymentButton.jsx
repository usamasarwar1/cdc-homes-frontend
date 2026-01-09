import React, { useState } from 'react';
import { Copy, Edit, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialoag';
import { useToast } from '../hooks/use-toast';

export function PaymentButton({ amount, type, description, buttonText, className = "" }) {
  const isPayLater = type === 'pay-later';
  const uniqueId = description.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const defaultUrl = isPayLater ? `https://your-invoice-platform.com/invoice-${uniqueId}` : `https://buy.stripe.com/payment-${uniqueId}`;
  const [paymentUrl, setPaymentUrl] = useState(defaultUrl);
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(paymentUrl);
  const { toast } = useToast();

  const getButtonStyle = () => {
    switch (type) {
      case 'pay-now':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'pay-later':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'challenge':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'addon':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const handleSaveUrl = () => {
    setPaymentUrl(editUrl);
    setIsEditing(false);
    toast({
      title: "Payment Link Updated",
      description: `Updated ${description} payment link successfully`,
    });
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      toast({
        title: "Copied to Clipboard",
        description: "Payment link URL copied successfully",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handlePayment = () => {
    if (paymentUrl.includes('YOUR_PAYMENT_LINK_HERE') || paymentUrl.includes('YOUR_INVOICE_LINK')) {
      const linkType = isPayLater ? "invoice/contract link" : "payment link";
      toast({
        title: `${isPayLater ? 'Invoice' : 'Payment'} Link Not Set`,
        description: `Please set your ${linkType} first`,
        variant: "destructive",
      });
      return;
    }
    window.open(paymentUrl, '_blank');
  };

  const displayText = buttonText || `${type === 'pay-later' ? `Schedule ${amount} Inspection` : `Book ${amount} Now`}`;

  return (
    <div className="space-y-2">
      <button
        onClick={handlePayment}
        className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${getButtonStyle()} ${className}`}
      >
        {displayText}
      </button>
      
      <div className="flex gap-1">
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 border-gray-300">
              <Edit className="w-3 h-3 mr-1 " />
              Edit URL
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Edit {isPayLater ? 'Invoice/Contract' : 'Payment'} Link - {description}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {isPayLater ? 'Invoice/Contract Link URL' : 'Stripe Payment Link URL'}
                </label>
                <Input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder={isPayLater ? "https://your-invoice-platform.com/invoice-link" : "https://buy.stripe.com/your_payment_link"}
                  className="mt-1"
                />
              </div>
              <div className="text-xs text-gray-500">
                <p><strong>Amount:</strong> {amount}</p>
                <p><strong>Type:</strong> {description}</p>
                <p><strong>Example:</strong> {isPayLater ? 'https://quickbooks.intuit.com/invoice/abc123' : 'https://buy.stripe.com/test_4gwXXX123abc'}</p>
                {isPayLater && (
                  <p className="text-orange-600 mt-2"><strong>Note:</strong> This generates an invoice/contract link, not a payment link</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveUrl} className="flex-1 text-white bg-[#dc2626]">
                  Save Link
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="border-gray-300" size="sm" onClick={handleCopyUrl}>
          <Copy className="w-3 h-3" />
        </Button>

        <Button variant="outline" className="border-gray-300" size="sm" onClick={handlePayment}>
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}