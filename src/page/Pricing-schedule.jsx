import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PaymentButton } from '../components/PaymentButton';
// import { getStripePaymentUrl } from '@/components/StripePaymentManager';
// import { MultiFamilyPricing } from '/MultiFamilyPricing';
import { MultiFamilyPricing } from '../components/MultiFamilyPricing';
import { Download, DollarSign, Star, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function PricingSchedulePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const generatePDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
     <header className="bg-white shadow-sm print:hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
      
      <Link to="/" className="flex items-center gap-3">
        <img
          src="/attached_assets/CDC Logo_1753482679929.png"
          alt="CDC Logo"
          className="h-14 w-auto"
        />
        <div className="flex flex-col">
          <span className="text-lg md:text-xl font-bold text-gray-900">
            CDC Home Inspections
          </span>
          <span className="text-xs md:text-sm text-gray-600">
            Complete Pricing Schedule
          </span>
        </div>
      </Link>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Button
          onClick={generatePDF}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto bg-white border-gray-300"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>

        <Link to="/" className="w-full sm:w-auto">
          <Button
            variant="default"
            size="sm"
            className="w-full bg-[#dc2626] text-white hover:bg-red-600"
          >
            Back to Home
          </Button>
        </Link>
      </div>

    </div>
  </div>
</header>


      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Complete Pricing Schedule</h1>
          <p className="text-lg text-gray-600">All inspection services and payment options for Arizona properties</p>
          <div className="mt-4 text-sm text-gray-500">
            Effective Date: January 2025 | Valid for Maricopa and Pinal Counties
          </div>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Stripe Payment Link Setup</h3>
            <div className="text-sm text-blue-700 text-left max-w-4xl mx-auto space-y-2 mb-4">
              <p><strong>Step 1:</strong> Create payment links in your Stripe Dashboard for each price point below</p>
              <p><strong>Step 2:</strong> Copy each payment link URL and save them using the admin panel</p>
              <p><strong>Step 3:</strong> Test payments in Stripe's test mode before going live</p>
            </div>
            <div className="text-center">
              <Link to="/stripe-admin">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Manage Payment Links
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600 flex items-center">
              <DollarSign className="h-6 w-6 mr-2" />
              Single Family Homes
            </CardTitle>
            <p className="text-gray-600">Pricing based on square footage</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-center">Up to 1,200 sq ft</h4>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                  <div className="text-green-800 font-semibold mb-1">Book Now</div>
                  <div className="text-2xl font-bold text-green-600 mb-3">$575</div>
                  <PaymentButton
                    amount="$575"
                    type="pay-now"
                    description="Single Family ≤1,200 sq ft - Pay Now"
                  />
                </div>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-purple-800 font-semibold mb-1">50% Off Challenge</div>
                  <div className="text-2xl font-bold text-purple-600 mb-3">$287.50</div>
                  <PaymentButton
                    amount="$287.50"
                    type="challenge"
                    description="Single Family ≤1,200 sq ft - 50% Challenge"
                  />
                </div>

              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-center">1,201 - 3,000 sq ft</h4>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                  <div className="text-green-800 font-semibold mb-1">Book Now</div>
                  <div className="text-2xl font-bold text-green-600 mb-3">$650</div>
                  <PaymentButton
                    amount="$650"
                    type="pay-now"
                    description="Single Family 1,201-3,000 sq ft - Pay Now"
                  />
                </div>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-purple-800 font-semibold mb-1">50% Off Challenge</div>
                  <div className="text-2xl font-bold text-purple-600 mb-3">$325</div>
                  <PaymentButton
                    amount="$325"
                    type="challenge"
                    description="Single Family 1,201-3,000 sq ft - 50% Challenge"
                  />
                </div>

              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-center">3,001 - 5,000 sq ft</h4>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                  <div className="text-green-800 font-semibold mb-1">Book Now</div>
                  <div className="text-2xl font-bold text-green-600 mb-3">$725</div>
                  <PaymentButton
                    amount="$725"
                    type="pay-now"
                    description="Single Family 3,001-5,000 sq ft - Pay Now"
                  />
                </div>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-purple-800 font-semibold mb-1">50% Off Challenge</div>
                  <div className="text-2xl font-bold text-purple-600 mb-3">$362.50</div>
                  <PaymentButton
                    amount="$362.50"
                    type="challenge"
                    description="Single Family 3,001-5,000 sq ft - 50% Challenge"
                  />
                </div>

              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-center">5,001 - 6,000 sq ft</h4>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                  <div className="text-green-800 font-semibold mb-1">Book Now</div>
                  <div className="text-2xl font-bold text-green-600 mb-3">$800</div>
                  <PaymentButton
                    amount="$800"
                    type="pay-now"
                    description="Single Family 5,001-6,000 sq ft - Pay Now"
                  />
                </div>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-purple-800 font-semibold mb-1">50% Off Challenge</div>
                  <div className="text-2xl font-bold text-purple-600 mb-3">$400</div>
                  <PaymentButton
                    amount="$400"
                    type="challenge"
                    description="Single Family 5,001-6,000 sq ft - 50% Challenge"
                  />
                </div>

              </div>
            </div>

            <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-center">
              <div className="text-red-700 font-semibold text-lg">Properties Over 6,000 sq ft</div>
              <div className="text-red-600 mt-1">Call (800) 298-4250 for Custom Pricing</div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-orange-600 flex items-center">
              <DollarSign className="h-6 w-6 mr-2" />
              Multi-Family Properties
            </CardTitle>
            <p className="text-gray-600">Complete pricing options for all multi-unit scenarios with edit/copy payment links</p>
          </CardHeader>
          <CardContent>
            <MultiFamilyPricing />
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-600 flex items-center">
              <DollarSign className="h-6 w-6 mr-2" />
              Mobile/Manufactured Homes
            </CardTitle>
            <p className="text-gray-600">Fixed pricing by home type</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border-2 border-purple-200 rounded-lg p-6 text-center">
                <div className="text-purple-800 font-semibold mb-2">Single Wide</div>
                <div className="text-3xl font-bold text-purple-600 mb-3">$625</div>
                <div className="text-sm text-purple-700 mb-4">Updated pricing</div>
                <PaymentButton
                  amount="$625"
                  type="pay-now"
                  description="Single Wide Mobile Home - Pay Now"
                />
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <div className="text-purple-800 font-medium text-sm mb-2">50% Challenge</div>
                  <div className="text-xl font-bold text-purple-600 mb-2">$312.50</div>
                  <PaymentButton
                    amount="$312.50"
                    type="challenge"
                    description="Single Wide Mobile Home - 50% Challenge"
                  />
                </div>
              </div>

              <div className="bg-white border-2 border-purple-200 rounded-lg p-6 text-center">
                <div className="text-purple-800 font-semibold mb-2">Double Wide</div>
                <div className="text-3xl font-bold text-purple-600 mb-3">$750</div>
                <div className="text-sm text-purple-700 mb-4">Updated pricing</div>
                <PaymentButton
                  amount="$750"
                  type="pay-now"
                  description="Double Wide Mobile Home - Pay Now"
                />
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <div className="text-purple-800 font-medium text-sm mb-2">50% Challenge</div>
                  <div className="text-xl font-bold text-purple-600 mb-2">$375</div>
                  <PaymentButton
                    amount="$375"
                    type="challenge"
                    description="Double Wide Mobile Home - 50% Challenge"
                  />
                </div>
              </div>

              <div className="bg-white border-2 border-purple-200 rounded-lg p-6 text-center">
                <div className="text-purple-800 font-semibold mb-2">Triple Wide</div>
                <div className="text-3xl font-bold text-purple-600 mb-3">$800</div>
                <div className="text-sm text-purple-700 mb-4">Updated pricing</div>
                <PaymentButton
                  amount="$800"
                  type="pay-now"
                  description="Triple Wide Mobile Home - Pay Now"
                />
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <div className="text-purple-800 font-medium text-sm mb-2">50% Challenge</div>
                  <div className="text-xl font-bold text-purple-600 mb-2">$400</div>
                  <PaymentButton
                    amount="$400"
                    type="challenge"
                    description="Triple Wide Mobile Home - 50% Challenge"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600 flex items-center">
              <DollarSign className="h-6 w-6 mr-2" />
              Commercial Properties
            </CardTitle>
            <p className="text-gray-600">Flat rate pricing for commercial inspections</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pay Now */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <div className="text-green-800 font-semibold mb-2">Pay Now</div>
                <div className="text-3xl font-bold text-green-600 mb-3">$1,100</div>
                <div className="text-sm text-green-700 mb-4">Commercial Property</div>
                <PaymentButton
                  amount="$1,100"
                  type="pay-now"
                  description="Commercial Property - Pay Now"
                />
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 text-center">
                <div className="text-purple-800 font-semibold mb-2">50% Off Challenge</div>
                <div className="text-3xl font-bold text-purple-600 mb-3">$550</div>
                <div className="text-sm text-purple-700 mb-4">Commercial Property</div>
                <PaymentButton
                  amount="$550"
                  type="challenge"
                  description="Commercial Property - 50% Challenge"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-600 flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              50% Off Challenge Requirements
            </CardTitle>
            <p className="text-purple-700">Prove your inspector has the same credentials as Darrell Penn Jr.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-semibold text-purple-800">Required Credentials for 50% Discount:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Home Inspector License</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>General Contractor (KB-2)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>HVAC Licensed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Plumbing Licensed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Electrical Licensed</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Insurance Adjuster</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>IICRC Certified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Realtor License</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-purple-100 rounded-lg">
                <p className="text-purple-800 text-sm">
                  <strong>Verification Process:</strong> Submit inspector's full name and license numbers. 
                  Verification completed within 2 hours. If credentials are confirmed, 50% discount is applied automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-700">Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div>• All prices include standard home inspection services and detailed report</div>
              <div>• Service area: Maricopa County and Pinal County, Arizona</div>
              <div>• "Pay Now" pricing requires full payment at time of booking</div>

              <div>• 50% Off Challenge requires verification of all listed credentials within 2 hours</div>
              <div>• Pool/Spa inspection included with "Pay Now" option, +$50 for other payment methods</div>
              <div>• Termite inspection referral provided free with all inspections</div>
              <div>• Properties over 6,000 sq ft require custom pricing quote</div>
              <div>• Multi-family discounts apply to total inspection cost after per-unit calculation</div>
              <div>• All pricing subject to change with 30-day notice</div>
              <div>• Payment processing fees may apply for credit card transactions</div>
            </div>
          </CardContent>
        </Card>

        {/* Stripe Integration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-600 flex items-center">
              <DollarSign className="h-6 w-6 mr-2" />
              Stripe Payment Link Integration Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Step 1: Create Payment Links in Stripe Dashboard</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p>1. Go to your Stripe Dashboard → Products → Payment Links</p>
                <p>2. Click "Create payment link" for each price point</p>
                <p>3. Set the amount and description (e.g., "Home Inspection - Up to 1,200 sq ft - Pay Now")</p>
                <p>4. Copy the generated payment link URL</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Step 2: Replace Placeholder URLs in Code</h4>
              <div className="text-sm text-blue-700 space-y-2">
                <p>Replace <code className="bg-blue-100 px-1 rounded">YOUR_PAYMENT_LINK_HERE</code> with your actual Stripe payment links:</p>
                {/* <div className="bg-blue-100 p-3 rounded font-mono text-xs"> */}
                <div className="bg-blue-100 p-3 rounded font-mono text-xs break-words">
                  <p>{"onClick={() => window.open('https://buy.stripe.com/test_4gwXXX123abc', '_blank')}"}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Payment Links to Create</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold mb-2 text-green-800">Single Family (Pay Now):</h5>
                  <ul className="space-y-1 text-green-700">
                    <li>• $575 (≤1,200 sq ft)</li>
                    <li>• $650 (1,201-3,000 sq ft)</li>
                    <li>• $725 (3,001-5,000 sq ft)</li>
                    <li>• $800 (5,001-6,000 sq ft)</li>
                  </ul>
                  

                </div>
                <div>
                  <h5 className="font-semibold mb-2 text-green-800">Multi-Family (Fixed Rates):</h5>
                  <ul className="space-y-1 text-green-700">
                    <li>• $825.00 (2 Units)</li>
                    <li>• $900.00 (3 Units)</li>
                    <li>• $950.00 (4 Units)</li>
                    <li>• $1,050.00 (5 Units)</li>
                  </ul>
                  
                  <h5 className="font-semibold mb-2 text-green-800 mt-4">Mobile/50% Challenge:</h5>
                  <ul className="space-y-1 text-green-700">
                    <li>• $625/$312.50 (Single Wide)</li>
                    <li>• $750/$375 (Double Wide)</li>
                    <li>• $800/$400 (Triple Wide)</li>
                    <li>• Plus all 50% amounts</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Testing Instructions</h4>
              <div className="text-sm text-red-700 space-y-2">
                <p>1. Use Stripe test mode with test payment links first</p>
                <p>2. Test each amount to verify correct processing</p>
                <p>3. Switch to live mode only after thorough testing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Questions About Pricing?</h3>
              <div className="space-y-2 text-blue-800">
                <div className="font-medium text-lg">(800) 298-4250</div>
                <div>cdchomeinspections@gmail.com</div>
                <div className="text-sm">Monday - Friday: 8AM - 6PM</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="hidden print:block text-center text-xs text-gray-500 p-4">
        CDC Home Inspections | (800) 298-4250 | cdchomeinspections@gmail.com | Effective January 2025
      </div>
    </div>
  );
}