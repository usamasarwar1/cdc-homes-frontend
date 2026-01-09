import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../components/Headers';
// import { getStripePaymentUrl } from '@/components/StripePaymentManager';

export default function PricingPage() {
  const [propertyData, setPropertyData] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    const storedData = localStorage.getItem('propertyData');
    if (storedData) {
      setPropertyData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const generatePaymentUrl = (price, paymentMethod, propertyType) => {
    const baseUrl = '/pricing';
    const method = paymentMethod;
    const amount = `$${price}`;
    return `${baseUrl}-${method}-${amount}`;
  };

  const getPricingTier = (propertyData) => {
    if (!propertyData) return null;
    
    const { propertyType, mobileHomeType, multiFamilyUnits, commercialType, squareFootage = 0 } = propertyData;
    
    if (propertyType === 'Mobile/Manufactured Home') {
      switch (mobileHomeType) {
        case 'Single Wide': return { payNow: 625, challenge: 312.5, tier: "Single Wide Mobile Home" };
        case 'Double Wide': return { payNow: 750, challenge: 375, tier: "Double Wide Mobile Home" };
        case 'Triple Wide': return { payNow: 800, challenge: 400, tier: "Triple Wide Mobile Home" };
        default: return { payNow: 625, challenge: 312.5, tier: "Mobile/Manufactured Home" };
      }
    }
    
    if (propertyType === 'Multi-Family Residence') {
      switch (multiFamilyUnits) {
        case '2 Units': return { payNow: 825, challenge: 412.5, tier: "2-Unit Multi-Family" };
        case '3 Units': return { payNow: 900, challenge: 450, tier: "3-Unit Multi-Family" };
        case '4 Units': return { payNow: 950, challenge: 475, tier: "4-Unit Multi-Family" };
        case '5 Units': return { payNow: 1050, challenge: 525, tier: "5-Unit Multi-Family" };
        case '6 Units': return { payNow: 1500, challenge: 750, tier: "6-Unit Multi-Family" };
        default: return { payNow: 825, challenge: 412.5, tier: "Multi-Family Residence" };
      }
    }
    
    if (propertyType === 'Commercial Property') {
      return { payNow: 1100, challenge: 550, tier: "Commercial Property" };
    }
    
    if (propertyType === 'Single Family Residence') {
      if (squareFootage <= 1200) {
        return { payNow: 575, challenge: 287.5, tier: `${squareFootage?.toLocaleString()} SF Single Family` };
      } else if (squareFootage <= 3000) {
        return { payNow: 650, challenge: 325, tier: `${squareFootage?.toLocaleString()} SF Single Family` };
      } else if (squareFootage <= 5000) {
        return { payNow: 725, challenge: 362.5, tier: `${squareFootage?.toLocaleString()} SF Single Family` };
      } else if (squareFootage <= 6000) {
        return { payNow: 800, challenge: 400, tier: `${squareFootage?.toLocaleString()} SF Single Family` };
      }
    }
    
    return null;
  };

  const PaymentButton = ({ price, paymentMethod, propertyInfo }) => {
    // console.log(price, paymentMethod, propertyInfo);
    
    const handlePaymentClick = () => {
      let paymentUrl;
      
      // Haider-dev ( i comment this code back in when Stripe will be configured)
    //   if (paymentMethod === 'challenge') {
    //     paymentUrl = getStripePaymentUrl(price, 'challenge');
    //   } else {
    //     paymentUrl = getStripePaymentUrl(price, 'paynow');
    //   }
      
    //   if (paymentUrl === '#payment-not-configured') {
    //     alert('Payment link not configured. Please set up Stripe payment links in the admin panel.');
    //     return;
    //   }
      
    //   // Store payment details for potential future use
    //   localStorage.setItem('selectedPayment', JSON.stringify({
    //     price,
    //     paymentMethod,
    //     propertyInfo,
    //     timestamp: new Date().toISOString()
    //   }));
      
      // Open payment URL in new tab
      window.open(paymentUrl, '_blank');
    };

    const buttonText = paymentMethod === 'paynow' ? 'Book Now' : '50% Challenge';
    const buttonStyle = paymentMethod === 'paynow' 
      ? 'bg-green-600 hover:bg-green-700' 
      : 'bg-purple-600 hover:bg-purple-700';

    return (
      <button
        onClick={handlePaymentClick}
        className={`${buttonStyle} cursor-pointer text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm w-full mt-2`}
        title={`Click to proceed with ${buttonText} option for $${price}`}
      >
        {buttonText} - ${price}
      </button>
    );
  };

  const pricing = getPricingTier(propertyData);

  return (
    <div className="min-h-screen bg-gray-50">
    
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-20">
            <div className="flex items-center space-x-6">
              <img src="/attached_assets/CDC Logo_1753482679929.png" alt="CDC Logo" className="h-16 w-auto" />
              <div className="text-center">
                <div className="hidden md:block">
                  <div className="text-2xl font-bold text-gray-900 tracking-tight">
                    CDC Home Inspections
                  </div>
                  <div className="text-sm text-gray-600">
                    Protecting Arizona Homeowners Since 2013
                  </div>
                </div>
                <div className="md:hidden">
                  <div className="text-xl font-bold text-gray-900">
                    CDC Home Inspections
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
          <Link to="/">
            <Button variant="outline" className="w-[255px] sm:w-fit mb-4 cursor-pointer border-gray-300 bg-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link to="/pricing-schedule">
            <Button variant="outline" className="mb-4 cursor-pointer bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
              View Complete Pricing Schedule
            </Button>
          </Link>
        </div>
        <div className="mb-8 max-w-4xl mx-auto">
          <details className="bg-gray-50 border border-gray-200 rounded-lg">
            <summary className="cursor-pointer p-4 font-semibold text-lg text-gray-900 hover:bg-gray-100 rounded-lg">
              What's Included in Every Inspection
            </summary>
            <div className="p-6 bg-white border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Safety Inspection</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Pool barriers and gates</li>
                    <li>• Emergency equipment</li>
                    <li>• Safety covers and alarms</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Equipment & Structure</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Pump and filtration systems</li>
                    <li>• Electrical components</li>
                    <li>• Pool/spa structure and finishes</li>
                  </ul>
                </div>
              </div>
            </div>
          </details>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Inspection Pricing</h2>
          {propertyData ? (
            <div className="bg-blue-50 rounded-lg p-6 max-w-3xl mx-auto mb-6">
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div>
                  <div className="text-sm text-blue-600 font-medium mb-1">Property Type</div>
                  <div className="text-lg text-blue-900 font-semibold">{propertyData.propertyType}</div>
                  {propertyData.mobileHomeType && (
                    <div className="text-blue-700">{propertyData.mobileHomeType}</div>
                  )}
                  {propertyData.multiFamilyUnits && (
                    <div className="text-blue-700">{propertyData.multiFamilyUnits}</div>
                  )}
                </div>
                <div>
                  {propertyData.squareFootage && (
                    <>
                      <div className="text-sm text-blue-600 font-medium mb-1">Square Footage</div>
                      <div className="text-lg text-blue-900 font-semibold">{propertyData.squareFootage.toLocaleString()} sq ft</div>
                    </>
                  )}
                </div>
              </div>
              {propertyData.street && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="text-sm text-blue-600 font-medium mb-1">Address</div>
                  <div className="text-blue-700">{propertyData.street}, {propertyData.city}, {propertyData.state} {propertyData.zip}</div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional home inspection services with no hidden fees. Choose the payment option that works best for you.
            </p>
          )}
        </div>

        {propertyData && pricing ? (
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-center text-2xl text-blue-900">
                  Your Inspection Pricing
                </CardTitle>
                <p className="text-center text-blue-700">{pricing.tier}</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 gap-6">
                  
                  <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="text-3xl font-bold text-green-900 mb-2">${pricing.payNow}</div>
                    <div className="text-lg text-green-800 font-semibold mb-3">Book Now</div>
                    <div className="text-sm text-green-700 mb-4">Save money with advance payment</div>
                    <div 
                      onClick={() => {
                        const paymentUrl = getStripePaymentUrl(pricing.payNow, 'paynow');
                        if (paymentUrl === '#payment-not-configured') {
                          alert('Payment link not configured. Please set up Stripe payment links in the admin panel.');
                          return;
                        }
                        localStorage.setItem('selectedPayment', JSON.stringify({
                          price: pricing.payNow,
                          paymentMethod: 'paynow',
                          propertyInfo: pricing.tier,
                          timestamp: new Date().toISOString()
                        }));
                        window.open(paymentUrl, '_blank');
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors cursor-pointer text-center"
                      title={`Click to proceed with Pay Now option for $${pricing.payNow}`}
                    >
                      Book Now - ${pricing.payNow}
                    </div>
                  </div>

                  <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="text-lg text-blue-800 font-semibold mb-2">50% Off Challenge</div>
                    <div className="text-3xl font-bold text-blue-900 mb-2 prize-pulse-animation">${(pricing.payNow / 2).toFixed(2)}</div>
                    <div className="text-sm text-blue-700 mb-4">Find an inspector with matching credentials</div>
                    <Link 
                      to="/credential-comparison"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors inline-block"
                    >
                      Compare Credentials
                    </Link>
                  </div>


                </div>
                

              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {(!propertyData || propertyData.propertyType === 'Single Family Residence') && (
            <Card>
            <CardHeader>
              <CardTitle className="text-center">Single Family Residence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Up to 1,200 SF</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <PaymentButton price={575.00} paymentMethod="paynow" propertyInfo="Up to 1,200 SF Single Family" />
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">1,201 - 3,000 SF</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <PaymentButton price={650.00} paymentMethod="paynow" propertyInfo="1,201-3,000 SF Single Family" />
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">3,001 - 5,000 SF</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <PaymentButton price={725.00} paymentMethod="paynow" propertyInfo="3,001-5,000 SF Single Family" />
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">5,001 - 6,000 SF</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <PaymentButton price={800.00} paymentMethod="paynow" propertyInfo="5,001-6,000 SF Single Family" />
                  </div>
                </div>
              </div>
            </CardContent>
            </Card>
          )}

          {(!propertyData || propertyData.propertyType === 'Multi-Family Residence') && (
            <Card>
            <CardHeader>
              <CardTitle className="text-center">Multi-Family Residence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">2 Units</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <PaymentButton price={825.00} paymentMethod="paynow" propertyInfo="2-Unit Multi-Family" />
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">3 Units</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <PaymentButton price={900.00} paymentMethod="paynow" propertyInfo="3-Unit Multi-Family" />
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">4 Units</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <PaymentButton price={950.00} paymentMethod="paynow" propertyInfo="4-Unit Multi-Family" />
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">5 Units</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <PaymentButton price={1050.00} paymentMethod="paynow" propertyInfo="5-Unit Multi-Family" />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">6 Units</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <PaymentButton price={1325.00} paymentMethod="paynow" propertyInfo="6-Unit Multi-Family" />
                  </div>
                </div>
              </div>
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                <strong>Custom Pricing:</strong> When units have different square footage, per-unit pricing with volume discounts apply (20%-30% off based on unit count).
              </div>
            </CardContent>
            </Card>
          )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {(!propertyData || propertyData.propertyType === 'Mobile/Manufactured Home') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Mobile/Manufactured Home</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Single Wide</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <PaymentButton price={625.00} paymentMethod="paynow" propertyInfo="Single Wide Mobile Home" />
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Double Wide</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <PaymentButton price={750.00} paymentMethod="paynow" propertyInfo="Double Wide Mobile Home" />
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Triple Wide</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <PaymentButton price={800.00} paymentMethod="paynow" propertyInfo="Triple Wide Mobile Home" />
                  </div>
                </div>
              </div>
            </CardContent>
            </Card>
          )}

          {(!propertyData || propertyData.propertyType === 'Commercial Property') && (
            <Card>
            <CardHeader>
              <CardTitle className="text-center">Commercial Property</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-gray-900">Commercial Inspection</div>
                <div className="text-sm text-gray-600">Professional inspection services</div>
              </div>
              <div className="grid grid-cols-1 gap-3 mb-4">
                <PaymentButton price={1100.00} paymentMethod="paynow" propertyInfo="Commercial Property" />
              </div>
              <div className="mt-3 text-xs text-gray-600">
                <div className="font-semibold mb-1">Property Types:</div>
                <div>Office Space, Tenant Improvement, Warehouse, Airport, Loading Dock, Auto Shop, Laundromat, Retail Store</div>
              </div>
            </CardContent>
            </Card>
          )}
        </div>



        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">What's Included in Every Inspection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Structural Systems',
                'Electrical Systems',
                'Plumbing Systems',
                'HVAC Systems',
                'Exterior Components',
                'Interior Components',
                'Roofing Systems',
                'Insulation & Ventilation',
                'Built-in Appliances',
                'Detailed Written Report',
                'Digital Photo Documentation',
                'Same-Day Report Delivery'
              ].map((item) => (
                <div key={item} className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>



        <div className="mt-12 text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/what's-included" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Detailed What's Included
            </Link>
            <Link 
              to="/inspector" 
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Meet the Inspector
            </Link>
          </div>
        </div>


      </div>
    </div>
  );
}