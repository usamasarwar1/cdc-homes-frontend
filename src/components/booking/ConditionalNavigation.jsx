import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ArrowLeft, User, FileText, DollarSign, Lock } from 'lucide-react';


export default function ConditionalNavigation({ 
  isVerified, 
  onViewInspector, 
  onViewIncludes, 
  onViewPricing,
  onBack 
}) {
  const [currentView, setCurrentView] = useState<'main' | 'inspector' | 'includes'>('main');

  if (currentView === 'inspector') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setCurrentView('main')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Meet Our Inspector</h2>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Darrell Penn</h3>
              <p className="text-gray-600 mb-4">Certified Home Inspector</p>
              <p className="text-sm text-gray-500">
                With years of experience and multiple certifications, Darrell provides 
                comprehensive and thorough home inspections you can trust.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onViewIncludes} className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            See What's Included
          </Button>
          <Button 
            onClick={onViewPricing}
            disabled={!isVerified}
            className={`flex-1 ${isVerified ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            {isVerified ? (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                View Pricing
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Pricing Locked
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (currentView === 'includes') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setCurrentView('main')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">What's Included</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Inspection</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Structural systems</li>
                <li>• Electrical systems</li>
                <li>• Plumbing systems</li>
                <li>• HVAC systems</li>
                <li>• Interior and exterior</li>
                <li>• Roof and attic</li>
                <li>• Foundation and basement</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Comprehensive written report</li>
                <li>• High-resolution photos</li>
                <li>• Priority recommendations</li>
                <li>• 24-hour delivery</li>
                <li>• Digital and email delivery</li>
                <li>• Follow-up consultation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onViewInspector} className="flex-1">
            <User className="h-4 w-4 mr-2" />
            Meet Our Inspector
          </Button>
          <Button 
            onClick={onViewPricing}
            disabled={!isVerified}
            className={`flex-1 ${isVerified ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            {isVerified ? (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                View Pricing
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Pricing Locked
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Continue!</h2>
        <p className="text-lg text-gray-600">
          Your details have been confirmed. Explore our services and view pricing when ready.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={onViewInspector}>
          <CardHeader className="text-center">
            <User className="h-12 w-12 mx-auto text-blue-600 mb-2" />
            <CardTitle>Meet Our Inspector</CardTitle>
            <CardDescription>Learn about your certified inspector</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={onViewInspector}>
              View Inspector Profile
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={onViewIncludes}>
          <CardHeader className="text-center">
            <FileText className="h-12 w-12 mx-auto text-green-600 mb-2" />
            <CardTitle>What's Included</CardTitle>
            <CardDescription>See our comprehensive inspection services</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={onViewIncludes}>
              What's Included
            </Button>
          </CardContent>
        </Card>

        <Card className={`${isVerified ? 'cursor-pointer hover:shadow-lg' : 'opacity-50'} transition-all`}>
          <CardHeader className="text-center">
            {isVerified ? (
              <DollarSign className="h-12 w-12 mx-auto text-red-600 mb-2" />
            ) : (
              <Lock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            )}
            <CardTitle className="flex items-center justify-center gap-2">
              View Pricing
              {!isVerified && <Badge variant="secondary">Verification Required</Badge>}
            </CardTitle>
            <CardDescription>
              {isVerified 
                ? "See detailed pricing for your property"
                : "Complete verification to unlock pricing"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onViewPricing}
              disabled={!isVerified}
              className={`w-full ${isVerified ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {isVerified ? "View Pricing" : "🔒 Locked"}
            </Button>
            {!isVerified && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Complete contact verification above to unlock pricing
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Verification
        </Button>
      </div>
    </div>
  );
}